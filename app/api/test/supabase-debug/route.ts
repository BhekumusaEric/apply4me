import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment variables:')
    console.log('- URL exists:', !!supabaseUrl)
    console.log('- Anon key exists:', !!supabaseAnonKey)
    console.log('- Service key exists:', !!supabaseServiceKey)
    console.log('- URL value:', supabaseUrl?.substring(0, 30) + '...')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: {
          url: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        }
      }, { status: 500 })
    }
    
    // Test 1: Try with service role key
    console.log('🧪 Test 1: Service role key...')
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    try {
      const { data: testData1, error: testError1 } = await adminClient
        .from('institutions')
        .select('id, name')
        .limit(1)
      
      console.log('Service role test result:', { data: testData1, error: testError1 })
      
      if (testError1) {
        console.error('Service role error:', testError1)
      }
    } catch (err) {
      console.error('Service role exception:', err)
    }
    
    // Test 2: Try with anon key
    console.log('🧪 Test 2: Anon key...')
    const anonClient = createClient(supabaseUrl, supabaseAnonKey!)
    
    try {
      const { data: testData2, error: testError2 } = await anonClient
        .from('institutions')
        .select('id, name')
        .limit(1)
      
      console.log('Anon key test result:', { data: testData2, error: testError2 })
      
      if (testError2) {
        console.error('Anon key error:', testError2)
      }
    } catch (err) {
      console.error('Anon key exception:', err)
    }
    
    // Test 3: Try a simple query
    console.log('🧪 Test 3: Simple query...')
    try {
      const { data: simpleData, error: simpleError } = await adminClient
        .from('institutions')
        .select('count')
        .limit(1)
      
      console.log('Simple query result:', { data: simpleData, error: simpleError })
    } catch (err) {
      console.error('Simple query exception:', err)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        url: supabaseUrl?.substring(0, 30) + '...',
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey,
        nodeEnv: process.env.NODE_ENV
      },
      message: 'Debug test completed - check server logs for details'
    })
    
  } catch (error) {
    console.error('🚨 Debug test failed:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
