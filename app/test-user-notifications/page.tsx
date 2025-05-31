'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/app/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function TestUserNotificationsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testType, setTestType] = useState<'user' | 'admin'>('user')
  
  const [adminForm, setAdminForm] = useState({
    title: 'Important Update from Apply4Me',
    message: 'We have exciting news about new opportunities available for you. Check your dashboard for the latest updates!',
    recipients: 'all_users',
    type: 'general'
  })

  const sendTestUserNotification = async () => {
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
        body: JSON.stringify(adminForm)
      })

      const data = await response.json()
      setResult(data)

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
            <h1 className="text-3xl font-bold mb-2">🔔 Notification System Test</h1>
            <p className="text-muted-foreground">
              Test the complete notification flow from admin to users
            </p>
          </div>

          {/* Test Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Test Type</CardTitle>
              <CardDescription>
                Select what type of notification test you want to run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={testType === 'user' ? 'default' : 'outline'}
                  onClick={() => setTestType('user')}
                  className="h-20 flex-col"
                >
                  <span className="text-2xl mb-2">👤</span>
                  <span className="font-medium">Direct User Notification</span>
                  <span className="text-xs opacity-70">Send notification directly to your account</span>
                </Button>
                
                <Button
                  variant={testType === 'admin' ? 'default' : 'outline'}
                  onClick={() => setTestType('admin')}
                  className="h-20 flex-col"
                >
                  <span className="text-2xl mb-2">👨‍💼</span>
                  <span className="font-medium">Admin Broadcast</span>
                  <span className="text-xs opacity-70">Send notification as admin to all users</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Notification Test */}
          {testType === 'user' && (
            <Card>
              <CardHeader>
                <CardTitle>👤 Direct User Notification Test</CardTitle>
                <CardDescription>
                  This will create a test notification directly for your user account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What this test does:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Creates a test notification for your user account</li>
                    <li>• Shows notification in the bell icon (top right)</li>
                    <li>• Demonstrates the user notification system</li>
                    <li>• Tests the notification dropdown and marking as read</li>
                  </ul>
                </div>

                <Button 
                  onClick={sendTestUserNotification}
                  disabled={loading || !user}
                  className="w-full"
                >
                  {loading ? '🔄 Creating Notification...' : '🧪 Send Test User Notification'}
                </Button>

                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please sign in to test user notifications
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Notification Test */}
          {testType === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>👨‍💼 Admin Broadcast Test</CardTitle>
                <CardDescription>
                  This will send a notification from admin to all users (including you)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      value={adminForm.title}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={adminForm.type} onValueChange={(value) => setAdminForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="application_update">Application Update</SelectItem>
                        <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                        <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={adminForm.message}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select value={adminForm.recipients} onValueChange={(value) => setAdminForm(prev => ({ ...prev, recipients: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="incomplete_profiles">Users with Incomplete Profiles</SelectItem>
                      <SelectItem value="pending_payments">Users with Pending Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">What this test does:</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Sends notification to all users in the system</li>
                    <li>• Creates individual user notifications for each recipient</li>
                    <li>• Shows in admin dashboard and user notification centers</li>
                    <li>• Demonstrates the complete admin-to-user flow</li>
                  </ul>
                </div>

                <Button 
                  onClick={sendAdminNotification}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? '🔄 Sending Notification...' : '📢 Send Admin Notification'}
                </Button>
              </CardContent>
            </Card>
          )}

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
                  <div className="space-y-4">
                    <p className="text-green-700 dark:text-green-300">
                      {result.message}
                    </p>
                    
                    {result.instructions && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Next Steps:</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {result.instructions.message}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Location: {result.instructions.location}
                        </p>
                      </div>
                    )}

                    {result.data?.userNotificationsCreated && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          📧 Created {result.data.userNotificationsCreated} user notifications
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                      >
                        🔄 Refresh Page
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open('/dashboard', '_blank')}
                      >
                        📊 Open Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-700 dark:text-red-300">
                      {result.error}
                    </p>
                    {result.details && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Details: {result.details}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
