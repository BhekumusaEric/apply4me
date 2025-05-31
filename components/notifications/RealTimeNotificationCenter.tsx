'use client'

import { useState } from 'react'
import { Bell, CheckCircle, XCircle, AlertCircle, X, Eye, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRealTimeNotifications } from '@/hooks/use-real-time-notifications'

interface RealTimeNotificationCenterProps {
  userId: string
}

export default function RealTimeNotificationCenter({ userId }: RealTimeNotificationCenterProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markOneAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useRealTimeNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'payment_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'application_update':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'deadline_reminder':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
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
    if (read) return 'bg-gray-50 dark:bg-gray-800'

    switch (type) {
      case 'payment_verified':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'payment_rejected':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'application_update':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      case 'deadline_reminder':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800'
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markOneAsRead(notification.id)
    }
  }

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  return (
    <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Bell className={`h-5 w-5 transition-all duration-200 ${unreadCount > 0 ? 'text-sa-green animate-pulse' : 'text-gray-600'}`} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500 pulse-glow animate-bounce"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] z-50 slide-up">
          <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
            <CardHeader className="pb-3 bg-gradient-bg-subtle rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 gradient-text">
                  <Bell className="h-5 w-5" />
                  🔔 Notifications
                  {loading && <RefreshCw className="h-4 w-4 animate-spin text-sa-green" />}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refetch}
                    className="text-xs"
                    title="Refresh notifications"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                      title="Mark all as read"
                    >
                      <CheckCircle className="h-4 w-4" />
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
              </div>
              {unreadCount > 0 && (
                <CardDescription className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </CardDescription>
              )}
              {error && (
                <CardDescription className="text-red-600">
                  ⚠️ {error}
                </CardDescription>
              )}
            </CardHeader>

            <Separator />

            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 space-y-3">
                {loading && notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll receive updates about applications and payments here
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group card-hover ${
                        getNotificationBgColor(notification.type, notification.read)
                      } ${!notification.read ? 'border-l-4 border-l-sa-green' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                title="Delete notification"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className={`text-xs mt-1 ${
                            notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>

                            {notification.metadata?.source && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {notification.metadata.source === 'admin' ? '👨‍💼 Admin' :
                                 notification.metadata.source === 'test' ? '🧪 Test' :
                                 notification.metadata.source}
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Real-time notifications enabled</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
