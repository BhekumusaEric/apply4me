import { NextRequest, NextResponse } from 'next/server'
import { GoogleDriveService } from '@/lib/google/drive-service'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token provided'
      }, { status: 400 })
    }

    console.log('🔍 Testing Google Drive with OAuth token...')
    
    // Create Drive service with OAuth
    const driveService = await GoogleDriveService.withOAuth(accessToken, refreshToken)
    
    // Test listing files
    const files = await driveService.listFiles()
    
    // Test creating a folder
    const testFolder = await driveService.createFolder(`Apply4Me OAuth Test - ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Google Drive OAuth test successful!',
      results: {
        filesFound: Array.isArray(files) ? files.length : 0,
        sampleFiles: Array.isArray(files) ? files.slice(0, 3).map(f => ({
          name: f.name,
          id: f.id,
          mimeType: f.mimeType
        })) : [],
        testFolder: testFolder.success ? {
          id: testFolder.folderId,
          name: testFolder.folderName
        } : null
      }
    })

  } catch (error: any) {
    console.error('❌ Google Drive OAuth test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Google Drive OAuth test failed',
      details: error.message
    }, { status: 500 })
  }
}
