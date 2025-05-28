/**
 * Database Population Manager
 * Handles comprehensive database seeding and testing
 */

import { createClient } from '@supabase/supabase-js'
import { ProductionScraper } from '../scrapers/production-scraper'
import { ScrapedInstitution } from '../scrapers/institution-scraper'
import { ScrapedBursary } from '../scrapers/bursary-scraper'

export interface PopulationResult {
  institutions: {
    total: number
    new: number
    updated: number
    errors: number
  }
  bursaries: {
    total: number
    new: number
    updated: number
    errors: number
  }
  timestamp: string
  duration: number
}

export class DatabasePopulationManager {
  private supabase
  private scraper: ProductionScraper

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.scraper = new ProductionScraper()
  }

  /**
   * Populate database with fresh data from all sources
   */
  async populateDatabase(): Promise<PopulationResult> {
    const startTime = Date.now()
    console.log('🚀 Starting comprehensive database population...')

    const result: PopulationResult = {
      institutions: { total: 0, new: 0, updated: 0, errors: 0 },
      bursaries: { total: 0, new: 0, updated: 0, errors: 0 },
      timestamp: new Date().toISOString(),
      duration: 0
    }

    try {
      // Scrape all data
      const scrapingResult = await this.scraper.scrapeAll()

      // Process institutions
      console.log(`📊 Processing ${scrapingResult.institutions.length} institutions...`)
      for (const institution of scrapingResult.institutions) {
        try {
          const saved = await this.saveOrUpdateInstitution(institution)
          if (saved.isNew) {
            result.institutions.new++
          } else {
            result.institutions.updated++
          }
          result.institutions.total++
        } catch (error) {
          console.error('Error saving institution:', error)
          result.institutions.errors++
        }
      }

      // Process bursaries
      console.log(`💰 Processing ${scrapingResult.bursaries.length} bursaries...`)
      for (const bursary of scrapingResult.bursaries) {
        try {
          const saved = await this.saveOrUpdateBursary(bursary)
          if (saved.isNew) {
            result.bursaries.new++
          } else {
            result.bursaries.updated++
          }
          result.bursaries.total++
        } catch (error) {
          console.error('Error saving bursary:', error)
          result.bursaries.errors++
        }
      }

      result.duration = Date.now() - startTime
      console.log(`✅ Database population completed in ${result.duration}ms`)
      console.log(`📊 Results: ${result.institutions.total} institutions, ${result.bursaries.total} bursaries`)

    } catch (error) {
      console.error('❌ Database population failed:', error)
      throw error
    }

    return result
  }

  /**
   * Save or update institution in database
   */
  private async saveOrUpdateInstitution(institution: ScrapedInstitution): Promise<{ isNew: boolean }> {
    // Check if institution exists
    const { data: existing } = await this.supabase
      .from('institutions')
      .select('id')
      .eq('name', institution.name)
      .single()

    if (existing) {
      // Update existing institution
      const { error } = await this.supabase
        .from('institutions')
        .update({
          type: institution.type,
          province: institution.location,
          website_url: institution.website,
          description: institution.description,
          application_fee: institution.applicationFee || 0,
          required_documents: institution.requirements,
          contact_email: institution.contactInfo?.email,
          contact_phone: institution.contactInfo?.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) throw error
      return { isNew: false }
    } else {
      // Insert new institution
      const { error } = await this.supabase
        .from('institutions')
        .insert({
          id: crypto.randomUUID(),
          name: institution.name,
          type: institution.type,
          province: institution.location,
          website_url: institution.website,
          description: institution.description,
          application_fee: institution.applicationFee || 0,
          required_documents: institution.requirements,
          contact_email: institution.contactInfo?.email,
          contact_phone: institution.contactInfo?.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      return { isNew: true }
    }
  }

  /**
   * Save or update bursary in database
   */
  private async saveOrUpdateBursary(bursary: ScrapedBursary): Promise<{ isNew: boolean }> {
    // Check if bursary exists
    const { data: existing } = await this.supabase
      .from('bursaries')
      .select('id')
      .eq('id', bursary.id)
      .single()

    if (existing) {
      // Update existing bursary
      const { error } = await this.supabase
        .from('bursaries')
        .update({
          name: bursary.title,
          provider: bursary.provider,
          amount: typeof bursary.amount === 'number' ? bursary.amount : 0,
          description: bursary.description,
          eligibility_criteria: bursary.eligibility,
          application_deadline: bursary.applicationDeadline,
          application_url: bursary.applicationUrl,
          field_of_study: bursary.fieldOfStudy,
          type: 'national', // Default type
          is_active: bursary.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', bursary.id)

      if (error) throw error
      return { isNew: false }
    } else {
      // Insert new bursary
      const { error } = await this.supabase
        .from('bursaries')
        .insert({
          id: bursary.id,
          name: bursary.title,
          provider: bursary.provider,
          amount: typeof bursary.amount === 'number' ? bursary.amount : 0,
          description: bursary.description,
          eligibility_criteria: bursary.eligibility,
          application_deadline: bursary.applicationDeadline,
          application_url: bursary.applicationUrl,
          field_of_study: bursary.fieldOfStudy,
          type: 'national', // Default type
          is_active: bursary.isActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      return { isNew: true }
    }
  }

  /**
   * Test database connectivity and structure
   */
  async testDatabase(): Promise<{
    connected: boolean
    tables: { [key: string]: boolean }
    counts: { [key: string]: number }
    errors: string[]
  }> {
    const result = {
      connected: false,
      tables: {} as { [key: string]: boolean },
      counts: {} as { [key: string]: number },
      errors: [] as string[]
    }

    try {
      // Test basic connection
      const { data, error } = await this.supabase
        .from('institutions')
        .select('count')
        .limit(1)

      if (error) {
        result.errors.push(`Connection error: ${error.message}`)
        return result
      }

      result.connected = true

      // Test each table
      const tables = ['institutions', 'bursaries', 'applications', 'users']

      for (const table of tables) {
        try {
          const { count, error } = await this.supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

          if (error) {
            result.tables[table] = false
            result.errors.push(`Table ${table}: ${error.message}`)
          } else {
            result.tables[table] = true
            result.counts[table] = count || 0
          }
        } catch (error) {
          result.tables[table] = false
          result.errors.push(`Table ${table}: ${error}`)
        }
      }

    } catch (error) {
      result.errors.push(`Database test failed: ${error}`)
    }

    return result
  }

  /**
   * Get comprehensive database statistics
   */
  async getDatabaseStats(): Promise<{
    institutions: { total: number, byType: { [key: string]: number } }
    bursaries: { total: number, active: number, byProvider: { [key: string]: number } }
    applications: { total: number, byStatus: { [key: string]: number } }
    lastUpdated: string
  }> {
    const stats = {
      institutions: { total: 0, byType: {} as { [key: string]: number } },
      bursaries: { total: 0, active: 0, byProvider: {} as { [key: string]: number } },
      applications: { total: 0, byStatus: {} as { [key: string]: number } },
      lastUpdated: new Date().toISOString()
    }

    try {
      // Institution stats
      const { data: institutions } = await this.supabase
        .from('institutions')
        .select('type')

      if (institutions) {
        stats.institutions.total = institutions.length
        institutions.forEach(inst => {
          stats.institutions.byType[inst.type] = (stats.institutions.byType[inst.type] || 0) + 1
        })
      }

      // Bursary stats
      const { data: bursaries } = await this.supabase
        .from('bursaries')
        .select('provider, is_active')

      if (bursaries) {
        stats.bursaries.total = bursaries.length
        stats.bursaries.active = bursaries.filter(b => b.is_active).length
        bursaries.forEach(bursary => {
          stats.bursaries.byProvider[bursary.provider] = (stats.bursaries.byProvider[bursary.provider] || 0) + 1
        })
      }

      // Application stats
      const { data: applications } = await this.supabase
        .from('applications')
        .select('status')

      if (applications) {
        stats.applications.total = applications.length
        applications.forEach(app => {
          stats.applications.byStatus[app.status] = (stats.applications.byStatus[app.status] || 0) + 1
        })
      }

    } catch (error) {
      console.error('Error getting database stats:', error)
    }

    return stats
  }
}
