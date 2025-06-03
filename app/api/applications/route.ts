import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notificationService } from '@/lib/notifications/real-time-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user ID from query params or headers
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user's applications
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        institutions!inner(name, type, logo_url),
        programs(name, qualification_level, field_of_study)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Applications fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      applications: applications || [],
      count: applications?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Applications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const {
      user_id,
      institution_id,
      program_id,
      personal_info,
      academic_info,
      program_choices,
      service_type = 'standard',
      total_amount
    } = body

    // Validate required fields
    if (!user_id || !institution_id) {
      return NextResponse.json(
        { error: 'User ID and Institution ID are required' },
        { status: 400 }
      )
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        user_id,
        institution_id,
        program_id,
        personal_info,
        academic_info,
        program_choices,
        service_type,
        total_amount: total_amount || 50,
        status: 'draft',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Application creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create application', details: error.message },
        { status: 500 }
      )
    }

    // Get institution name for notification
    const { data: institution } = await supabase
      .from('institutions')
      .select('name')
      .eq('id', institution_id)
      .single()

    const institutionName = institution?.name || 'Unknown Institution'

    // Send admin notification about new application
    try {
      console.log('📧 Sending admin notification for new application...')

      await notificationService.broadcastNotification(
        ['admin'], // Send to admin
        {
          type: 'general',
          title: '🎓 New Application Submitted!',
          message: `A new application has been submitted to ${institutionName}. Application ID: ${application.id}. Service Type: ${service_type}. Amount: R${total_amount || 50}`,
          metadata: {
            applicationId: application.id,
            institutionName,
            serviceType: service_type,
            amount: total_amount || 50,
            userId: user_id,
            programId: program_id,
            source: 'application_submission'
          }
        }
      )

      console.log('✅ Admin notification sent successfully')
    } catch (notificationError) {
      console.error('❌ Failed to send admin notification:', notificationError)
      // Don't fail the application creation if notification fails
    }

    // Send user confirmation notification
    try {
      console.log('📧 Sending user confirmation notification...')

      await notificationService.sendNotification({
        id: `app_confirm_${application.id}`,
        userId: user_id,
        type: 'application_update',
        title: '📝 Application Submitted Successfully!',
        message: `Your application to ${institutionName} has been submitted successfully! We'll process your application and notify you once payment is verified.`,
        metadata: {
          applicationId: application.id,
          institutionName,
          serviceType: service_type,
          amount: total_amount || 50,
          source: 'application_confirmation'
        }
      })

      console.log('✅ User confirmation notification sent')
    } catch (notificationError) {
      console.error('❌ Failed to send user notification:', notificationError)
      // Don't fail the application creation if notification fails
    }

    return NextResponse.json({
      success: true,
      application,
      message: 'Application created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Applications POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
