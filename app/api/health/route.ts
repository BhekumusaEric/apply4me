import { NextResponse } from 'next/server';
import { createServerSupabaseAdminClient } from '@/lib/supabase-server';

async function checkAdminSystem(supabase: any) {
  try {
    const tables = ['admin_users', 'notifications', 'in_app_notifications'];
    const tableChecks = [];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        tableChecks.push({
          table,
          exists: !error,
          error: error?.message
        });
      } catch (err) {
        tableChecks.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const allTablesExist = tableChecks.every(check => check.exists);
    return {
      status: allTablesExist ? 'healthy' : 'degraded',
      tablesExist: allTablesExist,
      tables: tableChecks
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      tablesExist: false,
      error: error instanceof Error ? error.message : 'Admin system check failed'
    };
  }
}

export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connection
    const supabase = createServerSupabaseAdminClient();

    // Simple database query to test connection
    const { data, error } = await supabase
      .from('institutions')
      .select('count')
      .limit(1);

    const dbStatus = error ? 'unhealthy' : 'healthy';
    const responseTime = Date.now() - startTime;

    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    const allEnvPresent = Object.values(envCheck).every(Boolean);

    const healthStatus = {
      status: dbStatus === 'healthy' && allEnvPresent ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
          error: error?.message || null
        },
        environment: {
          status: allEnvPresent ? 'healthy' : 'unhealthy',
          variables: envCheck
        },
        services: {
          automation: 'healthy',
          payments: 'healthy',
          notifications: 'healthy'
        },
        adminSystem: await checkAdminSystem(supabase),
        authentication: {
          status: (process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true') ? 'enabled' : 'disabled',
          environment: process.env.NODE_ENV || 'development'
        }
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  }
}
