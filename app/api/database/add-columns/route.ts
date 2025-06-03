import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🔧 Adding hierarchical application system columns...')

    // First, let's check what columns already exist
    const { data: existingPrograms, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .limit(1)

    if (fetchError) {
      console.error('❌ Error fetching programs:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch programs', details: fetchError.message },
        { status: 500 }
      )
    }

    console.log('📊 Current program columns:', existingPrograms?.[0] ? Object.keys(existingPrograms[0]) : 'No programs found')

    // Add the new columns one by one using individual update operations
    const columnsToAdd = [
      { name: 'application_deadline', type: 'date', defaultValue: '2025-09-30' },
      { name: 'is_available', type: 'boolean', defaultValue: true },
      { name: 'available_spots', type: 'integer', defaultValue: 100 },
      { name: 'application_fee', type: 'decimal', defaultValue: 300.00 },
      { name: 'application_status', type: 'text', defaultValue: 'open' },
      { name: 'is_popular', type: 'boolean', defaultValue: false },
      { name: 'priority_level', type: 'integer', defaultValue: 1 },
      { name: 'application_count', type: 'integer', defaultValue: 0 },
      { name: 'success_rate', type: 'decimal', defaultValue: 85.0 }
    ]

    const results = []

    // Get all programs first
    const { data: allPrograms, error: getAllError } = await supabase
      .from('programs')
      .select('id, qualification_level, field_of_study')

    if (getAllError) {
      console.error('❌ Error getting all programs:', getAllError)
      return NextResponse.json(
        { error: 'Failed to get programs', details: getAllError.message },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${allPrograms?.length || 0} programs to update`)

    // Since we can't add columns directly via the API, we'll simulate the migration
    // by updating existing programs with the new data structure
    if (allPrograms && allPrograms.length > 0) {
      let updatedCount = 0
      let errorCount = 0

      for (const program of allPrograms) {
        try {
          // Generate realistic data for each program
          const updateData = {
            // We'll use existing columns that might exist or add to description
            description: (program as any).description || generateDescription(program.qualification_level, program.field_of_study),
            updated_at: new Date().toISOString()
          }

          const { error: updateError } = await supabase
            .from('programs')
            .update(updateData)
            .eq('id', program.id)

          if (updateError) {
            console.error(`❌ Error updating program ${program.id}:`, updateError)
            errorCount++
          } else {
            updatedCount++
          }
        } catch (error) {
          console.error(`❌ Error processing program ${program.id}:`, error)
          errorCount++
        }
      }

      results.push(`Updated ${updatedCount} programs`)
      if (errorCount > 0) {
        results.push(`${errorCount} programs had errors`)
      }
    }

    // Create a comprehensive response
    const response = {
      success: true,
      message: 'Hierarchical application system preparation completed',
      note: 'Database schema changes require direct SQL execution in Supabase dashboard',
      sqlCommands: [
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS application_deadline DATE;',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS available_spots INTEGER;',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2);',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT \'open\';',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1;',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;',
        'ALTER TABLE programs ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 85.0;'
      ],
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Run the SQL commands provided above',
        '3. Then run the migration again to populate data',
        '4. Verify the new columns exist in the programs table'
      ],
      results,
      programsFound: allPrograms?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Hierarchical application system preparation completed')
    console.log('📋 Next steps: Run SQL commands in Supabase dashboard')

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Column addition failed:', error)
    return NextResponse.json(
      {
        error: 'Column addition failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to generate descriptions
function generateDescription(qualificationLevel: string, fieldOfStudy: string): string {
  return `Comprehensive ${qualificationLevel || 'program'} in ${fieldOfStudy || 'the chosen field'}. This program provides students with both theoretical knowledge and practical skills needed for success in their career. Application deadline: September 30, 2025. Available spots: 100. Application fee: R300.`
}
