'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface RealTimeNotification {
  id: string
  userId: string
  type: 'general' | 'payment_verified' | 'payment_rejected' | 'application_update' | 'deadline_reminder'
  title: string
  message: string
  metadata?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export interface UseRealTimeNotificationsReturn {
  notifications: RealTimeNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useRealTimeNotifications(userId: string): UseRealTimeNotificationsReturn {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setError(null)
      const response = await fetch(`/api/notifications/real-time?action=get&userId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications)
      } else {
        console.warn('Invalid notifications response:', data)
        setNotifications([])
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/real-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notificationIds: [notificationId],
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Optimistically update the local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError(err instanceof Error ? err.message : 'Failed to mark as read')
    }
  }, [userId])

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    
    if (unreadIds.length === 0) return

    try {
      const response = await fetch('/api/notifications/real-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notificationIds: unreadIds,
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Optimistically update the local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
    }
  }, [notifications, userId])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/real-time?notificationId=${notificationId}&userId=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Optimistically update the local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }, [userId])

  const refreshNotifications = useCallback(async () => {
    setLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Set up polling for real-time updates
  useEffect(() => {
    if (!userId) return

    // Initial fetch
    fetchNotifications()

    // Set up polling every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [userId, fetchNotifications])

  // Listen for custom events to trigger immediate updates
  useEffect(() => {
    const handleNotificationEvent = () => {
      fetchNotifications()
    }

    window.addEventListener('notification-received', handleNotificationEvent)
    window.addEventListener('notification-update', handleNotificationEvent)

    return () => {
      window.removeEventListener('notification-received', handleNotificationEvent)
      window.removeEventListener('notification-update', handleNotificationEvent)
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  }
}

// Helper hook for notification actions
export function useNotificationActions(userId: string) {
  const { markAsRead, markAllAsRead, deleteNotification } = useRealTimeNotifications(userId)

  const handleNotificationClick = useCallback(async (notification: RealTimeNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    // Handle notification-specific actions based on type
    switch (notification.type) {
      case 'payment_verified':
        window.location.href = '/dashboard?tab=applications'
        break
      case 'payment_rejected':
        window.location.href = '/dashboard?tab=payments'
        break
      case 'application_update':
        window.location.href = '/dashboard?tab=applications'
        break
      case 'deadline_reminder':
        window.location.href = '/apply'
        break
      default:
        // For general notifications, just mark as read
        break
    }
  }, [markAsRead])

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  }
}
