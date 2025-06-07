import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'

// Supabase client for NextAuth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!
  }),
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
      }
      
      if (profile) {
        token.email = profile.email
        token.name = profile.name
        token.picture = profile.picture
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.provider = token.provider as string
      
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      if (account?.provider === 'google') {
        try {
          // Store additional user info in Supabase
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!existingUser) {
            // Create new user profile
            await supabase
              .from('profiles')
              .insert({
                email: user.email,
                full_name: user.name,
                avatar_url: user.image,
                provider: 'google',
                google_id: account.providerAccountId,
                created_at: new Date().toISOString()
              })
          }
          
          return true
        } catch (error) {
          console.error('Error during Google sign in:', error)
          return false
        }
      }
      
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
}

// Google OAuth scopes for different services
export const GOOGLE_SCOPES = {
  BASIC: ['openid', 'email', 'profile'],
  DRIVE: ['https://www.googleapis.com/auth/drive.file'],
  GMAIL: ['https://www.googleapis.com/auth/gmail.send'],
  CALENDAR: ['https://www.googleapis.com/auth/calendar'],
  SHEETS: ['https://www.googleapis.com/auth/spreadsheets']
}

// Helper function to get Google access token
export async function getGoogleAccessToken(userId: string) {
  try {
    const { data: account } = await supabase
      .from('accounts')
      .select('access_token, refresh_token, expires_at')
      .eq('userId', userId)
      .eq('provider', 'google')
      .single()

    if (!account) {
      throw new Error('No Google account found for user')
    }

    // Check if token is expired
    if (account.expires_at && Date.now() > account.expires_at * 1000) {
      // Token is expired, need to refresh
      // This would require implementing token refresh logic
      throw new Error('Google access token expired')
    }

    return account.access_token
  } catch (error) {
    console.error('Error getting Google access token:', error)
    throw error
  }
}
