import { google } from 'googleapis'
import { getGoogleAuthClient } from './auth-config'

export class GoogleSheetsService {
  private sheets: any

  constructor() {
    this.initializeSheets()
  }

  private async initializeSheets() {
    try {
      const authClient = await getGoogleAuthClient()
      this.sheets = google.sheets({ version: 'v4', auth: authClient })
    } catch (error) {
      console.error('Error initializing Google Sheets:', error)
      throw error
    }
  }

  // Create a new spreadsheet
  async createSpreadsheet(title: string, sheetNames: string[] = ['Sheet1']) {
    try {
      if (!this.sheets) {
        await this.initializeSheets()
      }

      const sheets = sheetNames.map(name => ({
        properties: { title: name }
      }))

      const response = await this.sheets.spreadsheets.create({
        resource: {
          properties: { title },
          sheets
        }
      })

      return {
        success: true,
        spreadsheetId: response.data.spreadsheetId,
        spreadsheetUrl: response.data.spreadsheetUrl
      }
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Add data to spreadsheet
  async addData(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    try {
      if (!this.sheets) {
        await this.initializeSheets()
      }

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        resource: { values }
      })

      return {
        success: true,
        updatedRows: response.data.updates.updatedRows,
        updatedRange: response.data.updates.updatedRange
      }
    } catch (error) {
      console.error('Error adding data to spreadsheet:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Read data from spreadsheet
  async readData(spreadsheetId: string, range: string) {
    try {
      if (!this.sheets) {
        await this.initializeSheets()
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      })

      return {
        success: true,
        values: response.data.values || [],
        range: response.data.range
      }
    } catch (error) {
      console.error('Error reading data from spreadsheet:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Update data in spreadsheet
  async updateData(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    try {
      if (!this.sheets) {
        await this.initializeSheets()
      }

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption,
        resource: { values }
      })

      return {
        success: true,
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns,
        updatedCells: response.data.updatedCells
      }
    } catch (error) {
      console.error('Error updating data in spreadsheet:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Create application tracking spreadsheet
  async createApplicationTrackingSheet(studentName: string, studentEmail: string) {
    try {
      const title = `Apply4Me - ${studentName} - Application Tracking`
      
      const createResult = await this.createSpreadsheet(title, [
        'Applications',
        'Documents',
        'Payments',
        'Timeline'
      ])

      if (!createResult.success) {
        return createResult
      }

      const spreadsheetId = createResult.spreadsheetId!

      // Add headers to Applications sheet
      await this.addData(spreadsheetId, 'Applications!A1:H1', [[
        'Institution',
        'Program',
        'Application Date',
        'Status',
        'Deadline',
        'Requirements Met',
        'Payment Status',
        'Notes'
      ]])

      // Add headers to Documents sheet
      await this.addData(spreadsheetId, 'Documents!A1:F1', [[
        'Document Type',
        'File Name',
        'Upload Date',
        'Status',
        'Drive Link',
        'Notes'
      ]])

      // Add headers to Payments sheet
      await this.addData(spreadsheetId, 'Payments!A1:G1', [[
        'Institution',
        'Amount',
        'Payment Date',
        'Payment Method',
        'Reference',
        'Status',
        'Receipt Link'
      ]])

      // Add headers to Timeline sheet
      await this.addData(spreadsheetId, 'Timeline!A1:D1', [[
        'Date',
        'Event',
        'Institution',
        'Details'
      ]])

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl: createResult.spreadsheetUrl,
        message: 'Application tracking spreadsheet created successfully'
      }
    } catch (error) {
      console.error('Error creating application tracking sheet:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Log application to tracking sheet
  async logApplication(
    spreadsheetId: string,
    applicationData: {
      institution: string
      program: string
      applicationDate: string
      status: string
      deadline: string
      requirementsMet: string
      paymentStatus: string
      notes?: string
    }
  ) {
    try {
      const values = [[
        applicationData.institution,
        applicationData.program,
        applicationData.applicationDate,
        applicationData.status,
        applicationData.deadline,
        applicationData.requirementsMet,
        applicationData.paymentStatus,
        applicationData.notes || ''
      ]]

      return await this.addData(spreadsheetId, 'Applications!A:H', values)
    } catch (error) {
      console.error('Error logging application:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService()
