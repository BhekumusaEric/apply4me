import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      variables: {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
            `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 
            'NOT_SET'
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
            `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
            'NOT_SET'
        },
        SUPABASE_SERVICE_ROLE_KEY: {
          exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
            `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 
            'NOT_SET'
        }
      },
      status: 'success'
    }

    // Check if all required variables are present
    const allPresent = envCheck.variables.NEXT_PUBLIC_SUPABASE_URL.exists &&
                      envCheck.variables.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists &&
                      envCheck.variables.SUPABASE_SERVICE_ROLE_KEY.exists

    return NextResponse.json({
      ...envCheck,
      allVariablesPresent: allPresent,
      message: allPresent ? 
        'All environment variables are configured!' : 
        'Some environment variables are missing'
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
