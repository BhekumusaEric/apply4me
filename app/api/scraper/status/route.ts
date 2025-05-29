import { NextRequest, NextResponse } from 'next/server'
import { DeadlineManager } from '@/lib/services/deadline-manager'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting application status summary...')
    
    const deadlineManager = new DeadlineManager()
    
    // Get comprehensive status summary
    const summary = await deadlineManager.getApplicationStatusSummary()
    
    // Calculate additional metrics
    const totalInstitutions = summary.openInstitutions + summary.closedInstitutions
    const totalPrograms = summary.openPrograms + summary.closedPrograms
    const totalBursaries = summary.activeBursaries + summary.expiredBursaries
    
    const institutionOpenRate = totalInstitutions > 0 ? 
      Math.round((summary.openInstitutions / totalInstitutions) * 100) : 0
    
    const programAvailabilityRate = totalPrograms > 0 ? 
      Math.round((summary.openPrograms / totalPrograms) * 100) : 0
    
    const bursaryActiveRate = totalBursaries > 0 ? 
      Math.round((summary.activeBursaries / totalBursaries) * 100) : 0

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        institutions: {
          total: totalInstitutions,
          open: summary.openInstitutions,
          closed: summary.closedInstitutions,
          openRate: institutionOpenRate
        },
        programs: {
          total: totalPrograms,
          available: summary.openPrograms,
          unavailable: summary.closedPrograms,
          availabilityRate: programAvailabilityRate
        },
        bursaries: {
          total: totalBursaries,
          active: summary.activeBursaries,
          expired: summary.expiredBursaries,
          activeRate: bursaryActiveRate
        },
        deadlines: {
          upcoming: summary.upcomingDeadlines,
          urgentCount: 0, // Will be calculated separately if needed
          warningCount: 0
        }
      },
      insights: {
        applicationSeason: determineApplicationSeason(),
        recommendations: generateRecommendations(summary),
        alerts: generateAlerts(summary)
      },
      message: '📊 Application status summary retrieved successfully'
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error getting application status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get application status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    console.log(`🔧 Performing deadline management action: ${action}`)
    
    const deadlineManager = new DeadlineManager()
    let result: any = {}
    
    switch (action) {
      case 'mark_expired':
        result = await deadlineManager.markExpiredItemsInactive()
        result.message = `✅ Marked expired items as inactive: ${result.institutionsUpdated} institutions, ${result.programsUpdated} programs, ${result.bursariesUpdated} bursaries`
        break
        
      case 'check_deadlines':
        const summary = await deadlineManager.getApplicationStatusSummary()
        result = {
          upcomingDeadlines: summary.upcomingDeadlines,
          message: `📅 Found ${summary.upcomingDeadlines} upcoming deadlines`
        }
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }
    
    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Deadline management action failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Deadline management action failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Determine current application season
 */
function determineApplicationSeason(): string {
  const now = new Date()
  const month = now.getMonth() // 0-based

  if (month >= 2 && month <= 8) {
    return 'Main Application Period (March-September)'
  } else if (month >= 0 && month <= 3) {
    return 'Mid-Year Intake Period (January-April)'
  } else {
    return 'Pre-Application Period (October-December)'
  }
}

/**
 * Generate recommendations based on status
 */
function generateRecommendations(summary: any): string[] {
  const recommendations: string[] = []
  
  const totalInstitutions = summary.openInstitutions + summary.closedInstitutions
  const totalBursaries = summary.activeBursaries + summary.expiredBursaries
  
  if (summary.openInstitutions / totalInstitutions < 0.5) {
    recommendations.push('🏫 Many institutions have closed applications. Consider promoting mid-year intake options.')
  }
  
  if (summary.activeBursaries / totalBursaries < 0.3) {
    recommendations.push('💰 Low bursary availability. Update bursary database with new opportunities.')
  }
  
  if (summary.upcomingDeadlines > 10) {
    recommendations.push('⏰ Many deadlines approaching. Send urgent notifications to users.')
  }
  
  if (summary.upcomingDeadlines === 0) {
    recommendations.push('📅 No upcoming deadlines. Focus on promoting next application cycle.')
  }
  
  return recommendations
}

/**
 * Generate alerts based on status
 */
function generateAlerts(summary: any): string[] {
  const alerts: string[] = []
  
  if (summary.openInstitutions === 0) {
    alerts.push('🚨 CRITICAL: No institutions currently accepting applications!')
  }
  
  if (summary.activeBursaries === 0) {
    alerts.push('🚨 WARNING: No active bursaries available!')
  }
  
  if (summary.upcomingDeadlines > 20) {
    alerts.push('⚠️ HIGH: Many deadlines approaching - users need urgent notifications!')
  }
  
  return alerts
}
