import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/google-auth'
import { ApplicationTracker, ApplicationData } from '@/lib/services/application-tracker'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { action, ...data } = await request.json()
    const tracker = new ApplicationTracker()

    switch (action) {
      case 'create_tracker':
        const { studentName, academicYear } = data
        const result = await tracker.createApplicationTracker(studentName, academicYear)
        
        return NextResponse.json({
          success: result.success,
          spreadsheetId: result.spreadsheetId,
          spreadsheetUrl: result.spreadsheetUrl,
          message: result.success 
            ? 'Application tracker created successfully!' 
            : 'Failed to create application tracker'
        })

      case 'add_application':
        const { spreadsheetId, application } = data
        const added = await tracker.addApplication(spreadsheetId, application)
        
        return NextResponse.json({
          success: added,
          message: added 
            ? 'Application added successfully!' 
            : 'Failed to add application'
        })

      case 'update_status':
        const { spreadsheetId: updateSpreadsheetId, institutionName, newStatus } = data
        const updated = await tracker.updateApplicationStatus(
          updateSpreadsheetId, 
          institutionName, 
          newStatus
        )
        
        return NextResponse.json({
          success: updated,
          message: updated 
            ? 'Application status updated successfully!' 
            : 'Failed to update application status'
        })

      case 'get_applications':
        const { spreadsheetId: getSpreadsheetId } = data
        const applications = await tracker.getApplications(getSpreadsheetId)
        
        return NextResponse.json({
          success: true,
          applications
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Application tracker API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spreadsheetId = searchParams.get('spreadsheetId')

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'Spreadsheet ID required'
      }, { status: 400 })
    }

    const tracker = new ApplicationTracker()
    const applications = await tracker.getApplications(spreadsheetId)
    
    return NextResponse.json({
      success: true,
      applications
    })

  } catch (error: any) {
    console.error('❌ Get applications error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
