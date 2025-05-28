import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🎓 Creating sample programs for testing...')

    // Get all institutions first
    const { data: institutions, error: institutionsError } = await supabase
      .from('institutions')
      .select('id, name, type')

    if (institutionsError) {
      console.error('❌ Error fetching institutions:', institutionsError)
      return NextResponse.json({ success: false, error: 'Failed to fetch institutions' }, { status: 500 })
    }

    if (!institutions || institutions.length === 0) {
      return NextResponse.json({ success: false, error: 'No institutions found' }, { status: 404 })
    }

    console.log(`🏫 Found ${institutions.length} institutions`)

    // Sample programs for different institution types (using correct schema)
    const universityPrograms = [
      {
        name: 'Bachelor of Computer Science',
        qualification_level: 'Bachelor\'s Degree',
        duration_years: 4,
        requirements: ['Matric Certificate', 'Mathematics (Level 6)', 'Physical Sciences (Level 5)', 'English (Level 4)'],
        career_outcomes: ['Software Developer', 'Data Scientist', 'Systems Analyst', 'IT Consultant'],
        field_of_study: 'Computer Science'
      },
      {
        name: 'Bachelor of Engineering (Mechanical)',
        qualification_level: 'Bachelor\'s Degree',
        duration_years: 4,
        requirements: ['Matric Certificate', 'Mathematics (Level 7)', 'Physical Sciences (Level 6)', 'English (Level 4)'],
        career_outcomes: ['Mechanical Engineer', 'Design Engineer', 'Project Manager', 'Manufacturing Engineer'],
        field_of_study: 'Engineering'
      },
      {
        name: 'Bachelor of Business Administration',
        qualification_level: 'Bachelor\'s Degree',
        duration_years: 3,
        requirements: ['Matric Certificate', 'Mathematics (Level 5)', 'English (Level 5)', 'Accounting (Level 4)'],
        career_outcomes: ['Business Manager', 'Marketing Specialist', 'Financial Analyst', 'Entrepreneur'],
        field_of_study: 'Business'
      }
    ]

    const tvetPrograms = [
      {
        name: 'National Certificate: Information Technology',
        qualification_level: 'National Certificate',
        duration_years: 1,
        requirements: ['Grade 12 Certificate', 'Mathematics (Level 3)', 'English (Level 3)'],
        career_outcomes: ['IT Support Technician', 'Computer Operator', 'Help Desk Assistant'],
        field_of_study: 'Information Technology'
      },
      {
        name: 'National Diploma: Electrical Engineering',
        qualification_level: 'National Diploma',
        duration_years: 3,
        requirements: ['Grade 12 Certificate', 'Mathematics (Level 4)', 'Physical Sciences (Level 4)', 'English (Level 3)'],
        career_outcomes: ['Electrical Technician', 'Maintenance Technician', 'Control Systems Technician'],
        field_of_study: 'Engineering'
      },
      {
        name: 'Certificate: Business Management',
        qualification_level: 'Certificate',
        duration_years: 1,
        requirements: ['Grade 12 Certificate', 'English (Level 3)'],
        career_outcomes: ['Office Administrator', 'Team Leader', 'Small Business Owner'],
        field_of_study: 'Business'
      }
    ]

    let totalProgramsCreated = 0

    // Create programs for each institution
    for (const institution of institutions) {
      console.log(`🎓 Creating programs for: ${institution.name}`)

      const programsToCreate = institution.type === 'university' ? universityPrograms : tvetPrograms

      for (const programTemplate of programsToCreate) {
        const programData = {
          id: crypto.randomUUID(),
          institution_id: institution.id,
          name: programTemplate.name,
          qualification_level: programTemplate.qualification_level,
          duration_years: programTemplate.duration_years,
          field_of_study: programTemplate.field_of_study,
          requirements: programTemplate.requirements,
          career_outcomes: programTemplate.career_outcomes,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: insertError } = await supabase
          .from('programs')
          .insert(programData)

        if (insertError) {
          console.error(`❌ Error creating program ${programTemplate.name}:`, insertError)
        } else {
          console.log(`✅ Created program: ${programTemplate.name}`)
          totalProgramsCreated++
        }
      }
    }

    console.log(`🎉 Sample programs creation completed! Created ${totalProgramsCreated} programs`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${totalProgramsCreated} sample programs`,
      programsCreated: totalProgramsCreated,
      institutionsProcessed: institutions.length
    })

  } catch (error) {
    console.error('❌ Error creating sample programs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create sample programs' },
      { status: 500 }
    )
  }
}
