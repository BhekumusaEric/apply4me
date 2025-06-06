/**
 * Production Environment Utilities
 * Handles production-specific configurations and security
 */

/**
 * Check if the application is running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if the application is running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if debug features should be enabled
 * Debug features are disabled in production unless explicitly enabled
 */
export function isDebugEnabled(): boolean {
  if (isDevelopment()) return true
  return process.env.ENABLE_DEBUG === 'true'
}

/**
 * Check if test routes should be accessible
 * Test routes are disabled in production unless explicitly enabled
 */
export function areTestRoutesEnabled(): boolean {
  if (isDevelopment()) return true
  return process.env.ENABLE_TEST_ROUTES === 'true'
}

/**
 * Get the application environment name
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'
}

/**
 * Check if console logging should be enabled
 * In production, only errors and warnings are logged unless debug is enabled
 */
export function shouldLog(level: 'log' | 'info' | 'warn' | 'error' = 'log'): boolean {
  if (isDevelopment()) return true
  if (level === 'error' || level === 'warn') return true
  return isDebugEnabled()
}

/**
 * Production-safe console logging
 * Only logs in development or when debug is enabled in production
 */
export const prodLog = {
  log: (...args: any[]) => {
    if (shouldLog('log')) console.log(...args)
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.info(...args)
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn(...args)
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error(...args)
  }
}

/**
 * Get admin emails from environment or fallback to hardcoded list
 */
export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS
  if (envEmails) {
    return envEmails.split(',').map(email => email.trim())
  }
  
  // Fallback admin emails
  return [
    'bhntshwcjc025@student.wethinkcode.co.za',
    'admin@apply4me.co.za',
    'bhekumusa@apply4me.co.za'
  ]
}

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.toLowerCase())
}

/**
 * Get the application URL based on environment
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  if (isProduction()) {
    return 'https://apply4me-eta.vercel.app'
  }
  
  return 'http://localhost:3000'
}

/**
 * Production security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  if (!isProduction()) return {}
  
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
}

/**
 * Check if a route should be accessible in production
 */
export function isRouteAllowedInProduction(pathname: string): boolean {
  // Always allow these routes
  const allowedRoutes = [
    '/',
    '/auth',
    '/dashboard',
    '/applications',
    '/admin-panel',
    '/api/health',
    '/api/institutions',
    '/api/applications',
    '/api/payments',
    '/api/notifications',
    '/api/admin'
  ]
  
  // Block test and debug routes in production
  const blockedInProduction = [
    '/api/test',
    '/api/debug',
    '/debug',
    '/admin-test',
    '/admin/test'
  ]
  
  if (isProduction()) {
    // Check if route is explicitly blocked
    for (const blocked of blockedInProduction) {
      if (pathname.startsWith(blocked)) {
        return areTestRoutesEnabled()
      }
    }
  }
  
  return true
}

/**
 * Sanitize error messages for production
 */
export function sanitizeError(error: any): string {
  if (isDevelopment()) {
    return error?.message || error?.toString() || 'Unknown error'
  }
  
  // In production, return generic error messages to avoid exposing sensitive information
  if (error?.message?.includes('Invalid API key')) {
    return 'Database connection error'
  }
  
  if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
    return 'Database configuration error'
  }
  
  return 'An error occurred. Please try again.'
}

/**
 * Production-safe environment variable getter
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key]
  
  if (!value && defaultValue !== undefined) {
    return defaultValue
  }
  
  return value
}

/**
 * Check if the application is properly configured for production
 */
export function isProductionReady(): {
  ready: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  if (isProduction()) {
    // Check required environment variables
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push(`Missing required environment variable: ${varName}`)
      }
    }
    
    // Check if test routes are disabled
    if (areTestRoutesEnabled()) {
      issues.push('Test routes are enabled in production (ENABLE_TEST_ROUTES=true)')
    }
    
    // Check if debug is disabled
    if (isDebugEnabled()) {
      issues.push('Debug mode is enabled in production (ENABLE_DEBUG=true)')
    }
  }
  
  return {
    ready: issues.length === 0,
    issues
  }
}
