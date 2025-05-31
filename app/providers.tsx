'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Toaster } from '@/components/ui/toaster'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => {
  try {
    const context = useContext(AuthContext)
    if (!context) {
      // Check if we're on the server side
      if (typeof window === 'undefined') {
        // Server-side fallback
        return {
          user: null,
          session: null,
          loading: true,
          signIn: async () => ({ error: new Error('Auth not available on server') }),
          signUp: async () => ({ error: new Error('Auth not available on server') }),
          signOut: async () => {},
          refreshSession: async () => {},
        }
      }

      // In development, log the error but provide a fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('useAuth called outside of AuthProvider, providing fallback')
        return {
          user: null,
          session: null,
          loading: false,
          signIn: async () => ({ error: new Error('Auth not available') }),
          signUp: async () => ({ error: new Error('Auth not available') }),
          signOut: async () => {},
          refreshSession: async () => {},
        }
      }
      throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
  } catch (error) {
    // Catch any React context errors and provide fallback
    console.warn('useAuth context error, providing fallback:', error)
    return {
      user: null,
      session: null,
      loading: false,
      signIn: async () => ({ error: new Error('Auth context error') }),
      signUp: async () => ({ error: new Error('Auth context error') }),
      signOut: async () => {},
      refreshSession: async () => {},
    }
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Error getting initial session:', error)
        } else {
          console.log('🔐 Initial session:', session ? 'Found' : 'None')
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('❌ Session fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session')

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in:', session?.user?.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed for:', session?.user?.email)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Sign out error:', error)
        throw error
      }
      console.log('👋 Successfully signed out')
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('❌ Session refresh error:', error)
        throw error
      }
      console.log('🔄 Session refreshed successfully')
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('❌ Session refresh failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, refreshSession }}>
      {children}
      <Toaster />
    </AuthContext.Provider>
  )
}
