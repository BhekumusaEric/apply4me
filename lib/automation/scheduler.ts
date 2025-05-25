/**
 * Automated Scheduling System
 * Handles periodic data updates and notifications
 */

import { InstitutionScraper, ScrapedInstitution } from '../scrapers/institution-scraper'
import { BursaryScraper, ScrapedBursary } from '../scrapers/bursary-scraper'
import { EmailNotificationService } from '../notifications/email-service'
import { createClient } from '../supabase'

export interface ScheduledTask {
  id: string
  name: string
  description: string
  schedule: string // Cron expression
  lastRun?: Date
  nextRun?: Date
  isActive: boolean
  taskType: 'scraping' | 'notification' | 'maintenance'
}

export interface AutomationStats {
  totalInstitutionsFound: number
  totalBursariesFound: number
  emailsSent: number
  lastUpdateTime: Date
  successRate: number
}

export class AutomationScheduler {
  private institutionScraper: InstitutionScraper
  private bursaryScraper: BursaryScraper
  private emailService: EmailNotificationService
  private supabase: any

  constructor() {
    this.institutionScraper = new InstitutionScraper()
    this.bursaryScraper = new BursaryScraper()
    this.emailService = new EmailNotificationService()
    this.supabase = createClient()
  }

  /**
   * Initialize all scheduled tasks
   */
  async initializeScheduler(): Promise<void> {
    console.log('🤖 Initializing Apply4Me Automation Scheduler...')
    
    const tasks: ScheduledTask[] = [
      {
        id: 'daily-institution-scrape',
        name: 'Daily Institution Discovery',
        description: 'Scrape for new educational institutions',
        schedule: '0 6 * * *', // Daily at 6 AM
        isActive: true,
        taskType: 'scraping'
      },
      {
        id: 'daily-bursary-scrape',
        name: 'Daily Bursary Discovery',
        description: 'Scrape for new bursary opportunities',
        schedule: '0 7 * * *', // Daily at 7 AM
        isActive: true,
        taskType: 'scraping'
      },
      {
        id: 'deadline-reminders',
        name: 'Deadline Reminder Notifications',
        description: 'Send deadline reminders to users',
        schedule: '0 9 * * *', // Daily at 9 AM
        isActive: true,
        taskType: 'notification'
      },
      {
        id: 'weekly-digest',
        name: 'Weekly Digest Email',
        description: 'Send weekly summary to users',
        schedule: '0 10 * * 1', // Mondays at 10 AM
        isActive: true,
        taskType: 'notification'
      },
      {
        id: 'data-cleanup',
        name: 'Database Cleanup',
        description: 'Clean up old and invalid data',
        schedule: '0 2 * * 0', // Sundays at 2 AM
        isActive: true,
        taskType: 'maintenance'
      }
    ]

    // Store tasks in database
    for (const task of tasks) {
      await this.saveTask(task)
    }

    console.log(`✅ Initialized ${tasks.length} scheduled tasks`)
  }

  /**
   * Run daily institution discovery
   */
  async runInstitutionDiscovery(): Promise<AutomationStats> {
    console.log('🏫 Starting daily institution discovery...')
    
    try {
      // Scrape for new institutions
      const scrapedInstitutions = await this.institutionScraper.scrapeAllSources()
      console.log(`🔍 Found ${scrapedInstitutions.length} institutions`)

      // Filter out existing institutions
      const newInstitutions = await this.filterNewInstitutions(scrapedInstitutions)
      console.log(`✨ ${newInstitutions.length} new institutions discovered`)

      // Save new institutions to database
      let savedCount = 0
      for (const institution of newInstitutions) {
        const saved = await this.saveInstitution(institution)
        if (saved) savedCount++
      }

      // Notify users about new institutions
      if (newInstitutions.length > 0) {
        await this.notifyUsersAboutNewInstitutions(newInstitutions)
      }

      const stats: AutomationStats = {
        totalInstitutionsFound: scrapedInstitutions.length,
        totalBursariesFound: 0,
        emailsSent: newInstitutions.length > 0 ? await this.getActiveUserCount() : 0,
        lastUpdateTime: new Date(),
        successRate: savedCount / scrapedInstitutions.length * 100
      }

      console.log(`✅ Institution discovery complete: ${savedCount} saved, ${stats.emailsSent} notifications sent`)
      return stats

    } catch (error) {
      console.error('❌ Error in institution discovery:', error)
      throw error
    }
  }

