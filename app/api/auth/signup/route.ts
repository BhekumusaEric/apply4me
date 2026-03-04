import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use admin client to bypass RLS and email confirmation issues
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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

    console.log('👤 Creating new user account:', email)

    // Use admin API to create user — auto-confirms email, bypasses rate limiting
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so users can login immediately
    })

    if (error) {
      console.error('❌ Signup error:', error)

      if (error.message?.includes('already registered') || error.message?.includes('already exists') || error.status === 422) {
        return NextResponse.json(
          {
            error: 'Account already exists',
            message: 'An account with this email already exists. Please sign in instead.',
            action: 'signin'
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data.user) {
      console.log('✅ User created successfully:', data.user.email)

      // Create a profile for the new user
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: email.split('@')[0], // Use part of email as initial name
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (profileError && profileError.code !== '23505') {
        console.warn('⚠️ Could not create profile (non-fatal):', profileError.message)
      }
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email },
      message: 'Account created successfully! You can now sign in.'
    })

  } catch (error) {
    console.error('❌ Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
