import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { notificationService } from '@/lib/services/notification-service'

interface VerifyPaymentRequest {
  applicationId: string
  status: 'verified' | 'rejected'
  adminNotes?: string
  verifiedBy: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json()

    const { applicationId, status, adminNotes, verifiedBy } = body

    if (!applicationId || !status || !verifiedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, status, verifiedBy' },
        { status: 400 }
      )
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "verified" or "rejected"' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get application details first
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        institutions (
          name,
          email,
          logo_url
        )
      `)
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application status based on verification
    const updateData: any = {
      payment_verification_status: status,
      payment_verification_date: new Date().toISOString(),
      payment_verification_by: verifiedBy,
      payment_verification_notes: adminNotes || null,
      updated_at: new Date().toISOString()
    }

    if (status === 'verified') {
      updateData.payment_status = 'completed'
      updateData.status = 'submitted'
    } else {
      updateData.payment_status = 'failed'
      updateData.status = 'payment_failed'
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)

    if (updateError) {
      console.error('Failed to update application:', updateError)
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      )
    }

    // Send notification to user
    try {
      // Create in-app notification using the new service
      const notificationResult = await notificationService.createPaymentVerificationNotification(
        application.user_id,
        status,
        {
          id: application.id,
          institutionName: application.institutions?.name || 'the institution',
          paymentReference: application.payment_reference || 'N/A',
          amount: application.total_amount || 0
        },
        adminNotes
      )

      if (notificationResult.success) {
        console.log(`✅ In-app notification created for payment ${status} - Application ${applicationId}`)
      } else {
        console.error('❌ Failed to create in-app notification:', notificationResult.error)
      }

      // Also send email notification (if email service is available)
      await sendPaymentVerificationNotification(application, status, adminNotes)

      console.log(`✅ Notifications sent for payment ${status} - Application ${applicationId}`)
    } catch (notificationError) {
      console.error('❌ Failed to send notification:', notificationError)
      // Don't fail the verification if notification fails
    }

    // Log verification action
    await logVerificationAction(applicationId, status, verifiedBy, adminNotes)

    return NextResponse.json({
      success: true,
      message: `Payment ${status} successfully`,
      applicationId,
      status,
      verifiedBy,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get pending payments for verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending_verification'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()

    // Select only columns that definitely exist in the current schema (first schema version)
    const selectQuery = `
      id,
      payment_status,
      status,
      created_at,
      personal_details,
      institutions (
        name,
        logo_url
      )
    `

    // Try to add optional columns that might not exist
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select(selectQuery)
        .eq('payment_status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Error fetching applications:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch pending payments',
          details: error.message,
          schemaIssue: error.code === '42703',
          fixUrl: '/api/database/fix-applications-schema'
        }, { status: 500 })
      }

      // Format the response with safe property access for existing columns only
      const formattedApplications = Array.isArray(applications) ? applications.map((app: any) => ({
        id: app.id,
        paymentReference: 'N/A', // Column doesn't exist yet
        paymentMethod: 'Unknown', // Column doesn't exist yet
        paymentDate: app.created_at, // Use created_at as fallback
        amount: 150, // Default amount since column doesn't exist
        status: app.payment_status,
        verificationStatus: 'pending_verification', // Default value since column doesn't exist
        applicationStatus: app.status,
        createdAt: app.created_at,
        studentName: `${app.personal_details?.firstName || ''} ${app.personal_details?.lastName || ''}`.trim(),
        studentEmail: app.personal_details?.email,
        studentPhone: app.personal_details?.phone,
        institutionName: app.institutions?.name,
        institutionLogo: app.institutions?.logo_url
      })) : []

      return NextResponse.json({
        success: true,
        applications: formattedApplications,
        total: formattedApplications.length,
        offset,
        limit,
        schemaWarning: 'Some columns may be missing from database schema'
      })

    } catch (queryError) {
      console.error('❌ Query error:', queryError)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: queryError instanceof Error ? queryError.message : 'Unknown error',
        schemaIssue: true,
        fixUrl: '/api/database/fix-applications-schema'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Get pending payments error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Send notification to user about payment verification
async function sendPaymentVerificationNotification(
  application: any,
  status: 'verified' | 'rejected',
  adminNotes?: string
) {
  const studentEmail = application.personal_info?.email
  const studentName = `${application.personal_info?.firstName || ''} ${application.personal_info?.lastName || ''}`.trim()
  const institutionName = application.institutions?.name || 'the institution'
  const paymentReference = application.payment_reference
  const amount = application.total_amount

  if (!studentEmail) {
    console.warn('No student email found for notification')
    return
  }

  const subject = status === 'verified'
    ? `✅ Payment Verified - Application Submitted to ${institutionName}`
    : `❌ Payment Verification Failed - Action Required`

  const message = status === 'verified'
    ? `
Dear ${studentName},

🎉 Great news! Your payment has been verified and your application has been successfully submitted to ${institutionName}.

Payment Details:
• Reference: ${paymentReference}
• Amount: R${amount}
• Status: Verified ✅

What happens next:
1. Your application is now being processed by ${institutionName}
2. You'll receive updates on your application status
3. Track your progress in your Apply4Me dashboard

Thank you for using Apply4Me!

Best regards,
The Apply4Me Team
    `
    : `
Dear ${studentName},

We've reviewed your payment for the application to ${institutionName}, but unfortunately we couldn't verify it.

Payment Details:
• Reference: ${paymentReference}
• Amount: R${amount}
• Status: Verification Failed ❌

${adminNotes ? `Admin Notes: ${adminNotes}` : ''}

Next Steps:
1. Please check your payment method and try again
2. Contact us if you believe this is an error
3. You can retry payment in your dashboard

Need help? Reply to this email or contact our support team.

Best regards,
The Apply4Me Team
    `

  // Here you would integrate with your email service
  // For now, we'll log the notification
  console.log('📧 Email Notification:', {
    to: studentEmail,
    subject,
    message: message.trim()
  })

  // You can integrate with services like:
  // - SendGrid
  // - Mailgun
  // - AWS SES
  // - Nodemailer with SMTP
}

// Create in-app notification for user
async function createUserNotification(
  application: any,
  status: 'verified' | 'rejected',
  adminNotes?: string
) {
  try {
    const userId = application.user_id
    const institutionName = application.institutions?.name || 'the institution'
    const paymentReference = application.payment_reference
    const amount = application.total_amount

    if (!userId) {
      console.warn('No user ID found for notification')
      return
    }

    const title = status === 'verified'
      ? '✅ Payment Verified - Application Submitted!'
      : '❌ Payment Verification Failed'

    const message = status === 'verified'
      ? `Your payment of R${amount} (Ref: ${paymentReference}) has been verified. Your application to ${institutionName} has been successfully submitted and is now being processed.`
      : `Your payment of R${amount} (Ref: ${paymentReference}) could not be verified. ${adminNotes ? `Reason: ${adminNotes}` : 'Please check your payment details and try again.'}`

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type: status === 'verified' ? 'payment_verified' : 'payment_rejected',
        title,
        message,
        metadata: {
          applicationId: application.id,
          paymentReference,
          institutionName,
          amount
        }
      })
    })

    if (!response.ok) {
      console.error('Failed to create notification:', await response.text())
    }
  } catch (error) {
    console.error('Failed to create user notification:', error)
  }
}

// Log verification action for audit trail
async function logVerificationAction(
  applicationId: string,
  status: string,
  verifiedBy: string,
  notes?: string
) {
  try {
    const supabase = createClient()

    await supabase
      .from('payment_verification_logs')
      .insert({
        application_id: applicationId,
        verification_status: status,
        verified_by: verifiedBy,
        notes: notes,
        verified_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log verification action:', error)
  }
}