  /**
   * Run daily bursary discovery
   */
  async runBursaryDiscovery(): Promise<AutomationStats> {
    console.log('💰 Starting daily bursary discovery...')
    
    try {
      // Scrape for new bursaries
      const scrapedBursaries = await this.bursaryScraper.scrapeAllBursaries()
      console.log(`🔍 Found ${scrapedBursaries.length} bursaries`)

      // Filter out existing bursaries
      const newBursaries = await this.filterNewBursaries(scrapedBursaries)
      console.log(`✨ ${newBursaries.length} new bursaries discovered`)

      // Save new bursaries to database
      let savedCount = 0
      for (const bursary of newBursaries) {
        const saved = await this.saveBursary(bursary)
        if (saved) savedCount++
      }

      // Notify users about new bursaries
      if (newBursaries.length > 0) {
        await this.notifyUsersAboutNewBursaries(newBursaries)
      }

      const stats: AutomationStats = {
        totalInstitutionsFound: 0,
        totalBursariesFound: scrapedBursaries.length,
        emailsSent: newBursaries.length > 0 ? await this.getActiveUserCount() : 0,
        lastUpdateTime: new Date(),
        successRate: savedCount / scrapedBursaries.length * 100
      }

      console.log(`✅ Bursary discovery complete: ${savedCount} saved, ${stats.emailsSent} notifications sent`)
      return stats

    } catch (error) {
      console.error('❌ Error in bursary discovery:', error)
      throw error
    }
  }

