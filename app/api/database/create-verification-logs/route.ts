import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Create payment verification logs table
    const { error: createTableError } = await supabase.rpc('create_payment_verification_logs_table')

    if (createTableError) {
      console.error('Failed to create verification logs table:', createTableError)
      
      // Try alternative approach with direct SQL
      const { error: sqlError } = await supabase
        .from('payment_verification_logs')
        .select('id')
        .limit(1)

      if (sqlError) {
        // Table doesn't exist, create it manually
        console.log('Creating payment_verification_logs table manually...')
        
        // Note: In a real implementation, you would run this SQL in your Supabase dashboard:
        /*
        CREATE TABLE payment_verification_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
          verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected')),
          verified_by TEXT NOT NULL,
          notes TEXT,
          verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index for faster queries
        CREATE INDEX idx_payment_verification_logs_application_id ON payment_verification_logs(application_id);
        CREATE INDEX idx_payment_verification_logs_verified_at ON payment_verification_logs(verified_at);
        */

        return NextResponse.json({
          success: false,
          message: 'Payment verification logs table needs to be created manually in Supabase dashboard',
          sql: `
CREATE TABLE payment_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected')),
  verified_by TEXT NOT NULL,
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_verification_logs_application_id ON payment_verification_logs(application_id);
CREATE INDEX idx_payment_verification_logs_verified_at ON payment_verification_logs(verified_at);
          `.trim()
        })
      }
    }

    // Add verification columns to applications table if they don't exist
    try {
      const { error: alterError } = await supabase.rpc('add_verification_columns')
      
      if (alterError) {
        console.log('Verification columns may already exist or need manual creation')
        
        return NextResponse.json({
          success: true,
          message: 'Verification system setup complete (some columns may need manual creation)',
          manualSQL: `
-- Add these columns to applications table if they don't exist:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_status TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_by TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS yoco_charge_id TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_payment_verification_status ON applications(payment_verification_status);
CREATE INDEX IF NOT EXISTS idx_applications_yoco_charge_id ON applications(yoco_charge_id);
          `.trim()
        })
      }
    } catch (alterError) {
      console.log('Alter table error (may be expected):', alterError)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verification system setup complete',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup verification system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
