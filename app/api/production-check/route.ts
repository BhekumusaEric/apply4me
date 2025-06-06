import { NextResponse } from 'next/server'
import { isProductionReady, isProduction, areTestRoutesEnabled, isDebugEnabled } from '@/lib/production-utils'

/**
 * Production readiness check endpoint
 * Verifies that the application is properly configured for production
 */
export async function GET() {
  try {
    const readinessCheck = isProductionReady()
    const environment = process.env.NODE_ENV
    
    // Additional production checks
    const checks = {
      environment: {
        isProduction: isProduction(),
        nodeEnv: environment,
        status: environment === 'production' ? 'production' : 'development'
      },
      security: {
        testRoutesDisabled: !areTestRoutesEnabled(),
        debugDisabled: !isDebugEnabled(),
        status: (!areTestRoutesEnabled() && !isDebugEnabled()) ? 'secure' : 'insecure'
      },
      configuration: {
        ready: readinessCheck.ready,
        issues: readinessCheck.issues,
        status: readinessCheck.ready ? 'configured' : 'misconfigured'
      }
    }
    
    // Overall status
    const overallStatus = readinessCheck.ready && 
                         checks.security.status === 'secure' && 
                         checks.environment.isProduction
                         ? 'production-ready' : 'not-ready'
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: checks.environment,
      security: checks.security,
      configuration: checks.configuration,
      recommendations: getRecommendations(checks),
      summary: {
        ready: overallStatus === 'production-ready',
        totalIssues: readinessCheck.issues.length,
        criticalIssues: readinessCheck.issues.filter(issue => 
          issue.includes('Missing required') || 
          issue.includes('enabled in production')
        ).length
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Failed to check production readiness',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Get recommendations based on current configuration
 */
function getRecommendations(checks: any): string[] {
  const recommendations: string[] = []
  
  if (!checks.environment.isProduction) {
    recommendations.push('Set NODE_ENV=production for production deployment')
  }
  
  if (checks.security.status === 'insecure') {
    if (areTestRoutesEnabled()) {
      recommendations.push('Disable test routes in production (remove ENABLE_TEST_ROUTES=true)')
    }
    if (isDebugEnabled()) {
      recommendations.push('Disable debug mode in production (remove ENABLE_DEBUG=true)')
    }
  }
  
  if (!checks.configuration.ready) {
    recommendations.push('Configure all required environment variables')
    recommendations.push('Verify Supabase connection and API keys')
  }
  
  if (checks.environment.isProduction && checks.security.status === 'secure' && checks.configuration.ready) {
    recommendations.push('✅ Application is production-ready!')
  }
  
  return recommendations
}

/**
 * POST endpoint to fix common production issues (admin only)
 */
export async function POST(request: Request) {
  try {
    const { action } = await request.json()
    
    // This would require admin authentication in a real implementation
    // For now, just return what actions could be taken
    
    const availableActions = {
      'check-environment': 'Verify all environment variables',
      'test-database': 'Test database connectivity',
      'verify-security': 'Check security configuration',
      'validate-apis': 'Test all API endpoints'
    }
    
    if (action && availableActions[action as keyof typeof availableActions]) {
      return NextResponse.json({
        success: true,
        action,
        description: availableActions[action as keyof typeof availableActions],
        message: 'Action would be performed in full implementation',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action',
      availableActions,
      timestamp: new Date().toISOString()
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process production check action',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
