import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientWithCookies, createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating profile for current authenticated user...')
    
    // Get the current authenticated user
    const supabase = createServerSupabaseClientWithCookies()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ No authenticated user found:', authError)
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: 'Please sign in first',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }
    
    console.log('✅ Found authenticated user:', user.email, 'ID:', user.id)
    
    // Use admin client to create profile
    const adminSupabase = createServerSupabaseAdminClient()
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (existingProfile) {
      console.log('✅ Profile already exists for user')
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
        user: {
          id: user.id,
          email: user.email
        },
        timestamp: new Date().toISOString()
      })
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing profile:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: checkError,
        timestamp: new Date().toISOString()
      })
    }
    
    // Create new profile for current user
    console.log('📝 Creating new profile for user:', user.id)
    
    const profileData = {
      user_id: user.id,
      personal_info: {
        firstName: '',
        lastName: '',
        email: user.email
      },
      contact_info: {
        email: user.email
      },
      academic_history: {},
      study_preferences: {},
      profile_completeness: 5, // Just started
      readiness_score: 0,
      is_verified: false
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
    
    console.log('✅ Profile created successfully for user:', user.email)
    
    return NextResponse.json({
      success: true,
      message: 'Profile created successfully for current user!',
      profile: newProfile,
      user: {
        id: user.id,
        email: user.email
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Create current user profile error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Create profile failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
