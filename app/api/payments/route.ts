import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Yoco API configuration
const YOCO_API_URL = 'https://online.yoco.com/v1/charges/'
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY

interface PaymentRequest {
  applicationId: string
  amount: number
  currency: string
  token: string
  description: string
  metadata?: {
    applicationId: string
    userId: string
    institutionName: string
    serviceType: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()
    
    if (!YOCO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Validate required fields
    if (!body.token || !body.amount || !body.applicationId) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      )
    }

    // Create payment with Yoco
    const yocoResponse = await fetch(YOCO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: body.token,
        amountInCents: Math.round(body.amount * 100), // Convert to cents
        currency: body.currency || 'ZAR',
        description: body.description,
        metadata: body.metadata
      })
    })

    const yocoResult = await yocoResponse.json()

    if (!yocoResponse.ok) {
      console.error('Yoco payment failed:', yocoResult)
      return NextResponse.json(
        { 
          error: 'Payment failed', 
          details: yocoResult.displayMessage || yocoResult.message || 'Unknown error'
        },
        { status: 400 }
      )
    }

    // Payment successful - update application in database
    const supabase = createClient()
    
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        payment_status: 'completed',
        status: 'submitted',
        payment_method: 'card',
        payment_reference: yocoResult.id,
        payment_date: new Date().toISOString(),
        yoco_charge_id: yocoResult.id
      })
      .eq('id', body.applicationId)

    if (updateError) {
      console.error('Failed to update application:', updateError)
      // Payment succeeded but DB update failed - log for manual reconciliation
      console.error('MANUAL RECONCILIATION NEEDED:', {
        applicationId: body.applicationId,
        yocoChargeId: yocoResult.id,
        amount: body.amount
      })
    }

    return NextResponse.json({
      success: true,
      chargeId: yocoResult.id,
      status: yocoResult.status,
      amount: yocoResult.amount,
      currency: yocoResult.currency,
      message: 'Payment processed successfully'
    })

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle payment status webhooks from Yoco
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify webhook signature (implement based on Yoco documentation)
    // const signature = request.headers.get('x-yoco-signature')
    
    const { id: chargeId, status, metadata } = body
    
    if (!chargeId || !status) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Update application based on payment status
    let applicationStatus = 'payment_pending'
    let paymentStatus = 'pending'
    
    switch (status) {
      case 'successful':
        applicationStatus = 'submitted'
        paymentStatus = 'completed'
        break
      case 'failed':
        applicationStatus = 'payment_failed'
        paymentStatus = 'failed'
        break
      case 'cancelled':
        applicationStatus = 'payment_cancelled'
        paymentStatus = 'cancelled'
        break
    }

    const { error } = await supabase
      .from('applications')
      .update({
        payment_status: paymentStatus,
        status: applicationStatus,
        updated_at: new Date().toISOString()
      })
      .eq('yoco_charge_id', chargeId)

    if (error) {
      console.error('Webhook update failed:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Get payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    const chargeId = searchParams.get('chargeId')

    if (!applicationId && !chargeId) {
      return NextResponse.json(
        { error: 'Application ID or Charge ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    let query = supabase
      .from('applications')
      .select('id, payment_status, payment_method, payment_reference, payment_date, total_amount')

    if (applicationId) {
      query = query.eq('id', applicationId)
    } else if (chargeId) {
      query = query.eq('yoco_charge_id', chargeId)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: {
        status: data.payment_status,
        method: data.payment_method,
        reference: data.payment_reference,
        date: data.payment_date,
        amount: data.total_amount
      }
    })

  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    )
  }
}
