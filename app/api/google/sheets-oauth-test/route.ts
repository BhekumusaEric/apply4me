import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google/sheets-service'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token provided'
      }, { status: 400 })
    }

    console.log('🔍 Testing Google Sheets with OAuth token...')
    
    // Create Sheets service with OAuth
    const sheetsService = await GoogleSheetsService.withOAuth(accessToken, refreshToken)
    
    // Test creating a spreadsheet
    const spreadsheet = await sheetsService.createSpreadsheet(
      `Apply4Me OAuth Test - ${new Date().toISOString()}`,
      ['OAuth Test Sheet', 'Test Data']
    )

    // Test adding data to the spreadsheet
    await sheetsService.updateData(spreadsheet.spreadsheetId!, 'OAuth Test Sheet!A1:C3', [
      ['Name', 'Email', 'Status'],
      ['Test User', 'test@example.com', 'Active'],
      ['OAuth Test', 'oauth@test.com', 'Success']
    ])

    return NextResponse.json({
      success: true,
      message: 'Google Sheets OAuth test successful!',
      results: {
        spreadsheet: {
          id: spreadsheet.spreadsheetId,
          url: spreadsheet.spreadsheetUrl,
          title: `Apply4Me OAuth Test - ${new Date().toISOString()}`
        },
        dataAdded: true
      }
    })

  } catch (error: any) {
    console.error('❌ Google Sheets OAuth test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Google Sheets OAuth test failed',
      details: error.message
    }, { status: 500 })
  }
}
