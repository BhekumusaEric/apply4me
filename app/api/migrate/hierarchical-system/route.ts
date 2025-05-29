import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🚀 Starting Hierarchical Application System Migration...')

    // Check if migration has already been run
    const { data: existingMigration } = await supabase
      .from('migration_log')
      .select('*')
      .eq('migration_name', 'hierarchical_application_system')
      .single()

    if (existingMigration) {
      return NextResponse.json({
        success: true,
        message: 'Migration already completed',
        completedAt: existingMigration.completed_at
      })
    }

    // Phase 1.1: Enhance Programs Table
    console.log('📊 Phase 1.1: Enhancing programs table...')

    const programEnhancements = `
      -- Add program-specific application fields
      ALTER TABLE programs
      ADD COLUMN IF NOT EXISTS application_deadline DATE,
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS available_spots INTEGER,
      ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS entry_requirements TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'open' CHECK (application_status IN ('open', 'closed', 'full', 'pending')),
      ADD COLUMN IF NOT EXISTS min_requirements JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS program_coordinator_email TEXT,
      ADD COLUMN IF NOT EXISTS program_coordinator_phone TEXT,
      ADD COLUMN IF NOT EXISTS application_opens_at DATE,
      ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

      -- Add program metadata
      ALTER TABLE programs
      ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
      ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0.0;
    `

    const { error: programError } = await supabase.rpc('exec_sql', { sql: programEnhancements })
    if (programError) {
      console.error('❌ Error enhancing programs table:', programError)
      throw programError
    }

    // Phase 1.2: Enhance Applications Table
    console.log('📊 Phase 1.2: Enhancing applications table...')

    const applicationEnhancements = `
      -- Add program-specific application fields
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS program_specific_info JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS program_requirements_met JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS program_application_fee DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'institution' CHECK (application_type IN ('institution', 'program')),
      ADD COLUMN IF NOT EXISTS program_deadline DATE,
      ADD COLUMN IF NOT EXISTS program_status TEXT DEFAULT 'draft' CHECK (program_status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'));
    `

    const { error: applicationError } = await supabase.rpc('exec_sql', { sql: applicationEnhancements })
    if (applicationError) {
      console.error('❌ Error enhancing applications table:', applicationError)
      throw applicationError
    }

    // Phase 1.3: Create Indexes
    console.log('📊 Phase 1.3: Creating performance indexes...')

    const indexCreation = `
      -- Programs table indexes
      CREATE INDEX IF NOT EXISTS idx_programs_deadline ON programs(application_deadline);
      CREATE INDEX IF NOT EXISTS idx_programs_available ON programs(is_available);
      CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(application_status);
      CREATE INDEX IF NOT EXISTS idx_programs_popular ON programs(is_popular);
      CREATE INDEX IF NOT EXISTS idx_programs_opens_at ON programs(application_opens_at);
      CREATE INDEX IF NOT EXISTS idx_programs_institution_available ON programs(institution_id, is_available);

      -- Applications table indexes
      CREATE INDEX IF NOT EXISTS idx_applications_program ON applications(program_id);
      CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);
      CREATE INDEX IF NOT EXISTS idx_applications_program_status ON applications(program_status);
      CREATE INDEX IF NOT EXISTS idx_applications_program_deadline ON applications(program_deadline);

      -- Composite indexes
      CREATE INDEX IF NOT EXISTS idx_programs_institution_status_deadline ON programs(institution_id, application_status, application_deadline);
      CREATE INDEX IF NOT EXISTS idx_applications_user_program ON applications(user_id, program_id);
    `

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexCreation })
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError)
      throw indexError
    }

    // Phase 1.4: Update Existing Data
    console.log('📊 Phase 1.4: Updating existing programs with realistic data...')

    const { data: existingPrograms, error: fetchError } = await supabase
      .from('programs')
      .select('id, qualification_level, field_of_study')
      .is('application_deadline', null)

    if (fetchError) {
      console.error('❌ Error fetching existing programs:', fetchError)
      throw fetchError
    }

    if (existingPrograms && existingPrograms.length > 0) {
      console.log(`📊 Updating ${existingPrograms.length} existing programs...`)

      for (const program of existingPrograms) {
        const updateData = {
          application_deadline: Math.random() > 0.6 ? '2025-09-30' :
                               Math.random() > 0.3 ? '2025-11-15' : '2025-07-31',
          application_opens_at: Math.random() > 0.5 ? '2025-03-01' : '2025-02-01',
          is_available: Math.random() > 0.15, // 85% available
          available_spots: generateAvailableSpots(program.qualification_level),
          application_fee: generateApplicationFee(program.qualification_level),
          application_status: generateApplicationStatus(),
          is_popular: Math.random() > 0.75,
          priority_level: Math.floor(Math.random() * 5) + 1,
          description: generateDescription(program.qualification_level, program.field_of_study),
          entry_requirements: generateEntryRequirements(program.qualification_level),
          min_requirements: generateMinRequirements(program.qualification_level, program.field_of_study),
          last_updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('programs')
          .update(updateData)
          .eq('id', program.id)

        if (updateError) {
          console.error(`❌ Error updating program ${program.id}:`, updateError)
        }
      }
    }

    // Phase 1.5: Create Helper Functions
    console.log('📊 Phase 1.5: Creating helper functions...')

    const helperFunctions = `
      -- Function to get available programs for an institution
      CREATE OR REPLACE FUNCTION get_available_programs(institution_uuid UUID)
      RETURNS TABLE (
        id UUID,
        name TEXT,
        qualification_level TEXT,
        field_of_study TEXT,
        application_deadline DATE,
        application_fee DECIMAL(10,2),
        available_spots INTEGER,
        application_status TEXT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          p.id,
          p.name,
          p.qualification_level,
          p.field_of_study,
          p.application_deadline,
          p.application_fee,
          p.available_spots,
          p.application_status
        FROM programs p
        WHERE p.institution_id = institution_uuid
          AND p.is_available = TRUE
          AND p.application_status = 'open'
          AND (p.application_deadline IS NULL OR p.application_deadline > CURRENT_DATE)
          AND (p.application_opens_at IS NULL OR p.application_opens_at <= CURRENT_DATE)
        ORDER BY p.is_popular DESC, p.priority_level DESC, p.name ASC;
      END;
      $$ LANGUAGE plpgsql;

      -- Function to check if a program is accepting applications
      CREATE OR REPLACE FUNCTION is_program_accepting_applications(program_uuid UUID)
      RETURNS BOOLEAN AS $$
      DECLARE
        program_record RECORD;
      BEGIN
        SELECT
          is_available,
          application_status,
          application_deadline,
          application_opens_at,
          available_spots,
          application_count
        INTO program_record
        FROM programs
        WHERE id = program_uuid;

        IF NOT FOUND THEN
          RETURN FALSE;
        END IF;

        RETURN (
          program_record.is_available = TRUE
          AND program_record.application_status = 'open'
          AND (program_record.application_deadline IS NULL OR program_record.application_deadline > CURRENT_DATE)
          AND (program_record.application_opens_at IS NULL OR program_record.application_opens_at <= CURRENT_DATE)
          AND (program_record.available_spots IS NULL OR program_record.application_count < program_record.available_spots)
        );
      END;
      $$ LANGUAGE plpgsql;
    `

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: helperFunctions })
    if (functionError) {
      console.error('❌ Error creating helper functions:', functionError)
      throw functionError
    }

    // Create migration log table if it doesn't exist
    const migrationLogTable = `
      CREATE TABLE IF NOT EXISTS public.migration_log (
        id SERIAL PRIMARY KEY,
        migration_name TEXT UNIQUE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        description TEXT
      );
    `

    const { error: logTableError } = await supabase.rpc('exec_sql', { sql: migrationLogTable })
    if (logTableError) {
      console.error('❌ Error creating migration log table:', logTableError)
    }

    // Log migration completion
    const { error: logError } = await supabase
      .from('migration_log')
      .insert({
        migration_name: 'hierarchical_application_system',
        completed_at: new Date().toISOString(),
        description: 'Added program-specific application support with backward compatibility'
      })

    if (logError) {
      console.error('❌ Error logging migration:', logError)
    }

    console.log('✅ Hierarchical Application System Migration completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Hierarchical Application System Migration completed successfully',
      phases: [
        'Enhanced programs table with application-specific fields',
        'Enhanced applications table with program support',
        'Created performance indexes',
        'Updated existing programs with realistic data',
        'Created helper functions for program queries'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions for data generation
function generateAvailableSpots(qualificationLevel: string): number {
  if (qualificationLevel?.toLowerCase().includes('bachelor')) {
    return Math.floor(Math.random() * 200) + 50
  } else if (qualificationLevel?.toLowerCase().includes('master')) {
    return Math.floor(Math.random() * 50) + 15
  } else {
    return Math.floor(Math.random() * 100) + 25
  }
}

function generateApplicationFee(qualificationLevel: string): number {
  const level = qualificationLevel?.toLowerCase() || ''

  if (level.includes('bachelor')) {
    return Math.floor(Math.random() * 400) + 200
  } else if (level.includes('master')) {
    return Math.floor(Math.random() * 600) + 300
  } else if (level.includes('diploma')) {
    return Math.floor(Math.random() * 300) + 150
  } else {
    return Math.floor(Math.random() * 350) + 175
  }
}

function generateApplicationStatus(): string {
  const rand = Math.random()
  if (rand > 0.9) return 'closed'
  if (rand > 0.98) return 'full'
  if (rand > 0.95) return 'pending'
  return 'open'
}

function generateDescription(qualificationLevel: string, fieldOfStudy: string): string {
  return `Comprehensive ${qualificationLevel} program in ${fieldOfStudy || 'the chosen field'}. This program provides students with both theoretical knowledge and practical skills needed for success in their career.`
}

function generateEntryRequirements(qualificationLevel: string): string[] {
  const level = qualificationLevel?.toLowerCase() || ''

  if (level.includes('bachelor')) {
    return ['NSC with Bachelor\'s pass', 'Mathematics (Level 4)', 'English (Level 4)', 'Subject-specific requirements']
  } else if (level.includes('master')) {
    return ['Relevant Bachelor\'s degree', 'Minimum 65% average', 'Research proposal', 'Academic references']
  } else if (level.includes('diploma')) {
    return ['NSC with Diploma pass', 'Mathematics (Level 3)', 'English (Level 3)', 'Subject-specific requirements']
  } else {
    return ['NSC or equivalent', 'English proficiency', 'Subject-specific requirements']
  }
}

function generateMinRequirements(qualificationLevel: string, fieldOfStudy: string): any {
  const level = qualificationLevel?.toLowerCase() || ''
  const field = fieldOfStudy?.toLowerCase() || ''

  let minimumAPS = 15
  let englishLevel = 2
  let mathematicsLevel = 2

  if (level.includes('bachelor')) {
    minimumAPS = 30 + Math.floor(Math.random() * 10)
    englishLevel = 4
    mathematicsLevel = field.includes('engineering') || field.includes('science') ? 5 : 4
  } else if (level.includes('diploma')) {
    minimumAPS = 20 + Math.floor(Math.random() * 8)
    englishLevel = 3
    mathematicsLevel = field.includes('engineering') || field.includes('science') ? 4 : 3
  }

  return {
    minimumAPS,
    englishLevel,
    mathematicsLevel
  }
}
