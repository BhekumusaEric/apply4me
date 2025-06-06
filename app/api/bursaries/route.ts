/**
 * Bursaries API endpoint
 * Provides bursaries data for frontend consumption
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseAdminClient()

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
