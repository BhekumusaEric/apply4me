import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * Setup Notifications Table
 * This endpoint creates the notifications table using direct SQL
 */
export async function POST() {
  try {
    const supabase = createClient()

    console.log('🔧 Setting up notifications table...')

    // First, let's try to create the table using a simple approach
    // We'll use the service role client to execute raw SQL
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1)

    if (!error) {
      return NextResponse.json({
        success: true,
        message: 'Notifications table already exists',
        status: 'ready'
      })
    }

    // If we get a "relation does not exist" error, we need to create the table
    if (error.code === '42P01') {
      console.log('📋 Notifications table does not exist, creating it...')
      
      // For now, let's create a mock response that tells the user what to do
      const sqlScript = `
-- Copy and paste this SQL into your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.notifications (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Insert a test notification to verify the table works
INSERT INTO public.notifications (user_id, type, title, message, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'general',
  'Notifications System Ready',
  'The notifications system has been successfully set up and is ready to use.',
  '{"source": "system_setup"}'
);
      `

      return NextResponse.json({
        success: false,
        message: 'Notifications table needs to be created manually',
        instructions: 'Please run the provided SQL script in your Supabase SQL Editor',
        sqlScript: sqlScript.trim(),
        steps: [
          '1. Go to your Supabase Dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and paste the provided SQL script',
          '4. Click "Run" to execute the script',
          '5. Test the notifications API again'
        ]
      }, { status: 200 })
    }

    return NextResponse.json({
      success: false,
      error: 'Unexpected database error',
      details: error.message
    }, { status: 500 })

  } catch (error) {
    console.error('❌ Setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup notifications table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Check notifications table status
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Try to query the notifications table
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          status: 'table_missing',
          message: 'Notifications table does not exist',
          setupUrl: '/api/database/setup-notifications'
        })
      }

      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Database error',
        error: error.message
      }, { status: 500 })
    }

    // Table exists, let's check if it has the right structure
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, message, read, created_at')
      .limit(1)

    if (testError) {
      return NextResponse.json({
        success: false,
        status: 'schema_error',
        message: 'Notifications table exists but has schema issues',
        error: testError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status: 'ready',
      message: 'Notifications system is ready',
      tableExists: true,
      recordCount: testData?.length || 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to check notifications status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
