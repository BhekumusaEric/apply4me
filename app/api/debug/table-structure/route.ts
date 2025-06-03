import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking table structure...')
    
    const adminSupabase = createServerSupabaseAdminClient()
    
    // Try to get table information
    const { data, error } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .limit(0) // Get no rows, just structure
    
    if (error) {
      console.error('❌ Table query failed:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Table query failed',
        details: error,
        timestamp: new Date().toISOString()
      })
    }
    
    // Try to insert a minimal record to see what columns are required
    const testUserId = '00000000-0000-0000-0000-000000000000' // Dummy UUID
    
    const { data: insertData, error: insertError } = await adminSupabase
      .from('student_profiles')
      .insert({
        user_id: testUserId
      })
      .select()
    
    // Delete the test record if it was created
    if (insertData) {
      await adminSupabase
        .from('student_profiles')
        .delete()
        .eq('user_id', testUserId)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Table structure check completed',
      results: {
        selectQuery: {
          success: !error,
          error: (error as any)?.message
        },
        insertTest: {
          success: !insertError,
          error: (insertError as any)?.message,
          details: insertError
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Table structure check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Table structure check failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
