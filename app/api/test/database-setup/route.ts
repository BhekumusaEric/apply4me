import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { areTestRoutesEnabled, sanitizeError, prodLog } from '@/lib/production-utils'

export async function GET(request: NextRequest) {
  // Check if test routes are enabled
  if (!areTestRoutesEnabled()) {
    return NextResponse.json(
      {
        error: 'Test routes disabled in production',
        message: 'This endpoint is disabled in production for security reasons.'
      },
      { status: 404 }
    )
  }

  try {
    prodLog.info('🔍 Testing database setup...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const testResults = {
      timestamp: new Date().toISOString(),
      tables: [] as any[],
      summary: {
        total: 0,
        exists: 0,
        missing: 0,
        status: 'UNKNOWN'
      }
    }

    // Test tables to check
    const tablesToTest = [
      'notifications',
      'in_app_notifications',
      'admin_users'
    ]

    // Test each table
    for (const tableName of tablesToTest) {
      try {
        console.log(`📊 Testing table: ${tableName}`)

        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1)

        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist
            testResults.tables.push({
              name: tableName,
              exists: false,
              status: 'MISSING',
              error: 'Table does not exist'
            })
            console.log(`❌ Table ${tableName}: MISSING`)
          } else {
            // Other error
            testResults.tables.push({
              name: tableName,
              exists: false,
              status: 'ERROR',
              error: error.message
            })
            console.log(`⚠️ Table ${tableName}: ERROR - ${error.message}`)
          }
        } else {
          // Table exists
          testResults.tables.push({
            name: tableName,
            exists: true,
            status: 'EXISTS',
            message: 'Table is accessible'
          })
          console.log(`✅ Table ${tableName}: EXISTS`)
        }
      } catch (err) {
        testResults.tables.push({
          name: tableName,
          exists: false,
          status: 'ERROR',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
        console.log(`❌ Table ${tableName}: ERROR - ${err}`)
      }
    }

    // Test admin users specifically
    try {
      console.log('👤 Testing admin users data...')
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('email, role')
        .limit(10)

      if (!adminError && adminUsers) {
        testResults.tables.push({
          name: 'admin_users_data',
          exists: true,
          status: 'DATA_EXISTS',
          message: `Found ${adminUsers.length} admin users`,
          data: adminUsers
        })
        console.log(`✅ Admin users data: Found ${adminUsers.length} users`)
      }
    } catch (err) {
      console.log('⚠️ Could not test admin users data')
    }

    // Calculate summary
    testResults.summary.total = tablesToTest.length
    testResults.summary.exists = testResults.tables.filter(t => t.exists).length
    testResults.summary.missing = testResults.tables.filter(t => !t.exists).length

    if (testResults.summary.missing === 0) {
      testResults.summary.status = 'ALL_TABLES_EXIST'
    } else if (testResults.summary.exists > 0) {
      testResults.summary.status = 'PARTIAL_SETUP'
    } else {
      testResults.summary.status = 'NO_TABLES_EXIST'
    }

    console.log('🎉 DATABASE SETUP TEST COMPLETED')
    console.log(`📊 Results: ${testResults.summary.exists}/${testResults.summary.total} tables exist`)
    console.log(`🎯 Status: ${testResults.summary.status}`)

    return NextResponse.json({
      success: true,
      message: 'Database setup test completed',
      results: testResults,
      instructions: testResults.summary.status === 'ALL_TABLES_EXIST'
        ? [
            '✅ All tables exist! Database setup is complete.',
            '🚀 You can now enable production authentication.',
            '🔧 Set REQUIRE_AUTH=true in your environment variables.',
            '📱 Test the admin interface at /admin/test-users'
          ]
        : [
            '⚠️ Some tables are missing. Please run the SQL setup script.',
            '📋 Go to your Supabase dashboard > SQL Editor',
            '📄 Copy the SQL from /database/setup-admin-system.sql',
            '▶️ Paste and run the script in SQL Editor',
            '🔄 Refresh this test to verify setup'
          ]
    })

  } catch (error) {
    console.error('❌ Database setup test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      instructions: [
        '❌ Database connection failed.',
        '🔧 Check your Supabase configuration in .env.local',
        '🌐 Verify your Supabase project is running',
        '🔑 Ensure your API keys are correct'
      ]
    }, { status: 500 })
  }
}
