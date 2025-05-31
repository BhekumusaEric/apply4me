import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const applicationId = formData.get('applicationId') as string
    const paymentReference = formData.get('paymentReference') as string
    const amount = formData.get('amount') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const proofOfPayment = formData.get('proofOfPayment') as File
    const notes = formData.get('notes') as string

    // Validate required fields
    if (!applicationId || !paymentReference || !amount || !paymentMethod || !proofOfPayment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Convert file to base64 for storage (in production, use proper file storage)
    const arrayBuffer = await proofOfPayment.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const fileData = {
      name: proofOfPayment.name,
      type: proofOfPayment.type,
      size: proofOfPayment.size,
      data: base64
    }

    // Create payment verification record
    const { data: verification, error: verificationError } = await supabase
      .from('payment_verifications')
      .insert({
        application_id: applicationId,
        payment_reference: paymentReference,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        proof_of_payment: fileData,
        notes: notes || null,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (verificationError) {
      console.error('Failed to create payment verification:', verificationError)
      return NextResponse.json(
        { error: 'Failed to submit payment proof' },
        { status: 500 }
      )
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        payment_status: 'pending_verification',
        status: 'payment_pending',
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        payment_date: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Failed to update application:', updateError)
      // Don't fail the request if verification was created successfully
    }

    // Create notification for admin
    try {
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'payment_verification_required',
          title: 'New Payment Verification Required',
          message: `Payment verification needed for application ${applicationId}. Reference: ${paymentReference}`,
          data: {
            applicationId,
            paymentReference,
            amount: parseFloat(amount),
            paymentMethod,
            verificationId: verification.id
          },
          created_at: new Date().toISOString()
        })
    } catch (notificationError) {
      console.error('Failed to create admin notification:', notificationError)
      // Don't fail the request
    }

    return NextResponse.json({
      success: true,
      verificationId: verification.id,
      message: 'Payment proof submitted successfully'
    })

  } catch (error) {
    console.error('Manual verification error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment verification' },
      { status: 500 }
    )
  }
}
