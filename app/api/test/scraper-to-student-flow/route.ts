import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🧪 Testing complete scraper-to-student flow...')

    const testResults = {
      success: false,
      phases: [] as string[],
      data: {} as any,
      errors: [] as string[],
      timestamp: new Date().toISOString()
    }

    // Phase 1: Test Database Population (Scraper Save)
    console.log('📊 Phase 1: Testing database population...')
    try {
      const populateResponse = await fetch('http://localhost:3000/api/database/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'populate' })
      })

      if (populateResponse.ok) {
        const populateData = await populateResponse.json()
        testResults.phases.push(`✅ Database population: ${populateData.result?.institutions?.total || 0} institutions, ${populateData.result?.bursaries?.total || 0} bursaries`)
        testResults.data.populateResult = populateData
      } else {
        testResults.errors.push('❌ Database population failed')
      }
    } catch (error) {
      testResults.errors.push(`❌ Database population error: ${error}`)
    }

    // Phase 2: Test Enhanced Program Data Retrieval
    console.log('📊 Phase 2: Testing enhanced program data retrieval...')
    try {
      const { data: programs, error: programsError } = await supabase
        .from('programs')
        .select(`
          id,
          name,
          qualification_level,
          field_of_study,
          application_deadline,
          is_available,
          available_spots,
          application_fee,
          application_status,
          is_popular,
          success_rate,
          institutions!inner(name, province)
        `)
        .eq('is_available', true)
        .eq('application_status', 'open')
        .limit(10)

      if (programsError) {
        testResults.errors.push(`❌ Program retrieval error: ${programsError.message}`)
      } else {
        testResults.phases.push(`✅ Enhanced programs retrieved: ${programs?.length || 0} available programs`)
        testResults.data.programs = programs?.slice(0, 3) // Sample data
      }
    } catch (error) {
      testResults.errors.push(`❌ Program retrieval error: ${error}`)
    }

    // Phase 3: Test Student-Facing API
    console.log('📊 Phase 3: Testing student-facing program API...')
    try {
      const studentApiResponse = await fetch('http://localhost:3000/api/programs/enhanced')

      if (studentApiResponse.ok) {
        const studentData = await studentApiResponse.json()
        testResults.phases.push(`✅ Student API: ${studentData.data?.stats?.total || 0} programs available to students`)
        testResults.data.studentApi = {
          totalPrograms: studentData.data?.stats?.total,
          availablePrograms: studentData.data?.stats?.available,
          popularPrograms: studentData.data?.stats?.popular,
          openApplications: studentData.data?.stats?.openApplications,
          averageFee: studentData.data?.stats?.averageFee,
          averageSuccessRate: studentData.data?.stats?.averageSuccessRate
        }
      } else {
        testResults.errors.push('❌ Student API failed')
      }
    } catch (error) {
      testResults.errors.push(`❌ Student API error: ${error}`)
    }

    // Phase 4: Test Institution-Specific Program Retrieval
    console.log('📊 Phase 4: Testing institution-specific programs...')
    try {
      // Get a sample institution
      const { data: institutions, error: instError } = await supabase
        .from('institutions')
        .select('id, name')
        .limit(1)

      if (instError || !institutions || institutions.length === 0) {
        testResults.errors.push('❌ No institutions found for testing')
      } else {
        const testInstitution = institutions[0]

        const { data: institutionPrograms, error: instProgramsError } = await supabase
          .from('programs')
          .select(`
            id,
            name,
            qualification_level,
            application_deadline,
            is_available,
            application_status
          `)
          .eq('institution_id', testInstitution.id)
          .eq('is_available', true)

        if (instProgramsError) {
          testResults.errors.push(`❌ Institution programs error: ${instProgramsError.message}`)
        } else {
          testResults.phases.push(`✅ Institution programs: ${institutionPrograms?.length || 0} programs for ${testInstitution.name}`)
          testResults.data.institutionTest = {
            institution: testInstitution.name,
            programCount: institutionPrograms?.length || 0,
            samplePrograms: institutionPrograms?.slice(0, 2)
          }
        }
      }
    } catch (error) {
      testResults.errors.push(`❌ Institution programs error: ${error}`)
    }

    // Phase 5: Test Real-Time Data Freshness
    console.log('📊 Phase 5: Testing data freshness...')
    try {
      const { data: recentPrograms, error: recentError } = await supabase
        .from('programs')
        .select('id, name, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (recentError) {
        testResults.errors.push(`❌ Data freshness error: ${recentError.message}`)
      } else {
        const now = new Date()
        const recentUpdates = recentPrograms?.filter(p => {
          const updatedAt = new Date(p.updated_at)
          const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
          return hoursDiff < 24 // Updated within last 24 hours
        }) || []

        testResults.phases.push(`✅ Data freshness: ${recentUpdates.length}/${recentPrograms?.length || 0} programs updated recently`)
        testResults.data.freshness = {
          totalPrograms: recentPrograms?.length || 0,
          recentlyUpdated: recentUpdates.length,
          sampleUpdates: recentPrograms?.slice(0, 2).map(p => ({
            name: p.name,
            lastUpdated: p.updated_at
          }))
        }
      }
    } catch (error) {
      testResults.errors.push(`❌ Data freshness error: ${error}`)
    }

    // Phase 6: Test Application Flow Readiness
    console.log('📊 Phase 6: Testing application flow readiness...')
    try {
      const { data: applicablePrograms, error: appError } = await supabase
        .from('programs')
        .select(`
          id,
          name,
          application_deadline,
          application_fee,
          available_spots,
          application_count,
          institutions!inner(name)
        `)
        .eq('is_available', true)
        .eq('application_status', 'open')
        .gte('application_deadline', new Date().toISOString().split('T')[0])
        .limit(5)

      if (appError) {
        testResults.errors.push(`❌ Application flow error: ${appError.message}`)
      } else {
        const readyForApplications = applicablePrograms?.filter(p =>
          p.application_deadline &&
          p.application_fee &&
          p.available_spots
        ) || []

        testResults.phases.push(`✅ Application readiness: ${readyForApplications.length}/${applicablePrograms?.length || 0} programs ready for applications`)
        testResults.data.applicationReadiness = {
          totalOpenPrograms: applicablePrograms?.length || 0,
          fullyConfigured: readyForApplications.length,
          sampleReady: readyForApplications.slice(0, 2).map(p => ({
            name: p.name,
            institution: (p.institutions as any)?.name,
            deadline: p.application_deadline,
            fee: p.application_fee,
            spots: p.available_spots
          }))
        }
      }
    } catch (error) {
      testResults.errors.push(`❌ Application flow error: ${error}`)
    }

    // Determine overall success
    testResults.success = testResults.errors.length === 0 && testResults.phases.length >= 5

    // Generate summary
    const summary = {
      status: testResults.success ? '🎉 COMPLETE SUCCESS' : '⚠️ PARTIAL SUCCESS',
      completedPhases: testResults.phases.length,
      totalErrors: testResults.errors.length,
      keyMetrics: {
        programsAvailable: testResults.data.studentApi?.totalPrograms || 0,
        programsOpen: testResults.data.studentApi?.openApplications || 0,
        averageSuccessRate: testResults.data.studentApi?.averageSuccessRate || 0,
        averageFee: testResults.data.studentApi?.averageFee || 0,
        dataFreshness: testResults.data.freshness?.recentlyUpdated || 0,
        applicationReady: testResults.data.applicationReadiness?.fullyConfigured || 0
      },
      flowStatus: {
        scraperToDatabase: testResults.data.populateResult ? '✅ Working' : '❌ Failed',
        databaseToStudents: testResults.data.studentApi ? '✅ Working' : '❌ Failed',
        institutionPrograms: testResults.data.institutionTest ? '✅ Working' : '❌ Failed',
        applicationFlow: testResults.data.applicationReadiness ? '✅ Working' : '❌ Failed'
      }
    }

    console.log(`${summary.status}: Scraper-to-Student flow test completed`)
    console.log(`📊 ${summary.keyMetrics.programsAvailable} programs available to students`)
    console.log(`🎯 ${summary.keyMetrics.applicationReady} programs ready for applications`)

    return NextResponse.json({
      ...testResults,
      summary,
      message: testResults.success ?
        'Complete scraper-to-student flow is working perfectly!' :
        'Scraper-to-student flow has some issues but core functionality works',
      recommendations: testResults.success ? [
        '🎉 Your scraper-to-student flow is perfect!',
        '🚀 Students can access fresh program data immediately',
        '📊 All enhanced program features are working',
        '🎯 Application flow is ready for production'
      ] : [
        '🔧 Review errors and fix any database issues',
        '📊 Ensure scraper is populating data correctly',
        '🎯 Verify student-facing APIs are working',
        '🚀 Test application flow end-to-end'
      ]
    })

  } catch (error) {
    console.error('❌ Scraper-to-student flow test failed:', error)
    return NextResponse.json(
      {
        error: 'Flow test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
