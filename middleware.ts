import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isRouteAllowedInProduction, isProduction, getSecurityHeaders, prodLog } from '@/lib/production-utils'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is allowed in production (before any other processing)
  if (!isRouteAllowedInProduction(pathname)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Route not available in production',
        message: 'This endpoint is disabled in production for security reasons.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...getSecurityHeaders()
        }
      }
    )
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip middleware for API routes and health checks
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    prodLog.warn('⚠️ Supabase environment variables not configured, skipping auth middleware')
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Handle auth callback
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // If this is an auth callback with a code, exchange it for a session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to dashboard with welcome parameter for new users
      return NextResponse.redirect(new URL('/dashboard?welcome=true', request.url))
    }
  }

  // If this is an email verification callback
  if (token_hash && type === 'email') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    })
    if (!error) {
      // Redirect to dashboard with welcome parameter for newly verified users
      return NextResponse.redirect(new URL('/dashboard?welcome=true', request.url))
    } else {
      // Redirect to verification page with error
      return NextResponse.redirect(new URL('/auth/verify-email?error=verification_failed', request.url))
    }
  }

  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (
    request.nextUrl.pathname.startsWith('/auth/signin') ||
    request.nextUrl.pathname.startsWith('/auth/signup')
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add security headers in production
  if (isProduction()) {
    const securityHeaders = getSecurityHeaders()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
