/**
 * Bursaries API endpoint
 * Provides bursaries data for frontend consumption
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('bursaries')
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: false })

    if (error) {
      console.error('Bursaries API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bursaries', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Bursaries API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
