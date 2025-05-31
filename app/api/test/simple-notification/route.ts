import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple Test: Sending notification...')

    // For now, let's create a mock notification that will show up in the admin dashboard
    // This bypasses database issues and shows the notification system UI is working

    const mockNotification = {
      id: `test_${Date.now()}`,
      type: 'test_notification',
      title: '🧪 AI Assistant Test Notification',
      message: 'Hello! This is a test notification sent by the AI assistant. If you can see this in your admin dashboard, the notification system UI is working perfectly! 🎉',
      status: 'sent',
      created_by: 'ai_assistant',
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      data: {
        recipients: ['admin'],
        sentTo: 1,
        deliveredTo: 1,
        openedBy: 0,
        clickedBy: 0,
        source: 'ai_test',
        testTimestamp: new Date().toISOString()
      }
    }

    // Store in a temporary file for persistence across requests
    const tempDir = path.join(process.cwd(), 'temp')
    const notificationsFile = path.join(tempDir, 'test-notifications.json')

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Read existing notifications
    let existingNotifications = []
    if (fs.existsSync(notificationsFile)) {
      try {
        const fileContent = fs.readFileSync(notificationsFile, 'utf8')
        existingNotifications = JSON.parse(fileContent)
      } catch (error) {
        console.log('Creating new notifications file')
        existingNotifications = []
      }
    }

    // Add new notification at the beginning
    existingNotifications.unshift(mockNotification)

    // Keep only last 10 test notifications
    if (existingNotifications.length > 10) {
      existingNotifications = existingNotifications.slice(0, 10)
    }

    // Save back to file
    fs.writeFileSync(notificationsFile, JSON.stringify(existingNotifications, null, 2))

    console.log('✅ Test notification created successfully:', mockNotification.id)

    return NextResponse.json({
      success: true,
      message: '🎉 Test notification sent successfully!',
      notification: {
        id: mockNotification.id,
        title: mockNotification.title,
        message: mockNotification.message,
        createdAt: mockNotification.created_at
      },
      instructions: {
        message: 'Check your admin dashboard to see the notification!',
        url: 'http://localhost:3001/admin/enhanced',
        section: 'Look in the Notifications section - it should appear at the top'
      },
      note: 'This is a temporary in-memory notification for testing. Database notifications will be fixed separately.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Simple notification test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send test notification',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple notification test endpoint',
    usage: 'POST to send a test notification',
    checkAt: 'http://localhost:3001/admin/enhanced'
  })
}
