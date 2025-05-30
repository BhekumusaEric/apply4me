import { createClient } from '@/lib/supabase'

export interface DeadlineStatus {
  isOpen: boolean
  isExpired: boolean
  daysRemaining: number
  urgencyLevel: 'expired' | 'urgent' | 'warning' | 'open' | 'future'
  message: string
}

export interface ApplicationWindow {
  isCurrentlyOpen: boolean
  opensAt?: Date
  closesAt?: Date
  nextOpeningDate?: Date
  status: 'open' | 'closed' | 'upcoming' | 'expired'
}

export class DeadlineManager {
  private supabase = createClient()

  /**
   * Check if an application deadline is still valid and open
   */
  checkDeadlineStatus(deadline: string | Date): DeadlineStatus {
    const now = new Date()
    const deadlineDate = new Date(deadline)

    // Calculate days remaining
    const timeDiff = deadlineDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    // Determine status
    if (daysRemaining < 0) {
      return {
        isOpen: false,
        isExpired: true,
        daysRemaining: 0,
        urgencyLevel: 'expired',
        message: `Deadline passed ${Math.abs(daysRemaining)} days ago`
      }
    } else if (daysRemaining === 0) {
      return {
        isOpen: true,
        isExpired: false,
        daysRemaining: 0,
        urgencyLevel: 'urgent',
        message: 'Deadline is TODAY!'
      }
    } else if (daysRemaining <= 3) {
      return {
        isOpen: true,
        isExpired: false,
        daysRemaining,
        urgencyLevel: 'urgent',
        message: `Only ${daysRemaining} days left!`
      }
    } else if (daysRemaining <= 14) {
      return {
        isOpen: true,
        isExpired: false,
        daysRemaining,
        urgencyLevel: 'warning',
        message: `${daysRemaining} days remaining`
      }
    } else if (daysRemaining <= 60) {
      return {
        isOpen: true,
        isExpired: false,
        daysRemaining,
        urgencyLevel: 'open',
        message: `${daysRemaining} days remaining`
      }
    } else {
      return {
        isOpen: true,
        isExpired: false,
        daysRemaining,
        urgencyLevel: 'future',
        message: `Opens in ${daysRemaining} days`
      }
    }
  }

  /**
   * Determine application window status for South African universities
   */
  determineApplicationWindow(institutionName: string, currentDeadline?: string): ApplicationWindow {
    const now = new Date()
    const currentYear = now.getFullYear()

    // Standard SA university application periods
    const applicationPeriods = {
      // Main intake (February start)
      main: {
        opens: new Date(currentYear - 1, 2, 1), // March 1st previous year
        closes: new Date(currentYear - 1, 8, 30), // September 30th previous year
        nextOpens: new Date(currentYear, 2, 1), // March 1st current year
        nextCloses: new Date(currentYear, 8, 30) // September 30th current year
      },
      // Mid-year intake (July start) - limited programs
      midYear: {
        opens: new Date(currentYear, 0, 15), // January 15th
        closes: new Date(currentYear, 3, 30), // April 30th
        nextOpens: new Date(currentYear + 1, 0, 15),
        nextCloses: new Date(currentYear + 1, 3, 30)
      }
    }

    // Check if we have a specific deadline
    if (currentDeadline) {
      const deadlineStatus = this.checkDeadlineStatus(currentDeadline)
      return {
        isCurrentlyOpen: deadlineStatus.isOpen && !deadlineStatus.isExpired,
        closesAt: new Date(currentDeadline),
        status: deadlineStatus.isExpired ? 'expired' : 'open'
      }
    }

    // Check main application period
    const mainPeriod = applicationPeriods.main
    if (now >= mainPeriod.opens && now <= mainPeriod.closes) {
      return {
        isCurrentlyOpen: true,
        opensAt: mainPeriod.opens,
        closesAt: mainPeriod.closes,
        status: 'open'
      }
    }

    // Check if main period has passed
    if (now > mainPeriod.closes) {
      return {
        isCurrentlyOpen: false,
        closesAt: mainPeriod.closes,
        nextOpeningDate: mainPeriod.nextOpens,
        status: 'closed'
      }
    }

    // Check if main period is upcoming
    if (now < mainPeriod.opens) {
      return {
        isCurrentlyOpen: false,
        opensAt: mainPeriod.opens,
        closesAt: mainPeriod.closes,
        status: 'upcoming'
      }
    }

    // Default to closed
    return {
      isCurrentlyOpen: false,
      nextOpeningDate: mainPeriod.nextOpens,
      status: 'closed'
    }
  }

  /**
   * Filter institutions by application availability
   */
  filterOpenInstitutions(institutions: any[]): any[] {
    return institutions.filter(institution => {
      const window = this.determineApplicationWindow(
        institution.name,
        institution.application_deadline
      )
      return window.isCurrentlyOpen
    })
  }

  /**
   * Filter programs by availability and deadlines
   */
  filterOpenPrograms(programs: any[]): any[] {
    return programs.filter(program => {
      // Check if program is marked as available
      if (program.is_available === false) {
        return false
      }

      // Check deadline if exists
      if (program.application_deadline) {
        const deadlineStatus = this.checkDeadlineStatus(program.application_deadline)
        return deadlineStatus.isOpen && !deadlineStatus.isExpired
      }

      // If no specific deadline, assume it follows standard university calendar
      return true
    })
  }

