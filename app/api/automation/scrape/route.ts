/**
 * API Endpoint for Manual Data Scraping
 * Allows admin to trigger scraping manually
 */

import { NextRequest, NextResponse } from 'next/server'
import { AutomationScheduler } from '@/lib/automation/scheduler'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (!type || !['institutions', 'bursaries', 'both'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid scraping type. Use: institutions, bursaries, or both' },
        { status: 400 }
      )
    }

    const scheduler = new AutomationScheduler()
    const results: any = {}

    console.log(`🚀 Manual scraping triggered: ${type}`)

    if (type === 'institutions' || type === 'both') {
      console.log('🏫 Starting institution discovery...')
      results.institutions = await scheduler.runInstitutionDiscovery()
    }

    if (type === 'bursaries' || type === 'both') {
      console.log('💰 Starting bursary discovery...')
      results.bursaries = await scheduler.runBursaryDiscovery()
    }

    return NextResponse.json({
      success: true,
      message: `Scraping completed for ${type}`,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Scraping API error:', error)
    return NextResponse.json(
      { 
        error: 'Scraping failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const scheduler = new AutomationScheduler()
    const stats = await scheduler.getAutomationStats()

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
