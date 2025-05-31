import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing complete authentication flow...')

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Step 1: Test authentication
    console.log('🔐 Step 1: Testing authentication...')

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('❌ Authentication failed:', authError)

      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError,
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Authentication successful for:', authData.user?.email)

    // Step 2: Test database access with authenticated user
    console.log('🗄️ Step 2: Testing database access...')

    const adminSupabase = createServerSupabaseAdminClient()

    const { data: profile, error: profileError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError)

      return NextResponse.json({
        success: false,
        error: 'Profile fetch failed',
        details: profileError,
        auth: {
          success: true,
          user: authData.user?.email
        },
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Profile fetched successfully')

    // Step 3: Test profile update
    console.log('📝 Step 3: Testing profile update...')

    const updateData = {
      profile_completeness: 50,
      personal_info: {
        ...profile.personal_info,
        testUpdate: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }

    const { data: updatedProfile, error: updateError } = await adminSupabase
      .from('student_profiles')
      .update(updateData)
      .eq('user_id', authData.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Profile update failed:', updateError)

      return NextResponse.json({
        success: false,
        error: 'Profile update failed',
        details: updateError,
        auth: {
          success: true,
          user: authData.user?.email
        },
        profile: {
          success: true,
          data: profile
        },
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Profile updated successfully')

    // Step 4: Sign out
    console.log('👋 Step 4: Testing sign out...')

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.warn('⚠️ Sign out warning:', signOutError)
    } else {
      console.log('✅ Sign out successful')
    }

    return NextResponse.json({
      success: true,
      message: 'Complete authentication flow test successful!',
      results: {
        authentication: {
          success: true,
          user: authData.user?.email,
          userId: authData.user?.id
        },
        profileFetch: {
          success: true,
          profileId: profile.id,
          completeness: profile.profile_completeness
        },
        profileUpdate: {
          success: true,
          newCompleteness: updatedProfile.profile_completeness,
          lastUpdated: updatedProfile.last_updated
        },
        signOut: {
          success: !signOutError,
          error: signOutError?.message
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Auth flow test error:', error)

    return NextResponse.json({
      success: false,
      error: 'Auth flow test failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
