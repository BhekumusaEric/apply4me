-- Apply4Me Database Permissions Fix
-- Run this in your Supabase SQL Editor to fix all permission issues

-- =====================================================
-- STEP 1: Grant Service Role Permissions
-- =====================================================

-- Grant necessary permissions to service role for users table
GRANT SELECT, INSERT, UPDATE ON users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions for student_profiles table
GRANT SELECT, INSERT, UPDATE ON student_profiles TO service_role;

-- Grant permissions for notifications table
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO service_role;

-- =====================================================
-- STEP 2: Update RLS Policies for Users Table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Service role can access all users" ON users
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 3: Update RLS Policies for Student Profiles
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all profiles" ON student_profiles;
DROP POLICY IF EXISTS "Users can view own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can update own student profile" ON student_profiles;

-- Create comprehensive RLS policies for student_profiles table
CREATE POLICY "Service role can access all profiles" ON student_profiles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own student profile" ON student_profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update own student profile" ON student_profiles
  FOR ALL 
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- =====================================================
-- STEP 4: Update RLS Policies for Notifications
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can view all notifications" ON notifications;

-- Create comprehensive RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT 
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE 
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all notifications" ON notifications
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 5: Create Admin Notifications Table
-- =====================================================

-- Create admin_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  channels TEXT[] DEFAULT ARRAY['email'],
  sent_to INTEGER DEFAULT 0,
  delivered_to INTEGER DEFAULT 0,
  opened_by INTEGER DEFAULT 0,
  clicked_by INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin_notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

-- Enable RLS on admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_notifications
CREATE POLICY "Service role can manage admin notifications" ON admin_notifications
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 6: Grant Permissions for Admin Notifications
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON admin_notifications TO service_role;

-- =====================================================
-- STEP 7: Test Data Insertion
-- =====================================================

-- Insert a test notification to verify everything works
INSERT INTO notifications (id, user_id, type, title, message, metadata)
VALUES (
  'test_permissions_' || extract(epoch from now()),
  '85b75472-2b66-47c8-a8d2-27253382bfd6',
  'general',
  '✅ Database Permissions Fixed!',
  'Great news! The database permissions have been successfully updated. The notification system should now work perfectly.',
  '{"source": "permissions_fix", "test": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: Verification Queries
-- =====================================================

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('users', 'student_profiles', 'notifications', 'admin_notifications')
ORDER BY tablename, policyname;

-- Check table permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('users', 'student_profiles', 'notifications', 'admin_notifications')
AND grantee = 'service_role';

-- Test notification count
SELECT 
  'notifications' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE read = false) as unread_count
FROM notifications;

-- Test admin notifications table
SELECT 
  'admin_notifications' as table_name,
  COUNT(*) as total_count
FROM admin_notifications;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This will show in the results
SELECT 
  '🎉 Database Permissions Fix Complete!' as status,
  'All tables now have proper RLS policies and service role permissions' as message,
  'You can now test the notification system' as next_step;
