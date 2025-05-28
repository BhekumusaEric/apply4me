/**
 * Automated Scheduling System
 * Handles periodic data updates and notifications
 */

import { InstitutionScraper, ScrapedInstitution } from '../scrapers/institution-scraper'
import { BursaryScraper, ScrapedBursary } from '../scrapers/bursary-scraper'
import { ProgramScraper, ScrapedProgram } from '../scrapers/program-scraper'
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
  private programScraper: ProgramScraper
  private emailService: EmailNotificationService
  private supabase: any

  constructor() {
    this.institutionScraper = new InstitutionScraper()
    this.bursaryScraper = new BursaryScraper()
    this.programScraper = new ProgramScraper()
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
      // First clean up any existing duplicates
      console.log('🧹 Cleaning up duplicate institutions...')
      const duplicatesRemoved = await this.cleanupDuplicateInstitutions()
      if (duplicatesRemoved > 0) {
        console.log(`🗑️ Removed ${duplicatesRemoved} duplicate institutions`)
      }

      // Scrape for new institutions
      const scrapedInstitutions = await this.institutionScraper.scrapeAllSources()
      console.log(`🔍 Found ${scrapedInstitutions.length} institutions`)

      // Filter out existing institutions
      const newInstitutions = await this.filterNewInstitutions(scrapedInstitutions)
      console.log(`✨ ${newInstitutions.length} new institutions discovered`)

      // Save new institutions to database and scrape their programs
      let savedCount = 0
      let programsCount = 0
      for (const institution of newInstitutions) {
        const saved = await this.saveInstitution(institution)
        if (saved) {
          savedCount++

          // Scrape and save programs for this institution
          const programs = await this.programScraper.scrapeInstitutionPrograms(
            institution.name, // We'll use name as temp ID, will be replaced with actual DB ID
            institution.name
          )

          if (programs.length > 0) {
            // Get the actual institution ID from database
            const { data: savedInstitution } = await this.supabase
              .from('institutions')
              .select('id')
              .eq('name', institution.name)
              .eq('province', institution.location)
              .single()

            if (savedInstitution) {
              // Update programs with correct institution ID and save them
              for (const program of programs) {
                program.institutionId = savedInstitution.id
                const programSaved = await this.saveProgram(program)
                if (programSaved) programsCount++
              }
            }
          }
        }
      }

      console.log(`🎓 Programs discovery: ${programsCount} programs saved for ${savedCount} institutions`)

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
      // First clean up any existing duplicates
      console.log('🧹 Cleaning up duplicate bursaries...')
      const duplicatesRemoved = await this.cleanupDuplicateBursaries()
      if (duplicatesRemoved > 0) {
        console.log(`🗑️ Removed ${duplicatesRemoved} duplicate bursaries`)
      }

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
      // Extract province from location (e.g., "Cape Town, Western Cape" -> "Western Cape")
      const extractedProvince = this.extractProvinceFromLocation(institution.location)

      // Check for duplicates using multiple criteria
      const isDuplicate = await this.checkInstitutionDuplicate(institution.name, extractedProvince)

      if (!isDuplicate) {
        newInstitutions.push(institution)
      } else {
        console.log(`🔄 Skipping duplicate institution: ${institution.name} (${extractedProvince})`)
      }
    }

    return newInstitutions
  }

  /**
   * Extract province from location string
   */
  private extractProvinceFromLocation(location: string): string {
    // Handle various location formats
    const provinces = [
      'Western Cape', 'Eastern Cape', 'Northern Cape',
      'Gauteng', 'KwaZulu-Natal', 'Free State',
      'Limpopo', 'Mpumalanga', 'North West'
    ]

    // Find province in location string
    for (const province of provinces) {
      if (location.toLowerCase().includes(province.toLowerCase())) {
        return province
      }
    }

    // If no province found, return the location as is
    return location
  }

  /**
   * Check if institution already exists in database
   */
  private async checkInstitutionDuplicate(name: string, province: string): Promise<boolean> {
    try {
      // Check exact name match first
      const { data: exactMatch } = await this.supabase
        .from('institutions')
        .select('id, name, province')
        .eq('name', name)
        .single()

      if (exactMatch) {
        return true
      }

      // Check similar name with same province
      const { data: similarMatches } = await this.supabase
        .from('institutions')
        .select('id, name, province')
        .eq('province', province)

      if (similarMatches) {
        for (const match of similarMatches) {
          // Check for similar names (fuzzy matching)
          if (this.areInstitutionNamesSimilar(name, match.name)) {
            console.log(`🔍 Found similar institution: "${name}" vs "${match.name}"`)
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking institution duplicate:', error)
      return false
    }
  }

  /**
   * Check if two institution names are similar (fuzzy matching)
   */
  private areInstitutionNamesSimilar(name1: string, name2: string): boolean {
    const normalize = (str: string) => str.toLowerCase()
      .replace(/university|college|tvet|of|the|and/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const normalized1 = normalize(name1)
    const normalized2 = normalize(name2)

    // Check if one name contains the other
    return normalized1.includes(normalized2) || normalized2.includes(normalized1)
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
        .eq('name', bursary.title) // Fixed: title -> name
        .eq('provider', bursary.provider)
        .single()

      if (!existing) {
        newBursaries.push(bursary)
      } else {
        console.log(`🔄 Skipping duplicate bursary: ${bursary.title}`)
      }
    }

    return newBursaries
  }

  /**
   * Save institution to database
   */
  private async saveInstitution(institution: ScrapedInstitution): Promise<boolean> {
    try {
      console.log('💾 Saving institution:', institution.name)

      // Extract proper province from location
      const extractedProvince = this.extractProvinceFromLocation(institution.location)

      const { error } = await this.supabase
        .from('institutions')
        .insert({
          id: crypto.randomUUID(),
          name: institution.name,
          type: institution.type,
          province: extractedProvince, // Use extracted province
          website_url: institution.website, // website -> website_url
          description: institution.description,
          application_fee: institution.applicationFee || 0,
          required_documents: institution.requirements || [], // requirements -> required_documents
          contact_email: institution.contactInfo?.email,
          contact_phone: institution.contactInfo?.phone,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error saving institution:', error)
        return false
      }

      console.log('✅ Institution saved successfully:', institution.name, `(${extractedProvince})`)
      return true
    } catch (error) {
      console.error('❌ Exception saving institution:', error)
      return false
    }
  }

  /**
   * Save program to database
   */
  private async saveProgram(program: ScrapedProgram): Promise<boolean> {
    try {
      console.log('🎓 Saving program:', program.name)
      const { error } = await this.supabase
        .from('programs')
        .insert({
          id: crypto.randomUUID(),
          institution_id: program.institutionId,
          name: program.name,
          field_of_study: program.fieldOfStudy,
          qualification_type: program.qualificationLevel, // qualification_level -> qualification_type
          duration: `${program.durationYears} years`,
          requirements: program.requirements || [],
          career_outcomes: program.careerOutcomes || [],
          is_popular: program.isPopular || false,
          is_available: program.isAvailable !== false, // Default to true
          application_deadline: program.applicationDeadline,
          available_spots: program.availableSpots,
          application_fee: program.applicationFee,
          description: program.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error saving program:', error)
        return false
      }

      console.log('✅ Program saved successfully:', program.name)
      return true
    } catch (error) {
      console.error('❌ Exception saving program:', error)
      return false
    }
  }

  /**
   * Save bursary to database
   */
  private async saveBursary(bursary: ScrapedBursary): Promise<boolean> {
    try {
      console.log('💾 Saving bursary:', bursary.title)
      const { error } = await this.supabase
        .from('bursaries')
        .insert({
          id: crypto.randomUUID(), // Generate proper UUID instead of using bursary.id
          name: bursary.title, // title -> name
          provider: bursary.provider,
          type: 'national', // Default type
          field_of_study: bursary.fieldOfStudy || [],
          eligibility_criteria: bursary.eligibility || [], // eligibility -> eligibility_criteria
          amount: typeof bursary.amount === 'number' ? bursary.amount : 0,
          application_deadline: bursary.applicationDeadline,
          application_url: bursary.applicationUrl,
          description: bursary.description,
          is_active: bursary.isActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error saving bursary:', error)
        return false
      }

      console.log('✅ Bursary saved successfully:', bursary.title)
      return true
    } catch (error) {
      console.error('❌ Exception saving bursary:', error)
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

  /**
   * Clean up duplicate institutions
   */
  private async cleanupDuplicateInstitutions(): Promise<number> {
    try {
      // Get all institutions grouped by name and province
      const { data: institutions } = await this.supabase
        .from('institutions')
        .select('id, name, province, created_at')
        .order('created_at', { ascending: true })

      if (!institutions) return 0

      const duplicatesRemoved = new Set<string>()
      const seen = new Map<string, any>()

      for (const institution of institutions) {
        const key = `${institution.name.toLowerCase()}-${institution.province.toLowerCase()}`

        if (seen.has(key)) {
          // This is a duplicate, remove it
          const { error } = await this.supabase
            .from('institutions')
            .delete()
            .eq('id', institution.id)

          if (!error) {
            duplicatesRemoved.add(institution.id)
            console.log(`🗑️ Removed duplicate institution: ${institution.name}`)
          }
        } else {
          seen.set(key, institution)
        }
      }

      return duplicatesRemoved.size
    } catch (error) {
      console.error('Error cleaning up duplicate institutions:', error)
      return 0
    }
  }

  /**
   * Clean up duplicate bursaries
   */
  private async cleanupDuplicateBursaries(): Promise<number> {
    try {
      // Get all bursaries grouped by name and provider
      const { data: bursaries } = await this.supabase
        .from('bursaries')
        .select('id, name, provider, created_at')
        .order('created_at', { ascending: true })

      if (!bursaries) return 0

      const duplicatesRemoved = new Set<string>()
      const seen = new Map<string, any>()

      for (const bursary of bursaries) {
        const key = `${bursary.name.toLowerCase()}-${bursary.provider.toLowerCase()}`

        if (seen.has(key)) {
          // This is a duplicate, remove it
          const { error } = await this.supabase
            .from('bursaries')
            .delete()
            .eq('id', bursary.id)

          if (!error) {
            duplicatesRemoved.add(bursary.id)
            console.log(`🗑️ Removed duplicate bursary: ${bursary.name}`)
          }
        } else {
          seen.set(key, bursary)
        }
      }

      return duplicatesRemoved.size
    } catch (error) {
      console.error('Error cleaning up duplicate bursaries:', error)
      return 0
    }
  }
}
