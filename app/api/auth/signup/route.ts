import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('👤 Creating new user account:', email)

    const supabase = createClient()

    // Create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('❌ Signup error:', error)

      // Handle duplicate user gracefully
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        return NextResponse.json(
          {
            error: 'Account already exists',
            message: 'An account with this email already exists. Please sign in instead.',
            action: 'signin'
          },
          { status: 409 } // Conflict status
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data.user) {
      console.log('✅ User created successfully:', data.user.email)

      // Automatically create a profile for the new user
      console.log('📝 Creating profile for new user:', data.user.id)

      const adminSupabase = createServerSupabaseAdminClient()

      const profileData = {
        user_id: data.user.id,
        personal_info: {
          email: data.user.email
        },
        contact_info: {
          email: data.user.email
        },
        academic_history: {},
        study_preferences: {},
        profile_completeness: 5,
        readiness_score: 0,
        is_verified: false
      }

      const { data: profile, error: profileError } = await adminSupabase
        .from('student_profiles')
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        // Check if it's a duplicate key error (profile already exists)
        if (profileError.code === '23505') {
          console.log('⚠️ Profile already exists for new user (this is fine)')
        } else {
          console.error('❌ Failed to create profile for new user:', profileError)
          // Don't fail the signup, just log the error
        }
      } else {
        console.log('✅ Profile created successfully for new user')
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: data.user?.email_confirmed_at
        ? 'Account created successfully!'
        : 'Account created! Please check your email to verify your account.'
    })

  } catch (error) {
    console.error('❌ Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
