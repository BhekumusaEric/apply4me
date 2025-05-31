import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')

    const supabase = createServerSupabaseAdminClient()

    // Test 1: Basic connection
    console.log('📡 Testing basic connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message,
        tests: {
          connection: false,
          notificationsTable: false,
          permissions: false
        }
      }, { status: 500 })
    }

    console.log('✅ Basic connection successful')

    // Test 2: Check if notifications table exists
    console.log('📋 Checking notifications table...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1)

    const notificationsTableExists = !tableError
    console.log(`📋 Notifications table exists: ${notificationsTableExists}`)
    if (tableError) {
      console.log('❌ Table check error:', tableError)
    }

    // Test 3: Try to query notifications table (if it exists)
    let notificationsTest = false
    let notificationsError = null

    if (notificationsTableExists) {
      console.log('🔍 Testing notifications table access...')
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1)

      notificationsTest = !notifError
      notificationsError = notifError?.message

      if (notifError) {
        console.error('❌ Notifications table test failed:', notifError)
      } else {
        console.log('✅ Notifications table accessible')
      }
    }

    // Test 4: Try to insert a test notification (if table exists)
    let insertTest = false
    let insertError = null

    if (notificationsTableExists && notificationsTest) {
      console.log('📝 Testing notification insert...')
      const testNotification = {
        id: `test_db_${Date.now()}`,
        user_id: '85b75472-2b66-47c8-a8d2-27253382bfd6', // Use a real UUID
        type: 'general',
        title: 'Database Test Notification',
        message: 'This is a test notification to verify database functionality.',
        read: false,
        created_at: new Date().toISOString(),
        metadata: { source: 'database_test' }
      }

      const { data: insertData, error: insertErr } = await supabase
        .from('notifications')
        .insert([testNotification])
        .select()

      insertTest = !insertErr
      insertError = insertErr?.message

      if (insertErr) {
        console.error('❌ Insert test failed:', insertErr)
      } else {
        console.log('✅ Insert test successful:', insertData?.[0]?.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database tests completed',
      tests: {
        connection: true,
        notificationsTable: notificationsTableExists,
        notificationsAccess: notificationsTest,
        insertCapability: insertTest
      },
      details: {
        connectionError: null,
        tableError: tableError?.message,
        notificationsError,
        insertError
      },
      recommendations: !notificationsTableExists ? [
        'Create the notifications table using the SQL provided in the setup guide',
        'Run the table creation script in Supabase SQL Editor',
        'Enable Row Level Security policies for the notifications table'
      ] : insertTest ? [
        'Database is fully functional!',
        'Notifications system should work correctly',
        'You can now send real-time notifications'
      ] : [
        'Table exists but has permission issues',
        'Check Row Level Security policies',
        'Verify service role permissions'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'create_test_notification') {
      console.log('📝 Creating test notification in database...')

      const supabase = createServerSupabaseAdminClient()

      const testNotification = {
        id: `manual_test_${Date.now()}`,
        user_id: 'df70993e-739e-4190-b78d-93a9e1002bf7', // Real user ID from database
        type: 'general',
        title: '🧪 Manual Database Test',
        message: 'This notification was created directly in the database to test the system!',
        read: false,
        created_at: new Date().toISOString(),
        metadata: {
          source: 'manual_test',
          createdBy: 'database_test_api'
        }
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([testNotification])
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to create test notification:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create test notification',
          details: error.message
        }, { status: 500 })
      }

      console.log('✅ Test notification created:', data.id)

      return NextResponse.json({
        success: true,
        message: 'Test notification created successfully!',
        notification: data,
        instructions: {
          message: 'Check the notification bell icon to see if it appears',
          nextStep: 'Try fetching notifications for test-user-123'
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Database POST test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database POST test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
