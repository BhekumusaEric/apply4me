import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    const supabaseAdmin = createServerSupabaseAdminClient()
    
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching user notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notifications || []
    })

  } catch (error) {
    console.error('Error in user notifications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_ids, title, message, type = 'info' } = body

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: 'user_ids array is required' },
        { status: 400 }
      )
    }

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServerSupabaseAdminClient()

    // Create notifications for all specified users
    const notifications = user_ids.map(user_id => ({
      id: crypto.randomUUID(),
      user_id,
      type,
      title,
      message,
      read: false,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('Error creating user notifications:', error)
      return NextResponse.json(
        { error: 'Failed to create notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent to ${user_ids.length} user(s)`,
      data: data
    })

  } catch (error) {
    console.error('Error in user notifications POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServerSupabaseAdminClient()

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })

  } catch (error) {
    console.error('Error in notifications DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk operations on notifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notification_ids, user_ids } = body

    const supabaseAdmin = createServerSupabaseAdminClient()

    switch (action) {
      case 'mark_read':
        if (!notification_ids || !Array.isArray(notification_ids)) {
          return NextResponse.json(
            { error: 'notification_ids array is required for mark_read' },
            { status: 400 }
          )
        }

        const { error: readError } = await supabaseAdmin
          .from('notifications')
          .update({ read: true })
          .in('id', notification_ids)

        if (readError) throw readError

        return NextResponse.json({
          success: true,
          message: `${notification_ids.length} notification(s) marked as read`
        })

      case 'mark_unread':
        if (!notification_ids || !Array.isArray(notification_ids)) {
          return NextResponse.json(
            { error: 'notification_ids array is required for mark_unread' },
            { status: 400 }
          )
        }

        const { error: unreadError } = await supabaseAdmin
          .from('notifications')
          .update({ read: false })
          .in('id', notification_ids)

        if (unreadError) throw unreadError

        return NextResponse.json({
          success: true,
          message: `${notification_ids.length} notification(s) marked as unread`
        })

      case 'delete_bulk':
        if (!notification_ids || !Array.isArray(notification_ids)) {
          return NextResponse.json(
            { error: 'notification_ids array is required for delete_bulk' },
            { status: 400 }
          )
        }

        const { error: deleteError } = await supabaseAdmin
          .from('notifications')
          .delete()
          .in('id', notification_ids)

        if (deleteError) throw deleteError

        return NextResponse.json({
          success: true,
          message: `${notification_ids.length} notification(s) deleted`
        })

      case 'delete_user_notifications':
        if (!user_ids || !Array.isArray(user_ids)) {
          return NextResponse.json(
            { error: 'user_ids array is required for delete_user_notifications' },
            { status: 400 }
          )
        }

        const { error: deleteUserError } = await supabaseAdmin
          .from('notifications')
          .delete()
          .in('user_id', user_ids)

        if (deleteUserError) throw deleteUserError

        return NextResponse.json({
          success: true,
          message: `All notifications deleted for ${user_ids.length} user(s)`
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in notifications PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
