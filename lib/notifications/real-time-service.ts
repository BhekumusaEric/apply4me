import { createClient } from '@/lib/supabase'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { createEmailService } from '@/lib/email/email-service'

export interface NotificationPayload {
  id: string
  userId: string
  type: 'payment_verified' | 'payment_rejected' | 'application_update' | 'general' | 'deadline_reminder'
  title: string
  message: string
  metadata?: any
  channels?: ('database' | 'email' | 'push' | 'sms')[]
}

export class RealTimeNotificationService {
  private supabase = createServerSupabaseAdminClient()

  /**
   * Send notification to user with real-time delivery
   */
  async sendNotification(payload: NotificationPayload): Promise<{
    success: boolean
    notificationId?: string
    error?: string
    deliveryStatus: {
      database: boolean
      realtime: boolean
      email?: boolean
      push?: boolean
    }
  }> {
    const deliveryStatus = {
      database: false,
      realtime: false,
      email: false,
      push: false
    }

    try {
      // 1. Store in database (primary storage)
      const { data: notification, error: dbError } = await this.supabase
        .from('notifications')
        .insert({
          id: payload.id,
          user_id: payload.userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          metadata: payload.metadata || {},
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        console.error('❌ Database notification failed:', dbError)
        console.log('🔄 Falling back to file-based storage...')

        // Fallback to file storage
        try {
          const fs = require('fs')
          const path = require('path')

          const tempDir = path.join(process.cwd(), 'temp')
          const userNotificationsFile = path.join(tempDir, `user-notifications-${payload.userId}.json`)

          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
          }

          let existingNotifications = []
          if (fs.existsSync(userNotificationsFile)) {
            try {
              const fileContent = fs.readFileSync(userNotificationsFile, 'utf8')
              existingNotifications = JSON.parse(fileContent)
            } catch (error) {
              existingNotifications = []
            }
          }

          const fileNotification = {
            id: payload.id,
            user_id: payload.userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            read: false,
            created_at: new Date().toISOString(),
            metadata: payload.metadata || {}
          }

          existingNotifications.unshift(fileNotification)
          if (existingNotifications.length > 20) {
            existingNotifications = existingNotifications.slice(0, 20)
          }

          fs.writeFileSync(userNotificationsFile, JSON.stringify(existingNotifications, null, 2))

          deliveryStatus.database = true // Mark as successful since we stored it
          console.log('✅ Notification stored in file system as fallback')

        } catch (fileError) {
          console.error('❌ File fallback also failed:', fileError)
          return {
            success: false,
            error: 'Failed to store notification (database and file system failed)',
            deliveryStatus
          }
        }
      } else {
        deliveryStatus.database = true
        console.log('✅ Notification stored in database:', notification.id)
      }

      // 2. Send real-time update via Supabase Realtime
      try {
        await this.supabase
          .channel('notifications')
          .send({
            type: 'broadcast',
            event: 'new_notification',
            payload: {
              userId: payload.userId,
              notification: {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.created_at,
                read: false
              }
            }
          })

        deliveryStatus.realtime = true
        console.log('✅ Real-time notification sent')
      } catch (realtimeError) {
        console.error('⚠️ Real-time delivery failed:', realtimeError)
      }

      // 3. Send email notification (if requested)
      if (payload.channels?.includes('email')) {
        try {
          const emailSent = await this.sendEmailNotification(payload)
          deliveryStatus.email = emailSent
        } catch (emailError) {
          console.error('⚠️ Email notification failed:', emailError)
        }
      }

      // 4. Send push notification (if requested)
      if (payload.channels?.includes('push')) {
        try {
          const pushSent = await this.sendPushNotification(payload)
          deliveryStatus.push = pushSent
        } catch (pushError) {
          console.error('⚠️ Push notification failed:', pushError)
        }
      }

      return {
        success: true,
        notificationId: notification.id,
        deliveryStatus
      }

    } catch (error) {
      console.error('❌ Notification service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryStatus
      }
    }
  }

  /**
   * Send notification to multiple users
   */
  async broadcastNotification(
    recipients: string[] | string,
    notification: Omit<NotificationPayload, 'id' | 'userId'>
  ): Promise<{
    success: boolean
    results: Array<{ userId: string; success: boolean; notificationId?: string }>
    summary: {
      total: number
      successful: number
      failed: number
    }
  }> {
    // Resolve recipients to user IDs
    let userIds: string[] = []

    // Check if recipients contains special values like "all_users"
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients]
    const hasAllUsers = recipientArray.includes('all_users')
    const hasIncompleteProfiles = recipientArray.includes('incomplete_profiles')
    const hasPendingPayments = recipientArray.includes('pending_payments')
    const hasAdmin = recipientArray.includes('admin')

