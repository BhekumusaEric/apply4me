import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🔧 Starting program table migration...')

    // Check if columns already exist by trying to select them
    console.log('🔧 Checking existing program table structure...')
    const { data: testPrograms, error: checkError } = await supabase
      .from('programs')
      .select('id, is_popular, application_deadline, available_spots, application_fee, description')
      .limit(1)

    if (checkError && checkError.code === '42703') {
      console.log('❌ Enhanced program fields do not exist. Database schema needs to be updated manually.')
      console.log('🔧 Please run the following SQL commands in your Supabase SQL editor:')
      console.log(`
        ALTER TABLE programs
        ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS application_deadline DATE,
        ADD COLUMN IF NOT EXISTS available_spots INTEGER,
        ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS description TEXT;
      `)

      return NextResponse.json({
        success: false,
        message: 'Database schema needs to be updated. Please run the SQL commands shown in the console.',
        sqlCommands: [
          'ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE',
          'ALTER TABLE programs ADD COLUMN IF NOT EXISTS application_deadline DATE',
          'ALTER TABLE programs ADD COLUMN IF NOT EXISTS available_spots INTEGER',
          'ALTER TABLE programs ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2)',
          'ALTER TABLE programs ADD COLUMN IF NOT EXISTS description TEXT'
        ]
      })
    } else if (checkError) {
      console.error('❌ Error checking table structure:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check table structure'
      }, { status: 500 })
    } else {
      console.log('✅ Enhanced program fields already exist!')
    }

    // Update existing programs with sample data
    console.log('🔧 Updating existing programs with enhanced data...')

    const { data: existingPrograms, error: fetchError } = await supabase
      .from('programs')
      .select('id, qualification_level, field_of_study, is_popular')

    if (fetchError) {
      console.error('❌ Error fetching existing programs:', fetchError)
    } else if (existingPrograms && existingPrograms.length > 0) {
      console.log(`🔧 Found ${existingPrograms.length} programs to update`)

      // Only update programs that don't have enhanced data yet
      const programsToUpdate = existingPrograms.filter(p => p.is_popular === null || p.is_popular === undefined)
      console.log(`🔧 ${programsToUpdate.length} programs need enhanced data`)

      for (const program of programsToUpdate) {
        const updateData = {
          is_popular: Math.random() > 0.7,
          application_deadline: Math.random() > 0.5 ? '2024-09-30' : '2024-11-15',
          available_spots: Math.floor(Math.random() * 100 + 25),
          application_fee: generateApplicationFee(program.qualification_level),
          description: `Comprehensive program designed to provide students with practical skills and theoretical knowledge in ${program.field_of_study}.`
        }

        const { error: updateError } = await supabase
          .from('programs')
          .update(updateData)
          .eq('id', program.id)

        if (updateError) {
          console.error(`❌ Error updating program ${program.id}:`, updateError)
        } else {
          console.log(`✅ Updated program: ${program.id}`)
        }
      }
    }

    console.log('🎉 Program table migration completed!')

    return NextResponse.json({
      success: true,
      message: 'Program table migration completed successfully'
    })

  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}

function generateApplicationFee(qualificationLevel: string): number {
  const level = qualificationLevel.toLowerCase()

  if (level.includes('bachelor')) {
    return Math.floor(Math.random() * 500 + 300) // R300-R800
  } else if (level.includes('master') || level.includes('honours')) {
    return Math.floor(Math.random() * 600 + 400) // R400-R1000
  } else if (level.includes('diploma')) {
    return Math.floor(Math.random() * 400 + 200) // R200-R600
  } else if (level.includes('certificate')) {
    return Math.floor(Math.random() * 300 + 100) // R100-R400
  }

  return Math.floor(Math.random() * 400 + 200) // Default R200-R600
}
