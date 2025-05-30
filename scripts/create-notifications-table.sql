-- Create Notifications Table
-- Run this in your Supabase SQL Editor to enable real notifications

-- Create notifications table
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

-- Create some sample notifications for testing
INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'general',
  '🎉 Welcome to Apply4Me!',
  'Your account has been created successfully. Start exploring institutions and bursaries available to you.',
  '{"source": "welcome"}'
),
(
  '00000000-0000-0000-0000-000000000001',
  'application_submitted',
  '📝 Application Submitted',
  'Your application to University of Cape Town has been submitted successfully. We will notify you once payment is verified.',
  '{"applicationId": "app-123", "institutionName": "University of Cape Town", "serviceType": "standard"}'
),
(
  '00000000-0000-0000-0000-000000000001',
  'payment_verified',
  '✅ Payment Verified - Application Submitted!',
  'Your payment of R150 (Ref: PAY-123456) has been verified. Your application to University of Cape Town has been successfully submitted and is now being processed.',
  '{"applicationId": "app-123", "paymentReference": "PAY-123456", "institutionName": "University of Cape Town", "amount": 150}'
);

-- Verify the table was created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
