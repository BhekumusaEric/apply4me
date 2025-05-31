import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications/real-time-service'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const result = await notificationService.getUserNotifications(userId, {
      limit,
      unreadOnly
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Real-time notifications GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'send_notification':
        return await handleSendNotification(data)
      
      case 'mark_as_read':
        return await handleMarkAsRead(data)
      
      case 'broadcast':
        return await handleBroadcast(data)
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Real-time notifications POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process notification request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handleSendNotification(data: any) {
  const { userId, type, title, message, metadata, channels } = data

  if (!userId || !title || !message) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: userId, title, message'
    }, { status: 400 })
  }

  const result = await notificationService.sendNotification({
    id: `notif_${Date.now()}_${userId}`,
    userId,
    type: type || 'general',
    title,
    message,
    metadata,
    channels: channels || ['database']
  })

  return NextResponse.json(result)
}

async function handleMarkAsRead(data: any) {
  const { notificationIds, userId } = data

  if (!notificationIds || !userId) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: notificationIds, userId'
    }, { status: 400 })
  }

  const success = await notificationService.markAsRead(notificationIds, userId)

  return NextResponse.json({
    success,
    message: success ? 'Notifications marked as read' : 'Failed to mark notifications as read'
  })
}

async function handleBroadcast(data: any) {
  const { recipients, type, title, message, metadata, channels } = data

  if (!recipients || !title || !message) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: recipients, title, message'
    }, { status: 400 })
  }

  const supabase = createServerSupabaseAdminClient()
  let userIds: string[] = []

  // Get user IDs based on recipient criteria
  if (recipients === 'all_users') {
    const { data: users } = await supabase
      .from('users')
      .select('id')
    userIds = users?.map(u => u.id) || []
  } else if (recipients === 'incomplete_profiles') {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .is('profile_completed', false)
    userIds = users?.map(u => u.id) || []
  } else if (recipients === 'pending_payments') {
    const { data: applications } = await supabase
      .from('applications')
      .select('user_id')
      .eq('payment_status', 'pending')
    userIds = [...new Set(applications?.map(a => a.user_id) || [])]
  } else if (Array.isArray(recipients)) {
    userIds = recipients
  } else {
    return NextResponse.json({
      success: false,
      error: 'Invalid recipients format'
    }, { status: 400 })
  }

  if (userIds.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'No users found for the specified criteria'
    }, { status: 400 })
  }

  const result = await notificationService.broadcastNotification(userIds, {
    type: type || 'general',
    title,
    message,
    metadata,
    channels: channels || ['database']
  })

  return NextResponse.json(result)
}

// DELETE endpoint for deleting notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('notificationId')
    const userId = searchParams.get('userId')

    if (!notificationId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: notificationId, userId'
      }, { status: 400 })
    }

    const supabase = createServerSupabaseAdminClient()
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete notification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