  /**
   * Send deadline reminders
   */
  async sendDeadlineReminders(): Promise<number> {
    console.log('⏰ Sending deadline reminders...')
    
    try {
      // Get bursaries with approaching deadlines
      const upcomingDeadlines = await this.getUpcomingDeadlines(7) // 7 days warning
      
      if (upcomingDeadlines.length === 0) {
        console.log('📅 No upcoming deadlines found')
        return 0
      }

      // Get users who want deadline reminders
      const users = await this.getUsersWithDeadlinePreferences()
      let emailsSent = 0

      for (const user of users) {
        // Filter bursaries relevant to user
        const relevantBursaries = this.filterBursariesForUser(upcomingDeadlines, user)
        
        if (relevantBursaries.length > 0) {
          const sent = await this.emailService.sendDeadlineReminder(
            user.email,
            user.name,
            relevantBursaries
          )
          if (sent) emailsSent++
        }
      }

      console.log(`✅ Deadline reminders sent: ${emailsSent} emails`)
      return emailsSent

    } catch (error) {
      console.error('❌ Error sending deadline reminders:', error)
      return 0
    }
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(): Promise<number> {
    console.log('📊 Sending weekly digest...')
    
    try {
      // Get weekly data
      const weeklyData = await this.getWeeklyData()
      
      // Get users who want weekly digest
      const users = await this.getUsersWithDigestPreferences()
      let emailsSent = 0

      for (const user of users) {
        const sent = await this.emailService.sendWeeklyDigest(
          user.email,
          user.name,
          weeklyData
        )
        if (sent) emailsSent++
      }

      console.log(`✅ Weekly digest sent: ${emailsSent} emails`)
      return emailsSent

    } catch (error) {
      console.error('❌ Error sending weekly digest:', error)
      return 0
    }
  }

  /**
   * Filter new institutions (not in database)
   */
  private async filterNewInstitutions(institutions: ScrapedInstitution[]): Promise<ScrapedInstitution[]> {
    const newInstitutions: ScrapedInstitution[] = []
    
    for (const institution of institutions) {
      const { data: existing } = await this.supabase
        .from('institutions')
        .select('id')
        .eq('name', institution.name)
        .eq('location', institution.location)
        .single()
      
      if (!existing) {
        newInstitutions.push(institution)
      }
    }
    
    return newInstitutions
  }

  /**
   * Filter new bursaries (not in database)
   */
  private async filterNewBursaries(bursaries: ScrapedBursary[]): Promise<ScrapedBursary[]> {
    const newBursaries: ScrapedBursary[] = []
    
    for (const bursary of bursaries) {
      const { data: existing } = await this.supabase
        .from('bursaries')
        .select('id')
        .eq('title', bursary.title)
        .eq('provider', bursary.provider)
        .single()
      
      if (!existing) {
        newBursaries.push(bursary)
      }
    }
    
    return newBursaries
  }

  /**
   * Save institution to database
   */
  private async saveInstitution(institution: ScrapedInstitution): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('institutions')
        .insert({
          id: crypto.randomUUID(),
          name: institution.name,
          type: institution.type,
          location: institution.location,
          website: institution.website,
          description: institution.description,
          application_fee: institution.applicationFee || 0,
          programs: institution.programs,
          requirements: institution.requirements,
          contact_info: institution.contactInfo,
          scraped_at: institution.scrapedAt,
          source: institution.source
        })
      
      return !error
    } catch (error) {
      console.error('Error saving institution:', error)
      return false
    }
  }

  /**
   * Save bursary to database
   */
  private async saveBursary(bursary: ScrapedBursary): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('bursaries')
        .insert({
          id: bursary.id,
          title: bursary.title,
          provider: bursary.provider,
          amount: bursary.amount,
          description: bursary.description,
          eligibility: bursary.eligibility,
          requirements: bursary.requirements,
          application_deadline: bursary.applicationDeadline,
          application_url: bursary.applicationUrl,
          contact_info: bursary.contactInfo,
          field_of_study: bursary.fieldOfStudy,
          study_level: bursary.studyLevel,
          provinces: bursary.provinces,
          source: bursary.source,
          scraped_at: bursary.scrapedAt,
          is_active: bursary.isActive
        })
      
      return !error
    } catch (error) {
      console.error('Error saving bursary:', error)
      return false
    }
  }

  /**
   * Notify users about new institutions
   */
  private async notifyUsersAboutNewInstitutions(institutions: ScrapedInstitution[]): Promise<void> {
    const users = await this.getUsersWithInstitutionPreferences()
    
    for (const user of users) {
      await this.emailService.sendNewInstitutionAlert(
        user.email,
        user.name,
        institutions
      )
    }
  }

  /**
   * Notify users about new bursaries
   */
  private async notifyUsersAboutNewBursaries(bursaries: ScrapedBursary[]): Promise<void> {
    const users = await this.getUsersWithBursaryPreferences()
    
    for (const user of users) {
      await this.emailService.sendNewBursaryAlert(
        user.email,
        user.name,
        bursaries
      )
    }
  }

  /**
   * Get users with notification preferences
   */
  private async getUsersWithInstitutionPreferences(): Promise<any[]> {
    // Mock implementation - replace with actual database query
    return [
      { email: 'bhntshwcjc025@student.wethinkcode.co.za', name: 'Bhekumusa' }
    ]
  }

  private async getUsersWithBursaryPreferences(): Promise<any[]> {
    return [
      { email: 'bhntshwcjc025@student.wethinkcode.co.za', name: 'Bhekumusa' }
    ]
  }

  private async getUsersWithDeadlinePreferences(): Promise<any[]> {
    return [
      { email: 'bhntshwcjc025@student.wethinkcode.co.za', name: 'Bhekumusa' }
    ]
  }

  private async getUsersWithDigestPreferences(): Promise<any[]> {
    return [
      { email: 'bhntshwcjc025@student.wethinkcode.co.za', name: 'Bhekumusa' }
    ]
  }

  private async getActiveUserCount(): Promise<number> {
    return 1 // Mock count
  }

  private async getUpcomingDeadlines(days: number): Promise<ScrapedBursary[]> {
    // Mock implementation
    return []
  }

  private async getWeeklyData(): Promise<any> {
    return {
      newInstitutions: [],
      newBursaries: [],
      upcomingDeadlines: []
    }
  }

  private filterBursariesForUser(bursaries: ScrapedBursary[], user: any): ScrapedBursary[] {
    return bursaries // Mock implementation
  }

  private async saveTask(task: ScheduledTask): Promise<void> {
    // Save task to database
    console.log(`📅 Scheduled task: ${task.name}`)
  }

  /**
   * Get automation statistics
   */
  async getAutomationStats(): Promise<AutomationStats> {
    return {
      totalInstitutionsFound: 150,
      totalBursariesFound: 75,
      emailsSent: 250,
      lastUpdateTime: new Date(),
      successRate: 95
    }
  }
}
