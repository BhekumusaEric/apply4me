/**
 * Database Population API
 * Comprehensive endpoint for testing and populating the database
 */

import { NextRequest, NextResponse } from 'next/server'
import { DatabasePopulationManager } from '@/lib/database/population-manager'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (!action || !['populate', 'test', 'stats'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use: populate, test, or stats' },
        { status: 400 }
      )
    }

    const manager = new DatabasePopulationManager()
    console.log(`🚀 Database ${action} triggered...`)

    let result: any = {}

    switch (action) {
      case 'populate':
        console.log('📊 Starting comprehensive database population...')
        result = await manager.populateDatabase()
        break

      case 'test':
        console.log('🔍 Testing database connectivity and structure...')
        result = await manager.testDatabase()
        break

      case 'stats':
        console.log('📈 Gathering database statistics...')
        result = await manager.getDatabaseStats()
        break
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`❌ Database ${action} error:`, error)
    return NextResponse.json(
      { 
        error: `Database ${action} failed`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const manager = new DatabasePopulationManager()
    
    // Get comprehensive database overview
    const [testResult, stats] = await Promise.all([
      manager.testDatabase(),
      manager.getDatabaseStats()
    ])

    return NextResponse.json({
      success: true,
      database: {
        connectivity: testResult,
        statistics: stats
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database overview error:', error)
    return NextResponse.json(
      { error: 'Failed to get database overview' },
      { status: 500 }
    )
  }
}
