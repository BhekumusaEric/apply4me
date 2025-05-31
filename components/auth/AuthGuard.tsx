'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/simple-signin',
  fallback 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      console.log('🔐 Authentication required, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, show loading or redirect
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // If auth is not required or user is authenticated, render children
  return <>{children}</>
}

// Convenience component for protected routes
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  )
}

// Convenience component for public routes (redirects authenticated users)
export function PublicRoute({ 
  children, 
  redirectTo = '/dashboard',
  ...props 
}: Omit<AuthGuardProps, 'requireAuth'> & { redirectTo?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      console.log('🔐 User already authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [user, loading, redirectTo, router])

  // Show loading state
  if (loading) {
    return props.fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show loading or redirect
  if (user) {
    return props.fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, render children
  return <>{children}</>
}
