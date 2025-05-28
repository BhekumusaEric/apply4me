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
      console.error('Failed to fetch notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
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
      console.error('Failed to create notification:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
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
