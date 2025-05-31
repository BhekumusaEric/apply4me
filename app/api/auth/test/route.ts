import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientWithCookies } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing authentication...')

    // Create server-side Supabase client
    const supabase = createServerSupabaseClientWithCookies()

    // Test 1: Check if we can connect to Supabase
    console.log('📡 Testing Supabase connection...')

    // Test 2: Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔐 Auth test results:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    })

    // Test 3: Try to access the database
    console.log('🗄️ Testing database access...')

    try {
      const { data: tables, error: dbError } = await supabase
        .from('student_profiles')
        .select('id')
        .limit(1)

      console.log('📊 Database test results:', {
        hasData: !!tables,
        dataLength: tables?.length,
        dbError: dbError?.message
      })

      return NextResponse.json({
        success: true,
        auth: {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          authError: authError?.message
        },
        database: {
          hasData: !!tables,
          dataLength: tables?.length,
          dbError: dbError?.message
        },
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error('❌ Database test failed:', dbError)

      return NextResponse.json({
        success: false,
        auth: {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          authError: authError?.message
        },
        database: {
          error: 'Database connection failed',
          details: dbError
        },
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Auth test failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Authentication test failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
