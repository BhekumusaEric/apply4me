/**
 * Notification Service
 * Handles creation and management of user notifications
 */

export interface NotificationData {
  userId: string
  type: 'payment_verified' | 'payment_rejected' | 'application_update' | 'general' | 'deadline_reminder' | 'application_submitted'
  title: string
  message: string
  metadata?: {
    applicationId?: string
    paymentReference?: string
    institutionName?: string
    amount?: number
    [key: string]: any
  }
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  error?: string
}

export class NotificationService {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002')
  }

  /**
   * Create a new notification
   */
  async createNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      console.log(`📧 Creating notification: ${data.type} for user ${data.userId}`)

      // Try real API first, fall back to mock if needed
      let response = await fetch(`${this.baseUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      // If real API fails due to missing table, try mock API
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.code === 'TABLE_NOT_FOUND') {
          console.log('📧 Falling back to mock notifications API')
          response = await fetch(`${this.baseUrl}/api/notifications/mock`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          })
        }
      }

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Failed to create notification:', result)
        return {
          success: false,
          error: result.error || 'Failed to create notification'
        }
      }

      console.log(`✅ Notification created successfully: ${result.notification?.id}`)
      return {
        success: true,
        notificationId: result.notification?.id
      }

    } catch (error) {
      console.error('❌ Notification service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create payment verification notification
   */
  async createPaymentVerificationNotification(
    userId: string,
    status: 'verified' | 'rejected',
    applicationData: {
      id: string
      institutionName: string
      paymentReference: string
      amount: number
    },
    adminNotes?: string
  ): Promise<NotificationResult> {
    const title = status === 'verified'
      ? '✅ Payment Verified - Application Submitted!'
      : '❌ Payment Verification Failed'

    const message = status === 'verified'
      ? `Your payment of R${applicationData.amount} (Ref: ${applicationData.paymentReference}) has been verified. Your application to ${applicationData.institutionName} has been successfully submitted and is now being processed.`
      : `Your payment of R${applicationData.amount} (Ref: ${applicationData.paymentReference}) could not be verified. ${adminNotes ? `Reason: ${adminNotes}` : 'Please check your payment details and try again.'}`

    return this.createNotification({
      userId,
      type: status === 'verified' ? 'payment_verified' : 'payment_rejected',
      title,
      message,
      metadata: {
        applicationId: applicationData.id,
        paymentReference: applicationData.paymentReference,
        institutionName: applicationData.institutionName,
        amount: applicationData.amount,
        adminNotes
      }
    })
  }

  /**
   * Create application submission notification
   */
  async createApplicationSubmissionNotification(
    userId: string,
    applicationData: {
      id: string
      institutionName: string
      serviceType: string
      amount: number
    }
  ): Promise<NotificationResult> {
    const title = '📝 Application Submitted Successfully!'
    const message = `Your application to ${applicationData.institutionName} has been submitted. We'll process your application and notify you once payment is verified. Service: ${applicationData.serviceType.charAt(0).toUpperCase() + applicationData.serviceType.slice(1)}`

    return this.createNotification({
      userId,
      type: 'application_submitted',
      title,
      message,
      metadata: {
        applicationId: applicationData.id,
        institutionName: applicationData.institutionName,
        serviceType: applicationData.serviceType,
        amount: applicationData.amount
      }
    })
  }

  /**
   * Create application status update notification
   */
  async createApplicationStatusNotification(
    userId: string,
    status: string,
    applicationData: {
      id: string
      institutionName: string
    },
    details?: string
  ): Promise<NotificationResult> {
    const statusMessages = {
      'processing': {
        title: '⏳ Application Being Processed',
        message: `Your application to ${applicationData.institutionName} is currently being processed. We'll notify you of any updates.`
      },
      'completed': {
        title: '🎉 Application Completed',
        message: `Great news! Your application to ${applicationData.institutionName} has been completed and submitted to the institution.`
      },
      'rejected': {
        title: '❌ Application Rejected',
        message: `Unfortunately, your application to ${applicationData.institutionName} has been rejected. ${details || 'Please contact support for more information.'}`
      }
    }

    const statusInfo = statusMessages[status as keyof typeof statusMessages] || {
      title: '📋 Application Update',
      message: `Your application to ${applicationData.institutionName} status has been updated to: ${status}`
    }

    return this.createNotification({
      userId,
      type: 'application_update',
      title: statusInfo.title,
      message: statusInfo.message,
      metadata: {
        applicationId: applicationData.id,
        institutionName: applicationData.institutionName,
        status,
        details
      }
    })
  }

  /**
   * Create deadline reminder notification
   */
  async createDeadlineReminderNotification(
    userId: string,
    deadlineData: {
      institutionName: string
      deadline: string
      daysRemaining: number
    }
  ): Promise<NotificationResult> {
    const title = `⏰ Application Deadline Reminder`
    const message = `Reminder: The application deadline for ${deadlineData.institutionName} is in ${deadlineData.daysRemaining} days (${deadlineData.deadline}). Don't miss out!`

    return this.createNotification({
      userId,
      type: 'deadline_reminder',
      title,
      message,
      metadata: {
        institutionName: deadlineData.institutionName,
        deadline: deadlineData.deadline,
        daysRemaining: deadlineData.daysRemaining
      }
    })
  }

  /**
   * Create general system notification
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationResult> {
    return this.createNotification({
      userId,
      type: 'general',
      title,
      message,
      metadata
    })
  }

  /**
   * Bulk create notifications for multiple users
   */
  async createBulkNotifications(
    userIds: string[],
    notificationData: Omit<NotificationData, 'userId'>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    console.log(`📧 Creating bulk notifications for ${userIds.length} users`)

    for (const userId of userIds) {
      const result = await this.createNotification({
        ...notificationData,
        userId
      })

      if (result.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push(`User ${userId}: ${result.error}`)
      }
    }

    console.log(`✅ Bulk notifications completed: ${results.success} success, ${results.failed} failed`)
    return results
  }

  /**
   * Get user's notification preferences
   */
  async getUserNotificationPreferences(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/preferences?userId=${userId}`)
      const result = await response.json()
      return result.success ? result.preferences : null
    } catch (error) {
      console.error('❌ Failed to get notification preferences:', error)
      return null
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
