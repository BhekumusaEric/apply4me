/**
 * Email Notification Service
 * Sends automated emails for new opportunities and updates
 */

import { ScrapedInstitution } from '../scrapers/institution-scraper'
import { ScrapedBursary } from '../scrapers/bursary-scraper'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface NotificationPreferences {
  newInstitutions: boolean
  newBursaries: boolean
  deadlineReminders: boolean
  weeklyDigest: boolean
  fieldOfStudy?: string[]
  studyLevel?: string
  province?: string
}

export class EmailNotificationService {
  private apiKey: string
  private fromEmail: string = 'notifications@apply4me.co.za'
  private fromName: string = 'Apply4Me Notifications'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.EMAIL_API_KEY || ''
  }

  /**
   * Send new institution notification
   */
  async sendNewInstitutionAlert(
    userEmail: string,
    userName: string,
    institutions: ScrapedInstitution[]
  ): Promise<boolean> {
    const template = this.generateNewInstitutionTemplate(userName, institutions)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Send new bursary notification
   */
  async sendNewBursaryAlert(
    userEmail: string,
    userName: string,
    bursaries: ScrapedBursary[]
  ): Promise<boolean> {
    const template = this.generateNewBursaryTemplate(userName, bursaries)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Send deadline reminder
   */
  async sendDeadlineReminder(
    userEmail: string,
    userName: string,
    bursaries: ScrapedBursary[]
  ): Promise<boolean> {
    const template = this.generateDeadlineReminderTemplate(userName, bursaries)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(
    userEmail: string,
    userName: string,
    data: {
      newInstitutions: ScrapedInstitution[]
      newBursaries: ScrapedBursary[]
      upcomingDeadlines: ScrapedBursary[]
    }
  ): Promise<boolean> {
    const template = this.generateWeeklyDigestTemplate(userName, data)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Generate new institution email template
   */
  private generateNewInstitutionTemplate(userName: string, institutions: ScrapedInstitution[]): EmailTemplate {
    const subject = `🎓 New Educational Opportunities Discovered - Apply4Me`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Institutions - Apply4Me</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .institution { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .institution h3 { color: #10b981; margin: 0 0 10px 0; }
          .cta { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 New Educational Opportunities</h1>
          <p>Fresh institutions discovered just for you!</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName}! 👋</h2>
          <p>Great news! We've discovered <strong>${institutions.length} new educational institution${institutions.length > 1 ? 's' : ''}</strong> that might interest you:</p>
          
          ${institutions.map(inst => `
            <div class="institution">
              <h3>${inst.name}</h3>
              <p><strong>📍 Location:</strong> ${inst.location}</p>
              <p><strong>🎯 Type:</strong> ${inst.type.charAt(0).toUpperCase() + inst.type.slice(1)}</p>
              ${inst.description ? `<p><strong>📝 About:</strong> ${inst.description}</p>` : ''}
              ${inst.programs ? `<p><strong>📚 Programs:</strong> ${inst.programs.join(', ')}</p>` : ''}
              ${inst.applicationFee ? `<p><strong>💰 Application Fee:</strong> R${inst.applicationFee}</p>` : ''}
              ${inst.website ? `<a href="${inst.website}" class="cta">Visit Website</a>` : ''}
            </div>
          `).join('')}
          
          <p>Ready to apply? Visit your Apply4Me dashboard to get started!</p>
          <a href="https://apply4me-eta.vercel.app/dashboard" class="cta">View Dashboard</a>
        </div>
        
        <div class="footer">
          <p>© 2025 Apply4Me - Your Gateway to South African Higher Education</p>
          <p>🇿🇦 Empowering South African students to achieve their dreams</p>
        </div>
      </body>
      </html>
    `
    
    const text = `
      New Educational Opportunities - Apply4Me
      
      Hi ${userName}!
      
      Great news! We've discovered ${institutions.length} new educational institution${institutions.length > 1 ? 's' : ''} that might interest you:
      
      ${institutions.map(inst => `
        ${inst.name}
        Location: ${inst.location}
        Type: ${inst.type.charAt(0).toUpperCase() + inst.type.slice(1)}
        ${inst.description ? `About: ${inst.description}` : ''}
        ${inst.website ? `Website: ${inst.website}` : ''}
      `).join('\n')}
      
      Ready to apply? Visit your Apply4Me dashboard: https://apply4me-eta.vercel.app/dashboard
      
      © 2025 Apply4Me - Your Gateway to South African Higher Education
    `

    return { subject, html, text }
  }

  /**
   * Generate new bursary email template
   */
  private generateNewBursaryTemplate(userName: string, bursaries: ScrapedBursary[]): EmailTemplate {
    const subject = `💰 New Bursary Opportunities Available - Apply4Me`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Bursaries - Apply4Me</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #f59e0b, #10b981); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .bursary { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .bursary h3 { color: #f59e0b; margin: 0 0 10px 0; }
          .amount { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .deadline { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; }
          .cta { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 New Bursary Opportunities</h1>
          <p>Funding opportunities to support your education!</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName}! 🌟</h2>
          <p>Exciting news! We've found <strong>${bursaries.length} new bursary opportunit${bursaries.length > 1 ? 'ies' : 'y'}</strong> that could fund your education:</p>
          
          ${bursaries.map(bursary => `
            <div class="bursary">
              <h3>${bursary.title}</h3>
              <p><strong>🏢 Provider:</strong> ${bursary.provider}</p>
              <p><strong>💰 Amount:</strong> <span class="amount">${bursary.amount}</span></p>
              <p><strong>📚 Fields:</strong> ${bursary.fieldOfStudy.join(', ')}</p>
              <p><strong>⏰ Deadline:</strong> <span class="deadline">${new Date(bursary.applicationDeadline).toLocaleDateString()}</span></p>
              <p><strong>📝 Description:</strong> ${bursary.description}</p>
              ${bursary.applicationUrl ? `<a href="${bursary.applicationUrl}" class="cta">Apply Now</a>` : ''}
            </div>
          `).join('')}
          
          <p>Don't miss out on these opportunities! Apply early to increase your chances.</p>
          <a href="https://apply4me-eta.vercel.app/bursaries" class="cta">View All Bursaries</a>
        </div>
        
        <div class="footer">
          <p>© 2025 Apply4Me - Your Gateway to South African Higher Education</p>
          <p>💡 Tip: Set up deadline reminders to never miss an opportunity!</p>
        </div>
      </body>
      </html>
    `
    
    const text = `
      New Bursary Opportunities - Apply4Me
      
      Hi ${userName}!
      
      Exciting news! We've found ${bursaries.length} new bursary opportunit${bursaries.length > 1 ? 'ies' : 'y'} that could fund your education:
      
      ${bursaries.map(bursary => `
        ${bursary.title}
        Provider: ${bursary.provider}
        Amount: ${bursary.amount}
        Fields: ${bursary.fieldOfStudy.join(', ')}
        Deadline: ${new Date(bursary.applicationDeadline).toLocaleDateString()}
        ${bursary.applicationUrl ? `Apply: ${bursary.applicationUrl}` : ''}
      `).join('\n')}
      
      View all bursaries: https://apply4me-eta.vercel.app/bursaries
      
      © 2025 Apply4Me - Your Gateway to South African Higher Education
    `

    return { subject, html, text }
  }

  /**
   * Generate deadline reminder template
   */
  private generateDeadlineReminderTemplate(userName: string, bursaries: ScrapedBursary[]): EmailTemplate {
    const subject = `⏰ Urgent: Bursary Deadlines Approaching - Apply4Me`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deadline Reminder - Apply4Me</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #dc2626, #f59e0b); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .urgent { border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin: 10px 0; background: #fef2f2; }
          .urgent h3 { color: #dc2626; margin: 0 0 10px 0; }
          .deadline { background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .cta { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Urgent Deadline Reminder</h1>
          <p>Don't miss these bursary opportunities!</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName}! 🚨</h2>
          <p><strong>URGENT:</strong> ${bursaries.length} bursary deadline${bursaries.length > 1 ? 's are' : ' is'} approaching soon:</p>
          
          ${bursaries.map(bursary => `
            <div class="urgent">
              <h3>⚡ ${bursary.title}</h3>
              <p><strong>🏢 Provider:</strong> ${bursary.provider}</p>
              <p><strong>💰 Amount:</strong> ${bursary.amount}</p>
              <p><strong>⏰ Deadline:</strong> <span class="deadline">${new Date(bursary.applicationDeadline).toLocaleDateString()}</span></p>
              <p><strong>⏳ Days Left:</strong> ${Math.ceil((new Date(bursary.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p>
              ${bursary.applicationUrl ? `<a href="${bursary.applicationUrl}" class="cta">Apply Now - Don't Wait!</a>` : ''}
            </div>
          `).join('')}
          
          <p><strong>Action Required:</strong> Apply immediately to secure your funding!</p>
          <a href="https://apply4me-eta.vercel.app/bursaries" class="cta">View All Opportunities</a>
        </div>
        
        <div class="footer">
          <p>© 2025 Apply4Me - Your Gateway to South African Higher Education</p>
          <p>⚡ Time is running out - Apply today!</p>
        </div>
      </body>
      </html>
    `
    
    const text = `
      URGENT: Bursary Deadlines Approaching - Apply4Me
      
      Hi ${userName}!
      
      URGENT: ${bursaries.length} bursary deadline${bursaries.length > 1 ? 's are' : ' is'} approaching soon:
      
      ${bursaries.map(bursary => `
        ${bursary.title}
        Provider: ${bursary.provider}
        Amount: ${bursary.amount}
        Deadline: ${new Date(bursary.applicationDeadline).toLocaleDateString()}
        Days Left: ${Math.ceil((new Date(bursary.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
        ${bursary.applicationUrl ? `Apply: ${bursary.applicationUrl}` : ''}
      `).join('\n')}
      
      Apply immediately: https://apply4me-eta.vercel.app/bursaries
      
      © 2025 Apply4Me - Time is running out - Apply today!
    `

    return { subject, html, text }
  }

  /**
   * Generate weekly digest template
   */
  private generateWeeklyDigestTemplate(userName: string, data: any): EmailTemplate {
    const subject = `📊 Your Weekly Apply4Me Digest`
    
    // Implementation for weekly digest...
    const html = `<h1>Weekly Digest for ${userName}</h1>`
    const text = `Weekly Digest for ${userName}`
    
    return { subject, html, text }
  }

  /**
   * Send email using email service
   */
  private async sendEmail(params: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<boolean> {
    try {
      // For demo purposes, log the email
      console.log(`📧 Sending email to ${params.to}`)
      console.log(`Subject: ${params.subject}`)
      
      // In production, integrate with email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Postmark
      
      /*
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: params.to }]
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          subject: params.subject,
          content: [
            { type: 'text/html', value: params.html },
            { type: 'text/plain', value: params.text }
          ]
        })
      })
      
      return response.ok
      */
      
      return true // Mock success
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }
}
