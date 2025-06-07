import { GoogleAuth } from 'google-auth-library'

// Google Cloud Project Configuration
export const GOOGLE_CLOUD_CONFIG = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'apply4me',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/gmail.send'
  ]
}

// Initialize Google Auth
export const googleAuth = new GoogleAuth({
  projectId: GOOGLE_CLOUD_CONFIG.projectId,
  keyFilename: GOOGLE_CLOUD_CONFIG.keyFilename,
  scopes: GOOGLE_CLOUD_CONFIG.scopes
})

// Get authenticated client
export async function getGoogleAuthClient() {
  try {
    const authClient = await googleAuth.getClient()
    return authClient
  } catch (error) {
    console.error('Error getting Google Auth client:', error)
    throw error
  }
}

// Get project ID
export async function getGoogleProjectId() {
  try {
    const projectId = await googleAuth.getProjectId()
    return projectId
  } catch (error) {
    console.error('Error getting Google Project ID:', error)
    return GOOGLE_CLOUD_CONFIG.projectId
  }
}

// Verify Google Cloud credentials
export async function verifyGoogleCredentials() {
  try {
    const client = await getGoogleAuthClient()
    const projectId = await getGoogleProjectId()
    
    return {
      success: true,
      projectId,
      message: 'Google Cloud credentials verified successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to verify Google Cloud credentials'
    }
  }
}
