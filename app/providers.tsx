'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider, useSession } from 'next-auth/react'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  // Hybrid auth properties
  isAuthenticated: boolean
  authProvider: 'supabase' | 'nextauth' | null
  userEmail: string | null
  userName: string | null
  userId: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  isAuthenticated: false,
  authProvider: null,
  userEmail: null,
  userName: null,
  userId: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // In development, log the error but provide a fallback
    if (process.env.NODE_ENV === 'development') {
      console.warn('useAuth called outside of AuthProvider, providing fallback')
      return {
        user: null,
        loading: false,
        signIn: async () => ({ error: new Error('Auth not available') }),
        signUp: async () => ({ error: new Error('Auth not available') }),
        signOut: async () => {},
        isAuthenticated: false,
        authProvider: null,
        userEmail: null,
        userName: null,
        userId: null,
      }
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hybrid Auth Provider that combines Supabase and NextAuth
function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Get NextAuth session
  const { data: nextAuthSession, status: nextAuthStatus } = useSession()

  // Hybrid authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authProvider, setAuthProvider] = useState<'supabase' | 'nextauth' | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      // Check if we have either Supabase or NextAuth session
      const hasSupabaseAuth = !!session?.user
      const hasNextAuth = nextAuthStatus === 'authenticated' && !!nextAuthSession?.user

      if (hasSupabaseAuth) {
        setIsAuthenticated(true)
        setAuthProvider('supabase')
        setUserEmail(session.user.email || null)
        setUserName(session.user.user_metadata?.full_name || session.user.email || null)
        setUserId(session.user.id || null)
        console.log('🔐 Supabase auth detected:', session.user.email, 'ID:', session.user.id)
      } else if (hasNextAuth && nextAuthSession?.user) {
        setIsAuthenticated(true)
        setAuthProvider('nextauth')
        setUserEmail(nextAuthSession.user.email || null)
        setUserName(nextAuthSession.user.name || nextAuthSession.user.email || null)
        setUserId(nextAuthSession.user.email || null) // For NextAuth, we'll use email as identifier
        console.log('🔐 NextAuth detected:', nextAuthSession.user.email)
      } else {
        setIsAuthenticated(false)
        setAuthProvider(null)
        setUserEmail(null)
        setUserName(null)
        setUserId(null)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)

        if (session?.user) {
          setIsAuthenticated(true)
          setAuthProvider('supabase')
          setUserEmail(session.user.email || null)
          setUserName(session.user.user_metadata?.full_name || session.user.email || null)
          setUserId(session.user.id || null)
        } else if (nextAuthStatus !== 'authenticated') {
          // Only clear if NextAuth is also not authenticated
          setIsAuthenticated(false)
          setAuthProvider(null)
          setUserEmail(null)
          setUserName(null)
          setUserId(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, nextAuthSession, nextAuthStatus])

  // Update state when NextAuth session changes
  useEffect(() => {
    if (nextAuthStatus === 'loading') return

    if (nextAuthStatus === 'authenticated' && nextAuthSession?.user) {
      // Only set NextAuth as primary if no Supabase user
      if (!user) {
        setIsAuthenticated(true)
        setAuthProvider('nextauth')
        setUserEmail(nextAuthSession.user.email || null)
        setUserName(nextAuthSession.user.name || nextAuthSession.user.email || null)
        setUserId(nextAuthSession.user.email || null) // For NextAuth, use email as identifier
        console.log('🔐 NextAuth session updated:', nextAuthSession.user.email)
      }
    } else if (nextAuthStatus === 'unauthenticated') {
      // Only clear if Supabase is also not authenticated
      if (!user) {
        setIsAuthenticated(false)
        setAuthProvider(null)
        setUserEmail(null)
        setUserName(null)
        setUserId(null)
      }
    }
  }, [nextAuthSession, nextAuthStatus, user])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    // Sign out from both systems
    await supabase.auth.signOut()

    // Clear hybrid state
    setIsAuthenticated(false)
    setAuthProvider(null)
    setUserEmail(null)
    setUserName(null)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAuthenticated,
      authProvider,
      userEmail,
      userName,
      userId
    }}>
      {children}
      <Toaster />
    </AuthContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HybridAuthProvider>
        {children}
      </HybridAuthProvider>
    </SessionProvider>
  )
}
