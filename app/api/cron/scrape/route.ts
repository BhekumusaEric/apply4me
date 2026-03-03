/**
 * Vercel Cron Endpoint — Automatic Daily Scraping
 * Triggered daily at 4 AM UTC (6 AM SAST) by Vercel Crons
 * Protected by CRON_SECRET environment variable
 *
 * Setup: Add CRON_SECRET to your Vercel environment variables
 * Schedule: configured in vercel.json "crons" section
 */

import { NextRequest, NextResponse } from 'next/server'
import { ProductionScraper } from '@/lib/scrapers/production-scraper'

export const maxDuration = 60 // Allow up to 60 seconds on Vercel Pro (adjust for plan)

export async function GET(request: NextRequest) {
    try {
        // Verify the request is from Vercel Cron or an authorized admin
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret) {
            const isVercelCron = authHeader === `Bearer ${cronSecret}`
            if (!isVercelCron) {
                console.warn('⚠️ Unauthorized cron request — missing or invalid CRON_SECRET')
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        } else {
            // If no CRON_SECRET is set, only allow in development
            if (process.env.NODE_ENV === 'production') {
                console.error('❌ CRON_SECRET is not set — please add it to your Vercel environment variables')
                return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
            }
        }

        console.log('🤖 Vercel Cron: Starting scheduled scraping job...')
        const startTime = Date.now()

        const scraper = new ProductionScraper()
        const result = await scraper.scrapeAll()

        const durationMs = Date.now() - startTime
        const durationSec = (durationMs / 1000).toFixed(1)

        console.log(`✅ Cron scraping complete in ${durationSec}s`)
        console.log(`   Institutions: ${result.institutions.length} scraped, ${result.savedToDb.institutions} saved`)
        console.log(`   Bursaries: ${result.bursaries.length} scraped, ${result.savedToDb.bursaries} saved`)
        console.log(`   Errors: ${result.errors.length}`)

        return NextResponse.json({
            success: true,
            message: 'Scheduled scraping completed',
            duration: `${durationSec}s`,
            summary: {
                institutionsScraped: result.institutions.length,
                institutionsSavedToDb: result.savedToDb.institutions,
                bursariesScraped: result.bursaries.length,
                bursariesSavedToDb: result.savedToDb.bursaries,
                errors: result.errors.length,
                errorDetails: result.errors.slice(0, 5) // Only show first 5 errors
            },
            timestamp: result.timestamp
        })

    } catch (error) {
        console.error('❌ Cron scraping job failed:', error)
        return NextResponse.json({
            success: false,
            error: 'Scraping job failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
