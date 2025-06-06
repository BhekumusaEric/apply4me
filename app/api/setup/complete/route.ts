import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { areTestRoutesEnabled, isDevelopment } from '@/lib/production-utils'

export async function POST(request: NextRequest) {
  // Block in production unless explicitly enabled
  if (!areTestRoutesEnabled()) {
    return NextResponse.json(
      {
        error: 'Setup routes disabled in production',
        message: 'This endpoint is disabled in production for security reasons.'
      },
      { status: 404 }
    )
  }

  try {
    console.log('🚀 Starting complete database and auth setup...')
    
    // Use admin client for setup operations
    const adminSupabase = createServerSupabaseAdminClient()

    // Step 1: Create database tables with proper structure
    console.log('📋 Step 1: Creating database tables...')
    
    const { data: tables, error: tableError } = await adminSupabase
      .from('student_profiles')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === '42P01') {
      console.log('📝 Tables do not exist, need to create them manually in Supabase dashboard')
      
      return NextResponse.json({
        success: false,
        message: 'Database tables need to be created',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Run the following SQL to create tables:',
          `
          -- Create student_profiles table
          CREATE TABLE student_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            personal_info JSONB DEFAULT '{}',
            contact_info JSONB DEFAULT '{}',
            academic_history JSONB DEFAULT '{}',
            preferences JSONB DEFAULT '{}',
            documents JSONB DEFAULT '{}',
            readiness_assessment JSONB DEFAULT '{}',
            profile_completeness INTEGER DEFAULT 0,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Enable RLS
          ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

          -- Create RLS policies
          CREATE POLICY "Users can view own profile" ON student_profiles
            FOR SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert own profile" ON student_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update own profile" ON student_profiles
            FOR UPDATE USING (auth.uid() = user_id);
          `
        ],
        timestamp: new Date().toISOString()
      })
    }

    // Step 2: Test database access
    console.log('🔍 Step 2: Testing database access...')
    
    if (tableError) {
      console.error('❌ Database access error:', tableError)
      
      return NextResponse.json({
        success: false,
        error: 'Database access failed',
        details: tableError,
        message: 'Check RLS policies and table permissions',
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Database tables exist and are accessible')

    // Step 3: Create a test user for development
    console.log('👤 Step 3: Creating test user...')
    
    const testEmail = 'test@apply4me.co.za'
    const testPassword = 'TestPassword123!'
    
    // Check if test user already exists
    const { data: existingUser, error: userCheckError } = await adminSupabase.auth.admin.listUsers()
    
    const testUserExists = existingUser?.users?.some(user => user.email === testEmail)
    
    if (!testUserExists) {
      console.log('📝 Creating new test user...')
      
      const { data: newUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true // Auto-confirm email for testing
      })
      
      if (createUserError) {
        console.error('❌ Failed to create test user:', createUserError)
        
        return NextResponse.json({
          success: false,
          error: 'Failed to create test user',
          details: createUserError,
          timestamp: new Date().toISOString()
        })
      }
      
      console.log('✅ Test user created:', newUser.user?.email)
    } else {
      console.log('✅ Test user already exists')
    }

    // Step 4: Test profile creation
    console.log('📊 Step 4: Testing profile creation...')
    
    // Get the test user
    const testUser = existingUser?.users?.find(user => user.email === testEmail)
    
    if (testUser) {
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await adminSupabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', testUser.id)
        .single()
      
      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // No profile exists, create one
        console.log('📝 Creating test profile...')
        
        const { data: newProfile, error: createProfileError } = await adminSupabase
          .from('student_profiles')
          .insert({
            user_id: testUser.id,
            personal_info: {
              firstName: 'Test',
              lastName: 'User',
              email: testEmail
            },
            contact_info: {
              email: testEmail,
              phone: '0123456789'
            },
            profile_completeness: 25
          })
          .select()
          .single()
        
        if (createProfileError) {
          console.error('❌ Failed to create test profile:', createProfileError)
          
          return NextResponse.json({
            success: false,
            error: 'Failed to create test profile',
            details: createProfileError,
            timestamp: new Date().toISOString()
          })
        }
        
        console.log('✅ Test profile created')
      } else {
        console.log('✅ Test profile already exists')
      }
    }

    // Step 5: Return success with instructions
    console.log('🎉 Setup completed successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Complete setup finished successfully!',
      testCredentials: {
        email: testEmail,
        password: testPassword,
        note: 'Use these credentials to test authentication'
      },
      nextSteps: [
        '1. Go to /auth/simple-signin',
        '2. Sign in with the test credentials above',
        '3. Test the profile system',
        '4. Verify data is saving to real database'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Complete setup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Complete setup failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
