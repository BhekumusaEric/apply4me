import { google } from 'googleapis'
import { getGoogleAuthClient } from './auth-config'

export class GoogleDriveService {
  private drive: any

  constructor() {
    this.initializeDrive()
  }

  private async initializeDrive() {
    try {
      const authClient = await getGoogleAuthClient()
      this.drive = google.drive({ version: 'v3', auth: authClient })
    } catch (error) {
      console.error('Error initializing Google Drive:', error)
      throw error
    }
  }

  // Upload file to Google Drive
  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    folderId?: string
  ) {
    try {
      if (!this.drive) {
        await this.initializeDrive()
      }

      const fileMetadata: any = {
        name: fileName
      }

      if (folderId) {
        fileMetadata.parents = [folderId]
      }

      const media = {
        mimeType,
        body: fileBuffer
      }

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink'
      })

      return {
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
      }
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Create folder in Google Drive
  async createFolder(folderName: string, parentFolderId?: string) {
    try {
      if (!this.drive) {
        await this.initializeDrive()
      }

      const fileMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      }

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId]
      }

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name'
      })

      return {
        success: true,
        folderId: response.data.id,
        folderName: response.data.name
      }
    } catch (error) {
      console.error('Error creating folder in Google Drive:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get file from Google Drive
  async getFile(fileId: string) {
    try {
      if (!this.drive) {
        await this.initializeDrive()
      }

      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime'
      })

      return {
        success: true,
        file: response.data
      }
    } catch (error) {
      console.error('Error getting file from Google Drive:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId: string) {
    try {
      if (!this.drive) {
        await this.initializeDrive()
      }

      await this.drive.files.delete({
        fileId
      })

      return {
        success: true,
        message: 'File deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // List files in a folder
  async listFiles(folderId?: string, pageSize: number = 10) {
    try {
      if (!this.drive) {
        await this.initializeDrive()
      }

      const query = folderId ? `'${folderId}' in parents` : undefined

      const response = await this.drive.files.list({
        q: query,
        pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, createdTime, modifiedTime)'
      })

      return {
        success: true,
        files: response.data.files,
        nextPageToken: response.data.nextPageToken
      }
    } catch (error) {
      console.error('Error listing files from Google Drive:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Share file with specific permissions
  async shareFile(fileId: string, email: string, role: 'reader' | 'writer' | 'commenter' = 'reader') {
    try {
      if (!this.drive) {
        await this.initializeDrive()
      }

      const permission = {
        type: 'user',
        role,
        emailAddress: email
      }

      const response = await this.drive.permissions.create({
        fileId,
        resource: permission,
        sendNotificationEmail: true
      })

      return {
        success: true,
        permissionId: response.data.id
      }
    } catch (error) {
      console.error('Error sharing file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService()
