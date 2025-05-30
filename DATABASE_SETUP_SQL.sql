-- Apply4Me Database Setup SQL Commands
-- Run these commands in your Supabase SQL Editor to set up the payment verification system

-- Step 1: Add payment columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_status TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_by TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS yoco_charge_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 150.00;

-- Step 2: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create payment verification logs table
CREATE TABLE IF NOT EXISTS payment_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_payment_method ON applications(payment_method);
CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_verification_logs_application_id ON payment_verification_logs(application_id);

-- Step 5: Update existing applications with default payment data
UPDATE applications 
SET 
  payment_status = 'pending',
  total_amount = 150.00
WHERE payment_status IS NULL;

-- Verification queries (run these to check if setup worked)
-- Check if payment columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name LIKE 'payment%';

-- Check if notifications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check if payment verification logs table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'payment_verification_logs';

-- Check sample data
SELECT id, payment_status, total_amount 
FROM applications 
LIMIT 5;
