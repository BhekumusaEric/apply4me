import { NextRequest, NextResponse } from 'next/server'

/**
 * Mock Notifications API
 * This provides a working notifications system for testing when the database table doesn't exist
 */

interface MockNotification {
  id: string
  userId: string
  type: 'payment_verified' | 'payment_rejected' | 'application_update' | 'general' | 'deadline_reminder' | 'application_submitted'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
}

// In-memory storage for testing (in production, this would be in the database)
let mockNotifications: MockNotification[] = [
  {
    id: '1',
    userId: 'test-user-123',
    type: 'general',
    title: '🎉 Welcome to Apply4Me!',
    message: 'Your account has been created successfully. Start exploring institutions and bursaries available to you.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    metadata: { source: 'welcome' }
  },
  {
    id: '2',
    userId: 'test-user-123',
    type: 'application_submitted',
    title: '📝 Application Submitted',
    message: 'Your application to University of Cape Town has been submitted successfully. We will notify you once payment is verified.',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    metadata: { 
      applicationId: 'app-123',
      institutionName: 'University of Cape Town',
      serviceType: 'standard'
    }
  },
  {
    id: '3',
    userId: 'test-user-123',
    type: 'payment_verified',
    title: '✅ Payment Verified - Application Submitted!',
    message: 'Your payment of R150 (Ref: PAY-123456) has been verified. Your application to University of Cape Town has been successfully submitted and is now being processed.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    metadata: {
      applicationId: 'app-123',
      paymentReference: 'PAY-123456',
      institutionName: 'University of Cape Town',
      amount: 150
    }
  }
]

// Get notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log(`📧 [MOCK] Fetching notifications for user: ${userId}`)

    // Filter notifications for the user
    let userNotifications = mockNotifications.filter(n => n.userId === userId)

    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read)
    }

    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply limit
    userNotifications = userNotifications.slice(0, limit)

    const unreadCount = mockNotifications.filter(n => n.userId === userId && !n.read).length

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount,
      source: 'mock',
      message: 'Using mock notifications (database table not available)'
    })

  } catch (error) {
    console.error('❌ Mock notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, metadata } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      )
    }

    console.log(`📧 [MOCK] Creating notification: ${type} for user ${userId}`)

    const newNotification: MockNotification = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: metadata || {}
    }

    // Add to mock storage
    mockNotifications.push(newNotification)

    console.log(`✅ [MOCK] Notification created: ${newNotification.id}`)

    return NextResponse.json({
      success: true,
      notification: newNotification,
      source: 'mock',
      message: 'Notification created in mock storage'
    })

  } catch (error) {
    console.error('❌ Mock notification creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, userId } = body

    if (!notificationIds || !Array.isArray(notificationIds) || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: notificationIds (array), userId' },
        { status: 400 }
      )
    }

    console.log(`📧 [MOCK] Marking notifications as read for user: ${userId}`)

    // Update notifications in mock storage
    let updatedCount = 0
    mockNotifications = mockNotifications.map(notification => {
      if (notificationIds.includes(notification.id) && notification.userId === userId) {
        updatedCount++
        return { ...notification, read: true }
      }
      return notification
    })

    console.log(`✅ [MOCK] Marked ${updatedCount} notifications as read`)

    return NextResponse.json({
      success: true,
      updatedCount,
      source: 'mock',
      message: 'Notifications marked as read in mock storage'
    })

  } catch (error) {
    console.error('❌ Mock notification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// Get all mock notifications (for debugging)
export async function DELETE() {
  try {
    const allNotifications = [...mockNotifications]
    
    return NextResponse.json({
      success: true,
      notifications: allNotifications,
      count: allNotifications.length,
      source: 'mock',
      message: 'All mock notifications retrieved'
    })

  } catch (error) {
    console.error('❌ Mock notifications debug error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}
