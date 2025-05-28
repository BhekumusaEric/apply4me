'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bell, CheckCircle, XCircle, AlertCircle, Plus, RefreshCw } from 'lucide-react'

interface Notification {
  id: string
  userId: string
  type: 'payment_verified' | 'payment_rejected' | 'application_update' | 'general' | 'deadline_reminder' | 'application_submitted'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export default function NotificationTestPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const testUserId = 'test-user-123'

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // Try real API first, fall back to mock if needed
      const response = await fetch(`/api/notifications?userId=${testUserId}&limit=20`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
        console.log(`📧 Using ${data.fallbackToMock ? 'mock' : 'real'} notifications API`)
      } else {
        console.error('Failed to fetch notifications:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestNotification = async (type: string, title: string, message: string, metadata?: any) => {
    try {
      setCreating(true)
      // Try real API first, fall back to mock if needed
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId,
          type,
          title,
          message,
          metadata
        })
      })

      const result = await response.json()
      if (result.success) {
        await fetchNotifications() // Refresh the list
        console.log(`📧 Created notification using ${result.fallbackToMock ? 'mock' : 'real'} API`)
      } else {
        console.error('Failed to create notification:', result.error)
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
    } finally {
      setCreating(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      // Try real API first, fall back to mock if needed
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          userId: testUserId
        })
      })

      if (response.ok) {
        await fetchNotifications() // Refresh the list
        console.log('📧 Marked notifications as read')
      } else {
        console.error('Failed to mark notifications as read')
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
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
      case 'application_submitted':
        return <Bell className="h-5 w-5 text-purple-600" />
      case 'deadline_reminder':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
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
      case 'application_submitted':
        return 'bg-purple-50 border-purple-200'
      case 'deadline_reminder':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50'
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

  const testNotifications = [
    {
      type: 'payment_verified',
      title: '✅ Payment Verified',
      message: 'Your payment of R200 has been verified. Your application is now being processed.',
      metadata: { amount: 200, paymentReference: 'PAY-789' }
    },
    {
      type: 'payment_rejected',
      title: '❌ Payment Failed',
      message: 'Your payment could not be verified. Please check your payment details.',
      metadata: { amount: 150, reason: 'Invalid card details' }
    },
    {
      type: 'application_submitted',
      title: '📝 Application Submitted',
      message: 'Your application to Wits University has been submitted successfully.',
      metadata: { institutionName: 'Wits University', serviceType: 'express' }
    },
    {
      type: 'application_update',
      title: '📋 Application Update',
      message: 'Your application status has been updated to "Under Review".',
      metadata: { status: 'under_review', institutionName: 'UCT' }
    },
    {
      type: 'deadline_reminder',
      title: '⏰ Deadline Reminder',
      message: 'Application deadline for Rhodes University is in 3 days!',
      metadata: { institutionName: 'Rhodes University', daysRemaining: 3 }
    },
    {
      type: 'general',
      title: '🎉 Welcome!',
      message: 'Welcome to Apply4Me! Start exploring institutions and opportunities.',
      metadata: { source: 'welcome' }
    }
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔔 Notifications System Test</h1>
        <p className="text-gray-600">
          Test the notifications functionality with mock data. This demonstrates how the notification system works.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Test Controls
          </CardTitle>
          <CardDescription>
            Create test notifications and manage the notification system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={fetchNotifications}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                variant="outline"
                size="sm"
              >
                Mark All Read ({unreadCount})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {testNotifications.map((testNotif, index) => (
              <Button
                key={index}
                onClick={() => createTestNotification(testNotif.type, testNotif.title, testNotif.message, testNotif.metadata)}
                disabled={creating}
                variant="outline"
                size="sm"
                className="text-left justify-start"
              >
                {getNotificationIcon(testNotif.type)}
                <span className="ml-2 truncate">{testNotif.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Create some test notifications above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
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
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-400">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            {notification.metadata.institutionName && (
                              <span className="ml-2">• {notification.metadata.institutionName}</span>
                            )}
                            {notification.metadata.amount && (
                              <span className="ml-2">• R{notification.metadata.amount}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Using mock notifications API (database table not available)</p>
            <p>• Test User ID: {testUserId}</p>
            <p>• Total Notifications: {notifications.length}</p>
            <p>• Unread Count: {unreadCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
