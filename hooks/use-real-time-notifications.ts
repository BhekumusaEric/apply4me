'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: any
}

export function useRealTimeNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        throw fetchError
      }

      const formattedNotifications: Notification[] = (data || []).map(notif => ({
        id: notif.id,
        userId: notif.user_id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: notif.read,
        createdAt: notif.created_at,
        metadata: notif.metadata
      }))

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.read).length)

    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif.id) 
            ? { ...notif, read: true }
            : notif
        )
      )

      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))

      return true
    } catch (err) {
      console.error('❌ Failed to mark notifications as read:', err)
      return false
    }
  }, [user, supabase])

  // Mark single notification as read
  const markOneAsRead = useCallback(async (notificationId: string) => {
    return markAsRead([notificationId])
  }, [markAsRead])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return true
    return markAsRead(unreadIds)
  }, [notifications, markAsRead])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      return true
    } catch (err) {
      console.error('❌ Failed to delete notification:', err)
      return false
    }
  }, [user, notifications, supabase])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    console.log('🔔 Setting up real-time notifications for user:', user.id)

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        console.log('🔔 Real-time notification received:', payload)
        
        if (payload.payload.userId === user.id) {
          const newNotification: Notification = {
            id: payload.payload.notification.id,
            userId: user.id,
            type: payload.payload.notification.type,
            title: payload.payload.notification.title,
            message: payload.payload.notification.message,
            read: false,
            createdAt: payload.payload.notification.createdAt,
            metadata: payload.payload.notification.metadata
          }

          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icon-192x192.png',
              tag: newNotification.id
            })
          }
        }
      })
      .on('broadcast', { event: 'notifications_read' }, (payload) => {
        console.log('🔔 Notifications marked as read:', payload)
        
        if (payload.payload.userId === user.id) {
          const readIds = payload.payload.notificationIds
          setNotifications(prev => 
            prev.map(notif => 
              readIds.includes(notif.id) 
                ? { ...notif, read: true }
                : notif
            )
          )
          setUnreadCount(prev => Math.max(0, prev - readIds.length))
        }
      })
      .subscribe()

    // Also subscribe to database changes as backup
    const dbSubscription = supabase
      .channel('db-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔔 Database notification inserted:', payload)
        
        const newNotification: Notification = {
          id: payload.new.id,
          userId: payload.new.user_id,
          type: payload.new.type,
          title: payload.new.title,
          message: payload.new.message,
          read: payload.new.read,
          createdAt: payload.new.created_at,
          metadata: payload.new.metadata
        }

        setNotifications(prev => {
          // Avoid duplicates
          if (prev.some(n => n.id === newNotification.id)) {
            return prev
          }
          return [newNotification, ...prev]
        })

        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔔 Database notification updated:', payload)
        
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === payload.new.id 
              ? {
                  ...notif,
                  read: payload.new.read,
                  title: payload.new.title,
                  message: payload.new.message,
                  metadata: payload.new.metadata
                }
              : notif
          )
        )

        // Update unread count
        if (payload.old.read !== payload.new.read) {
          setUnreadCount(prev => 
            payload.new.read ? Math.max(0, prev - 1) : prev + 1
          )
        }
      })
      .subscribe()

    // Cleanup subscriptions
    return () => {
      console.log('🔔 Cleaning up notification subscriptions')
      supabase.removeChannel(channel)
      supabase.removeChannel(dbSubscription)
    }
  }, [user, supabase])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission)
      })
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markOneAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}
