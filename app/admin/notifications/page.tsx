'use client'

import { useState, useEffect } from 'react'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  recipients: string[]
  sentTo: number
  deliveredTo: number
  openedBy: number
  clickedBy: number
  status: string
  scheduledFor: string | null
  sentAt: string | null
  createdBy: string
  createdAt: string
}

interface NotificationsData {
  notifications: Notification[]
  summary: {
    totalNotifications: number
    sentNotifications: number
    scheduledNotifications: number
    draftNotifications: number
    totalRecipients: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    deliveryRate: number
    openRate: number
    clickRate: number
  }
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [data, setData] = useState<NotificationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Send notification form state
  const [sendForm, setSendForm] = useState({
    type: 'custom',
    title: '',
    message: '',
    recipients: 'all_users',
    channels: ['email'],
    scheduledFor: ''
  })
  const [sending, setSending] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/notifications')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Failed to fetch notifications:', result.error)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.message) {
      alert('Please fill in title and message')
      return
    }

    try {
      setSending(true)

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sendForm,
          recipients: [sendForm.recipients],
          scheduledFor: sendForm.scheduledFor || null
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(result.data.message)
        setSendForm({
          type: 'custom',
          title: '',
          message: '',
          recipients: 'all_users',
          channels: ['email'],
          scheduledFor: ''
        })
        fetchNotifications() // Refresh the list
      } else {
        alert(`Failed to send notification: ${result.error}`)
      }
    } catch (error) {
      console.error('Send notification error:', error)
      alert('Failed to send notification. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application_reminder': return '📅'
      case 'payment_reminder': return '⚠️'
      case 'document_reminder': return '👁️'
      case 'acceptance_notification': return '✅'
      case 'weekly_digest': return '📧'
      default: return '🔔'
    }
  }

  const recipientOptions = [
    { value: 'all_users', label: 'All Users', count: 25 },
    { value: 'incomplete_profiles', label: 'Incomplete Profiles', count: 15 },
    { value: 'pending_payments', label: 'Pending Payments', count: 8 },
    { value: 'missing_documents', label: 'Missing Documents', count: 12 },
    { value: 'accepted_applications', label: 'Accepted Applications', count: 3 },
    { value: 'rejected_applications', label: 'Rejected Applications', count: 1 }
  ]

  const notificationTemplates = [
    {
      type: 'application_reminder',
      title: 'Application Deadline Reminder',
      message: 'Your application deadline is approaching. Please complete your application to avoid missing out.'
    },
    {
      type: 'payment_reminder',
      title: 'Payment Required',
      message: 'Your application fee payment is still pending. Please complete payment to proceed with your application.'
    },
    {
      type: 'document_reminder',
      title: 'Missing Documents',
      message: 'Please upload your missing documents to complete your application profile.'
    },
    {
      type: 'acceptance_notification',
      title: 'Application Status Update',
      message: 'Congratulations! Your application has been accepted. Next steps will be sent to you soon.'
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading notifications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📧 Notifications Center</h1>
          <p className="text-gray-600">Send notifications and track communication with students</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`px-4 py-2 rounded-md ${activeTab === 'send' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
            >
              📧 Send Notification
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md ${activeTab === 'history' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
            >
              📋 History
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">📤</span>
                  <div>
                    <p className="text-sm text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold">{data.summary.sentNotifications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">👥</span>
                  <div>
                    <p className="text-sm text-gray-600">Total Recipients</p>
                    <p className="text-2xl font-bold">{data.summary.totalRecipients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">📈</span>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Rate</p>
                    <p className="text-2xl font-bold">{data.summary.deliveryRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-500">👁️</span>
                  <div>
                    <p className="text-sm text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold">{data.summary.openRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{data.summary.totalDelivered}</p>
                  <p className="text-xs text-gray-500">of {data.summary.totalRecipients} sent</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Opened</p>
                  <p className="text-2xl font-bold text-blue-600">{data.summary.totalOpened}</p>
                  <p className="text-xs text-gray-500">of {data.summary.totalDelivered} delivered</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Clicked</p>
                  <p className="text-2xl font-bold text-purple-600">{data.summary.totalClicked}</p>
                  <p className="text-xs text-gray-500">of {data.summary.totalOpened} opened</p>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Notifications</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span>{getTypeIcon(notification.type)}</span>
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message.substring(0, 100)}...</p>
                          <p className="text-xs text-gray-500">
                            {notification.sentAt ?
                              `Sent ${new Date(notification.sentAt).toLocaleDateString()}` :
                              `Scheduled for ${notification.scheduledFor ? new Date(notification.scheduledFor).toLocaleDateString() : 'later'}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.sentTo} recipients
                        </p>
                        {notification.status === 'sent' && (
                          <p className="text-xs text-gray-500">
                            {notification.openedBy} opened
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Tab */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <span>📤</span>
                  <span>Send New Notification</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notification Type</label>
                  <select
                    value={sendForm.type}
                    onChange={(e) => setSendForm({...sendForm, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="custom">Custom Message</option>
                    <option value="application_reminder">Application Reminder</option>
                    <option value="payment_reminder">Payment Reminder</option>
                    <option value="document_reminder">Document Reminder</option>
                    <option value="acceptance_notification">Acceptance Notification</option>
                    <option value="weekly_digest">Weekly Digest</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Enter notification title..."
                    value={sendForm.title}
                    onChange={(e) => setSendForm({...sendForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Enter your message..."
                    value={sendForm.message}
                    onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium mb-2">Recipients</label>
                  <select
                    value={sendForm.recipients}
                    onChange={(e) => setSendForm({...sendForm, recipients: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {recipientOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count} users)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channels */}
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Channels</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.channels.includes('email')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSendForm({...sendForm, channels: [...sendForm.channels, 'email']})
                          } else {
                            setSendForm({...sendForm, channels: sendForm.channels.filter(c => c !== 'email')})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="mr-1">📧</span>
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.channels.includes('sms')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSendForm({...sendForm, channels: [...sendForm.channels, 'sms']})
                          } else {
                            setSendForm({...sendForm, channels: sendForm.channels.filter(c => c !== 'sms')})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="mr-1">📱</span>
                      SMS
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.channels.includes('whatsapp')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSendForm({...sendForm, channels: [...sendForm.channels, 'whatsapp']})
                          } else {
                            setSendForm({...sendForm, channels: sendForm.channels.filter(c => c !== 'whatsapp')})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="mr-1">💬</span>
                      WhatsApp
                    </label>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={sendForm.scheduledFor}
                    onChange={(e) => setSendForm({...sendForm, scheduledFor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !sendForm.title || !sendForm.message}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <span className="mr-2">⏳</span>
                      {sendForm.scheduledFor ? 'Scheduling...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      {sendForm.scheduledFor ? 'Schedule Notification' : 'Send Now'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Quick Templates</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {notificationTemplates.map((template, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSendForm({
                           ...sendForm,
                           type: template.type,
                           title: template.title,
                           message: template.message
                         })}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span>{getTypeIcon(template.type)}</span>
                        <h4 className="font-medium">{template.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{template.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && data && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Notification History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span>{getTypeIcon(notification.type)}</span>
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {notification.sentAt ?
                            `Sent ${new Date(notification.sentAt).toLocaleString()}` :
                            `Scheduled for ${notification.scheduledFor ? new Date(notification.scheduledFor).toLocaleString() : 'later'}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Sent to: {notification.sentTo}</p>
                        <p>Delivered: {notification.deliveredTo}</p>
                        <p>Opened: {notification.openedBy}</p>
                        <p>Clicked: {notification.clickedBy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
