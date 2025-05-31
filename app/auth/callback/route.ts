import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  console.log('🔐 Auth callback received:', { code: !!code, token_hash: !!token_hash, type })

  if (code) {
    const supabase = createServerSupabaseClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_callback_error`)
      }

      if (data.user) {
        console.log('✅ User authenticated via code:', data.user.email)
        // Redirect to profile setup for new users
        return NextResponse.redirect(`${requestUrl.origin}/profile/setup?welcome=true`)
      }
    } catch (error) {
      console.error('❌ Code exchange exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_callback_error`)
    }
  }

  if (token_hash && type === 'email') {
    const supabase = createServerSupabaseClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email'
      })

      if (error) {
        console.error('❌ Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/verify-email?error=verification_failed`)
      }

      if (data.user) {
        console.log('✅ Email verified and user authenticated:', data.user.email)
        // Redirect to profile setup for newly verified users
        return NextResponse.redirect(`${requestUrl.origin}/profile/setup?welcome=true`)
      }
    } catch (error) {
      console.error('❌ Email verification exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-email?error=verification_failed`)
    }
  }

  // If no code or token_hash, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
