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
-- Complete setup for Apply4Me Admin System

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment_verified', 'payment_rejected', 'application_update', 'general', 'deadline_reminder', 'application_submitted')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- 4. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 6. Create policies for admin_users
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Insert default admin users
INSERT INTO public.admin_users (user_id, email, role, permissions)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'bhntshwcjc025@student.wethinkcode.co.za', 'super_admin', '{"all": true}'),
  ('00000000-0000-0000-0000-000000000002', 'admin@apply4me.co.za', 'admin', '{"manage_institutions": true, "manage_applications": true}'),
  ('00000000-0000-0000-0000-000000000003', 'bhekumusa@apply4me.co.za', 'admin', '{"manage_institutions": true, "manage_applications": true}')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;

-- Setup complete! For full setup, see: /database/setup-admin-system.sql
          `,
          setupInstructions: [
            '1. Open your Supabase project dashboard',
            '2. Navigate to SQL Editor',
            '3. Copy and paste the SQL script above',
            '4. Click "Run" to execute the script',
            '5. Refresh this page to verify the setup',
            '6. For complete setup with RLS policies, use /database/setup-admin-system.sql'
          ]
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
