import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test user notification...')

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const supabase = createServerSupabaseAdminClient()

    // Create a test notification for the user
    const testNotification = {
      id: `test_user_notif_${Date.now()}`,
      user_id: userId,
      type: 'general',
      title: '🎉 Welcome to Apply4Me Notifications!',
      message: 'This is a test notification to show you how our notification system works. You\'ll receive updates about your applications, payment status, and important deadlines here.',
      read: false,
      created_at: new Date().toISOString(),
      metadata: {
        source: 'test',
        testTimestamp: new Date().toISOString()
      }
    }

    // Store in file for demo (since database has connection issues)
    const fs = require('fs')
    const path = require('path')

    const tempDir = path.join(process.cwd(), 'temp')
    const userNotificationsFile = path.join(tempDir, `user-notifications-${userId}.json`)

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    let existingNotifications = []
    if (fs.existsSync(userNotificationsFile)) {
      try {
        const fileContent = fs.readFileSync(userNotificationsFile, 'utf8')
        existingNotifications = JSON.parse(fileContent)
      } catch (error) {
        existingNotifications = []
      }
    }

    existingNotifications.unshift(testNotification)
    if (existingNotifications.length > 20) {
      existingNotifications = existingNotifications.slice(0, 20)
    }

    fs.writeFileSync(userNotificationsFile, JSON.stringify(existingNotifications, null, 2))

    // Try database as backup
    try {
      await supabase.from('notifications').insert([testNotification])
      console.log('✅ Also saved to database')
    } catch (dbError) {
      console.log('Database unavailable, using file storage only')
    }

    console.log('✅ Test user notification created successfully:', testNotification.id)

    return NextResponse.json({
      success: true,
      message: '🎉 Test user notification created successfully!',
      notification: testNotification,
      instructions: {
        message: 'Check the notification bell icon in the header to see your notification!',
        location: 'Top right corner of the page'
      },
      note: 'Notification stored in file system for demo. In production, this would use the database.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test user notification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create test user notification',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test user notification endpoint',
    usage: 'POST with { userId: "user_id" } to create a test notification',
    timestamp: new Date().toISOString()
  })
}
