import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/google-auth'
import { getGoogleOAuthClientFromToken } from '@/lib/google/oauth-client'

export interface DeadlineEvent {
  institutionName: string
  program: string
  deadlineType: 'Application' | 'Scholarship' | 'Housing' | 'Financial Aid' | 'Interview'
  date: string
  time?: string
  description?: string
  priority: 'High' | 'Medium' | 'Low'
}

export class GoogleCalendarService {
  private calendar: any = null

  constructor() {}

  /**
   * Initialize with OAuth if user is signed in with Google
   */
  private async initializeWithOAuth() {
    try {
      const session = await getServerSession(authOptions)
      
      if (session?.accessToken && session?.provider === 'google') {
        const auth = await getGoogleOAuthClientFromToken(
          session.accessToken, 
          session.refreshToken
        )
        this.calendar = google.calendar({ version: 'v3', auth })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error initializing Google Calendar service:', error)
      return false
    }
  }

  /**
   * Create a dedicated calendar for university application deadlines
   */
  async createApplicationCalendar(studentName: string): Promise<{
    calendarId: string
    success: boolean
  }> {
    try {
      const usingOAuth = await this.initializeWithOAuth()
      
      if (!usingOAuth || !this.calendar) {
        throw new Error('Google Calendar access requires OAuth authentication')
      }

      const calendarName = `${studentName} - University Applications`
      
      const calendar = await this.calendar.calendars.insert({
        requestBody: {
          summary: calendarName,
          description: 'University application deadlines and important dates',
          timeZone: 'Africa/Johannesburg' // South African timezone
        }
      })

      console.log(`✅ Created application calendar: ${calendarName}`)

      return {
        calendarId: calendar.data.id,
        success: true
      }
    } catch (error) {
      console.error('Error creating application calendar:', error)
      return {
        calendarId: '',
        success: false
      }
    }
  }

  /**
   * Add a deadline event to the calendar
   */
  async addDeadline(calendarId: string, deadline: DeadlineEvent): Promise<{
    eventId: string
    success: boolean
  }> {
    try {
      await this.initializeWithOAuth()
      
      if (!this.calendar) {
        throw new Error('Calendar service not initialized')
      }

      // Parse the deadline date
      const deadlineDate = new Date(deadline.date)
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid deadline date')
      }

      // Set time if provided, otherwise default to 11:59 PM
      if (deadline.time) {
        const [hours, minutes] = deadline.time.split(':')
        deadlineDate.setHours(parseInt(hours), parseInt(minutes))
      } else {
        deadlineDate.setHours(23, 59) // Default to end of day
      }

      const endDate = new Date(deadlineDate)
      endDate.setHours(endDate.getHours() + 1) // 1 hour duration

      const eventTitle = `${deadline.deadlineType}: ${deadline.institutionName} - ${deadline.program}`
      const eventDescription = `
${deadline.deadlineType} deadline for ${deadline.program} at ${deadline.institutionName}

Priority: ${deadline.priority}
${deadline.description ? `\nNotes: ${deadline.description}` : ''}

Created by Apply4Me - University Application Manager
      `.trim()

      const event = await this.calendar.events.insert({
        calendarId: calendarId,
        requestBody: {
          summary: eventTitle,
          description: eventDescription,
          start: {
            dateTime: deadlineDate.toISOString(),
            timeZone: 'Africa/Johannesburg'
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Africa/Johannesburg'
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 * 7 }, // 1 week before
              { method: 'email', minutes: 24 * 60 * 3 }, // 3 days before
              { method: 'popup', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 } // 1 hour before
            ]
          },
          colorId: this.getPriorityColor(deadline.priority)
        }
      })

      console.log(`✅ Added deadline: ${eventTitle}`)

      return {
        eventId: event.data.id || '',
        success: true
      }
    } catch (error) {
      console.error('Error adding deadline:', error)
      return {
        eventId: '',
        success: false
      }
    }
  }

  /**
   * Get upcoming deadlines from calendar
   */
  async getUpcomingDeadlines(calendarId: string, daysAhead: number = 30): Promise<any[]> {
    try {
      await this.initializeWithOAuth()
      
      if (!this.calendar) {
        throw new Error('Calendar service not initialized')
      }

      const now = new Date()
      const futureDate = new Date()
      futureDate.setDate(now.getDate() + daysAhead)

      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error)
      return []
    }
  }

  /**
   * Create multiple deadline reminders for an application
   */
  async createApplicationDeadlines(
    calendarId: string,
    institutionName: string,
    program: string,
    applicationDeadline: string
  ): Promise<boolean> {
    try {
      const deadlines: DeadlineEvent[] = [
        {
          institutionName,
          program,
          deadlineType: 'Application',
          date: applicationDeadline,
          priority: 'High',
          description: 'Final application submission deadline'
        }
      ]

      // Add reminder deadlines leading up to the main deadline
      const mainDeadline = new Date(applicationDeadline)
      
      // 2 weeks before: Start application
      const startDate = new Date(mainDeadline)
      startDate.setDate(startDate.getDate() - 14)
      deadlines.push({
        institutionName,
        program,
        deadlineType: 'Application',
        date: startDate.toISOString().split('T')[0],
        priority: 'Medium',
        description: 'Start working on application (2 weeks before deadline)'
      })

      // 1 week before: Review and finalize
      const reviewDate = new Date(mainDeadline)
      reviewDate.setDate(reviewDate.getDate() - 7)
      deadlines.push({
        institutionName,
        program,
        deadlineType: 'Application',
        date: reviewDate.toISOString().split('T')[0],
        priority: 'High',
        description: 'Review and finalize application (1 week before deadline)'
      })

      // Add all deadlines
      for (const deadline of deadlines) {
        await this.addDeadline(calendarId, deadline)
      }

      console.log(`✅ Created application deadline series for ${institutionName} - ${program}`)
      return true
    } catch (error) {
      console.error('Error creating application deadlines:', error)
      return false
    }
  }

  /**
   * Get color ID based on priority
   */
  private getPriorityColor(priority: DeadlineEvent['priority']): string {
    switch (priority) {
      case 'High': return '11' // Red
      case 'Medium': return '5' // Yellow
      case 'Low': return '2' // Green
      default: return '1' // Blue
    }
  }

  /**
   * Static method to create service with OAuth
   */
  static async withOAuth(accessToken: string, refreshToken?: string) {
    const service = new GoogleCalendarService()
    const auth = await getGoogleOAuthClientFromToken(accessToken, refreshToken)
    service.calendar = google.calendar({ version: 'v3', auth })
    return service
  }
}
