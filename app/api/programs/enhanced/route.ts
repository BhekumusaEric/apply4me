import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    console.log('📊 Fetching enhanced program data...')

    // Get enhanced program data with all new fields
    const { data: programs, error } = await supabase
      .from('programs')
      .select(`
        id,
        name,
        qualification_level,
        field_of_study,
        duration_years,
        application_deadline,
        is_available,
        available_spots,
        application_fee,
        application_status,
        is_popular,
        priority_level,
        application_count,
        success_rate,
        institution_id,
        institutions!inner(name, type, province)
      `)
      .order('is_popular', { ascending: false })
      .order('priority_level', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Error fetching programs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch programs', details: error.message },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total: programs?.length || 0,
      available: programs?.filter(p => p.is_available).length || 0,
      popular: programs?.filter(p => p.is_popular).length || 0,
      openApplications: programs?.filter(p => p.application_status === 'open').length || 0,
      averageFee: programs?.length ? 
        Math.round(programs.reduce((sum, p) => sum + (p.application_fee || 0), 0) / programs.length) : 0,
      averageSuccessRate: programs?.length ?
        Math.round(programs.reduce((sum, p) => sum + (p.success_rate || 0), 0) / programs.length) : 0
    }

    // Group by institution
    const byInstitution = programs?.reduce((acc, program) => {
      const institutionName = (program.institutions as any)?.name || 'Unknown'
      if (!acc[institutionName]) {
        acc[institutionName] = []
      }
      acc[institutionName].push(program)
      return acc
    }, {} as Record<string, any[]>) || {}

    // Group by status
    const byStatus = programs?.reduce((acc, program) => {
      const status = program.application_status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const response = {
      success: true,
      data: {
        programs: programs || [],
        stats,
        byInstitution,
        byStatus,
        enhancedFields: [
          'application_deadline',
          'is_available', 
          'available_spots',
          'application_fee',
          'application_status',
          'is_popular',
          'priority_level',
          'application_count',
          'success_rate'
        ]
      },
      message: 'Enhanced program data retrieved successfully',
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Retrieved ${programs?.length || 0} enhanced programs`)
    console.log(`📊 Stats: ${stats.available}/${stats.total} available, ${stats.openApplications} open applications`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Enhanced program fetch failed:', error)
    return NextResponse.json(
      { 
        error: 'Enhanced program fetch failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { institutionId } = await request.json()
    
    console.log(`📊 Fetching available programs for institution: ${institutionId}`)

    // Get only available programs for a specific institution
    const { data: programs, error } = await supabase
      .from('programs')
      .select(`
        id,
        name,
        qualification_level,
        field_of_study,
        application_deadline,
        application_fee,
        available_spots,
        application_count,
        success_rate,
        institutions!inner(name)
      `)
      .eq('institution_id', institutionId)
      .eq('is_available', true)
      .eq('application_status', 'open')
      .gte('application_deadline', new Date().toISOString().split('T')[0])
      .order('is_popular', { ascending: false })
      .order('priority_level', { ascending: false })

    if (error) {
      console.error('❌ Error fetching institution programs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch institution programs', details: error.message },
        { status: 500 }
      )
    }

    const response = {
      success: true,
      data: {
        programs: programs || [],
        institutionId,
        availableCount: programs?.length || 0,
        totalSpots: programs?.reduce((sum, p) => sum + (p.available_spots || 0), 0) || 0,
        averageFee: programs?.length ? 
          Math.round(programs.reduce((sum, p) => sum + (p.application_fee || 0), 0) / programs.length) : 0
      },
      message: `Found ${programs?.length || 0} available programs`,
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Found ${programs?.length || 0} available programs for institution`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Institution programs fetch failed:', error)
    return NextResponse.json(
      { 
        error: 'Institution programs fetch failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
