/**
 * Program Scraper
 * Scrapes academic programs from various educational institutions
 */

export interface ScrapedProgram {
  id: string
  institutionId: string
  name: string
  fieldOfStudy: string
  qualificationLevel: string
  durationYears: number
  requirements: string[]
  careerOutcomes: string[]
  description?: string
  isPopular?: boolean
  isAvailable?: boolean
  applicationDeadline?: string
  availableSpots?: number
  applicationFee?: number
  source: string
  scrapedAt: Date
}

export class ProgramScraper {
  private baseUrl: string = 'https://www.universitiessa.ac.za'

  constructor() {
    console.log('🎓 Program Scraper initialized')
  }

  /**
   * Scrape programs for a specific institution
   */
  async scrapeInstitutionPrograms(institutionId: string, institutionName: string): Promise<ScrapedProgram[]> {
    console.log(`🎓 Scraping programs for: ${institutionName}`)

    try {
      // For now, return mock programs based on institution type
      return this.generateMockPrograms(institutionId, institutionName)
    } catch (error) {
      console.error(`❌ Error scraping programs for ${institutionName}:`, error)
      return []
    }
  }

  /**
   * Scrape programs from all sources
   */
  async scrapeAllPrograms(): Promise<ScrapedProgram[]> {
    console.log('🎓 Starting comprehensive program scraping...')

    const allPrograms: ScrapedProgram[] = []

    try {
      // Mock implementation - in production, this would scrape from various sources
      const mockPrograms = this.generateMockProgramsForAllInstitutions()
      allPrograms.push(...mockPrograms)

      console.log(`✅ Program scraping completed: ${allPrograms.length} programs found`)
      return allPrograms
    } catch (error) {
      console.error('❌ Error in program scraping:', error)
      return []
    }
  }

  /**
   * Generate mock programs for a specific institution
   */
  private generateMockPrograms(institutionId: string, institutionName: string): ScrapedProgram[] {
    const programs: ScrapedProgram[] = []

    // Determine program types based on institution name/type
    const programTemplates = this.getProgramTemplatesForInstitution(institutionName)

    programTemplates.forEach((template, index) => {
      programs.push({
        id: `${institutionId}-program-${index + 1}`,
        institutionId,
        name: template.name,
        fieldOfStudy: template.fieldOfStudy,
        qualificationLevel: template.qualificationLevel,
        durationYears: template.durationYears,
        requirements: template.requirements,
        careerOutcomes: template.careerOutcomes,
        description: template.description,
        isPopular: (template as any).isPopular || false,
        isAvailable: (template as any).isAvailable !== false, // Default to true unless explicitly false
        applicationDeadline: (template as any).applicationDeadline || this.generateApplicationDeadline(),
        availableSpots: (template as any).availableSpots || this.generateAvailableSpots(),
        applicationFee: (template as any).applicationFee || this.generateApplicationFee(template.qualificationLevel),
        source: 'Mock Program Scraper',
        scrapedAt: new Date()
      })
    })

    return programs
  }

  /**
   * Get program templates based on institution type
   */
  private getProgramTemplatesForInstitution(institutionName: string) {
    const name = institutionName.toLowerCase()

    if (name.includes('university')) {
      return this.getUniversityPrograms()
    } else if (name.includes('tvet') || name.includes('college')) {
      return this.getTVETPrograms()
    } else {
      return this.getGeneralPrograms()
    }
  }

  /**
   * University program templates
   */
  private getUniversityPrograms() {
    return [
      {
        name: 'Bachelor of Science in Computer Science',
        fieldOfStudy: 'Engineering and Technology',
        qualificationLevel: 'Bachelor\'s Degree',
        durationYears: 3,
        requirements: ['Mathematics', 'Physical Sciences', 'English'],
        careerOutcomes: ['Software Developer', 'Data Scientist', 'Systems Analyst'],
        description: 'Comprehensive computer science program covering programming, algorithms, and software engineering.',
        isPopular: true
      },
      {
        name: 'Bachelor of Commerce',
        fieldOfStudy: 'Business and Management',
        qualificationLevel: 'Bachelor\'s Degree',
        durationYears: 3,
        requirements: ['Mathematics', 'English', 'Accounting'],
        careerOutcomes: ['Business Analyst', 'Financial Manager', 'Marketing Specialist'],
        description: 'Business-focused degree covering finance, marketing, and management principles.'
      },
      {
        name: 'Bachelor of Engineering',
        fieldOfStudy: 'Engineering and Technology',
        qualificationLevel: 'Bachelor\'s Degree',
        durationYears: 4,
        requirements: ['Mathematics', 'Physical Sciences', 'Technical Drawing'],
        careerOutcomes: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer'],
        description: 'Professional engineering degree with specialization options.',
        isPopular: true
      },
      {
        name: 'Bachelor of Medicine and Surgery',
        fieldOfStudy: 'Health Sciences',
        qualificationLevel: 'Bachelor\'s Degree',
        durationYears: 6,
        requirements: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
        careerOutcomes: ['Medical Doctor', 'Surgeon', 'General Practitioner'],
        description: 'Medical degree program leading to medical practice.'
      }
    ]
  }

