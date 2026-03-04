import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Use service role admin client — required for admin.createUser
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    console.log('👤 Creating new user account:', email)

    // Use admin API — creates user with email already confirmed so they can
    // log in immediately without needing to verify their email first
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error('❌ Signup error:', error)

      // Duplicate email
      if (error.status === 422 ||
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already exists') ||
        error.message?.toLowerCase().includes('email address has already been registered')) {
        return NextResponse.json(
          {
            error: 'Account already exists',
            message: 'An account with this email already exists. Please sign in instead.',
            action: 'signin'
          },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.user) {
      console.log('✅ User created successfully:', data.user.email)

      // Create profile record — profiles has its own auto-generated UUID PK
      // It is NOT linked to auth.users by FK, just email is used to match
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          email: data.user.email,
          full_name: email.split('@')[0],
          role: 'student',
        })

      if (profileError) {
        if (profileError.code === '23505') {
          console.log('⚠️ Profile already exists (fine)')
        } else {
          // Non-fatal — user can still log in, profile built during onboarding
          console.warn('⚠️ Profile creation failed (non-fatal):', profileError.message)
        }
      } else {
        console.log('✅ Profile created successfully')
      }
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email },
      message: 'Account created successfully! You can now sign in.'
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('❌ Signup API error:', message)
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    )
  }
}
