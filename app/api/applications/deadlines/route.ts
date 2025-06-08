import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/google-auth'
import { GoogleCalendarService, DeadlineEvent } from '@/lib/services/google-calendar-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // For now, allow any authenticated user to use calendar features
    // TODO: Add proper Google OAuth token validation when needed

    const { action, ...data } = await request.json()
    const calendarService = new GoogleCalendarService()

    switch (action) {
      case 'create_calendar':
        const { studentName } = data
        const result = await calendarService.createApplicationCalendar(studentName)
        
        return NextResponse.json({
          success: result.success,
          calendarId: result.calendarId,
          message: result.success 
            ? 'Application calendar created successfully!' 
            : 'Failed to create application calendar'
        })

      case 'add_deadline':
        const { calendarId, deadline } = data
        const added = await calendarService.addDeadline(calendarId, deadline)
        
        return NextResponse.json({
          success: added.success,
          eventId: added.eventId,
          message: added.success 
            ? 'Deadline added successfully!' 
            : 'Failed to add deadline'
        })

      case 'create_application_deadlines':
        const { calendarId: appCalendarId, institutionName, program, applicationDeadline } = data
        const created = await calendarService.createApplicationDeadlines(
          appCalendarId,
          institutionName,
          program,
          applicationDeadline
        )
        
        return NextResponse.json({
          success: created,
          message: created 
            ? 'Application deadline series created successfully!' 
            : 'Failed to create application deadlines'
        })

      case 'get_upcoming':
        const { calendarId: getCalendarId, daysAhead } = data
        const upcoming = await calendarService.getUpcomingDeadlines(
          getCalendarId, 
          daysAhead || 30
        )
        
        return NextResponse.json({
          success: true,
          deadlines: upcoming
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Calendar deadlines API error:', error)
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

    // For now, allow any authenticated user to use calendar features
    // TODO: Add proper Google OAuth token validation when needed

    const { searchParams } = new URL(request.url)
    const calendarId = searchParams.get('calendarId')
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30')

    if (!calendarId) {
      return NextResponse.json({
        success: false,
        error: 'Calendar ID required'
      }, { status: 400 })
    }

    const calendarService = new GoogleCalendarService()
    const deadlines = await calendarService.getUpcomingDeadlines(calendarId, daysAhead)
    
    return NextResponse.json({
      success: true,
      deadlines
    })

  } catch (error: any) {
    console.error('❌ Get deadlines error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
