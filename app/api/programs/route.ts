import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id')
    const fieldOfStudy = searchParams.get('field_of_study')
    const qualificationLevel = searchParams.get('qualification_level')
    const availableOnly = searchParams.get('available_only') === 'true'

    let query = supabase
      .from('programs')
      .select(`
        *,
        institutions!inner(name, type, province, logo_url)
      `)

    // Apply filters
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }

    if (fieldOfStudy) {
      query = query.eq('field_of_study', fieldOfStudy)
    }

    if (qualificationLevel) {
      query = query.eq('qualification_level', qualificationLevel)
    }

    if (availableOnly) {
      query = query
        .eq('is_available', true)
        .eq('application_status', 'open')
        .gte('application_deadline', new Date().toISOString().split('T')[0])
    }

    // Order by popularity and priority
    query = query
      .order('is_popular', { ascending: false })
      .order('priority_level', { ascending: false })
      .order('name', { ascending: true })

    const { data: programs, error } = await query

    if (error) {
      console.error('Programs fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch programs', details: error.message },
        { status: 500 }
      )
    }

    // Calculate additional metrics
    const enhancedPrograms = programs?.map(program => ({
      ...program,
      days_until_deadline: program.application_deadline 
        ? Math.ceil((new Date(program.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
      is_deadline_soon: program.application_deadline 
        ? Math.ceil((new Date(program.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30
        : false
    })) || []

    return NextResponse.json({
      success: true,
      programs: enhancedPrograms,
      count: enhancedPrograms.length,
      filters: {
        institution_id: institutionId,
        field_of_study: fieldOfStudy,
        qualification_level: qualificationLevel,
        available_only: availableOnly
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Programs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const {
      institution_id,
      name,
      qualification_level,
      duration_years,
      field_of_study,
      application_deadline,
      application_fee,
      description,
      entry_requirements,
      is_available = true,
      application_status = 'open'
    } = body

    // Validate required fields
    if (!institution_id || !name || !qualification_level || !field_of_study) {
      return NextResponse.json(
        { error: 'Institution ID, name, qualification level, and field of study are required' },
        { status: 400 }
      )
    }

    // Create program
    const { data: program, error } = await supabase
      .from('programs')
      .insert({
        institution_id,
        name,
        qualification_level,
        duration_years: duration_years || 3,
        field_of_study,
        application_deadline,
        application_fee,
        description,
        entry_requirements,
        is_available,
        application_status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Program creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create program', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      program,
      message: 'Program created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Programs POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
