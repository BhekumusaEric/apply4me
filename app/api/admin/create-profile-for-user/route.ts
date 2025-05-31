import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    console.log('👤 Creating profile for user:', userId, email)

    // Use admin client to create profile
    const adminSupabase = createServerSupabaseAdminClient()

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingProfile) {
      console.log('✅ Profile already exists for user')
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
        action: 'existing',
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

    // Create new profile
    console.log('📝 Creating new profile for user:', userId)

    const profileData = {
      user_id: userId,
      personal_info: {
        email: email || ''
      },
      contact_info: {
        email: email || ''
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
      // Check if it's a duplicate key error (profile already exists)
      if (createError.code === '23505') {
        console.log('⚠️ Profile already exists for user, fetching existing profile...')

        // Fetch the existing profile
        const { data: existingProfile, error: fetchError } = await adminSupabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          console.error('❌ Failed to fetch existing profile:', fetchError)
          return NextResponse.json({
            success: false,
            error: 'Failed to access existing profile',
            details: fetchError,
            timestamp: new Date().toISOString()
          })
        }

        console.log('✅ Using existing profile')
        return NextResponse.json({
          success: true,
          message: 'Profile already exists (no action needed)',
          profile: existingProfile,
          action: 'existing',
          timestamp: new Date().toISOString()
        })
      } else {
        console.error('❌ Failed to create profile:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create profile',
          details: createError,
          timestamp: new Date().toISOString()
        })
      }
    }

    console.log('✅ Profile created successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully!',
      profile: newProfile,
      action: 'created',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Admin create profile error:', error)

    return NextResponse.json({
      success: false,
      error: 'Admin create profile failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
