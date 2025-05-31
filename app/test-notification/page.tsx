'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestNotificationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test/simple-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🧪 Notification Test</h1>
          <p className="text-muted-foreground">
            Test the notification system by sending a test notification
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Send Test Notification
            </CardTitle>
            <CardDescription>
              This will send a test notification to the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={sendTestNotification}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Notification
                </>
              )}
            </Button>

            {result && (
              <div className="mt-4">
                {result.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Success!</span>
                    </div>
                    <p className="text-green-800 mb-3">{result.message}</p>

                    {result.notification && (
                      <div className="bg-white rounded border p-3 mb-3">
                        <h4 className="font-medium mb-1">{result.notification.title}</h4>
                        <p className="text-sm text-gray-600">{result.notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          ID: {result.notification.id}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-900">Next Steps:</p>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Check your admin dashboard at <code>/admin/enhanced</code></li>
                        <li>• Look in the Notifications section</li>
                        <li>• The notification should appear at the top of the list</li>
                        <li>• You can send multiple test notifications</li>
                      </ul>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        asChild
                        variant="outline"
                      >
                        <a href="/admin/enhanced" target="_blank">
                          Open Admin Dashboard
                        </a>
                      </Button>

                      <Button
                        onClick={sendTestNotification}
                        variant="secondary"
                        size="sm"
                      >
                        Send Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-900">Error</span>
                    </div>
                    <p className="text-red-800 mb-2">{result.error}</p>
                    {result.details && (
                      <p className="text-sm text-red-700">Details: {result.details}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Check Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">1</Badge>
              <span>Click "Send Test Notification" above</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">2</Badge>
              <span>Open the admin dashboard at <code>/admin/enhanced</code></span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">3</Badge>
              <span>Look for the notification in the Notifications section</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">4</Badge>
              <span>The test notification should appear with a 🧪 icon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
