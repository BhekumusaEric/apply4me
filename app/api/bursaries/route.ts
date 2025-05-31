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

    // Get all bursaries and filter for unique ones
    const { data, error } = await supabase
      .from('bursaries')
      .select('*')
      .order('amount', { ascending: false })

    if (error) {
      console.error('Bursaries API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bursaries', details: error.message },
        { status: 500 }
      )
    }

    // Remove duplicates based on name and provider
    const uniqueBursaries = data?.filter((bursary, index, self) =>
      index === self.findIndex(b =>
        b.name === bursary.name && b.provider === bursary.provider
      )
    ) || []

    // Sort by amount (highest first) and limit to reasonable number
    const sortedBursaries = uniqueBursaries
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 20) // Show top 20 bursaries

    return NextResponse.json({
      success: true,
      data: sortedBursaries,
      count: sortedBursaries.length,
      total_in_database: data?.length || 0,
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
