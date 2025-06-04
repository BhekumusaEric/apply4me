/**
 * Bursary and Scholarship Discovery System
 * Automatically finds funding opportunities for students
 */

export interface ScrapedBursary {
  id: string
  title: string
  provider: string
  amount: number | string
  description: string
  eligibility: string[]
  requirements: string[]
  applicationDeadline: string
  applicationUrl?: string
  contactInfo?: {
    email?: string
    phone?: string
    website?: string
  }
  fieldOfStudy: string[]
  studyLevel: 'undergraduate' | 'postgraduate' | 'both'
  provinces?: string[]
  source: string
  scrapedAt: string
  isActive: boolean
}

export class BursaryScraper {
  private sources = [
    {
      name: 'NSFAS',
      url: 'https://www.nsfas.org.za',
      type: 'government'
    },
    {
      name: 'Funza Lushaka',
      url: 'https://www.funzalushaka.doe.gov.za',
      type: 'government'
    },
    {
      name: 'Sasol Bursaries',
      url: 'https://www.sasol.com/careers/bursaries',
      type: 'corporate'
    },
    {
      name: 'Anglo American Bursaries',
      url: 'https://www.angloamerican.com/sustainability/education',
      type: 'corporate'
    },
    {
      name: 'Eskom Bursaries',
      url: 'https://www.eskom.co.za/careers/bursaries',
      type: 'corporate'
    }
  ]

  /**
   * Scrape all bursary sources
   */
  async scrapeAllBursaries(): Promise<ScrapedBursary[]> {
    const allBursaries: ScrapedBursary[] = []

    for (const source of this.sources) {
      try {
        console.log(`💰 Scraping bursaries from ${source.name}...`)
        const bursaries = await this.scrapeBursarySource(source)
        allBursaries.push(...bursaries)
        console.log(`✅ Found ${bursaries.length} bursaries from ${source.name}`)
      } catch (error) {
        console.error(`❌ Error scraping ${source.name}:`, error)
      }
    }

    return this.deduplicateBursaries(allBursaries)
  }

  /**
   * Scrape specific bursary source
   */
  private async scrapeBursarySource(source: any): Promise<ScrapedBursary[]> {
    // For demo, return mock data
    return this.getMockBursaries(source)
  }

  /**
   * No mock data - return empty array
   */
  private getMockBursaries(source: any): ScrapedBursary[] {
    // Return empty array - no mock data
    return []
  }

  /**
   * Remove duplicate bursaries
   */
  private deduplicateBursaries(bursaries: ScrapedBursary[]): ScrapedBursary[] {
    const seen = new Set<string>()
    return bursaries.filter(bursary => {
      if (seen.has(bursary.id)) {
        return false
      }
      seen.add(bursary.id)
      return true
    })
  }

  /**
   * Filter bursaries by field of study
   */
  filterByField(bursaries: ScrapedBursary[], field: string): ScrapedBursary[] {
    return bursaries.filter(bursary =>
      bursary.fieldOfStudy.some(f =>
        f.toLowerCase().includes(field.toLowerCase())
      )
    )
  }

  /**
   * Filter bursaries by study level
   */
  filterByLevel(bursaries: ScrapedBursary[], level: string): ScrapedBursary[] {
    return bursaries.filter(bursary =>
      bursary.studyLevel === level || bursary.studyLevel === 'both'
    )
  }

  /**
   * Filter bursaries by deadline (upcoming)
   */
  filterByUpcomingDeadlines(bursaries: ScrapedBursary[], daysAhead: number = 30): ScrapedBursary[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

    return bursaries.filter(bursary => {
      const deadline = new Date(bursary.applicationDeadline)
      return deadline >= new Date() && deadline <= cutoffDate
    })
  }

  /**
   * Get bursaries by amount (high value first)
   */
  sortByAmount(bursaries: ScrapedBursary[]): ScrapedBursary[] {
    return bursaries.sort((a, b) => {
      const amountA = this.extractAmount(a.amount)
      const amountB = this.extractAmount(b.amount)
      return amountB - amountA
    })
  }

  /**
   * Extract numeric amount from string
   */
  private extractAmount(amount: number | string): number {
    if (typeof amount === 'number') return amount

    const match = amount.match(/R?(\d+(?:,\d+)*(?:\.\d+)?)/i)
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''))
    }
    return 0
  }

  /**
   * Validate bursary data
   */
  validateBursary(bursary: ScrapedBursary): boolean {
    return !!(
      bursary.title &&
      bursary.provider &&
      bursary.amount &&
      bursary.applicationDeadline &&
      bursary.fieldOfStudy.length > 0
    )
  }

  /**
   * Check if bursary deadline is approaching
   */
  isDeadlineApproaching(bursary: ScrapedBursary, daysWarning: number = 7): boolean {
    const deadline = new Date(bursary.applicationDeadline)
    const warningDate = new Date()
    warningDate.setDate(warningDate.getDate() + daysWarning)

    return deadline <= warningDate && deadline >= new Date()
  }
}
