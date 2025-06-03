import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Apply4Me Admin System...')

    // Handle static generation - use default URL when not available
    let baseUrl: string
    try {
      baseUrl = request.nextUrl.origin
    } catch {
      // During static generation, use a default URL
      baseUrl = 'http://localhost:3000'
    }
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        status: 'UNKNOWN'
      }
    }

    // Test 1: Admin Users API - GET
    try {
      console.log('📊 Test 1: Admin Users API - GET')
      const response = await fetch(`${baseUrl}/api/admin/users`)
      const data = await response.json()
      
      const test1 = {
        name: 'Admin Users API - GET',
        status: response.ok ? 'PASSED' : 'FAILED',
        statusCode: response.status,
        data: response.ok ? 'Admin users retrieved successfully' : data.error,
        details: response.ok ? `Found ${data.adminUsers?.length || 0} admin users` : data
      }
      testResults.tests.push(test1)
      console.log(`${test1.status === 'PASSED' ? '✅' : '❌'} ${test1.name}: ${test1.details}`)
    } catch (error) {
      const test1 = {
        name: 'Admin Users API - GET',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      testResults.tests.push(test1)
      console.log(`❌ ${test1.name}: ${test1.error}`)
    }

    // Test 2: Admin Users API - POST (Add User)
    try {
      console.log('📊 Test 2: Admin Users API - POST')
      const testUser = {
        email: `test-${Date.now()}@apply4me.co.za`,
        role: 'admin',
        permissions: { test: true }
      }
      
      const response = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      })
      const data = await response.json()
      
      const test2 = {
        name: 'Admin Users API - POST',
        status: response.ok ? 'PASSED' : 'FAILED',
        statusCode: response.status,
        data: response.ok ? 'Admin user added successfully' : data.error,
        details: response.ok ? `Added user: ${testUser.email}` : data
      }
      testResults.tests.push(test2)
      console.log(`${test2.status === 'PASSED' ? '✅' : '❌'} ${test2.name}: ${test2.details}`)
    } catch (error) {
      const test2 = {
        name: 'Admin Users API - POST',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      testResults.tests.push(test2)
      console.log(`❌ ${test2.name}: ${test2.error}`)
    }

    // Test 3: Database Initialization
    try {
      console.log('📊 Test 3: Database Initialization')
      const response = await fetch(`${baseUrl}/api/database/init-notifications`)
      const data = await response.json()
      
      const test3 = {
        name: 'Database Initialization',
        status: response.ok ? 'PASSED' : 'FAILED',
        statusCode: response.status,
        data: response.ok ? 'Database initialization endpoint working' : data.error,
        details: response.ok ? 'SQL scripts provided for manual setup' : data
      }
      testResults.tests.push(test3)
      console.log(`${test3.status === 'PASSED' ? '✅' : '❌'} ${test3.name}: ${test3.details}`)
    } catch (error) {
      const test3 = {
        name: 'Database Initialization',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      testResults.tests.push(test3)
      console.log(`❌ ${test3.name}: ${test3.error}`)
    }

    // Test 4: Admin Test Interface Accessibility
    try {
      console.log('📊 Test 4: Admin Test Interface')
      const response = await fetch(`${baseUrl}/admin/test-users`)
      
      const test4 = {
        name: 'Admin Test Interface',
        status: response.ok ? 'PASSED' : 'FAILED',
        statusCode: response.status,
        data: response.ok ? 'Admin test interface accessible' : 'Interface not accessible',
        details: response.ok ? 'Test interface available at /admin/test-users' : `Status: ${response.status}`
      }
      testResults.tests.push(test4)
      console.log(`${test4.status === 'PASSED' ? '✅' : '❌'} ${test4.name}: ${test4.details}`)
    } catch (error) {
      const test4 = {
        name: 'Admin Test Interface',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      testResults.tests.push(test4)
      console.log(`❌ ${test4.name}: ${test4.error}`)
    }

    // Calculate summary
    testResults.summary.total = testResults.tests.length
    testResults.summary.passed = testResults.tests.filter(t => t.status === 'PASSED').length
    testResults.summary.failed = testResults.tests.filter(t => t.status === 'FAILED').length
    
    if (testResults.summary.failed === 0) {
      testResults.summary.status = 'ALL TESTS PASSED'
    } else if (testResults.summary.passed > 0) {
      testResults.summary.status = 'SOME TESTS FAILED'
    } else {
      testResults.summary.status = 'ALL TESTS FAILED'
    }

    console.log('🎉 ADMIN SYSTEM TEST COMPLETED')
    console.log(`📊 Test Results: ${testResults.summary.passed}/${testResults.summary.total} passed`)
    console.log(`🎯 Overall Status: ${testResults.summary.status}`)

    return NextResponse.json({
      success: true,
      message: 'Admin system test completed',
      results: testResults,
      recommendations: [
        testResults.summary.failed === 0 
          ? 'All tests passed! Admin system is ready for production.'
          : 'Some tests failed. Check the details and fix issues before production.',
        'Run the SQL script in Supabase to set up database tables.',
        'Set REQUIRE_AUTH=true for production deployment.',
        'Integrate admin user management into main admin dashboard.'
      ]
    })

  } catch (error) {
    console.error('❌ Admin system test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin system test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
