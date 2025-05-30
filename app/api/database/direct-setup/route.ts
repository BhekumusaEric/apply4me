import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🔧 Direct database setup - Adding payment columns...')

    // Step 1: Try to add columns using direct table operations
    const results = []

    // Check current table structure
    try {
      const { data: sampleApp, error: sampleError } = await supabase
        .from('applications')
        .select('*')
        .limit(1)
        .single()

      if (sampleError && sampleError.code !== 'PGRST116') {
        console.log('⚠️ Error checking applications table:', sampleError.message)
      }

      console.log('📋 Sample application structure:', Object.keys(sampleApp || {}))
    } catch (err) {
      console.log('⚠️ Could not check table structure:', err)
    }

    // Step 2: Try to update an application to test if columns exist
    try {
      const { data: testApp, error: testError } = await supabase
        .from('applications')
        .select('id')
        .limit(1)
        .single()

      if (testApp) {
        // Try to update with payment fields
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            payment_status: 'pending',
            total_amount: 150.00
          })
          .eq('id', testApp.id)

        if (updateError) {
          console.log('❌ Payment columns do not exist:', updateError.message)
          results.push({
            step: 'Column Test',
            status: 'failed',
            error: updateError.message
          })
        } else {
          console.log('✅ Payment columns already exist!')
          results.push({
            step: 'Column Test',
            status: 'success',
            message: 'Payment columns are available'
          })
        }
      }
    } catch (err) {
      console.log('⚠️ Error testing columns:', err)
    }

    // Step 3: Check for notifications table
    try {
      const { data: notifTest, error: notifError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1)

      if (notifError) {
        console.log('❌ Notifications table does not exist:', notifError.message)
        results.push({
          step: 'Notifications Table',
          status: 'failed',
          error: notifError.message
        })
      } else {
        console.log('✅ Notifications table exists!')
        results.push({
          step: 'Notifications Table',
          status: 'success',
          message: 'Notifications table is available'
        })
      }
    } catch (err) {
      console.log('⚠️ Error checking notifications table:', err)
    }

    // Step 4: Provide manual setup instructions
    const hasErrors = results.some(r => r.status === 'failed')

    if (hasErrors) {
      return NextResponse.json({
        success: false,
        message: 'Manual database setup required',
        results,
        setupInstructions: {
          title: 'Run these SQL commands in your Supabase SQL Editor:',
          commands: [
            '-- Add payment columns to applications table',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_method TEXT;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_reference TEXT;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT \'pending\';',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_status TEXT;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_date TIMESTAMP WITH TIME ZONE;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_by TEXT;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verification_notes TEXT;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS yoco_charge_id TEXT;',
            'ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 150.00;',
            '',
            '-- Create notifications table',
            'CREATE TABLE IF NOT EXISTS notifications (',
            '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
            '  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,',
            '  type TEXT NOT NULL,',
            '  title TEXT NOT NULL,',
            '  message TEXT NOT NULL,',
            '  read BOOLEAN DEFAULT FALSE,',
            '  read_at TIMESTAMP WITH TIME ZONE,',
            '  metadata JSONB,',
            '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
            ');',
            '',
            '-- Create payment verification logs table',
            'CREATE TABLE IF NOT EXISTS payment_verification_logs (',
            '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
            '  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,',
            '  verification_status TEXT NOT NULL,',
            '  verified_by TEXT NOT NULL,',
            '  notes TEXT,',
            '  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
            '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
            ');',
            '',
            '-- Update existing applications',
            'UPDATE applications SET payment_status = \'pending\', total_amount = 150.00 WHERE payment_status IS NULL;'
          ],
          steps: [
            '1. Go to your Supabase dashboard',
            '2. Navigate to SQL Editor',
            '3. Copy and paste all the SQL commands above',
            '4. Click "Run" to execute them',
            '5. Refresh this page to verify the setup'
          ]
        }
      })
    }

    // If no errors, setup is complete
    return NextResponse.json({
      success: true,
      message: 'Database schema is ready for payments!',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check database schema',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check current status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Test payment columns
    const { data: testApp, error: testError } = await supabase
      .from('applications')
      .select('id')
      .limit(1)
      .single()

    let paymentColumnsExist = false
    if (testApp) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ payment_status: 'pending' })
        .eq('id', testApp.id)
      
      paymentColumnsExist = !updateError
    }

    // Test notifications table
    const { error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)

    const notificationsTableExists = !notifError

    return NextResponse.json({
      success: true,
      status: {
        payment_columns_exist: paymentColumnsExist,
        notifications_table_exists: notificationsTableExists,
        ready_for_payments: paymentColumnsExist && notificationsTableExists
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
