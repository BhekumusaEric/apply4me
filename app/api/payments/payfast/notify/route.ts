import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { payFastService } from '@/lib/services/payfast-service'
import { notificationService } from '@/lib/services/notification-service'

// Handle PayFast ITN (Instant Transaction Notification)
export async function POST(request: NextRequest) {
  try {
    console.log('📨 PayFast ITN received')

    // Get client IP for security validation
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    // Parse form data from PayFast
    const formData = await request.formData()
    const params: Record<string, string> = {}

    Array.from(formData.entries()).forEach(([key, value]) => {
      params[key] = value.toString()
    })

    console.log('📊 PayFast ITN params:', {
      payment_status: params.payment_status,
      pf_payment_id: params.pf_payment_id,
      custom_str1: params.custom_str1, // applicationId
      amount_gross: params.amount_gross,
      clientIP
    })

    // Security validations

    // 1. Verify PayFast IP (in production)
    if (process.env.NODE_ENV === 'production' && !payFastService.isValidPayFastIP(clientIP)) {
      console.error('❌ Invalid PayFast IP:', clientIP)
      return NextResponse.json({ error: 'Invalid source IP' }, { status: 403 })
    }

    // 2. Verify signature
    if (!payFastService.verifyNotification(params)) {
      console.error('❌ Invalid PayFast signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Extract payment details
    const {
      payment_status,
      pf_payment_id,
      custom_str1: applicationId,
      custom_str2: userId,
      custom_str3: institutionName,
      custom_str4: programName,
      custom_str5: paymentId,
      amount_gross,
      amount_fee,
      amount_net,
      name_first,
      name_last,
      email_address
    } = params

    if (!applicationId) {
      console.error('❌ Missing application ID in PayFast notification')
      return NextResponse.json({ error: 'Missing application ID' }, { status: 400 })
    }

    // Update application based on payment status
    const supabase = createClient()

    let applicationStatus = 'payment_pending'
    let paymentStatusValue = 'pending'

    switch (payment_status) {
      case 'COMPLETE':
        applicationStatus = 'submitted'
        paymentStatusValue = 'completed'
        console.log('✅ Payment completed for application:', applicationId)
        break
      case 'FAILED':
        applicationStatus = 'payment_failed'
        paymentStatusValue = 'failed'
        console.log('❌ Payment failed for application:', applicationId)
        break
      case 'CANCELLED':
        applicationStatus = 'payment_cancelled'
        paymentStatusValue = 'cancelled'
        console.log('⚠️ Payment cancelled for application:', applicationId)
        break
      default:
        console.log('📊 Payment status update:', payment_status, 'for application:', applicationId)
    }

    // Update application in database
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        payment_status: paymentStatusValue,
        status: applicationStatus,
        payfast_payment_id: pf_payment_id,
        payment_reference: paymentId || pf_payment_id,
        payment_amount: parseFloat(amount_gross || '0'),
        payment_fee: parseFloat(amount_fee || '0'),
        payment_net: parseFloat(amount_net || '0'),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('❌ Failed to update application:', updateError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // Log successful payment for audit trail
    if (payment_status === 'COMPLETE') {
      console.log('🎉 Payment successfully processed:', {
        applicationId,
        paymentId: pf_payment_id,
        amount: amount_gross,
        institution: institutionName,
        program: programName,
        user: `${name_first} ${name_last}`,
        email: email_address
      })

      // Send payment confirmation notification
      try {
        await notificationService.createPaymentVerificationNotification(
          userId,
          'verified',
          {
            id: applicationId,
            institutionName: institutionName || 'Institution',
            paymentReference: pf_payment_id,
            amount: parseFloat(amount_gross || '0')
          }
        )
        console.log('✅ Payment confirmation notification sent')
      } catch (notifError) {
        console.error('❌ Failed to send payment notification:', notifError)
      }
    }

    // Respond to PayFast
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ PayFast ITN processing error:', error)
    return NextResponse.json(
      { error: 'ITN processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests (PayFast sometimes sends GET for validation)
export async function GET(request: NextRequest) {
  console.log('📨 PayFast validation request received')
  return NextResponse.json({ success: true, message: 'PayFast endpoint active' })
}
