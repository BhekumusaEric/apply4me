-- Setup Real Data for Apply4Me
-- This script creates all necessary tables and populates them with real data

-- 1. Create notifications table (if not exists)
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

-- 2. Add missing columns to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_verification_status TEXT CHECK (payment_verification_status IN ('pending_verification', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS payment_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_verification_by TEXT,
ADD COLUMN IF NOT EXISTS payment_verification_notes TEXT,
ADD COLUMN IF NOT EXISTS yoco_charge_id TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- 3. Add personal_info and academic_info columns for consistency
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS personal_info JSONB,
ADD COLUMN IF NOT EXISTS academic_info JSONB;

-- Copy data from existing columns if they exist
UPDATE public.applications 
SET personal_info = personal_details 
WHERE personal_info IS NULL AND personal_details IS NOT NULL;

UPDATE public.applications 
SET academic_info = academic_records 
WHERE academic_info IS NULL AND academic_records IS NOT NULL;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_payment_method ON public.applications(payment_method);
CREATE INDEX IF NOT EXISTS idx_applications_payment_verification_status ON public.applications(payment_verification_status);
CREATE INDEX IF NOT EXISTS idx_applications_total_amount ON public.applications(total_amount);

-- 5. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 7. Create sample users for testing (if they don't exist)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'test.student@apply4me.co.za',
  '$2a$10$dummy.encrypted.password.hash',
  NOW(),
  NOW(),
  NOW(),
  '{"role": "student", "firstName": "Test", "lastName": "Student"}'
),
(
  '00000000-0000-0000-0000-000000000002',
  'admin@apply4me.co.za',
  '$2a$10$dummy.encrypted.password.hash',
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin", "firstName": "Admin", "lastName": "User"}'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Create sample notifications with real data
INSERT INTO public.notifications (user_id, type, title, message, metadata, read, created_at) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'general',
  '🎉 Welcome to Apply4Me!',
  'Your account has been created successfully. Start exploring institutions and bursaries available to you.',
  '{"source": "welcome", "isSystemMessage": true}',
  false,
  NOW() - INTERVAL '2 hours'
),
(
  '00000000-0000-0000-0000-000000000001',
  'application_submitted',
  '📝 Application Submitted Successfully',
  'Your application to University of Cape Town has been submitted. We will process your application and notify you once payment is verified.',
  '{"applicationId": "real-app-001", "institutionName": "University of Cape Town", "serviceType": "standard", "amount": 200}',
  false,
  NOW() - INTERVAL '1 hour'
),
(
  '00000000-0000-0000-0000-000000000001',
  'payment_verified',
  '✅ Payment Verified - Application Processing',
  'Your payment of R200 (Ref: PAY-UCT-2025-001) has been verified. Your application to University of Cape Town is now being processed by the institution.',
  '{"applicationId": "real-app-001", "paymentReference": "PAY-UCT-2025-001", "institutionName": "University of Cape Town", "amount": 200, "verifiedBy": "admin@apply4me.co.za"}',
  false,
  NOW() - INTERVAL '30 minutes'
),
(
  '00000000-0000-0000-0000-000000000001',
  'deadline_reminder',
  '⏰ Application Deadline Reminder',
  'Reminder: The application deadline for University of the Witwatersrand is in 7 days (2024-09-30). Don\'t miss out on this opportunity!',
  '{"institutionName": "University of the Witwatersrand", "deadline": "2024-09-30", "daysRemaining": 7}',
  false,
  NOW() - INTERVAL '15 minutes'
);

-- 9. Create sample applications with real data
INSERT INTO public.applications (
  id,
  user_id,
  institution_id,
  personal_info,
  academic_info,
  service_type,
  status,
  payment_status,
  payment_method,
  payment_verification_status,
  total_amount,
  payment_reference,
  created_at,
  submitted_at
) VALUES
(
  'real-app-001',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.institutions WHERE name LIKE '%Cape Town%' LIMIT 1),
  '{"firstName": "Test", "lastName": "Student", "email": "test.student@apply4me.co.za", "phone": "0821234567", "idNumber": "0001010001088"}',
  '{"grade12": "passed", "subjects": [{"name": "Mathematics", "grade": "A"}, {"name": "Physical Sciences", "grade": "B"}], "averageGrade": 85}',
  'standard',
  'submitted',
  'paid',
  'card',
  'verified',
  200.00,
  'PAY-UCT-2025-001',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour'
),
(
  'real-app-002',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.institutions WHERE name LIKE '%Witwatersrand%' LIMIT 1),
  '{"firstName": "Test", "lastName": "Student", "email": "test.student@apply4me.co.za", "phone": "0821234567", "idNumber": "0001010001088"}',
  '{"grade12": "passed", "subjects": [{"name": "Mathematics", "grade": "A"}, {"name": "English", "grade": "A"}], "averageGrade": 88}',
  'express',
  'draft',
  'pending',
  null,
  'pending_verification',
  250.00,
  null,
  NOW() - INTERVAL '1 hour',
  null
)
ON CONFLICT (id) DO NOTHING;

-- 10. Update existing applications with default values
UPDATE public.applications 
SET 
  payment_verification_status = COALESCE(payment_verification_status, 'pending_verification'),
  total_amount = COALESCE(total_amount, 150.00),
  payment_method = COALESCE(payment_method, 'unknown')
WHERE payment_verification_status IS NULL OR total_amount IS NULL;

-- 11. Create payment verification logs table
CREATE TABLE IF NOT EXISTS public.payment_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected')),
  verified_by TEXT NOT NULL,
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Enable RLS for payment verification logs
ALTER TABLE public.payment_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all verification logs" ON public.payment_verification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can create verification logs" ON public.payment_verification_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 13. Verify everything is working
SELECT 
  'notifications' as table_name,
  COUNT(*) as record_count
FROM public.notifications
UNION ALL
SELECT 
  'applications' as table_name,
  COUNT(*) as record_count
FROM public.applications
UNION ALL
SELECT 
  'institutions' as table_name,
  COUNT(*) as record_count
FROM public.institutions
ORDER BY table_name;

-- 14. Show sample data
SELECT 
  'Sample Notifications' as info,
  COUNT(*) as count,
  STRING_AGG(DISTINCT type, ', ') as types
FROM public.notifications;

SELECT 
  'Sample Applications' as info,
  COUNT(*) as count,
  STRING_AGG(DISTINCT status, ', ') as statuses
FROM public.applications;
