import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🔧 Manual database setup - Adding payment columns...')

    // Step 1: Add payment columns to applications table manually
    const columnsToAdd = [
      'payment_method',
      'payment_date', 
      'payment_reference',
      'payment_status',
      'payment_verification_status',
      'payment_verification_date',
      'payment_verification_by',
      'payment_verification_notes',
      'yoco_charge_id',
      'total_amount'
    ]

    // Check which columns already exist
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'applications')
      .in('column_name', columnsToAdd)

    if (checkError) {
      console.log('⚠️ Could not check existing columns:', checkError.message)
    }

    const existingColumnNames = existingColumns?.map(col => col.column_name) || []
    console.log('📋 Existing payment columns:', existingColumnNames)

    const missingColumns = columnsToAdd.filter(col => !existingColumnNames.includes(col))
    console.log('📋 Missing columns:', missingColumns)

    if (missingColumns.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Database schema needs to be updated manually in Supabase dashboard',
        missingColumns,
        sqlCommands: [
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
          '-- Create indexes',
          'CREATE INDEX IF NOT EXISTS idx_applications_payment_method ON applications(payment_method);',
          'CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);',
          'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);',
          'CREATE INDEX IF NOT EXISTS idx_payment_verification_logs_application_id ON payment_verification_logs(application_id);'
        ],
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and paste the SQL commands above',
          '4. Execute them one by one or all at once',
          '5. Refresh this page to verify the setup'
        ]
      })
    }

    // If all columns exist, check for notifications table
    const { data: notificationTable, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'notifications')
      .eq('table_schema', 'public')

    const hasNotificationsTable = notificationTable && notificationTable.length > 0

    // Update existing applications with default payment data
    if (existingColumnNames.includes('payment_status')) {
      try {
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            payment_status: 'pending',
            total_amount: 150.00
          })
          .is('payment_status', null)

        if (updateError) {
          console.log('⚠️ Error updating existing applications:', updateError.message)
        } else {
          console.log('✅ Updated existing applications with default payment data')
        }
      } catch (err) {
        console.log('⚠️ Error updating applications:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema check completed',
      status: {
        payment_columns_exist: missingColumns.length === 0,
        notifications_table_exists: hasNotificationsTable,
        existing_columns: existingColumnNames,
        missing_columns: missingColumns
      },
      ready_for_payments: missingColumns.length === 0 && hasNotificationsTable,
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

// GET endpoint to check schema status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if payment columns exist
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'applications')
      .in('column_name', ['payment_method', 'payment_status', 'payment_reference'])

    const hasPaymentColumns = columns && columns.length >= 3

    // Check if notifications table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'notifications')
      .eq('table_schema', 'public')

    const hasNotificationsTable = tables && tables.length > 0

    return NextResponse.json({
      success: true,
      schema_status: {
        payment_columns_exist: hasPaymentColumns,
        notifications_table_exists: hasNotificationsTable,
        columns_found: columns?.map(c => c.column_name) || [],
        ready_for_payments: hasPaymentColumns && hasNotificationsTable
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check schema status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
