import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { payFastService, PayFastPaymentData } from '@/lib/services/payfast-service'

// Create PayFast payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, amount, description, userEmail, userName, metadata } = body

    // Validate required fields
    if (!applicationId || !amount || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (!payFastService.validateAmount(amount)) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Create PayFast payment
    const paymentData: PayFastPaymentData = {
      applicationId,
      amount,
      description: description || `Apply4Me Application Payment`,
      userEmail,
      userName,
      metadata
    }

    const result = await payFastService.createPayment(paymentData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment creation failed' },
        { status: 400 }
      )
    }

    // Update application status to payment_pending
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        payment_status: 'pending',
        status: 'payment_pending',
        payment_method: 'payfast',
        payment_reference: result.paymentId,
        payment_date: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Failed to update application status:', updateError)
      // Continue anyway - payment URL is still valid
    }

    console.log('✅ PayFast payment created successfully:', {
      applicationId,
      paymentId: result.paymentId,
      amount
    })

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      paymentId: result.paymentId,
      message: 'Payment created successfully'
    })

  } catch (error) {
    console.error('❌ PayFast payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get PayFast configuration status
export async function GET(request: NextRequest) {
  try {
    const config = payFastService.getConfigStatus()
    
    return NextResponse.json({
      success: true,
      config: {
        configured: config.configured,
        environment: config.environment,
        merchantId: config.merchantId.substring(0, 4) + '****', // Mask for security
        issues: config.issues
      }
    })

  } catch (error) {
    console.error('PayFast config check error:', error)
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    )
  }
}
