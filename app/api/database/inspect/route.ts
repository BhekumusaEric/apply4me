import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * Database Inspector
 * This endpoint helps us understand the current database schema
 */
export async function GET() {
  try {
    const supabase = createClient()

    console.log('🔍 Inspecting database schema...')

    // Try to get a sample record from applications table to see what columns exist
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('*')
      .limit(1)

    const sampleApp = appData?.[0]

    let applicationColumns: string[] = []
    let applicationSample: any = null

    if (appError) {
      console.error('❌ Error accessing applications table:', appError)
    } else if (sampleApp) {
      applicationColumns = Object.keys(sampleApp)
      applicationSample = sampleApp
    }

    // Try to get institutions
    const { data: instData, error: instError } = await supabase
      .from('institutions')
      .select('*')
      .limit(1)

    const sampleInst = instData?.[0]
    let institutionColumns: string[] = []
    if (!instError && sampleInst) {
      institutionColumns = Object.keys(sampleInst)
    }

    // Try to get users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    const sampleUser = userData?.[0]
    let userColumns: string[] = []
    if (!userError && sampleUser) {
      userColumns = Object.keys(sampleUser)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tables: {
        applications: {
          accessible: !appError,
          error: appError?.message,
          columns: applicationColumns,
          sampleRecord: applicationSample ? {
            id: applicationSample.id,
            hasPersonalInfo: !!applicationSample.personal_info,
            hasAcademicInfo: !!applicationSample.academic_info,
            status: applicationSample.status,
            paymentStatus: applicationSample.payment_status,
            createdAt: applicationSample.created_at
          } : null
        },
        institutions: {
          accessible: !instError,
          error: instError?.message,
          columns: institutionColumns,
          count: institutionColumns.length
        },
        users: {
          accessible: !userError,
          error: userError?.message,
          columns: userColumns,
          count: userColumns.length
        }
      },
      recommendations: {
        missingColumns: [
          'payment_method',
          'payment_verification_status',
          'payment_verification_date',
          'payment_verification_by',
          'payment_verification_notes',
          'yoco_charge_id',
          'payment_reference',
          'total_amount'
        ],
        fixUrl: '/api/database/fix-applications-schema'
      }
    })

  } catch (error) {
    console.error('❌ Database inspection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database inspection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
