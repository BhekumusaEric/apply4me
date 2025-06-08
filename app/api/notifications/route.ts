import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

interface Notification {
  id: string
  userId: string
  type: 'payment_verified' | 'payment_rejected' | 'application_update' | 'general'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: {
    applicationId?: string
    paymentReference?: string
    institutionName?: string
  }
}

// Get user notifications
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

    const supabase = createClient()

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('❌ Failed to fetch notifications:', error)

      // Check if table doesn't exist - fall back to mock data for now
      if (error.code === '42P01') {
        console.log('📧 Notifications table not found, falling back to mock API')

        // Redirect to mock API
        const mockResponse = await fetch(`${request.url.replace('/api/notifications', '/api/notifications/mock')}`)
        const mockData = await mockResponse.json()

        return NextResponse.json({
          ...mockData,
          fallbackToMock: true,
          message: 'Using mock notifications - database table not available'
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch notifications',
        details: error.message
      }, { status: 500 })
    }

    const formattedNotifications: Notification[] = notifications?.map(notif => ({
      id: notif.id,
      userId: notif.user_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      createdAt: notif.created_at,
      metadata: notif.metadata
    })) || []

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount: formattedNotifications.filter(n => !n.read).length
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const supabase = createClient()

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata: metadata || null,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create notification:', error)

      // Check if table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Notifications table not found. Please initialize the database.',
          code: 'TABLE_NOT_FOUND',
          initUrl: '/api/database/init-notifications'
        }, { status: 503 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create notification',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.created_at,
        metadata: notification.metadata
      }
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const supabase = createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', notificationIds)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to mark notifications as read:', error)
      return NextResponse.json(
        { error: 'Failed to update notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notifications marked as read`
    })

  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