  /**
   * TVET College program templates
   */
  private getTVETPrograms() {
    return [
      {
        name: 'National Certificate in Information Technology',
        fieldOfStudy: 'Information Technology',
        qualificationLevel: 'National Certificate',
        durationYears: 1,
        requirements: ['Grade 9', 'Mathematics Literacy'],
        careerOutcomes: ['IT Support Technician', 'Computer Operator', 'Help Desk Assistant'],
        description: 'Practical IT skills training for entry-level positions.'
      },
      {
        name: 'National Diploma in Electrical Engineering',
        fieldOfStudy: 'Engineering and Technology',
        qualificationLevel: 'National Diploma',
        durationYears: 3,
        requirements: ['Grade 12', 'Mathematics', 'Physical Sciences'],
        careerOutcomes: ['Electrical Technician', 'Maintenance Technician', 'Installation Specialist'],
        description: 'Hands-on electrical engineering training.'
      },
      {
        name: 'Certificate in Business Administration',
        fieldOfStudy: 'Business and Management',
        qualificationLevel: 'Certificate',
        durationYears: 1,
        requirements: ['Grade 10', 'English'],
        careerOutcomes: ['Administrative Assistant', 'Office Manager', 'Customer Service Representative'],
        description: 'Basic business and administrative skills training.'
      }
    ]
  }

  /**
   * General program templates
   */
  private getGeneralPrograms() {
    return [
      {
        name: 'Diploma in Education',
        fieldOfStudy: 'Education',
        qualificationLevel: 'Diploma',
        durationYears: 3,
        requirements: ['Grade 12', 'Subject specialization'],
        careerOutcomes: ['Primary School Teacher', 'Secondary School Teacher', 'Education Coordinator'],
        description: 'Teacher training program for primary and secondary education.'
      },
      {
        name: 'Certificate in Hospitality Management',
        fieldOfStudy: 'Hospitality and Tourism',
        qualificationLevel: 'Certificate',
        durationYears: 1,
        requirements: ['Grade 10', 'English'],
        careerOutcomes: ['Hotel Receptionist', 'Restaurant Manager', 'Event Coordinator'],
        description: 'Hospitality industry skills and management training.'
      }
    ]
  }

  /**
   * Generate mock programs for all institutions (used when no specific institution is provided)
   */
  private generateMockProgramsForAllInstitutions(): ScrapedProgram[] {
    const programs: ScrapedProgram[] = []

    // Generate programs for mock institutions
    const mockInstitutions = [
      { id: 'univ-1', name: 'University of Technology' },
      { id: 'tvet-1', name: 'Technical College' },
      { id: 'univ-2', name: 'State University' }
    ]

    mockInstitutions.forEach(institution => {
      const institutionPrograms = this.generateMockPrograms(institution.id, institution.name)
      programs.push(...institutionPrograms)
    })

    return programs
  }

  /**
   * Filter programs by field of study
   */
  filterByField(programs: ScrapedProgram[], fieldOfStudy: string): ScrapedProgram[] {
    return programs.filter(program =>
      program.fieldOfStudy.toLowerCase().includes(fieldOfStudy.toLowerCase())
    )
  }

  /**
   * Filter programs by qualification level
   */
  filterByQualificationLevel(programs: ScrapedProgram[], level: string): ScrapedProgram[] {
    return programs.filter(program =>
      program.qualificationLevel.toLowerCase().includes(level.toLowerCase())
    )
  }

  /**
   * Get popular programs
   */
  getPopularPrograms(programs: ScrapedProgram[]): ScrapedProgram[] {
    return programs.filter(program => program.isPopular)
  }

  /**
   * Generate realistic application deadline
   */
  private generateApplicationDeadline(): string {
    const now = new Date()
    const deadlineOptions = [
      new Date(now.getFullYear(), 8, 30), // September 30
      new Date(now.getFullYear(), 10, 15), // November 15
      new Date(now.getFullYear() + 1, 0, 31), // January 31 next year
      new Date(now.getFullYear() + 1, 2, 15), // March 15 next year
    ]

    // Filter future deadlines
    const futureDeadlines = deadlineOptions.filter(date => date > now)

    if (futureDeadlines.length === 0) {
      // If no future deadlines, add next year's deadlines
      return new Date(now.getFullYear() + 1, 8, 30).toISOString().split('T')[0]
    }

    const randomDeadline = futureDeadlines[Math.floor(Math.random() * futureDeadlines.length)]
    return randomDeadline.toISOString().split('T')[0]
  }

  /**
   * Generate realistic available spots
   */
  private generateAvailableSpots(): number {
    const spotOptions = [25, 30, 40, 50, 75, 100, 120, 150, 200]
    return spotOptions[Math.floor(Math.random() * spotOptions.length)]
  }

  /**
   * Generate realistic application fee based on qualification level
   */
  private generateApplicationFee(qualificationLevel: string): number {
    const level = qualificationLevel.toLowerCase()

    if (level.includes('certificate')) {
      return Math.floor(Math.random() * 300) + 100 // R100-R400
    } else if (level.includes('diploma')) {
      return Math.floor(Math.random() * 400) + 200 // R200-R600
    } else if (level.includes('bachelor')) {
      return Math.floor(Math.random() * 500) + 300 // R300-R800
    } else if (level.includes('master') || level.includes('honours')) {
      return Math.floor(Math.random() * 600) + 400 // R400-R1000
    } else if (level.includes('phd') || level.includes('doctorate')) {
      return Math.floor(Math.random() * 800) + 500 // R500-R1300
    }

    return Math.floor(Math.random() * 400) + 200 // Default R200-R600
  }

  /**
   * Get available programs (not closed)
   */
  getAvailablePrograms(programs: ScrapedProgram[]): ScrapedProgram[] {
    return programs.filter(program => program.isAvailable)
  }

  /**
   * Get programs with upcoming deadlines
   */
  getUpcomingDeadlines(programs: ScrapedProgram[], daysAhead: number = 30): ScrapedProgram[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

    return programs.filter(program => {
      if (!program.applicationDeadline) return false
      const deadline = new Date(program.applicationDeadline)
      return deadline >= new Date() && deadline <= cutoffDate
    })
  }
}
