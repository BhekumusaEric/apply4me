/**
 * Database Population API
 * Comprehensive endpoint for testing and populating the database
 */

import { NextRequest, NextResponse } from 'next/server'
import { DatabasePopulationManager } from '@/lib/database/population-manager'

export async function POST(request: NextRequest) {
  let action = 'unknown'

  try {
    const requestData = await request.json()
    action = requestData.action

    if (!action || !['populate', 'test', 'stats', 'migrate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use: populate, test, stats, or migrate' },
        { status: 400 }
      )
    }

    const manager = new DatabasePopulationManager()
    console.log(`🚀 Database ${action} triggered...`)

    const result: any = {}

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

      case 'migrate':
        console.log('🔧 Running hierarchical application system migration...')
        result = await manager.runHierarchicalMigration()
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
