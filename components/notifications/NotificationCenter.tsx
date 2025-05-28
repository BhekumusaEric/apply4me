'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Notification {
  id: string
  userId: string
  type: 'payment_verified' | 'payment_rejected' | 'application_update' | 'general'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: {
    applicationId?: string
    paymentReference?: string
    institutionName?: string
    amount?: number
  }
}

interface NotificationCenterProps {
  userId: string
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${userId}&limit=20`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          userId
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notificationIds.includes(notif.id)
              ? { ...notif, read: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'payment_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'application_update':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50'

    switch (type) {
      case 'payment_verified':
        return 'bg-green-50 border-green-200'
      case 'payment_rejected':
        return 'bg-red-50 border-red-200'
      case 'application_update':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(false)}
                className="text-xs"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>

          <Separator />

          <div className="max-h-96 overflow-y-auto">
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      getNotificationBgColor(notification.type, notification.read)
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead([notification.id])
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>

                        <p className={`text-xs mt-1 ${
                          notification.read ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>

                          {notification.metadata?.paymentReference && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Ref: {notification.metadata.paymentReference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setShowDropdown(false)
                    // Navigate to full notifications page if you have one
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </Card>
        </div>
      )}
    </div>
  )
}
