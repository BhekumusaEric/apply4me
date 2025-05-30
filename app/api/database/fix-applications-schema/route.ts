import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * Fix Applications Table Schema
 * This endpoint adds missing columns to the applications table
 */
export async function POST() {
  try {
    const supabase = createClient()

    console.log('🔧 Fixing applications table schema...')

    // Check current table structure first
    const { data: currentData, error: checkError } = await supabase
      .from('applications')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking applications table:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Cannot access applications table',
        details: checkError.message,
        sqlScript: getFixSQL()
      }, { status: 500 })
    }

    // The table exists, but we need to add missing columns
    // Since we can't execute DDL directly, provide the SQL script
    return NextResponse.json({
      success: false,
      message: 'Applications table needs schema updates. Please run the provided SQL script.',
      instructions: 'Copy and paste the SQL script into your Supabase SQL Editor and run it.',
      sqlScript: getFixSQL(),
      steps: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the provided SQL script',
        '4. Click "Run" to execute the script',
        '5. Restart your application server'
      ]
    })

  } catch (error) {
    console.error('❌ Schema fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix applications schema',
      details: error instanceof Error ? error.message : 'Unknown error',
      sqlScript: getFixSQL()
    }, { status: 500 })
  }
}

/**
 * Check applications table schema status
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Test if the problematic columns exist
    const { data, error } = await supabase
      .from('applications')
      .select('id, payment_method, payment_verification_status, yoco_charge_id')
      .limit(1)

    if (error) {
      if (error.message.includes('payment_method') || error.message.includes('column') || error.code === '42703') {
        return NextResponse.json({
          success: false,
          status: 'missing_columns',
          message: 'Applications table is missing required columns',
          missingColumns: ['payment_method', 'payment_verification_status', 'payment_verification_date', 'payment_verification_by', 'payment_verification_notes', 'yoco_charge_id'],
          fixUrl: '/api/database/fix-applications-schema'
        })
      }

      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Database error',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status: 'ready',
      message: 'Applications table schema is correct',
      columnsPresent: true
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to check applications schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getFixSQL(): string {
  return `
-- Fix Applications Table Schema
-- Run this SQL in your Supabase SQL Editor

-- Add missing columns to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_verification_status TEXT CHECK (payment_verification_status IN ('pending_verification', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS payment_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_verification_by TEXT,
ADD COLUMN IF NOT EXISTS payment_verification_notes TEXT,
ADD COLUMN IF NOT EXISTS yoco_charge_id TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Update payment_status check constraint to include new values
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_payment_status_check;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'pending_verification', 'completed'));

-- Update status check constraint to include new values  
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('draft', 'submitted', 'processing', 'completed', 'rejected', 'payment_failed', 'payment_pending'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_payment_method ON public.applications(payment_method);
CREATE INDEX IF NOT EXISTS idx_applications_payment_verification_status ON public.applications(payment_verification_status);
CREATE INDEX IF NOT EXISTS idx_applications_yoco_charge_id ON public.applications(yoco_charge_id);
CREATE INDEX IF NOT EXISTS idx_applications_payment_reference ON public.applications(payment_reference);

-- Create payment verification logs table
CREATE TABLE IF NOT EXISTS public.payment_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected')),
  verified_by TEXT NOT NULL,
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment verification logs
CREATE INDEX IF NOT EXISTS idx_payment_verification_logs_application_id ON public.payment_verification_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_payment_verification_logs_verified_at ON public.payment_verification_logs(verified_at);

-- Enable RLS for payment verification logs
ALTER TABLE public.payment_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment verification logs
CREATE POLICY "Admins can view all verification logs" ON public.payment_verification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can create verification logs" ON public.payment_verification_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Update some existing applications to have default payment_verification_status
UPDATE public.applications 
SET payment_verification_status = 'pending_verification' 
WHERE payment_status = 'pending' 
AND payment_verification_status IS NULL;

-- Insert a test record to verify the schema works
INSERT INTO public.applications (
  user_id,
  institution_id, 
  personal_info,
  academic_info,
  service_type,
  total_amount,
  status,
  payment_status,
  payment_method,
  payment_verification_status
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  (SELECT id FROM public.institutions LIMIT 1),
  '{"firstName": "Test", "lastName": "User", "email": "test@example.com"}',
  '{"grade12": "passed"}',
  'standard',
  150.00,
  'draft',
  'pending_verification',
  'card',
  'pending_verification'
) ON CONFLICT DO NOTHING;

-- Clean up test record
DELETE FROM public.applications 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Verify the schema is working
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND table_schema = 'public'
AND column_name IN ('payment_method', 'payment_verification_status', 'yoco_charge_id')
ORDER BY column_name;
  `.trim()
}
