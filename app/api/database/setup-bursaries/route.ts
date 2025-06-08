/**
 * Setup Bursaries Database
 * Creates bursaries table and populates with sample data
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = createServerSupabaseAdminClient()

    console.log('🔍 Setting up bursaries table and data...')

    // First, check if bursaries table exists and has data
    const { data: existingBursaries, error: checkError } = await supabase
      .from('bursaries')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking bursaries table:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check bursaries table',
        details: checkError.message
      }, { status: 500 })
    }

    if (existingBursaries && existingBursaries.length > 0) {
      console.log('✅ Bursaries table already has data')
      return NextResponse.json({
        success: true,
        message: 'Bursaries table already populated',
        count: existingBursaries.length
      })
    }

    // Insert sample bursaries data
    const sampleBursaries = [
      {
        name: 'NSFAS Bursary',
        provider: 'National Student Financial Aid Scheme',
        type: 'national',
        field_of_study: ['All Fields'],
        eligibility_criteria: [
          'South African citizen',
          'Household income below R350,000',
          'First-time entering higher education',
          'Academic merit'
        ],
        amount: 100000,
        application_deadline: '2024-11-30',
        application_url: 'https://www.nsfas.org.za',
        description: 'Comprehensive financial aid covering tuition, accommodation, meals, and learning materials for qualifying students from disadvantaged backgrounds.',
        is_active: true
      },
      {
        name: 'Sasol Bursary Programme',
        provider: 'Sasol Limited',
        type: 'sector',
        field_of_study: ['Engineering and Technology', 'Natural Sciences', 'Chemistry'],
        eligibility_criteria: [
          'South African citizen',
          'Academic excellence (70%+ average)',
          'Financial need',
          'Studying relevant fields',
          'Leadership potential'
        ],
        amount: 150000,
        application_deadline: '2024-08-31',
        application_url: 'https://www.sasol.com/careers/bursaries',
        description: 'Full bursary covering tuition, accommodation, and living expenses for engineering and science students with vacation work opportunities.',
        is_active: true
      },
      {
        name: 'Anglo American Bursary',
        provider: 'Anglo American',
        type: 'sector',
        field_of_study: ['Engineering and Technology', 'Natural Sciences', 'Business and Management', 'Mining'],
        eligibility_criteria: [
          'South African citizen',
          'Academic merit (65%+ average)',
          'Financial need',
          'Leadership potential',
          'Community involvement'
        ],
        amount: 120000,
        application_deadline: '2024-09-15',
        application_url: 'https://www.angloamerican.com/careers/bursaries',
        description: 'Comprehensive bursary with mentorship, vacation work opportunities, and potential employment after graduation.',
        is_active: true
      },
      {
        name: 'Gauteng Provincial Bursary',
        provider: 'Gauteng Provincial Government',
        type: 'provincial',
        field_of_study: ['All Fields'],
        eligibility_criteria: [
          'Gauteng resident',
          'Financial need',
          'Academic merit (60%+ average)',
          'South African citizen',
          'First-time university student'
        ],
        amount: 80000,
        application_deadline: '2024-10-31',
        application_url: 'https://www.gauteng.gov.za/bursaries',
        description: 'Provincial bursary for Gauteng residents pursuing higher education at recognized institutions.',
        is_active: true
      },
      {
        name: 'Western Cape Provincial Bursary',
        provider: 'Western Cape Provincial Government',
        type: 'provincial',
        field_of_study: ['All Fields'],
        eligibility_criteria: [
          'Western Cape resident',
          'Financial need',
          'Academic merit (60%+ average)',
          'South African citizen',
          'Studying at WC institution'
        ],
        amount: 75000,
        application_deadline: '2024-10-31',
        application_url: 'https://www.westerncape.gov.za/bursaries',
        description: 'Provincial bursary supporting Western Cape students in higher education with focus on local development.',
        is_active: true
      },
      {
        name: 'Eskom Bursary Programme',
        provider: 'Eskom Holdings SOC Ltd',
        type: 'sector',
        field_of_study: ['Engineering and Technology', 'Natural Sciences', 'Information Technology'],
        eligibility_criteria: [
          'South African citizen',
          'Academic excellence (70%+ average)',
          'Financial need',
          'Studying relevant fields',
          'Commitment to work for Eskom'
        ],
        amount: 140000,
        application_deadline: '2024-09-30',
        application_url: 'https://www.eskom.co.za/careers/bursaries',
        description: 'Full bursary for engineering and technical students with guaranteed employment opportunities at Eskom.',
        is_active: true
      },
      {
        name: 'Transnet Bursary',
        provider: 'Transnet SOC Ltd',
        type: 'sector',
        field_of_study: ['Engineering and Technology', 'Logistics', 'Business and Management'],
        eligibility_criteria: [
          'South African citizen',
          'Academic merit (65%+ average)',
          'Financial need',
          'Studying relevant fields',
          'Willingness to work for Transnet'
        ],
        amount: 130000,
        application_deadline: '2024-08-15',
        application_url: 'https://www.transnet.net/careers/bursaries',
        description: 'Comprehensive bursary for students in transport and logistics related fields with career opportunities.',
        is_active: true
      },
      {
        name: 'Nedbank Bursary Programme',
        provider: 'Nedbank Limited',
        type: 'sector',
        field_of_study: ['Business and Management', 'Finance', 'Information Technology', 'Economics'],
        eligibility_criteria: [
          'South African citizen',
          'Academic excellence (70%+ average)',
          'Financial need',
          'Leadership potential',
          'Community involvement'
        ],
        amount: 110000,
        application_deadline: '2024-09-30',
        application_url: 'https://www.nedbank.co.za/careers/bursaries',
        description: 'Banking sector bursary with mentorship, internships, and potential career opportunities in financial services.',
        is_active: true
      },
      {
        name: 'University of Cape Town Bursary',
        provider: 'University of Cape Town',
        type: 'institutional',
        field_of_study: ['All Fields'],
        eligibility_criteria: [
          'Admitted to UCT',
          'Financial need',
          'Academic merit (65%+ average)',
          'South African citizen',
          'First-time university student'
        ],
        amount: 90000,
        application_deadline: '2024-12-15',
        application_url: 'https://www.uct.ac.za/apply/funding',
        description: 'Institutional bursary for UCT students covering tuition and accommodation based on financial need and academic merit.',
        is_active: true
      },
      {
        name: 'Stellenbosch University Bursary',
        provider: 'Stellenbosch University',
        type: 'institutional',
        field_of_study: ['All Fields'],
        eligibility_criteria: [
          'Admitted to Stellenbosch University',
          'Financial need',
          'Academic merit (65%+ average)',
          'South African citizen',
          'Demonstrated leadership'
        ],
        amount: 85000,
        application_deadline: '2024-12-15',
        application_url: 'https://www.sun.ac.za/english/learning-teaching/student-affairs/student-funding',
        description: 'Institutional bursary for Stellenbosch students with focus on academic excellence and leadership development.',
        is_active: true
      }
    ]

    console.log(`📝 Inserting ${sampleBursaries.length} sample bursaries...`)

    const { data, error } = await supabase
      .from('bursaries')
      .insert(sampleBursaries)
      .select()

    if (error) {
      console.error('❌ Error inserting bursaries:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert bursaries',
        details: error.message
      }, { status: 500 })
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} bursaries`)

    return NextResponse.json({
      success: true,
      message: 'Bursaries table populated successfully',
      count: data?.length || 0,
      data: data
    })

  } catch (error) {
    console.error('❌ Setup bursaries error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseAdminClient()

    const { data, error } = await supabase
      .from('bursaries')
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: false })

    if (error) {
      console.error('❌ Error fetching bursaries:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bursaries',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      message: 'Bursaries fetched successfully'
    })

  } catch (error) {
    console.error('❌ Fetch bursaries error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