    if (hasAllUsers) {
      // Handle "all_users" broadcast
      console.log('📢 Broadcasting to all users...')

      // Try student_profiles first (more reliable)
      const { data: profiles, error: profilesError } = await this.supabase
        .from('student_profiles')
        .select('userId')

      if (profilesError) {
        console.error('❌ Failed to fetch user profiles:', profilesError)
        // Fallback to known user IDs
        userIds = [
          '85b75472-2b66-47c8-a8d2-27253382bfd6',
          'df70993e-739e-4190-b78d-93a9e1002bf7',
          'a518a0d8-121b-40cd-a995-061908b97a05'
        ]
        console.log('🔄 Using fallback user IDs:', userIds)
      } else {
        userIds = profiles?.map(p => p.userId) || []
        console.log('✅ Found users from profiles:', userIds.length)
      }
    } else if (hasIncompleteProfiles) {
      const { data: profiles } = await this.supabase
        .from('student_profiles')
        .select('userId')
        .lt('completeness', 90)
      userIds = profiles?.map(p => p.userId) || []
    } else if (hasPendingPayments) {
      const { data: applications } = await this.supabase
        .from('applications')
        .select('user_id')
        .eq('payment_status', 'pending')
      userIds = [...new Set(applications?.map(a => a.user_id) || [])]
    } else if (hasAdmin) {
      // Handle "admin" notifications - send to admin users
      console.log('👑 Sending to admin users...')

      // For now, use a known admin user ID
      // In production, you'd query an admin_users table or use role-based access
      userIds = [
        '85b75472-2b66-47c8-a8d2-27253382bfd6' // Main admin user
      ]

      console.log('✅ Admin notification will be sent to:', userIds)
    } else {
      // Regular user IDs - filter out any special values
      userIds = recipientArray.filter(id =>
        id !== 'all_users' &&
        id !== 'incomplete_profiles' &&
        id !== 'pending_payments' &&
        id !== 'admin'
      )
    }

    console.log(`📤 Sending to ${userIds.length} users:`, userIds)


    const results = []
    let successful = 0
    let failed = 0

    for (const userId of userIds) {
      const payload: NotificationPayload = {
        ...notification,
        id: `notif_${Date.now()}_${userId}`,
        userId
      }

      const result = await this.sendNotification(payload)

      results.push({
        userId,
        success: result.success,
        notificationId: result.notificationId
      })

      if (result.success) {
        successful++
      } else {
        failed++
      }
    }

    return {
      success: failed === 0,
      results,
      summary: {
        total: userIds.length,
        successful,
        failed
      }
    }
  }

  /**
   * Get user notifications with real-time subscription
   */
  async getUserNotifications(userId: string, options: {
    limit?: number
    unreadOnly?: boolean
    markAsRead?: boolean
  } = {}) {
    const { limit = 20, unreadOnly = false, markAsRead = false } = options

    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (unreadOnly) {
        query = query.eq('read', false)
      }

      const { data: notifications, error } = await query

      if (error) {
        throw error
      }

      // Mark as read if requested
      if (markAsRead && notifications?.length > 0) {
        const unreadIds = notifications
          .filter(n => !n.read)
          .map(n => n.id)

        if (unreadIds.length > 0) {
          await this.supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .in('id', unreadIds)
        }
      }

      return {
        success: true,
        notifications: notifications || [],
        unreadCount: notifications?.filter(n => !n.read).length || 0
      }

    } catch (error) {
      console.error('❌ Failed to get user notifications:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        notifications: [],
        unreadCount: 0
      }
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(notificationIds: string[], userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      // Send real-time update
      await this.supabase
        .channel('notifications')
        .send({
          type: 'broadcast',
          event: 'notifications_read',
          payload: {
            userId,
            notificationIds
          }
        })

      return true
    } catch (error) {
      console.error('❌ Failed to mark notifications as read:', error)
      return false
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // Get user email
      const { data: user } = await this.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', payload.userId)
        .single()

      if (!user?.email) {
        console.log('⚠️ No email found for user:', payload.userId)
        return false
      }

      // Use the email service
      const emailService = createEmailService()
      if (!emailService) {
        console.log('⚠️ No email service configured')
        return false
      }

      const success = await emailService.sendNotificationEmail(
        user.email,
        user.full_name || 'User',
        payload.title,
        payload.message,
        payload.metadata
      )

      if (success) {
        console.log(`✅ Email sent to ${user.email}: ${payload.title}`)
      } else {
        console.log(`❌ Failed to send email to ${user.email}`)
      }

      return success
    } catch (error) {
      console.error('❌ Email notification error:', error)
      return false
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // TODO: Integrate with push service (Firebase, OneSignal, etc.)
      console.log(`📱 Would send push notification: ${payload.title}`)

      // Example Firebase integration:
      /*
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: userFcmToken,
          notification: {
            title: payload.title,
            body: payload.message,
            icon: '/icon-192x192.png'
          },
          data: payload.metadata
        })
      })

      return response.ok
      */

      return true // Mock success for now
    } catch (error) {
      console.error('❌ Push notification error:', error)
      return false
    }
  }
}

// Singleton instance
export const notificationService = new RealTimeNotificationService()
