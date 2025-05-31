import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating test profile...')

    const adminSupabase = createServerSupabaseAdminClient()

    // Get the test user
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()

    if (usersError) {
      console.error('❌ Failed to list users:', usersError)
      return NextResponse.json({
        success: false,
        error: 'Failed to list users',
        details: usersError,
        timestamp: new Date().toISOString()
      })
    }

    const testUser = users.users.find(user => user.email === 'test@apply4me.co.za')

    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'Test user not found',
        message: 'Run /api/setup/complete first',
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Found test user:', testUser.email)

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    if (existingProfile) {
      console.log('✅ Profile already exists')
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
        timestamp: new Date().toISOString()
      })
    }

    // Create the profile
    console.log('📝 Creating new profile...')

    // Minimal profile data - only required fields
    const profileData = {
      user_id: testUser.id
    }

    const { data: newProfile, error: createError } = await adminSupabase
      .from('student_profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create profile:', createError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create profile',
        details: createError,
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Profile created successfully')

    return NextResponse.json({
      success: true,
      message: 'Test profile created successfully!',
      profile: newProfile,
      testCredentials: {
        email: 'test@apply4me.co.za',
        password: 'TestPassword123!'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Create test profile error:', error)

    return NextResponse.json({
      success: false,
      error: 'Create test profile failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
