import { NextRequest, NextResponse } from 'next/server'
import { verifyGoogleCredentials } from '@/lib/google/auth-config'
import { googleDriveService } from '@/lib/google/drive-service'
import { googleSheetsService } from '@/lib/google/sheets-service'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Google Services Integration...')

    // Test Google Cloud credentials
    console.log('📋 Testing Google Cloud credentials...')
    const credentialsTest = await verifyGoogleCredentials()
    
    if (!credentialsTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Google Cloud credentials verification failed',
        details: credentialsTest.error,
        tests: {
          credentials: credentialsTest
        }
      }, { status: 500 })
    }

    console.log('✅ Google Cloud credentials verified')

    // Test Google Drive service
    console.log('📁 Testing Google Drive service...')
    let driveTest: { success: boolean; error?: string; files?: any; nextPageToken?: any } = { success: false, error: 'Not tested' }

    try {
      // Try to list files (this will test authentication)
      const driveResult = await googleDriveService.listFiles(undefined, 1)
      driveTest = driveResult
      console.log('✅ Google Drive service working')
    } catch (error) {
      console.error('❌ Google Drive service error:', error)
      driveTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Drive error'
      }
    }

    // Test Google Sheets service
    console.log('📊 Testing Google Sheets service...')
    let sheetsTest: { success: boolean; error?: string; spreadsheetId?: string; spreadsheetUrl?: string } = { success: false, error: 'Not tested' }

    try {
      // Try to create a test spreadsheet
      const sheetsResult = await googleSheetsService.createSpreadsheet(
        `Apply4Me Test - ${new Date().toISOString()}`,
        ['Test Sheet']
      )
      sheetsTest = sheetsResult
      console.log('✅ Google Sheets service working')

      // Clean up test spreadsheet if created successfully
      if (sheetsTest.success && sheetsTest.spreadsheetId) {
        console.log('🧹 Cleaning up test spreadsheet...')
        // Note: We would need Drive service to delete the spreadsheet
        // For now, we'll leave it as it's just a test
      }
    } catch (error) {
      console.error('❌ Google Sheets service error:', error)
      sheetsTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Sheets error'
      }
    }

    // Environment variables check
    const envCheck = {
      GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL
    }

    const allServicesWorking = credentialsTest.success && driveTest.success && sheetsTest.success
    const allEnvVarsSet = Object.values(envCheck).every(Boolean)

    return NextResponse.json({
      success: allServicesWorking,
      message: allServicesWorking 
        ? 'All Google services are working correctly!' 
        : 'Some Google services have issues',
      timestamp: new Date().toISOString(),
      environment: {
        variables: envCheck,
        allSet: allEnvVarsSet
      },
      tests: {
        credentials: credentialsTest,
        drive: driveTest,
        sheets: sheetsTest
      },
      recommendations: allServicesWorking ? [
        'Google services are ready for production use',
        'You can now integrate Google Sign-In in your app',
        'Document storage via Google Drive is available',
        'Application tracking via Google Sheets is ready'
      ] : [
        'Check Google Cloud credentials configuration',
        'Ensure service account has proper permissions',
        'Verify all environment variables are set correctly',
        'Check Google Cloud Console for API enablement'
      ]
    })

  } catch (error) {
    console.error('❌ Google services test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Google services test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      recommendations: [
        'Check if Google Cloud CLI is properly configured',
        'Verify service account credentials',
        'Ensure required APIs are enabled in Google Cloud Console',
        'Check environment variables configuration'
      ]
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_tracking_sheet':
        const { studentName, studentEmail } = data
        const result = await googleSheetsService.createApplicationTrackingSheet(
          studentName,
          studentEmail
        )
        return NextResponse.json(result)

      case 'upload_document':
        const { fileName, fileData, mimeType } = data
        const buffer = Buffer.from(fileData, 'base64')
        const uploadResult = await googleDriveService.uploadFile(
          fileName,
          buffer,
          mimeType
        )
        return NextResponse.json(uploadResult)

      case 'create_folder':
        const { folderName } = data
        const folderResult = await googleDriveService.createFolder(folderName)
        return NextResponse.json(folderResult)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Google services API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
