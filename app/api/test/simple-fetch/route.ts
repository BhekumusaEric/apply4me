import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Handle static generation - use defaults when URL is not available
    let searchParams: URLSearchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch {
      // During static generation, create empty search params
      searchParams = new URLSearchParams()
    }
    const userId = searchParams.get('userId') || 'df70993e-739e-4190-b78d-93a9e1002bf7'
    
    console.log('🔍 Simple fetch test for user:', userId)
    
    const supabase = createServerSupabaseAdminClient()
    
    // Simple query with timeout
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Fetch error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch notifications',
        details: error.message
      }, { status: 500 })
    }
    
    console.log(`✅ Found ${data?.length || 0} notifications`)
    
    return NextResponse.json({
      success: true,
      notifications: data || [],
      count: data?.length || 0,
      userId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Simple fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Simple fetch failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
