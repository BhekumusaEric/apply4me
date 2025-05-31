import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test: Sending notification...')

    const supabase = createClient()

    // Create a test notification in admin_notifications table
    const testNotification = {
      type: 'test_notification',
      title: '🧪 Test Notification from AI Assistant',
      message: 'This is a test notification sent by the AI assistant to verify the notification system is working properly. If you can see this in your admin dashboard, the notification system is functioning correctly!',
      status: 'sent',
      created_by: 'ai_assistant',
      created_at: new Date().toISOString(),
      data: {
        recipients: ['admin'],
        sentTo: 1,
        deliveredTo: 1,
        openedBy: 0,
        clickedBy: 0,
        source: 'ai_test'
      }
    }

    const { data: adminNotification, error: adminError } = await supabase
      .from('admin_notifications')
      .insert(testNotification)
      .select()
      .single()

    if (adminError) {
      console.error('Failed to create admin notification:', adminError)
    } else {
      console.log('✅ Admin notification created:', adminNotification.id)
    }

    // Also create a user notification for testing
    const userNotification = {
      user_id: 'test-user-123',
      type: 'general',
      title: '🔔 User Test Notification',
      message: 'This is a test user notification from the AI assistant. Check your notification center!',
      read: false,
      created_at: new Date().toISOString(),
      metadata: {
        source: 'ai_assistant_test',
        testId: Date.now()
      }
    }

    const { data: userNotif, error: userError } = await supabase
      .from('notifications')
      .insert(userNotification)
      .select()
      .single()

    if (userError) {
      console.error('Failed to create user notification:', userError)
    } else {
      console.log('✅ User notification created:', userNotif.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifications sent successfully!',
      data: {
        adminNotification: adminNotification || null,
        userNotification: userNotif || null,
        adminError: adminError?.message || null,
        userError: userError?.message || null
      },
      instructions: {
        admin: 'Check your admin dashboard at /admin/enhanced',
        user: 'Check the notification center in the app header'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test notification endpoint',
    usage: 'POST to this endpoint to send test notifications',
    endpoints: {
      admin: '/admin/enhanced',
      notifications: '/api/notifications'
    }
  })
}
