// Email service configuration for Apply4Me notifications

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'smtp'
  apiKey?: string
  domain?: string
  fromEmail: string
  fromName: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    to: string,
    toName: string,
    title: string,
    message: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const template = this.generateNotificationTemplate(title, message, metadata)
      
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(to, toName, template)
        case 'mailgun':
          return await this.sendWithMailgun(to, toName, template)
        case 'resend':
          return await this.sendWithResend(to, toName, template)
        case 'smtp':
          return await this.sendWithSMTP(to, toName, template)
        default:
          console.error('❌ Unknown email provider:', this.config.provider)
          return false
      }
    } catch (error) {
      console.error('❌ Email service error:', error)
      return false
    }
  }

  /**
   * Generate email template for notifications
   */
  private generateNotificationTemplate(title: string, message: string, metadata?: any): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .alert { padding: 15px; margin: 20px 0; border-radius: 6px; }
          .alert-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
          .alert-success { background: #e8f5e8; border-left: 4px solid #4caf50; }
          .alert-warning { background: #fff3cd; border-left: 4px solid #ff9800; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Apply4Me</h1>
            <p>Your Education Journey Partner</p>
          </div>
          
          <div class="content">
            <h2>${title}</h2>
            <p>${message}</p>
            
            ${metadata?.type === 'payment_verified' ? `
              <div class="alert alert-success">
                <strong>✅ Payment Confirmed!</strong><br>
                Your payment has been successfully processed.
              </div>
            ` : ''}
            
            ${metadata?.type === 'application_update' ? `
              <div class="alert alert-info">
                <strong>📋 Application Update</strong><br>
                There's an update on your application status.
              </div>
            ` : ''}
            
            ${metadata?.type === 'deadline_reminder' ? `
              <div class="alert alert-warning">
                <strong>⏰ Important Deadline</strong><br>
                Don't miss this important deadline!
              </div>
            ` : ''}
            
            <a href="https://apply4me.co.za/dashboard" class="button">
              View Dashboard
            </a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              This notification was sent because you have an active Apply4Me account. 
              You can manage your notification preferences in your dashboard.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Apply4Me. All rights reserved.</p>
            <p>
              <a href="https://apply4me.co.za" style="color: #007bff;">Website</a> | 
              <a href="https://apply4me.co.za/support" style="color: #007bff;">Support</a> | 
              <a href="https://apply4me.co.za/unsubscribe" style="color: #007bff;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
${title}

${message}

View your dashboard: https://apply4me.co.za/dashboard

---
Apply4Me - Your Education Journey Partner
© 2024 Apply4Me. All rights reserved.
    `.trim()

    return {
      subject: `Apply4Me: ${title}`,
      html,
      text
    }
  }

  /**
   * Send email using SendGrid
   */
  private async sendWithSendGrid(to: string, toName: string, template: EmailTemplate): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to, name: toName }]
          }],
          from: { 
            email: this.config.fromEmail, 
            name: this.config.fromName 
          },
          subject: template.subject,
          content: [
            { type: 'text/plain', value: template.text },
            { type: 'text/html', value: template.html }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('❌ SendGrid error:', error)
        return false
      }

      console.log('✅ Email sent via SendGrid to:', to)
      return true
    } catch (error) {
      console.error('❌ SendGrid send error:', error)
      return false
    }
  }

  /**
   * Send email using Mailgun
   */
  private async sendWithMailgun(to: string, toName: string, template: EmailTemplate): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`)
      formData.append('to', `${toName} <${to}>`)
      formData.append('subject', template.subject)
      formData.append('text', template.text)
      formData.append('html', template.html)

      const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('❌ Mailgun error:', error)
        return false
      }

      console.log('✅ Email sent via Mailgun to:', to)
      return true
    } catch (error) {
      console.error('❌ Mailgun send error:', error)
      return false
    }
  }

  /**
   * Send email using Resend
   */
  private async sendWithResend(to: string, toName: string, template: EmailTemplate): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: [`${toName} <${to}>`],
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('❌ Resend error:', error)
        return false
      }

      console.log('✅ Email sent via Resend to:', to)
      return true
    } catch (error) {
      console.error('❌ Resend send error:', error)
      return false
    }
  }

  /**
   * Send email using SMTP (placeholder)
   */
  private async sendWithSMTP(to: string, toName: string, template: EmailTemplate): Promise<boolean> {
    // This would require nodemailer or similar SMTP library
    console.log('📧 SMTP email sending not implemented yet')
    console.log(`Would send to: ${toName} <${to}>`)
    console.log(`Subject: ${template.subject}`)
    return true // Mock success for now
  }
}

// Email service factory
export function createEmailService(): EmailService | null {
  // Try different email providers based on available environment variables
  
  if (process.env.SENDGRID_API_KEY) {
    return new EmailService({
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'notifications@apply4me.co.za',
      fromName: process.env.FROM_NAME || 'Apply4Me'
    })
  }
  
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return new EmailService({
      provider: 'mailgun',
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.FROM_EMAIL || 'notifications@apply4me.co.za',
      fromName: process.env.FROM_NAME || 'Apply4Me'
    })
  }
  
  if (process.env.RESEND_API_KEY) {
    return new EmailService({
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'notifications@apply4me.co.za',
      fromName: process.env.FROM_NAME || 'Apply4Me'
    })
  }
  
  console.log('⚠️ No email service configured. Set SENDGRID_API_KEY, MAILGUN_API_KEY, or RESEND_API_KEY')
  return null
}
