import { NextRequest, NextResponse } from 'next/server'

// Mock notifications for when database table doesn't exist
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

    console.log('📧 Using mock notifications API for user:', userId)

    // Generate mock notifications
    const mockNotifications = [
      {
        id: 'mock-1',
        userId,
        type: 'payment_verified',
        title: '✅ Payment Verified - Application Submitted!',
        message: 'Your payment of R250 has been verified. Your application to University of KwaZulu-Natal has been successfully submitted and is now being processed.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        metadata: {
          applicationId: 'app-123',
          paymentReference: 'PAY-456',
          institutionName: 'University of KwaZulu-Natal',
          amount: 250
        }
      },
      {
        id: 'mock-2',
        userId,
        type: 'application_submitted',
        title: '📝 Application Submitted Successfully!',
        message: 'Your application to Tshwane University of Technology has been submitted. We\'ll process your application and notify you once payment is verified.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        metadata: {
          applicationId: 'app-124',
          institutionName: 'Tshwane University of Technology'
        }
      },
      {
        id: 'mock-3',
        userId,
        type: 'deadline_reminder',
        title: '⏰ Application Deadline Reminder',
        message: 'Reminder: The application deadline for Stellenbosch University is in 7 days. Don\'t miss out!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        metadata: {
          institutionName: 'Stellenbosch University',
          deadline: '2024-12-31',
          daysRemaining: 7
        }
      },
      {
        id: 'mock-4',
        userId,
        type: 'welcome',
        title: '🎉 Welcome to Apply4Me!',
        message: 'Welcome to South Africa\'s premier higher education application platform! Complete your profile to get started.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        metadata: {
          source: 'system'
        }
      },
      {
        id: 'mock-5',
        userId,
        type: 'application_update',
        title: '📋 Application Status Update',
        message: 'Your application to University of Cape Town is currently being processed. We\'ll notify you of any updates.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        metadata: {
          applicationId: 'app-125',
          institutionName: 'University of Cape Town',
          status: 'processing'
        }
      }
    ]

    // Filter notifications
    let filteredNotifications = mockNotifications
    
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.read)
    }

    // Apply limit
    filteredNotifications = filteredNotifications.slice(0, limit)

    const unreadCount = mockNotifications.filter(n => !n.read).length

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount,
      source: 'mock',
      message: 'Using mock notifications - database table not available'
    })

  } catch (error) {
    console.error('Mock notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create mock notification
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

    console.log('📧 Creating mock notification:', { userId, type, title })

    // Simulate successful creation
    const mockNotification = {
      id: `mock-${Date.now()}`,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: metadata || {}
    }

    return NextResponse.json({
      success: true,
      notification: mockNotification,
      source: 'mock',
      message: 'Mock notification created - database table not available'
    })

  } catch (error) {
    console.error('Create mock notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Mark mock notifications as read
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

    console.log('📧 Marking mock notifications as read:', notificationIds)

    // Simulate successful update
    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} mock notifications marked as read`,
      source: 'mock',
      note: 'Database table not available - changes not persisted'
    })

  } catch (error) {
    console.error('Update mock notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
