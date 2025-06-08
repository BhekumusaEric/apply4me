import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating student_profiles and student_documents tables...')

    // Use service role key for admin operations
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Step 1: Create student_profiles table
    console.log('📋 Creating student_profiles table...')
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS public.student_profiles (
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
    `

    // Since exec_sql RPC might not exist, let's use a different approach
    // First check if table exists
    const { error: checkError } = await supabaseAdmin
      .from('student_profiles')
      .select('count')
      .limit(1)

    if (checkError && checkError.code === '42P01') {
      console.log('✅ Confirmed: student_profiles table does not exist, needs creation')

      // Use Supabase Management API to create table
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({ sql: createProfilesTable })
        })

        if (response.ok) {
          console.log('✅ student_profiles table created via Management API')
        } else {
          console.log('⚠️ Management API approach failed, table might need manual creation')
        }
      } catch (apiError) {
        console.log('⚠️ Management API not available, table needs manual creation')
      }
    } else if (!checkError) {
      console.log('✅ student_profiles table already exists')
    } else {
      console.log('⚠️ Unexpected error checking table:', checkError.message)
    }

    // Step 2: Create student_documents table
    console.log('📋 Creating student_documents table...')
    const createDocumentsTable = `
      CREATE TABLE IF NOT EXISTS public.student_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

          -- Document information
          document_name TEXT NOT NULL,
          document_type TEXT NOT NULL,
          file_url TEXT,
          file_size INTEGER,
          mime_type TEXT,

          -- Verification status
          is_verified BOOLEAN DEFAULT FALSE,
          verification_date TIMESTAMP WITH TIME ZONE,
          expiry_date TIMESTAMP WITH TIME ZONE,
          notes TEXT,

          -- Timestamps
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Check if student_documents table exists
    const { error: checkDocsError } = await supabaseAdmin
      .from('student_documents')
      .select('count')
      .limit(1)

    if (checkDocsError && checkDocsError.code === '42P01') {
      console.log('✅ Confirmed: student_documents table does not exist, needs creation')
    } else if (!checkDocsError) {
      console.log('✅ student_documents table already exists')
    } else {
      console.log('⚠️ Unexpected error checking documents table:', checkDocsError.message)
    }

    // For now, let's focus on testing what we have and provide manual SQL
    console.log('📋 Tables need to be created manually in Supabase dashboard')

    const manualSQL = `
-- Run this SQL in your Supabase SQL Editor:

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
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

-- Create student_documents table
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Document information
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    mime_type TEXT,

    -- Verification status
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_profiles
CREATE POLICY "Users can view own profile" ON public.student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.student_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for student_documents
CREATE POLICY "Users can view own documents" ON public.student_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.student_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.student_documents
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_profile_id ON public.student_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_user_id ON public.student_documents(user_id);
    `

    // Step 4: Test the setup
    console.log('🧪 Testing table creation...')
    const { data: testProfiles, error: testProfilesError } = await supabaseAdmin
      .from('student_profiles')
      .select('count')
      .limit(1)

    const { data: testDocs, error: testDocsError } = await supabaseAdmin
      .from('student_documents')
      .select('count')
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Database setup analysis completed',
      results: {
        student_profiles: {
          exists: !testProfilesError || testProfilesError.code !== '42P01',
          error: testProfilesError?.message,
          accessible: !!testProfiles,
          needsCreation: testProfilesError?.code === '42P01'
        },
        student_documents: {
          exists: !testDocsError || testDocsError.code !== '42P01',
          error: testDocsError?.message,
          accessible: !!testDocs,
          needsCreation: testDocsError?.code === '42P01'
        }
      },
      manualSQL,
      recommendation: testProfilesError?.code === '42P01' ?
        'Tables need to be created. Copy the manualSQL and run it in Supabase SQL Editor.' :
        'Tables exist. Check RLS policies if access issues persist.'
    })

  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAdminClient()

    console.log('🔍 Checking existing database tables...')

    // Check what tables exist by trying to access them
    const tableChecks = [
      'users',
      'student_profiles',
      'student_documents',
      'institutions',
      'programs',
      'applications',
      'bursaries',
      'career_profiles'
    ]

    const tableStatus: Record<string, any> = {}

    for (const tableName of tableChecks) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1)

        tableStatus[tableName] = {
          exists: !error,
          accessible: !!data,
          error: error?.message,
          errorCode: error?.code
        }

        console.log(`📊 Table ${tableName}:`, tableStatus[tableName])
      } catch (err) {
        tableStatus[tableName] = {
          exists: false,
          accessible: false,
          error: 'Exception occurred',
          details: err
        }
      }
    }

    return NextResponse.json({
      status: 'Database discovery completed',
      tables: tableStatus,
      summary: {
        totalChecked: tableChecks.length,
        existing: Object.values(tableStatus).filter(t => t.exists).length,
        accessible: Object.values(tableStatus).filter(t => t.accessible).length
      },
      recommendation: 'Check individual table status for next steps'
    })

  } catch (error) {
    console.error('❌ Database discovery failed:', error)
    return NextResponse.json({
      error: 'Database discovery failed',
      details: error
    }, { status: 500 })
  }
}
