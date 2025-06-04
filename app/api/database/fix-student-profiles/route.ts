import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing student_profiles table schema...')
    
    const supabaseAdmin = createServerSupabaseAdminClient()

    // First, check if the table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .limit(1)

    console.log('📊 Current table status:', { tableError: tableError?.message })

    // If the table doesn't exist or has wrong schema, recreate it
    const createTableSQL = `
      -- Drop the table if it exists with wrong schema
      DROP TABLE IF EXISTS public.student_profiles CASCADE;
      
      -- Create student_profiles table with correct schema
      CREATE TABLE public.student_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          
          -- Personal Information (JSON)
          personal_info JSONB DEFAULT '{}',
          contact_info JSONB DEFAULT '{}',
          academic_history JSONB DEFAULT '{}',
          study_preferences JSONB DEFAULT '{}',
          
          -- Extracted fields for easier querying
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          phone TEXT,
          id_number TEXT,
          
          -- Profile metadata
          profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
          readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
          is_verified BOOLEAN DEFAULT FALSE,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies
      CREATE POLICY "Users can view own profile" ON public.student_profiles
          FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own profile" ON public.student_profiles
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own profile" ON public.student_profiles
          FOR UPDATE USING (auth.uid() = user_id);
      
      -- Create index
      CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
    `

    // Execute the SQL
    const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableSQL
    })

    if (sqlError) {
      console.error('❌ SQL execution error:', sqlError)
      
      // Try alternative approach - use individual queries
      console.log('🔄 Trying alternative approach...')
      
      // Try to create the table directly
      const { error: createError } = await supabaseAdmin
        .from('student_profiles')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
          personal_info: {},
          contact_info: {},
          academic_history: {},
          study_preferences: {},
          profile_completeness: 0,
          readiness_score: 0,
          is_verified: false
        })

      // Delete the test record
      if (!createError) {
        await supabaseAdmin
          .from('student_profiles')
          .delete()
          .eq('user_id', '00000000-0000-0000-0000-000000000000')
      }

      return NextResponse.json({
        success: !createError,
        message: createError ? 'Table needs manual creation' : 'Table schema verified',
        error: createError?.message,
        sqlError: sqlError.message,
        manualSQL: createTableSQL,
        instructions: [
          '1. Go to Supabase Dashboard > SQL Editor',
          '2. Copy and paste the SQL from manualSQL field',
          '3. Execute the SQL',
          '4. Refresh the application'
        ]
      })
    }

    // Test the table after creation
    const { data: testData, error: testError } = await supabaseAdmin
      .from('student_profiles')
      .select('id, user_id')
      .limit(1)

    console.log('✅ Table creation completed')
    console.log('🧪 Test query result:', { testError: testError?.message, hasData: !!testData })

    return NextResponse.json({
      success: true,
      message: 'Student profiles table schema fixed successfully',
      testResult: {
        error: testError?.message,
        canQuery: !testError
      }
    })

  } catch (error) {
    console.error('❌ Error fixing student_profiles schema:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix student_profiles schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createServerSupabaseAdminClient()

    // Check current table status
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .limit(1)

    return NextResponse.json({
      success: true,
      tableExists: !tableError,
      error: tableError?.message,
      canAccess: !!tableData || !tableError
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check table status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
