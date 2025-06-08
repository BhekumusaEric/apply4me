import { GoogleSheetsService } from '@/lib/google/sheets-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/google-auth'

export interface ApplicationData {
  institutionName: string
  program: string
  deadline: string
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected' | 'Waitlisted'
  applicationFee: string
  requirements: string[]
  notes?: string
}

export class ApplicationTracker {
  private sheetsService: GoogleSheetsService | null = null

  constructor() {}

  /**
   * Initialize with OAuth if user is signed in with Google
   */
  private async initializeWithOAuth() {
    try {
      const session = await getServerSession(authOptions)
      console.log('🔍 Application Tracker Session:', {
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
        provider: session?.provider,
        user: session?.user?.email
      })

      if (session?.accessToken && session?.provider === 'google') {
        console.log('✅ Using OAuth for Google Sheets in Application Tracker')
        this.sheetsService = await GoogleSheetsService.withOAuth(
          session.accessToken,
          session.refreshToken
        )
        return true
      }

      console.log('⚠️ Falling back to API key for Google Sheets')
      // Fallback to regular service (API key)
      this.sheetsService = new GoogleSheetsService()
      return false
    } catch (error) {
      console.error('Error initializing application tracker:', error)
      this.sheetsService = new GoogleSheetsService()
      return false
    }
  }

  /**
   * Create a new application tracking spreadsheet for a student
   */
  async createApplicationTracker(studentName: string, academicYear: string): Promise<{
    spreadsheetId: string
    spreadsheetUrl: string
    success: boolean
  }> {
    try {
      const usingOAuth = await this.initializeWithOAuth()
      
      if (!this.sheetsService) {
        throw new Error('Failed to initialize Google Sheets service')
      }

      const spreadsheetTitle = `${studentName} - University Applications ${academicYear}`

      const spreadsheet = await this.sheetsService.createSpreadsheet(
        spreadsheetTitle,
        [
          'Application Tracker',
          'Requirements Checklist',
          'Deadlines Calendar'
        ]
      )

      if (!spreadsheet.spreadsheetId) {
        throw new Error('Failed to create spreadsheet')
      }

      // Set up the header row for the main tracker
      await this.setupTrackerHeaders(spreadsheet.spreadsheetId)
      
      // Set up the requirements checklist
      await this.setupRequirementsSheet(spreadsheet.spreadsheetId)
      
      // Set up the deadlines calendar
      await this.setupDeadlinesSheet(spreadsheet.spreadsheetId)

      console.log(`✅ Created application tracker: ${spreadsheet.spreadsheetUrl}`)

      return {
        spreadsheetId: spreadsheet.spreadsheetId,
        spreadsheetUrl: spreadsheet.spreadsheetUrl || '',
        success: true
      }
    } catch (error) {
      console.error('Error creating application tracker:', error)
      return {
        spreadsheetId: '',
        spreadsheetUrl: '',
        success: false
      }
    }
  }

  /**
   * Add a new application to the tracking spreadsheet
   */
  async addApplication(spreadsheetId: string, application: ApplicationData): Promise<boolean> {
    try {
      await this.initializeWithOAuth()
      
      if (!this.sheetsService) {
        throw new Error('Sheets service not initialized')
      }

      // Add the application data
      const rowData = [
        application.institutionName,
        application.program,
        application.deadline,
        application.status,
        application.applicationFee,
        application.requirements.join(', '),
        application.notes || '',
        new Date().toLocaleDateString() // Date added
      ]

      await this.sheetsService.addData(
        spreadsheetId,
        'Application Tracker!A:H',
        [rowData]
      )

      console.log(`✅ Added application: ${application.institutionName} - ${application.program}`)
      return true
    } catch (error) {
      console.error('Error adding application:', error)
      return false
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    spreadsheetId: string, 
    institutionName: string, 
    newStatus: ApplicationData['status']
  ): Promise<boolean> {
    try {
      await this.initializeWithOAuth()
      
      if (!this.sheetsService) {
        throw new Error('Sheets service not initialized')
      }

      // Find the application row
      const dataResult = await this.sheetsService.readData(
        spreadsheetId,
        'Application Tracker!A:H'
      )

      if (!dataResult.success || !dataResult.values) return false

      for (let i = 1; i < dataResult.values.length; i++) { // Skip header row
        if (dataResult.values[i][0] === institutionName) {
          // Update status column (column D)
          await this.sheetsService.updateData(
            spreadsheetId,
            `Application Tracker!D${i + 1}`,
            [[newStatus]]
          )

          console.log(`✅ Updated ${institutionName} status to: ${newStatus}`)
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error updating application status:', error)
      return false
    }
  }

  /**
   * Set up header row for the main tracker sheet
   */
  private async setupTrackerHeaders(spreadsheetId: string) {
    if (!this.sheetsService) return

    const headers = [
      'Institution Name',
      'Program',
      'Application Deadline',
      'Status',
      'Application Fee',
      'Requirements',
      'Notes',
      'Date Added'
    ]

    await this.sheetsService.addData(
      spreadsheetId,
      'Application Tracker!A1:H1',
      [headers]
    )

    // Format header row (bold)
    // Note: This would require additional formatting API calls
  }

  /**
   * Set up requirements checklist sheet
   */
  private async setupRequirementsSheet(spreadsheetId: string) {
    if (!this.sheetsService) return

    const headers = [
      'Requirement Type',
      'Description',
      'Status',
      'Due Date',
      'Notes'
    ]

    await this.sheetsService.addData(
      spreadsheetId,
      'Requirements Checklist!A1:E1',
      [headers]
    )

    // Add common requirements
    const commonRequirements = [
      ['Personal Statement', 'Main essay/personal statement', 'Not Started', '', ''],
      ['Transcripts', 'Official academic transcripts', 'Not Started', '', ''],
      ['Letters of Recommendation', 'Teacher/counselor recommendations', 'Not Started', '', ''],
      ['Test Scores', 'SAT/ACT/AP scores', 'Not Started', '', ''],
      ['Application Form', 'Completed application form', 'Not Started', '', '']
    ]

    await this.sheetsService.addData(
      spreadsheetId,
      'Requirements Checklist!A2:E6',
      commonRequirements
    )
  }

  /**
   * Set up deadlines calendar sheet
   */
  private async setupDeadlinesSheet(spreadsheetId: string) {
    if (!this.sheetsService) return

    const headers = [
      'Institution',
      'Deadline Type',
      'Date',
      'Days Remaining',
      'Priority'
    ]

    await this.sheetsService.addData(
      spreadsheetId,
      'Deadlines Calendar!A1:E1',
      [headers]
    )
  }

  /**
   * Get application tracker data
   */
  async getApplications(spreadsheetId: string): Promise<ApplicationData[]> {
    try {
      await this.initializeWithOAuth()
      
      if (!this.sheetsService) {
        throw new Error('Sheets service not initialized')
      }

      const dataResult = await this.sheetsService.readData(
        spreadsheetId,
        'Application Tracker!A2:H' // Skip header row
      )

      if (!dataResult.success || !dataResult.values) return []

      return dataResult.values.map((row: any[]) => ({
        institutionName: row[0] || '',
        program: row[1] || '',
        deadline: row[2] || '',
        status: (row[3] as ApplicationData['status']) || 'Not Started',
        applicationFee: row[4] || '',
        requirements: row[5] ? row[5].split(', ') : [],
        notes: row[6] || ''
      }))
    } catch (error) {
      console.error('Error getting applications:', error)
      return []
    }
  }
}
