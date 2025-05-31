import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientWithCookies, createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking profile status for current user...')
    
    // Get the current authenticated user
    const supabase = createServerSupabaseClientWithCookies()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: 'Please sign in first',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }
    
    console.log('✅ Found authenticated user:', user.email, 'ID:', user.id)
    
    // Use admin client to check profile
    const adminSupabase = createServerSupabaseAdminClient()
    
    // Check if profile exists
    const { data: profile, error: profileError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Profile check error:', profileError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: profileError,
        user: {
          id: user.id,
          email: user.email
        },
        timestamp: new Date().toISOString()
      })
    }
    
    if (!profile) {
      console.log('📝 No profile found, creating one...')
      
      // Create profile for current user
      const profileData = {
        user_id: user.id,
        personal_info: {
          email: user.email
        },
        contact_info: {
          email: user.email
        },
        academic_history: {},
        study_preferences: {},
        profile_completeness: 5,
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
          user: {
            id: user.id,
            email: user.email
          },
          timestamp: new Date().toISOString()
        })
      }
      
      console.log('✅ Profile created successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Profile created successfully!',
        profile: newProfile,
        user: {
          id: user.id,
          email: user.email
        },
        action: 'created',
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('✅ Profile exists')
    
    return NextResponse.json({
      success: true,
      message: 'Profile exists and is accessible',
      profile: profile,
      user: {
        id: user.id,
        email: user.email
      },
      action: 'found',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Profile status check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Profile status check failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
