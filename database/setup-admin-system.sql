-- =====================================================
-- Apply4Me Admin User Management & Notifications Setup
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor
-- This will create all necessary tables for the admin system

-- 1. Create notifications table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment_verified', 'payment_rejected', 'application_update', 'general', 'deadline_reminder', 'application_submitted')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create in_app_notifications table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create admin_users table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
-- =====================================================
-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- In-app notifications indexes
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON public.in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_read ON public.in_app_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_priority ON public.in_app_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON public.in_app_notifications(created_at DESC);

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- 5. Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for notifications
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Create new policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Create RLS Policies for in_app_notifications
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own in_app notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "Users can update own in_app notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "System can create in_app notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "Admins can manage all in_app notifications" ON public.in_app_notifications;

-- Create new policies
CREATE POLICY "Users can view own in_app notifications" ON public.in_app_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own in_app notifications" ON public.in_app_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create in_app notifications" ON public.in_app_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all in_app notifications" ON public.in_app_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 8. Create RLS Policies for admin_users
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create new policies
CREATE POLICY "Super admins can view all admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 9. Insert default admin users
-- =====================================================
INSERT INTO public.admin_users (user_id, email, role, permissions) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'bhntshwcjc025@student.wethinkcode.co.za', 'super_admin', '{"all": true, "manage_users": true, "manage_institutions": true, "manage_applications": true, "system_admin": true}'),
  ('00000000-0000-0000-0000-000000000002', 'admin@apply4me.co.za', 'admin', '{"manage_institutions": true, "manage_applications": true, "view_analytics": true}'),
  ('00000000-0000-0000-0000-000000000003', 'bhekumusa@apply4me.co.za', 'admin', '{"manage_institutions": true, "manage_applications": true, "view_analytics": true}')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- 10. Create helpful functions
-- =====================================================
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.admin_users 
  WHERE email = user_email;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create notification triggers
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON public.notifications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_in_app_notifications_updated_at 
  BEFORE UPDATE ON public.in_app_notifications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON public.admin_users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- The following tables have been created:
-- 1. notifications - For general user notifications
-- 2. in_app_notifications - For in-app notification system
-- 3. admin_users - For admin user management
--
-- Features enabled:
-- - Row Level Security (RLS) on all tables
-- - Performance indexes
-- - Automatic timestamp updates
-- - Default admin users inserted
-- - Helper functions for admin checks
-- =====================================================
