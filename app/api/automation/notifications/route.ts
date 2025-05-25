/**
 * API Endpoint for Manual Notifications
 * Allows admin to trigger notifications manually
 */

import { NextRequest, NextResponse } from 'next/server'
import { AutomationScheduler } from '@/lib/automation/scheduler'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (!type || !['deadlines', 'digest'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type. Use: deadlines or digest' },
        { status: 400 }
      )
    }

    const scheduler = new AutomationScheduler()
    let emailsSent = 0

    console.log(`📧 Manual notification triggered: ${type}`)

    if (type === 'deadlines') {
      console.log('⏰ Sending deadline reminders...')
      emailsSent = await scheduler.sendDeadlineReminders()
    }

    if (type === 'digest') {
      console.log('📊 Sending weekly digest...')
      emailsSent = await scheduler.sendWeeklyDigest()
    }

    return NextResponse.json({
      success: true,
      message: `${type} notifications sent`,
      emailsSent,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Notification API error:', error)
    return NextResponse.json(
      { 
        error: 'Notification sending failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
