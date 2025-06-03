import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export interface NotificationData {
  type: 'general' | 'payment_verified' | 'payment_rejected' | 'application_update' | 'deadline_reminder'
  title: string
  message: string
  metadata?: Record<string, any>
  channels?: string[]
}

export interface NotificationResult {
  success: boolean
  summary: {
    total: number
    successful: number
    failed: number
  }
  errors?: string[]
}

export interface UserNotification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
  isRead?: boolean
  createdAt?: string
}

class RealTimeNotificationService {
  private supabase = createServerSupabaseAdminClient()

  /**
   * Send notification to a specific user
   */
  async sendNotification(notification: UserNotification): Promise<NotificationResult> {
    try {
      console.log(`📧 Sending notification to user ${notification.userId}:`, notification.title)

      // Store notification in database
      const { error: dbError } = await this.supabase
        .from('user_notifications')
        .insert({
          id: notification.id,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata || {},
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('❌ Database error:', dbError)
        return {
          success: false,
          summary: { total: 1, successful: 0, failed: 1 },
          errors: [dbError.message]
        }
      }

      // TODO: Add real-time delivery via WebSocket/SSE
      // TODO: Add email delivery
      // TODO: Add SMS delivery

      console.log('✅ Notification sent successfully')
      return {
        success: true,
        summary: { total: 1, successful: 1, failed: 0 }
      }

    } catch (error) {
      console.error('❌ Notification service error:', error)
      return {
        success: false,
        summary: { total: 1, successful: 0, failed: 1 },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Broadcast notification to multiple recipients
   */
  async broadcastNotification(
    recipients: string[] | string,
    notificationData: NotificationData
  ): Promise<NotificationResult> {
    try {
      console.log(`📢 Broadcasting notification: ${notificationData.title}`)

      let userIds: string[] = []

      // Resolve recipients
      if (typeof recipients === 'string') {
        if (recipients === 'admin') {
          // Send to admin users - for now, we'll use a placeholder
          userIds = ['admin-user-id']
        } else if (recipients === 'all_users') {
          // Get all user IDs
          const { data: users } = await this.supabase
            .from('student_profiles')
            .select('user_id')
          userIds = users?.map(u => u.user_id) || []
        } else {
          userIds = [recipients]
        }
      } else {
        userIds = recipients
      }

      if (userIds.length === 0) {
        console.log('⚠️ No recipients found')
        return {
          success: true,
          summary: { total: 0, successful: 0, failed: 0 }
        }
      }

      console.log(`📧 Sending to ${userIds.length} recipients`)

      // Send notifications to all users
      const results = await Promise.allSettled(
        userIds.map(userId => 
          this.sendNotification({
            id: `${Date.now()}_${userId}`,
            userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            metadata: notificationData.metadata
          })
        )
      )

      // Calculate summary
      let successful = 0
      let failed = 0
      const errors: string[] = []

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successful++
        } else {
          failed++
          if (result.status === 'rejected') {
            errors.push(result.reason?.message || 'Unknown error')
          } else if (result.status === 'fulfilled') {
            errors.push(...(result.value.errors || []))
          }
        }
      })

      console.log(`✅ Broadcast complete: ${successful} successful, ${failed} failed`)

      return {
        success: failed === 0,
        summary: {
          total: userIds.length,
          successful,
          failed
        },
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      console.error('❌ Broadcast error:', error)
      return {
        success: false,
        summary: { total: 0, successful: 0, failed: 1 },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getUserNotifications(
    userId: string,
    options: { limit?: number; unreadOnly?: boolean } | number = 50
  ): Promise<UserNotification[]> {
    // Handle both old and new API signatures
    const limit = typeof options === 'number' ? options : (options.limit || 50)
    const unreadOnly = typeof options === 'object' ? options.unreadOnly : false
    try {
      let query = this.supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching user notifications:', error)
        return []
      }

      return data?.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        isRead: notification.is_read,
        createdAt: notification.created_at
      })) || []

    } catch (error) {
      console.error('❌ Error in getUserNotifications:', error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      return !error
    } catch (error) {
      console.error('❌ Error marking notification as read:', error)
      return false
    }
  }
}

// Export singleton instance
export const notificationService = new RealTimeNotificationService()
export default notificationService
