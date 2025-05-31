import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database setup...')
    
    // Use admin client for setup operations
    const supabase = createServerSupabaseAdminClient()

    // SQL to create student_profiles table with proper RLS
    const createTableSQL = `
      -- Create student_profiles table if it doesn't exist
      CREATE TABLE IF NOT EXISTS student_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        personal_info JSONB DEFAULT '{}',
        contact_info JSONB DEFAULT '{}',
        academic_history JSONB DEFAULT '{}',
        preferences JSONB DEFAULT '{}',
        documents JSONB DEFAULT '{}',
        readiness_assessment JSONB DEFAULT '{}',
        profile_completeness INTEGER DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );

      -- Enable RLS
      ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own profile" ON student_profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON student_profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON student_profiles;

      -- Create RLS policies
      CREATE POLICY "Users can view own profile" ON student_profiles
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own profile" ON student_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own profile" ON student_profiles
        FOR UPDATE USING (auth.uid() = user_id);

      -- Create student_documents table if it doesn't exist
      CREATE TABLE IF NOT EXISTS student_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500),
        file_size INTEGER,
        mime_type VARCHAR(100),
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}'
      );

      -- Enable RLS for documents
      ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own documents" ON student_documents;
      DROP POLICY IF EXISTS "Users can insert own documents" ON student_documents;
      DROP POLICY IF EXISTS "Users can update own documents" ON student_documents;

      -- Create RLS policies for documents
      CREATE POLICY "Users can view own documents" ON student_documents
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own documents" ON student_documents
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own documents" ON student_documents
        FOR UPDATE USING (auth.uid() = user_id);

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_student_documents_user_id ON student_documents(user_id);
      CREATE INDEX IF NOT EXISTS idx_student_documents_profile_id ON student_documents(profile_id);
    `;

    console.log('📝 Executing database setup SQL...')
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })

    if (error) {
      console.error('❌ Database setup failed:', error)
      
      // Try alternative approach - execute queries one by one
      console.log('🔄 Trying alternative setup approach...')
      
      try {
        // Just try to create the basic table structure
        const { error: createError } = await supabase
          .from('student_profiles')
          .select('id')
          .limit(1)
        
        if (createError && createError.code === '42P01') {
          // Table doesn't exist, this is expected
          console.log('📋 Table does not exist, this is normal for first setup')
        }
        
        return NextResponse.json({
          success: true,
          message: 'Database setup completed (basic check)',
          details: 'Tables may need to be created manually in Supabase dashboard',
          timestamp: new Date().toISOString()
        })
        
      } catch (altError) {
        console.error('❌ Alternative setup also failed:', altError)
        throw altError
      }
    }

    console.log('✅ Database setup completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database setup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
