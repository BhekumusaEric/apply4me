import { NextRequest, NextResponse } from 'next/server'
import { createEmailService } from '@/lib/email/email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Testing email service...')

    const { to, subject, message } = await request.json()

    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Recipient email is required'
      }, { status: 400 })
    }

    // Create email service
    const emailService = createEmailService()
    
    if (!emailService) {
      return NextResponse.json({
        success: false,
        error: 'No email service configured',
        instructions: {
          message: 'Please configure an email service in your environment variables',
          options: [
            'SENDGRID_API_KEY for SendGrid',
            'RESEND_API_KEY for Resend', 
            'MAILGUN_API_KEY + MAILGUN_DOMAIN for Mailgun'
          ]
        }
      }, { status: 500 })
    }

    // Send test email
    const success = await emailService.sendNotificationEmail(
      to,
      'Test User',
      subject || 'Test Email from Apply4Me',
      message || 'This is a test email to verify your email service configuration is working correctly!',
      { type: 'test', source: 'api_test' }
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: '✅ Test email sent successfully!',
        details: {
          recipient: to,
          subject: subject || 'Test Email from Apply4Me',
          provider: process.env.SENDGRID_API_KEY ? 'SendGrid' :
                   process.env.RESEND_API_KEY ? 'Resend' :
                   process.env.MAILGUN_API_KEY ? 'Mailgun' : 'Unknown'
        },
        instructions: {
          message: 'Check your email inbox (and spam folder) for the test email',
          nextSteps: [
            'If you received the email, your email service is working correctly',
            'If not, check your API keys and email service configuration',
            'Try sending a notification with email enabled'
          ]
        },
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        troubleshooting: {
          checkList: [
            'Verify your API key is correct',
            'Check if sender email is verified',
            'Ensure you have not exceeded rate limits',
            'Check the email service logs for errors'
          ]
        },
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Email test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  // Check email service configuration
  const emailService = createEmailService()
  
  const configStatus = {
    sendgrid: !!process.env.SENDGRID_API_KEY,
    resend: !!process.env.RESEND_API_KEY,
    mailgun: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
    fromEmail: process.env.FROM_EMAIL || 'notifications@apply4me.co.za',
    fromName: process.env.FROM_NAME || 'Apply4Me'
  }

  const activeProvider = emailService ? (
    process.env.SENDGRID_API_KEY ? 'SendGrid' :
    process.env.RESEND_API_KEY ? 'Resend' :
    process.env.MAILGUN_API_KEY ? 'Mailgun' : 'Unknown'
  ) : null

  return NextResponse.json({
    message: 'Email service configuration status',
    configured: !!emailService,
    activeProvider,
    availableProviders: configStatus,
    instructions: {
      message: emailService ? 
        'Email service is configured and ready to use' :
        'No email service configured. Add one of the API keys to your environment variables.',
      testEndpoint: 'POST /api/test/email with { "to": "your-email@example.com" }',
      setupGuide: 'See docs/EMAIL_SETUP_GUIDE.md for detailed setup instructions'
    },
    timestamp: new Date().toISOString()
  })
}
