import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * Initialize Notifications Database Schema
 * This endpoint creates the notifications table and related structures
 */
export async function POST() {
  try {
    const supabase = createClient()

    console.log('🔧 Initializing notifications database schema...')

    // Create notifications table
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Notifications table
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('payment_verified', 'payment_rejected', 'application_update', 'general', 'deadline_reminder', 'application_submitted')),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (notificationsError) {
      console.error('❌ Error creating notifications table:', notificationsError)
      // Try alternative approach without RPC
      const { error: directError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1)

      if (directError && directError.code === '42P01') {
        // Table doesn't exist, we need to create it manually
        return NextResponse.json({
          success: false,
          error: 'Notifications table does not exist. Please run the SQL schema manually.',
          sqlScript: `
-- Run this SQL in your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment_verified', 'payment_rejected', 'application_update', 'general', 'deadline_reminder', 'application_submitted')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);
          `
        }, { status: 500 })
      }
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      `
    })

    if (indexError) {
      console.warn('⚠️ Warning creating indexes:', indexError)
    }

    // Enable RLS and create policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Row Level Security
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
        DROP POLICY IF EXISTS "System can create notifications" ON notifications;

        -- Create policies
        CREATE POLICY "Users can view own notifications" ON notifications
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can update own notifications" ON notifications
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "System can create notifications" ON notifications
          FOR INSERT WITH CHECK (true);
      `
    })

    if (rlsError) {
      console.warn('⚠️ Warning setting up RLS:', rlsError)
    }

    // Test the table by creating a sample notification
    const testUserId = '00000000-0000-0000-0000-000000000000' // Dummy UUID for testing

    const { data: testNotification, error: testError } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        type: 'general',
        title: 'System Initialized',
        message: 'Notifications system has been successfully initialized.',
        metadata: { source: 'system_init' }
      })
      .select()
      .single()

    if (testError) {
      console.error('❌ Error testing notifications table:', testError)
      return NextResponse.json({
        success: false,
        error: 'Failed to test notifications table',
        details: testError.message
      }, { status: 500 })
    }

    // Clean up test notification
    if (testNotification) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', testNotification.id)
    }

    console.log('✅ Notifications database schema initialized successfully')

    return NextResponse.json({
      success: true,
      message: 'Notifications database schema initialized successfully',
      tables: ['notifications'],
      features: [
        'Notification creation and retrieval',
        'Read/unread status tracking',
        'Metadata support for rich notifications',
        'Row Level Security enabled',
        'Performance indexes created'
      ]
    })

  } catch (error) {
    console.error('❌ Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get notifications schema status
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Check if notifications table exists
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1)

    const tableExists = !error || error.code !== '42P01'

    return NextResponse.json({
      success: true,
      tableExists,
      status: tableExists ? 'ready' : 'needs_initialization',
      message: tableExists 
        ? 'Notifications system is ready' 
        : 'Notifications table needs to be created'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check notifications schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
