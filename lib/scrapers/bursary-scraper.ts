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
   * Enhanced mock bursary data for demonstration
   * Simulates discovering new bursaries each time
   */
  private getMockBursaries(source: any): ScrapedBursary[] {
    const allMockBursaries: ScrapedBursary[] = [
      {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-engineering-2024`,
        title: 'Engineering Excellence Bursary 2024',
        provider: source.name,
        amount: 150000,
        description: '🤖 Auto-discovered: Full bursary covering tuition, accommodation, and living expenses for engineering students',
        eligibility: [
          'South African citizen',
          'Grade 12 with Mathematics and Physical Science',
          'Minimum 70% average',
          'Financial need demonstrated'
        ],
        requirements: [
          'Completed application form',
          'Academic transcripts',
          'Proof of income',
          'Motivation letter',
          'Two reference letters'
        ],
        applicationDeadline: '2024-08-31',
        applicationUrl: `${source.url}/apply`,
        contactInfo: {
          email: 'bursaries@company.co.za',
          phone: '+27 11 123 4567',
          website: source.url
        },
        fieldOfStudy: ['Engineering and Technology'],
        studyLevel: 'undergraduate',
        provinces: ['All provinces'],
        source: source.name,
        scrapedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-teaching-2024`,
        title: 'Future Teachers Bursary Program',
        provider: source.name,
        amount: 80000,
        description: '🤖 Auto-discovered: Bursary for students pursuing teaching qualifications in priority subjects',
        eligibility: [
          'South African citizen',
          'Commitment to teach for 3 years after graduation',
          'Grade 12 with minimum 60% average',
          'Passion for education'
        ],
        requirements: [
          'Application form',
          'Academic records',
          'Teaching commitment contract',
          'Personal statement'
        ],
        applicationDeadline: '2024-09-15',
        applicationUrl: `${source.url}/teaching-bursary`,
        contactInfo: {
          email: 'education@bursaries.gov.za',
          website: source.url
        },
        fieldOfStudy: ['Education and Teaching'],
        studyLevel: 'undergraduate',
        provinces: ['All provinces'],
        source: source.name,
        scrapedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-medicine-2024`,
        title: 'Healthcare Heroes Bursary',
        provider: source.name,
        amount: 200000,
        description: '🤖 Auto-discovered: Comprehensive bursary for medical and health science students',
        eligibility: [
          'South African citizen',
          'Accepted into medical or health science program',
          'Grade 12 with Life Sciences and Mathematics',
          'Minimum 80% average',
          'Community service commitment'
        ],
        requirements: [
          'University acceptance letter',
          'Academic transcripts',
          'Medical fitness certificate',
          'Community service plan',
          'Financial need assessment'
        ],
        applicationDeadline: '2024-07-31',
        applicationUrl: `${source.url}/healthcare-bursary`,
        contactInfo: {
          email: 'health.bursaries@foundation.org.za',
          phone: '+27 21 456 7890'
        },
        fieldOfStudy: ['Health Sciences'],
        studyLevel: 'undergraduate',
        provinces: ['All provinces'],
        source: source.name,
        scrapedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-business-2024`,
        title: 'Business Leadership Bursary',
        provider: source.name,
        amount: 120000,
        description: '🤖 Auto-discovered: Developing future business leaders with comprehensive support',
        eligibility: [
          'South African citizen',
          'Grade 12 with Mathematics/Mathematical Literacy',
          'Minimum 65% average',
          'Leadership potential demonstrated'
        ],
        requirements: [
          'Application form',
          'Academic transcripts',
          'Leadership portfolio',
          'Business plan (optional)',
          'Interview participation'
        ],
        applicationDeadline: '2024-08-15',
        applicationUrl: `${source.url}/business-bursary`,
        contactInfo: {
          email: 'business.bursaries@company.co.za',
          phone: '+27 11 987 6543'
        },
        fieldOfStudy: ['Business and Management'],
        studyLevel: 'undergraduate',
        provinces: ['All provinces'],
        source: source.name,
        scrapedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-agriculture-2024`,
        title: 'Sustainable Agriculture Bursary',
        provider: source.name,
        amount: 90000,
        description: '🤖 Auto-discovered: Supporting the future of South African agriculture and food security',
        eligibility: [
          'South African citizen',
          'Grade 12 with Life Sciences/Agricultural Sciences',
          'Minimum 60% average',
          'Rural background preferred'
        ],
        requirements: [
          'Application form',
          'Academic records',
          'Motivation letter',
          'Community recommendation',
          'Farm visit participation'
        ],
        applicationDeadline: '2024-09-30',
        applicationUrl: `${source.url}/agriculture-bursary`,
        contactInfo: {
          email: 'agriculture@foundation.org.za',
          phone: '+27 12 345 6789'
        },
        fieldOfStudy: ['Agriculture and Environmental Sciences'],
        studyLevel: 'undergraduate',
        provinces: ['All provinces'],
        source: source.name,
        scrapedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-it-2024`,
        title: 'Digital Innovation Bursary',
        provider: source.name,
        amount: 110000,
        description: '🤖 Auto-discovered: Empowering the next generation of IT professionals and innovators',
        eligibility: [
          'South African citizen',
          'Grade 12 with Mathematics',
          'Minimum 70% average',
          'Passion for technology'
        ],
        requirements: [
          'Application form',
          'Academic transcripts',
          'Coding portfolio (optional)',
          'Technology project showcase',
          'Online assessment'
        ],
        applicationDeadline: '2024-08-31',
        applicationUrl: `${source.url}/it-bursary`,
        contactInfo: {
          email: 'it.bursaries@techcompany.co.za',
          phone: '+27 21 555 0123'
        },
        fieldOfStudy: ['Information Technology'],
        studyLevel: 'undergraduate',
        provinces: ['All provinces'],
        source: source.name,
        scrapedAt: new Date().toISOString(),
        isActive: true
      }
    ]

    // Return 1-3 random bursaries to simulate discovery
    const shuffled = allMockBursaries.sort(() => 0.5 - Math.random())
    const count = Math.floor(Math.random() * 3) + 1 // 1-3 bursaries
    return shuffled.slice(0, count)
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
