import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications/real-time-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test: Simulating application submission...')

    // Simulate application data
    const mockApplication = {
      id: `app_${Date.now()}`,
      user_id: '85b75472-2b66-47c8-a8d2-27253382bfd6',
      institution_id: '550e8400-e29b-41d4-a716-446655440000',
      program_id: '550e8400-e29b-41d4-a716-446655440001',
      service_type: 'standard',
      total_amount: 150,
      created_at: new Date().toISOString()
    }

    const institutionName = 'University of Cape Town'

    // Send admin notification about new application
    console.log('📧 Sending admin notification for new application...')
    
    const adminResult = await notificationService.broadcastNotification(
      ['admin'], // Send to admin
      {
        type: 'general',
        title: '🎓 New Application Submitted!',
        message: `A new application has been submitted to ${institutionName}. Application ID: ${mockApplication.id}. Service Type: ${mockApplication.service_type}. Amount: R${mockApplication.total_amount}`,
        metadata: {
          applicationId: mockApplication.id,
          institutionName,
          serviceType: mockApplication.service_type,
          amount: mockApplication.total_amount,
          userId: mockApplication.user_id,
          programId: mockApplication.program_id,
          source: 'application_submission_test'
        }
      }
    )
    
    console.log('✅ Admin notification result:', adminResult)

    // Send user confirmation notification
    console.log('📧 Sending user confirmation notification...')
    
    const userResult = await notificationService.sendNotification({
      id: `app_confirm_${mockApplication.id}`,
      userId: mockApplication.user_id,
      type: 'application_update',
      title: '📝 Application Submitted Successfully!',
      message: `Your application to ${institutionName} has been submitted successfully! We'll process your application and notify you once payment is verified.`,
      metadata: {
        applicationId: mockApplication.id,
        institutionName,
        serviceType: mockApplication.service_type,
        amount: mockApplication.total_amount,
        source: 'application_confirmation_test'
      }
    })
    
    console.log('✅ User confirmation result:', userResult)

    return NextResponse.json({
      success: true,
      message: 'Application submission simulation completed',
      mockApplication,
      notifications: {
        admin: adminResult,
        user: userResult
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Application submission test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to simulate application submission',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
