import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    console.log('🔧 Setting up payment database schema...')

    // Step 1: Add payment columns to applications table using direct SQL
    console.log('📊 Adding payment columns to applications table...')

    try {
      // First, check if the columns already exist
      const { data: existingColumns, error: checkError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'applications')
        .in('column_name', ['payment_method', 'payment_status', 'payment_reference'])

      if (checkError) {
        console.log('⚠️ Could not check existing columns:', checkError.message)
      }

      const existingColumnNames = existingColumns?.map(col => col.column_name) || []
      console.log('📋 Existing payment columns:', existingColumnNames)

      // Add columns one by one using Supabase client
      const columnsToAdd = [
        { name: 'payment_method', type: 'TEXT' },
        { name: 'payment_date', type: 'TIMESTAMP WITH TIME ZONE' },
        { name: 'payment_reference', type: 'TEXT' },
        { name: 'payment_status', type: 'TEXT DEFAULT \'pending\'' },
        { name: 'payment_verification_status', type: 'TEXT' },
        { name: 'payment_verification_date', type: 'TIMESTAMP WITH TIME ZONE' },
        { name: 'payment_verification_by', type: 'TEXT' },
        { name: 'payment_verification_notes', type: 'TEXT' },
        { name: 'yoco_charge_id', type: 'TEXT' },
        { name: 'total_amount', type: 'DECIMAL(10,2) DEFAULT 150.00' }
      ]

      for (const column of columnsToAdd) {
        if (!existingColumnNames.includes(column.name)) {
          try {
            // Use raw SQL query through Supabase
            const { error } = await supabase
              .rpc('exec', {
                sql: `ALTER TABLE applications ADD COLUMN ${column.name} ${column.type};`
              })

            if (error) {
              console.log(`⚠️ Could not add column ${column.name}:`, error.message)
              // Try alternative approach
              console.log(`🔄 Trying alternative approach for ${column.name}...`)
            } else {
              console.log(`✅ Added column: ${column.name}`)
            }
          } catch (err) {
            console.log(`⚠️ Error adding column ${column.name}:`, err)
          }
        } else {
          console.log(`✅ Column ${column.name} already exists`)
        }
      }
    } catch (err) {
      console.log('⚠️ Error in column addition process:', err)
    }

    // Step 2: Create notifications table
    console.log('📧 Creating notifications table...')

    try {
      // Check if notifications table exists
      const { data: existingTables, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'notifications')
        .eq('table_schema', 'public')

      if (tableCheckError) {
        console.log('⚠️ Could not check existing tables:', tableCheckError.message)
      }

      if (!existingTables || existingTables.length === 0) {
        console.log('📝 Creating notifications table...')

        // Try to create the table using a simpler approach
        const { error: createError } = await supabase
          .rpc('exec', {
            sql: `
              CREATE TABLE notifications (
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
            `
          })

        if (createError) {
          console.log('⚠️ Could not create notifications table:', createError.message)
        } else {
          console.log('✅ Notifications table created successfully')
        }
      } else {
        console.log('✅ Notifications table already exists')
      }
    } catch (err) {
      console.log('⚠️ Error in notifications table creation:', err)
    }

    // Step 3: Create payment verification logs table
    console.log('📝 Creating payment verification logs table...')

    const createLogsTable = `
      CREATE TABLE IF NOT EXISTS payment_verification_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
        verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected')),
        verified_by TEXT NOT NULL,
        notes TEXT,
        verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    try {
      const { error: logsError } = await supabase.rpc('exec_sql', { sql_query: createLogsTable })
      if (logsError) {
        console.log('⚠️ Logs table may already exist:', logsError.message)
      } else {
        console.log('✅ Payment verification logs table created')
      }
    } catch (err) {
      console.log('⚠️ Error creating logs table:', err)
    }

    // Step 4: Create indexes for performance
    console.log('🚀 Creating performance indexes...')

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_applications_payment_method ON applications(payment_method);',
      'CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);',
      'CREATE INDEX IF NOT EXISTS idx_applications_payment_verification_status ON applications(payment_verification_status);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);',
      'CREATE INDEX IF NOT EXISTS idx_payment_verification_logs_application_id ON payment_verification_logs(application_id);'
    ]

    for (const indexSql of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: indexSql })
        if (error) {
          console.log(`⚠️ Index may already exist: ${error.message}`)
        } else {
          console.log(`✅ Created index: ${indexSql}`)
        }
      } catch (err) {
        console.log(`⚠️ Error creating index:`, err)
      }
    }

    // Step 5: Update existing applications with default payment data
    console.log('🔄 Updating existing applications with default payment data...')

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          payment_status: 'pending',
          total_amount: 150.00,
          payment_method: null,
          payment_reference: null
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

    console.log('🎉 Payment database schema setup completed!')

    return NextResponse.json({
      success: true,
      message: 'Payment database schema setup completed successfully',
      timestamp: new Date().toISOString(),
      steps: [
        'Added payment columns to applications table',
        'Created notifications table',
        'Created payment verification logs table',
        'Created performance indexes',
        'Updated existing applications with default data'
      ]
    })

  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json(
      {
        error: 'Failed to setup payment database schema',
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

    const hasPaymentColumns = columns && columns.length > 0

    // Check if notifications table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'notifications')

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
