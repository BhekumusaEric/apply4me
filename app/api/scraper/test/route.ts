import { NextRequest, NextResponse } from 'next/server'
import { ProductionScraper } from '@/lib/scrapers/production-scraper'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing real-time scraper...')
    
    const scraper = new ProductionScraper()
    
    // Test scraping with a small subset
    const testResult = await scraper.scrapeAll()
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        institutionsFound: testResult.institutions.length,
        bursariesFound: testResult.bursaries.length,
        errorsCount: testResult.errors.length
      },
      institutions: testResult.institutions.map(inst => ({
        name: inst.name,
        type: inst.type,
        location: inst.location,
        website: inst.website,
        description: inst.description?.substring(0, 100) + '...',
        applicationDeadline: inst.applicationDeadline,
        source: inst.source,
        scrapedAt: inst.scrapedAt
      })),
      bursaries: testResult.bursaries.map(burs => ({
        title: burs.title,
        provider: burs.provider,
        amount: burs.amount,
        applicationDeadline: burs.applicationDeadline,
        source: burs.source,
        isActive: burs.isActive
      })),
      errors: testResult.errors,
      message: '🎉 Real-time scraping test completed successfully!'
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Scraper test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Scraper test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { source, type } = await request.json()
    
    console.log(`🎯 Testing specific source: ${source} (${type})`)
    
    const scraper = new ProductionScraper()
    let result: any = {}
    
    if (type === 'institution') {
      // Test specific institution scraping
      const testSources = [
        {
          name: source || 'University of Cape Town',
          url: 'https://www.uct.ac.za',
          type: 'university',
          admissionsUrl: 'https://www.uct.ac.za/apply',
          active: true
        }
      ]
      
      result.institutions = []
      for (const testSource of testSources) {
        try {
          const institutions = await (scraper as any).scrapeInstitutions(testSource)
          result.institutions.push(...institutions)
        } catch (error) {
          result.error = error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    if (type === 'bursary') {
      // Test specific bursary scraping
      const testSources = [
        {
          name: source || 'NSFAS',
          url: 'https://www.nsfas.org.za',
          applicationUrl: 'https://www.nsfas.org.za/content/apply.html',
          type: 'government',
          active: true
        }
      ]
      
      result.bursaries = []
      for (const testSource of testSources) {
        try {
          const bursaries = await (scraper as any).scrapeBursaries(testSource)
          result.bursaries.push(...bursaries)
        } catch (error) {
          result.error = error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      source,
      type,
      result,
      timestamp: new Date().toISOString(),
      message: `✅ Specific source test completed: ${source}`
    })
    
  } catch (error) {
    console.error('❌ Specific scraper test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Specific scraper test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
