/**
 * Test API endpoint to check what data is actually in the database
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch institutions
    const { data: institutions, error: institutionsError } = await supabase
      .from('institutions')
      .select('*')
      .limit(5)

    if (institutionsError) {
      console.error('Institutions error:', institutionsError)
    }

    // Fetch bursaries
    const { data: bursaries, error: bursariesError } = await supabase
      .from('bursaries')
      .select('*')
      .limit(5)

    if (bursariesError) {
      console.error('Bursaries error:', bursariesError)
    }

    return NextResponse.json({
      success: true,
      data: {
        institutions: institutions || [],
        bursaries: bursaries || [],
        institutionsError: institutionsError?.message,
        bursariesError: bursariesError?.message
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test data error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
