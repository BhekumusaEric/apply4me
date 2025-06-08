import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/google-auth'
import { google } from 'googleapis'

/**
 * Get authenticated Google OAuth client from NextAuth session
 */
export async function getGoogleOAuthClient() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error('No Google access token found in session')
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    )

    // Set credentials
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    })

    return oauth2Client
  } catch (error) {
    console.error('Error creating Google OAuth client:', error)
    throw error
  }
}

/**
 * Get Google OAuth client for client-side requests
 */
export async function getGoogleOAuthClientFromToken(accessToken: string, refreshToken?: string) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    return oauth2Client
  } catch (error) {
    console.error('Error creating Google OAuth client from token:', error)
    throw error
  }
}

/**
 * Check if user has valid Google OAuth session
 */
export async function hasValidGoogleSession() {
  try {
    const session = await getServerSession(authOptions)
    return !!(session?.accessToken && session?.provider === 'google')
  } catch (error) {
    console.error('Error checking Google session:', error)
    return false
  }
}

/**
 * Get Google access token from session
 */
export async function getGoogleAccessToken() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error('No Google access token found in session')
    }

    return session.accessToken
  } catch (error) {
    console.error('Error getting Google access token:', error)
    throw error
  }
}
