'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/app/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Bell, CheckCircle, RefreshCw } from 'lucide-react'

export default function NotificationDemoPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [result, setResult] = useState<any>(null)

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const sendTestNotification = async () => {
    if (!user) {
      alert('Please sign in to test notifications')
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/test/user-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      const data = await response.json()
      setResult(data)
      
      // Refresh notifications after creating one
      setTimeout(fetchNotifications, 1000)

    } catch (error) {
      console.error('Error sending test notification:', error)
      setResult({
        success: false,
        error: 'Failed to send test notification'
      })
    } finally {
      setLoading(false)
    }
  }

  const sendAdminNotification = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '📢 Admin Announcement',
          message: 'This is a test notification sent from the admin to all users. You should see this in your notification bell!',
          recipients: ['all_users'],
          type: 'general'
        })
      })

      const data = await response.json()
      setResult(data)
      
      // Refresh notifications after admin sends one
      setTimeout(fetchNotifications, 1000)

    } catch (error) {
      console.error('Error sending admin notification:', error)
      setResult({
        success: false,
        error: 'Failed to send admin notification'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🔔 Complete Notification System Demo</h1>
            <p className="text-muted-foreground">
              Test the full notification flow: Admin → Users → Notification Bell
            </p>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Status
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Notifications</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Unread</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Read</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>👤 User Notification Test</CardTitle>
                <CardDescription>
                  Send a test notification directly to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What happens:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Creates notification for your user ID</li>
                    <li>• Shows in notification bell (top right)</li>
                    <li>• Updates unread count</li>
                    <li>• Can be marked as read</li>
                  </ul>
                </div>
                <Button 
                  onClick={sendTestNotification}
                  disabled={loading || !user}
                  className="w-full"
                >
                  {loading ? '🔄 Sending...' : '🧪 Send Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>👨‍💼 Admin Broadcast Test</CardTitle>
                <CardDescription>
                  Send notification from admin to all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">What happens:</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Admin sends to all users</li>
                    <li>• Creates user notifications</li>
                    <li>• Shows in admin dashboard</li>
                    <li>• Users see in notification bell</li>
                  </ul>
                </div>
                <Button 
                  onClick={sendAdminNotification}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? '🔄 Broadcasting...' : '📢 Send Admin Broadcast'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 How to Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Step-by-Step Testing:</h4>
                  <ol className="text-sm text-green-700 dark:text-green-300 space-y-2 list-decimal list-inside">
                    <li><strong>Look at the notification bell</strong> in the top right corner of the page</li>
                    <li><strong>Click "Send Test Notification"</strong> to create a notification for yourself</li>
                    <li><strong>Watch the bell icon</strong> - it should show a red badge with the unread count</li>
                    <li><strong>Click the bell icon</strong> to open the notification dropdown</li>
                    <li><strong>Click on a notification</strong> to mark it as read</li>
                    <li><strong>Try "Send Admin Broadcast"</strong> to test admin-to-user notifications</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchNotifications}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Notifications
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/admin/enhanced', '_blank')}
                  >
                    📊 Open Admin Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✅ Success!' : '❌ Error'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-2">
                    <p className="text-green-700 dark:text-green-300">
                      {result.message}
                    </p>
                    {result.note && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {result.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700 dark:text-red-300">
                    {result.error}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Notifications */}
          {notifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📧 Your Notifications</CardTitle>
                <CardDescription>
                  Current notifications for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read 
                          ? 'bg-gray-50 dark:bg-gray-800' 
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            )}
                            {notification.read && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
