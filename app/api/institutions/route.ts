/**
 * Institutions API endpoint
 * Provides institutions data for frontend consumption
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseAdminClient()

    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Institutions API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch institutions', details: error.message },
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
    console.error('Institutions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
