/**
 * Email Notification Service — powered by Resend
 * Sends real transactional emails for bursary alerts, deadline reminders, and digests
 */

import { Resend } from 'resend'
import { ScrapedInstitution } from '../scrapers/institution-scraper'
import { ScrapedBursary } from '../scrapers/bursary-scraper'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Apply4Me <notifications@apply4me.co.za>'
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://apply4me-eta.vercel.app'

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
  /**
   * Send new institution notification
   */
  async sendNewInstitutionAlert(
    userEmail: string,
    userName: string,
    institutions: ScrapedInstitution[]
  ): Promise<boolean> {
    const template = this.generateNewInstitutionTemplate(userName, institutions)
    return this.sendEmail({ to: userEmail, ...template })
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
    return this.sendEmail({ to: userEmail, ...template })
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
    return this.sendEmail({ to: userEmail, ...template })
  }

  /**
   * Send weekly digest email
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
    return this.sendEmail({ to: userEmail, ...template })
  }

  /**
   * Send application confirmation email
   */
  async sendApplicationConfirmation(
    userEmail: string,
    userName: string,
    data: {
      institutionName: string
      programName?: string
      applicationId: string
      amount: number
      serviceType: string
    }
  ): Promise<boolean> {
    const subject = `✅ Application Submitted — ${data.institutionName}`
    const html = this.baseLayout({
      preheader: `Your Apply4Me application to ${data.institutionName} has been submitted.`,
      header: '✅ Application Submitted!',
      headerSubtitle: 'We have received your application',
      accentColor: '#10b981',
      body: `
        <p style="margin:0 0 16px">Hi <strong>${userName}</strong> 👋</p>
        <p style="margin:0 0 16px">
          Your application to <strong>${data.institutionName}</strong> has been successfully received by Apply4Me.
          We will verify your payment and process your application within <strong>1–2 business days</strong>.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="color:#6b7280;padding:4px 0">Institution</td><td style="font-weight:600;text-align:right">${data.institutionName}</td></tr>
            ${data.programName ? `<tr><td style="color:#6b7280;padding:4px 0">Programme</td><td style="font-weight:600;text-align:right">${data.programName}</td></tr>` : ''}
            <tr><td style="color:#6b7280;padding:4px 0">Service</td><td style="font-weight:600;text-align:right">${data.serviceType}</td></tr>
            <tr><td style="color:#6b7280;padding:4px 0">Amount</td><td style="font-weight:600;text-align:right;color:#10b981">R${data.amount}</td></tr>
            <tr><td style="color:#6b7280;padding:4px 0">Reference</td><td style="font-weight:600;text-align:right;font-size:12px;color:#9ca3af">${data.applicationId}</td></tr>
          </table>
        </div>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
          You will receive another email once your payment has been verified and your application submitted to the institution.
        </p>
        ${this.ctaButton('View My Applications', `${SITE_URL}/applications`, '#10b981')}
      `
    })

    const text = `Hi ${userName}!\n\nYour application to ${data.institutionName} has been submitted.\n\nReference: ${data.applicationId}\nAmount: R${data.amount}\n\nWe will contact you within 1-2 business days.\n\nView applications: ${SITE_URL}/applications`
    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  /**
   * Send payment verified email
   */
  async sendPaymentVerified(
    userEmail: string,
    userName: string,
    data: {
      institutionName: string
      amount: number
      paymentReference: string
      applicationId: string
    }
  ): Promise<boolean> {
    const subject = `🎉 Payment Verified — Your application is being processed`
    const html = this.baseLayout({
      preheader: `Great news! Your payment of R${data.amount} has been verified.`,
      header: '🎉 Payment Verified!',
      headerSubtitle: 'Your application is moving forward',
      accentColor: '#10b981',
      body: `
        <p style="margin:0 0 16px">Hi <strong>${userName}</strong>! 🌟</p>
        <p style="margin:0 0 16px">
          Great news! Your payment of <strong>R${data.amount}</strong> for your application to 
          <strong>${data.institutionName}</strong> has been verified and your application is now being 
          submitted to the institution.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="color:#6b7280;padding:4px 0">Institution</td><td style="font-weight:600;text-align:right">${data.institutionName}</td></tr>
            <tr><td style="color:#6b7280;padding:4px 0">Amount</td><td style="font-weight:600;text-align:right;color:#10b981">R${data.amount}</td></tr>
            <tr><td style="color:#6b7280;padding:4px 0">Payment Ref</td><td style="font-weight:600;text-align:right;font-size:12px">${data.paymentReference}</td></tr>
          </table>
        </div>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
          The institution will contact you directly about the next steps in the admissions process. 
          You can track your application status in your dashboard.
        </p>
        ${this.ctaButton('Track My Application', `${SITE_URL}/applications`, '#10b981')}
      `
    })

    const text = `Hi ${userName}!\n\nYour payment of R${data.amount} for ${data.institutionName} has been verified!\n\nPayment Reference: ${data.paymentReference}\n\nTrack application: ${SITE_URL}/applications`
    return this.sendEmail({ to: userEmail, subject, html, text })
  }

  // ─── Private Template Generators ────────────────────────────────────────

  private generateNewInstitutionTemplate(userName: string, institutions: ScrapedInstitution[]): EmailTemplate {
    const subject = `🎓 ${institutions.length} New Institution${institutions.length > 1 ? 's' : ''} — Apply Now`
    const institutionsHtml = institutions.map(inst => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0">
        <h3 style="margin:0 0 8px;color:#10b981;font-size:16px">${inst.name}</h3>
        <p style="margin:0 0 4px;color:#6b7280;font-size:14px">📍 ${inst.location} &nbsp;·&nbsp; 🎯 ${inst.type.charAt(0).toUpperCase() + inst.type.slice(1)}</p>
        ${inst.applicationFee ? `<p style="margin:4px 0;font-size:14px">💰 Application Fee: <strong>R${inst.applicationFee}</strong></p>` : ''}
        ${inst.applicationDeadline ? `<p style="margin:4px 0;font-size:14px">⏰ Deadline: <strong>${new Date(inst.applicationDeadline).toLocaleDateString('en-ZA')}</strong></p>` : ''}
        ${inst.description ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280">${inst.description.substring(0, 150)}...</p>` : ''}
        ${inst.website ? `<a href="${inst.website}" style="display:inline-block;margin-top:10px;font-size:13px;color:#10b981">Visit Website →</a>` : ''}
      </div>
    `).join('')

    const html = this.baseLayout({
      preheader: `${institutions.length} new institutions just discovered on Apply4Me!`,
      header: '🎓 New Educational Opportunities',
      headerSubtitle: 'Fresh institutions discovered just for you',
      accentColor: '#10b981',
      body: `
        <p style="margin:0 0 16px">Hi <strong>${userName}</strong> 👋</p>
        <p style="margin:0 0 20px">
          We've discovered <strong>${institutions.length} new educational institution${institutions.length > 1 ? 's' : ''}</strong> that might interest you:
        </p>
        ${institutionsHtml}
        <p style="margin:24px 0 8px;color:#6b7280;font-size:14px">Ready to take the next step in your education journey?</p>
        ${this.ctaButton('View All Institutions', `${SITE_URL}/institutions`, '#10b981')}
      `
    })

    const text = `Hi ${userName}!\n\nWe found ${institutions.length} new institution${institutions.length > 1 ? 's' : ''} for you:\n\n` +
      institutions.map(i => `• ${i.name} — ${i.location}`).join('\n') +
      `\n\nView all: ${SITE_URL}/institutions`

    return { subject, html, text }
  }

  private generateNewBursaryTemplate(userName: string, bursaries: ScrapedBursary[]): EmailTemplate {
    const subject = `💰 ${bursaries.length} New Bursary Opportunit${bursaries.length > 1 ? 'ies' : 'y'} — Apply Soon`
    const bursariesHtml = bursaries.map(b => `
      <div style="border:1px solid #fde68a;border-radius:8px;padding:16px;margin:12px 0;background:#fffbeb">
        <h3 style="margin:0 0 8px;color:#d97706;font-size:16px">${b.title}</h3>
        <p style="margin:0 0 4px;font-size:14px">🏢 <strong>${b.provider}</strong></p>
        <p style="margin:0 0 4px;font-size:14px">💰 Amount: <strong>${typeof b.amount === 'number' ? `R${b.amount.toLocaleString()}` : b.amount}</strong></p>
        <p style="margin:0 0 4px;font-size:14px">📚 Fields: ${b.fieldOfStudy.slice(0, 3).join(', ')}</p>
        ${b.applicationDeadline ? `<p style="margin:0 0 8px;font-size:14px">⏰ Deadline: <strong style="color:#dc2626">${new Date(b.applicationDeadline).toLocaleDateString('en-ZA')}</strong></p>` : ''}
        ${b.applicationUrl ? `<a href="${b.applicationUrl}" style="display:inline-block;background:#d97706;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600">Apply Now →</a>` : ''}
      </div>
    `).join('')

    const html = this.baseLayout({
      preheader: `${bursaries.length} new bursaries now available — don't miss the deadlines!`,
      header: '💰 New Bursary Opportunities',
      headerSubtitle: 'Funding to support your education journey',
      accentColor: '#d97706',
      body: `
        <p style="margin:0 0 16px">Hi <strong>${userName}</strong> 🌟</p>
        <p style="margin:0 0 20px">
          We found <strong>${bursaries.length} new bursary opportunit${bursaries.length > 1 ? 'ies' : 'y'}</strong> that could fund your education:
        </p>
        ${bursariesHtml}
        <p style="margin:24px 0 8px;color:#6b7280;font-size:14px">Don't miss out — bursary applications close fast!</p>
        ${this.ctaButton('View All Bursaries', `${SITE_URL}/bursaries`, '#d97706')}
      `
    })

    const text = `Hi ${userName}!\n\nWe found ${bursaries.length} new bursaries:\n\n` +
      bursaries.map(b => `• ${b.title} (${b.provider}) — ${typeof b.amount === 'number' ? `R${b.amount.toLocaleString()}` : b.amount}`).join('\n') +
      `\n\nView all: ${SITE_URL}/bursaries`

    return { subject, html, text }
  }

  private generateDeadlineReminderTemplate(userName: string, bursaries: ScrapedBursary[]): EmailTemplate {
    const subject = `⏰ Urgent: ${bursaries.length} Bursary Deadline${bursaries.length > 1 ? 's' : ''} Closing Soon`
    const urgentHtml = bursaries.map(b => {
      const daysLeft = Math.ceil((new Date(b.applicationDeadline).getTime() - Date.now()) / 86400000)
      const urgencyColor = daysLeft <= 7 ? '#dc2626' : '#d97706'
      return `
        <div style="border:2px solid ${urgencyColor};border-radius:8px;padding:16px;margin:12px 0;background:#fef2f2">
          <h3 style="margin:0 0 8px;color:${urgencyColor};font-size:16px">⚡ ${b.title}</h3>
          <p style="margin:0 0 4px;font-size:14px">🏢 ${b.provider}</p>
          <p style="margin:0 0 4px;font-size:14px">💰 ${typeof b.amount === 'number' ? `R${b.amount.toLocaleString()}` : b.amount}</p>
          <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${urgencyColor}">
            ⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left — closes ${new Date(b.applicationDeadline).toLocaleDateString('en-ZA')}
          </p>
          ${b.applicationUrl ? `<a href="${b.applicationUrl}" style="display:inline-block;background:${urgencyColor};color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700">Apply Immediately →</a>` : ''}
        </div>
      `
    }).join('')

    const html = this.baseLayout({
      preheader: `Action required: bursary deadlines are closing in the next 30 days.`,
      header: '⏰ Deadline Reminder',
      headerSubtitle: "Don't miss these bursary opportunities!",
      accentColor: '#dc2626',
      body: `
        <p style="margin:0 0 16px">Hi <strong>${userName}</strong> 🚨</p>
        <p style="margin:0 0 20px">
          <strong>Urgent:</strong> You have ${bursaries.length} bursary deadline${bursaries.length > 1 ? 's' : ''} approaching:
        </p>
        ${urgentHtml}
        <p style="margin:24px 0 8px;font-weight:600;color:#dc2626">⚠️ Apply now — every day counts!</p>
        ${this.ctaButton('View All Bursaries', `${SITE_URL}/bursaries`, '#dc2626')}
      `
    })

    const text = `Hi ${userName}!\n\nURGENT — ${bursaries.length} bursary deadline${bursaries.length > 1 ? 's' : ''} closing soon:\n\n` +
      bursaries.map(b => {
        const d = Math.ceil((new Date(b.applicationDeadline).getTime() - Date.now()) / 86400000)
        return `• ${b.title} — ${d} days left (${b.applicationDeadline})`
      }).join('\n') +
      `\n\nApply now: ${SITE_URL}/bursaries`

    return { subject, html, text }
  }

  private generateWeeklyDigestTemplate(userName: string, data: {
    newInstitutions: ScrapedInstitution[]
    newBursaries: ScrapedBursary[]
    upcomingDeadlines: ScrapedBursary[]
  }): EmailTemplate {
    const subject = `📊 Your Weekly Apply4Me Digest — ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}`

    const institutionsSection = data.newInstitutions.length > 0 ? `
      <h3 style="margin:24px 0 12px;color:#10b981;font-size:16px">🎓 New Institutions (${data.newInstitutions.length})</h3>
      ${data.newInstitutions.slice(0, 5).map(i => `
        <div style="padding:10px 0;border-bottom:1px solid #f3f4f6">
          <strong>${i.name}</strong> &nbsp;·&nbsp; <span style="color:#6b7280;font-size:13px">${i.location}</span>
          ${i.applicationDeadline ? `<span style="float:right;font-size:12px;color:#dc2626">Closes ${new Date(i.applicationDeadline).toLocaleDateString('en-ZA')}</span>` : ''}
        </div>
      `).join('')}
      ${data.newInstitutions.length > 5 ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280">+${data.newInstitutions.length - 5} more institutions on the site</p>` : ''}
    ` : ''

    const bursariesSection = data.newBursaries.length > 0 ? `
      <h3 style="margin:24px 0 12px;color:#d97706;font-size:16px">💰 New Bursaries (${data.newBursaries.length})</h3>
      ${data.newBursaries.slice(0, 5).map(b => `
        <div style="padding:10px 0;border-bottom:1px solid #f3f4f6">
          <strong>${b.title}</strong> &nbsp;·&nbsp; <span style="color:#d97706;font-size:13px">${typeof b.amount === 'number' ? `R${b.amount.toLocaleString()}` : b.amount}</span>
          ${b.applicationDeadline ? `<span style="float:right;font-size:12px;color:#dc2626">Closes ${new Date(b.applicationDeadline).toLocaleDateString('en-ZA')}</span>` : ''}
        </div>
      `).join('')}
    ` : ''

    const deadlinesSection = data.upcomingDeadlines.length > 0 ? `
      <h3 style="margin:24px 0 12px;color:#dc2626;font-size:16px">⏰ Upcoming Deadlines (${data.upcomingDeadlines.length})</h3>
      ${data.upcomingDeadlines.slice(0, 5).map(b => {
      const d = Math.ceil((new Date(b.applicationDeadline).getTime() - Date.now()) / 86400000)
      return `
          <div style="padding:10px 0;border-bottom:1px solid #f3f4f6">
            <strong>${b.title}</strong>
            <span style="float:right;font-size:12px;color:${d <= 14 ? '#dc2626' : '#6b7280'};font-weight:600">${d} days left</span>
          </div>
        `
    }).join('')}
    ` : ''

    const noContent = !institutionsSection && !bursariesSection && !deadlinesSection
    const body = noContent
      ? `<p>Hi <strong>${userName}</strong>! 👋</p><p style="color:#6b7280">No new opportunities this week — but check the site regularly, new bursaries and institutions are added daily!</p>`
      : `<p style="margin:0 0 20px">Hi <strong>${userName}</strong>! 👋 Here's your weekly summary:</p>${institutionsSection}${bursariesSection}${deadlinesSection}`

    const html = this.baseLayout({
      preheader: `Your weekly Apply4Me summary — ${data.newInstitutions.length} institutions, ${data.newBursaries.length} bursaries, ${data.upcomingDeadlines.length} upcoming deadlines.`,
      header: '📊 Weekly Digest',
      headerSubtitle: `Week of ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      accentColor: '#3b82f6',
      body: `${body}<div style="margin-top:32px">${this.ctaButton('Open Apply4Me Dashboard', `${SITE_URL}/dashboard`, '#3b82f6')}</div>`
    })

    const text = `Weekly Apply4Me Digest\n\nHi ${userName}!\n\nNew institutions: ${data.newInstitutions.length}\nNew bursaries: ${data.newBursaries.length}\nUpcoming deadlines: ${data.upcomingDeadlines.length}\n\nView dashboard: ${SITE_URL}/dashboard`
    return { subject, html, text }
  }

  // ─── Layout Helpers ───────────────────────────────────────────────────────

  private baseLayout(opts: {
    preheader: string
    header: string
    headerSubtitle: string
    accentColor: string
    body: string
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.header}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${opts.preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,${opts.accentColor},#1d4ed8);border-radius:12px 12px 0 0;padding:32px 32px 24px;text-align:center">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Apply4Me</p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff">${opts.header}</h1>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85)">${opts.headerSubtitle}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px">
          ${opts.body}

          <!-- Footer -->
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 24px">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
            © ${new Date().getFullYear()} Apply4Me &nbsp;·&nbsp; Empowering South African students 🇿🇦<br>
            <a href="${SITE_URL}/dashboard" style="color:#9ca3af">Dashboard</a> &nbsp;·&nbsp;
            <a href="${SITE_URL}/bursaries" style="color:#9ca3af">Bursaries</a> &nbsp;·&nbsp;
            <a href="${SITE_URL}/institutions" style="color:#9ca3af">Institutions</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
  }

  private ctaButton(label: string, url: string, color: string): string {
    return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px">${label}</a>`
  }

  // ─── Real Email Sending via Resend ────────────────────────────────────────

  private async sendEmail(params: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text
      })

      if (error) {
        console.error(`❌ Resend error sending to ${params.to}:`, error)
        return false
      }

      console.log(`✅ Email sent to ${params.to} — ID: ${data?.id} — Subject: ${params.subject}`)
      return true
    } catch (err) {
      console.error(`❌ Exception sending email to ${params.to}:`, err)
      return false
    }
  }
}