  /**
   * Filter bursaries by deadline and active status
   */
  filterActiveBursaries(bursaries: any[]): any[] {
    return bursaries.filter(bursary => {
      // Check if bursary is marked as active
      if (bursary.is_active === false) {
        return false
      }

      // Check deadline
      if (bursary.application_deadline) {
        const deadlineStatus = this.checkDeadlineStatus(bursary.application_deadline)
        return deadlineStatus.isOpen && !deadlineStatus.isExpired
      }

      // If no deadline specified, assume it's open
      return true
    })
  }

  /**
   * Get upcoming deadlines (next 30 days)
   */
  getUpcomingDeadlines(items: any[], daysAhead: number = 30): any[] {
    const now = new Date()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

    return items.filter(item => {
      if (!item.application_deadline) return false

      const deadline = new Date(item.application_deadline)
      return deadline >= now && deadline <= cutoffDate
    })
  }

  /**
   * Mark expired items as inactive in database
   */
  async markExpiredItemsInactive(): Promise<{
    institutionsUpdated: number
    programsUpdated: number
    bursariesUpdated: number
  }> {
    const now = new Date().toISOString()
    let institutionsUpdated = 0
    let programsUpdated = 0
    let bursariesUpdated = 0

    try {
      // First, count expired institutions
      const { count: expiredInstCount } = await this.supabase
        .from('institutions')
        .select('*', { count: 'exact' })
        .lt('application_deadline', now)

      // Update expired institutions
      if (expiredInstCount && expiredInstCount > 0) {
        await this.supabase
          .from('institutions')
          .update({ is_featured: false })
          .lt('application_deadline', now)
        institutionsUpdated = expiredInstCount
      }

      // First, count expired programs
      const { count: expiredProgCount } = await this.supabase
        .from('programs')
        .select('*', { count: 'exact' })
        .lt('application_deadline', now)

      // Update expired programs
      if (expiredProgCount && expiredProgCount > 0) {
        await this.supabase
          .from('programs')
          .update({ is_available: false })
          .lt('application_deadline', now)
        programsUpdated = expiredProgCount
      }

      // First, count expired bursaries
      const { count: expiredBursCount } = await this.supabase
        .from('bursaries')
        .select('*', { count: 'exact' })
        .lt('application_deadline', now)

      // Update expired bursaries
      if (expiredBursCount && expiredBursCount > 0) {
        await this.supabase
          .from('bursaries')
          .update({ is_active: false })
          .lt('application_deadline', now)
        bursariesUpdated = expiredBursCount
      }

      console.log(`🗓️ Marked expired items as inactive: ${institutionsUpdated} institutions, ${programsUpdated} programs, ${bursariesUpdated} bursaries`)

    } catch (error) {
      console.error('❌ Error marking expired items:', error)
    }

    return { institutionsUpdated, programsUpdated, bursariesUpdated }
  }

  /**
   * Get application status summary for admin dashboard
   */
  async getApplicationStatusSummary(): Promise<{
    openInstitutions: number
    closedInstitutions: number
    openPrograms: number
    closedPrograms: number
    activeBursaries: number
    expiredBursaries: number
    upcomingDeadlines: number
  }> {
    try {
      const now = new Date().toISOString()

      // Get institution counts
      const { count: openInst } = await this.supabase
        .from('institutions')
        .select('*', { count: 'exact' })
        .or(`application_deadline.is.null,application_deadline.gte.${now}`)

      const { count: closedInst } = await this.supabase
        .from('institutions')
        .select('*', { count: 'exact' })
        .lt('application_deadline', now)

      // Get program counts
      const { count: openProg } = await this.supabase
        .from('programs')
        .select('*', { count: 'exact' })
        .eq('is_available', true)

      const { count: closedProg } = await this.supabase
        .from('programs')
        .select('*', { count: 'exact' })
        .eq('is_available', false)

      // Get bursary counts
      const { count: activeBurs } = await this.supabase
        .from('bursaries')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      const { count: expiredBurs } = await this.supabase
        .from('bursaries')
        .select('*', { count: 'exact' })
        .eq('is_active', false)

      // Get upcoming deadlines (next 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { count: upcomingDeadlines } = await this.supabase
        .from('bursaries')
        .select('*', { count: 'exact' })
        .gte('application_deadline', now)
        .lte('application_deadline', thirtyDaysFromNow.toISOString())

      return {
        openInstitutions: openInst || 0,
        closedInstitutions: closedInst || 0,
        openPrograms: openProg || 0,
        closedPrograms: closedProg || 0,
        activeBursaries: activeBurs || 0,
        expiredBursaries: expiredBurs || 0,
        upcomingDeadlines: upcomingDeadlines || 0
      }

    } catch (error) {
      console.error('❌ Error getting application status summary:', error)
      return {
        openInstitutions: 0,
        closedInstitutions: 0,
        openPrograms: 0,
        closedPrograms: 0,
        activeBursaries: 0,
        expiredBursaries: 0,
        upcomingDeadlines: 0
      }
    }
  }
}
