import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_callback_error`)
      }

      if (data.user) {
        // Redirect to dashboard with welcome parameter for new users
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?welcome=true`)
      }
    } catch (error) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_callback_error`)
    }
  }

  if (token_hash && type === 'email') {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email'
      })

      if (error) {
        console.error('Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/verify-email?error=verification_failed`)
      }

      if (data.user) {
        console.log('Email verified and user authenticated:', data.user.email)
        // Redirect to dashboard with welcome parameter for newly verified users
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?welcome=true`)
      }
    } catch (error) {
      console.error('Email verification exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-email?error=verification_failed`)
    }
  }

  // If no code or token_hash, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
