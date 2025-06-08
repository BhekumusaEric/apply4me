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

  // Skip middleware for API routes, NextAuth routes, and health checks
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    return response
  }

  // For now, disable Supabase auth middleware to focus on NextAuth
  // TODO: Integrate NextAuth session checking with middleware
  console.log('🔍 Middleware: Skipping auth checks for NextAuth integration')

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
