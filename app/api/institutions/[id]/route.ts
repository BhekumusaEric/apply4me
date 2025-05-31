import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch institution details
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (institutionError) {
      console.error('Institution fetch error:', institutionError)
      return NextResponse.json(
        { error: 'Institution not found', details: institutionError.message },
        { status: 404 }
      )
    }

    // Fetch programs for this institution
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .eq('institution_id', params.id)
      .order('is_popular', { ascending: false })
      .order('name', { ascending: true })

    if (programsError) {
      console.error('Programs fetch error:', programsError)
      // Don't fail the request if programs can't be fetched
    }

    // Get available programs count
    const availablePrograms = programs?.filter(p => 
      p.is_available && 
      p.application_status === 'open' &&
      (!p.application_deadline || new Date(p.application_deadline) > new Date())
    ) || []

    return NextResponse.json({
      success: true,
      institution: {
        ...institution,
        programs_count: programs?.length || 0,
        available_programs_count: availablePrograms.length
      },
      programs: programs || [],
      available_programs: availablePrograms,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Institution API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
