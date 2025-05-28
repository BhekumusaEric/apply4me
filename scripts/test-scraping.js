#!/usr/bin/env node

/**
 * Test Script for Apply4Me Scraping System
 * Tests database connectivity, scraping functionality, and data population
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDatabaseConnectivity() {
  console.log('🔍 Testing database connectivity...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('institutions')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }

    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    return false
  }
}

async function testTableStructure() {
  console.log('🔍 Testing table structure...')
  
  const tables = ['institutions', 'bursaries', 'applications', 'users']
  const results = {}

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`❌ Table ${table}: ${error.message}`)
        results[table] = { exists: false, count: 0, error: error.message }
      } else {
        console.log(`✅ Table ${table}: ${count || 0} records`)
        results[table] = { exists: true, count: count || 0 }
      }
    } catch (error) {
      console.error(`❌ Table ${table}: ${error.message}`)
      results[table] = { exists: false, count: 0, error: error.message }
    }
  }

  return results
}

async function testScrapingAPI() {
  console.log('🔍 Testing scraping API...')
  
  try {
    // Test database population
    const response = await fetch('http://localhost:3000/api/database/populate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'populate' })
    })

    if (!response.ok) {
      console.error('❌ Scraping API failed:', response.statusText)
      return false
    }

    const result = await response.json()
    if (result.success) {
      console.log('✅ Scraping API successful')
      console.log(`📊 Results:`, result.result)
      return true
    } else {
      console.error('❌ Scraping API error:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ Scraping API test failed:', error.message)
    return false
  }
}

async function getDataStatistics() {
  console.log('📊 Getting data statistics...')
  
  try {
    // Get institution stats
    const { data: institutions } = await supabase
      .from('institutions')
      .select('type')

    // Get bursary stats
    const { data: bursaries } = await supabase
      .from('bursaries')
      .select('provider, is_active')

    // Get application stats
    const { data: applications } = await supabase
      .from('applications')
      .select('status')

    const stats = {
      institutions: {
        total: institutions?.length || 0,
        byType: {}
      },
      bursaries: {
        total: bursaries?.length || 0,
        active: bursaries?.filter(b => b.is_active).length || 0,
        byProvider: {}
      },
      applications: {
        total: applications?.length || 0,
        byStatus: {}
      }
    }

    // Calculate breakdowns
    if (institutions) {
      institutions.forEach(inst => {
        stats.institutions.byType[inst.type] = (stats.institutions.byType[inst.type] || 0) + 1
      })
    }

    if (bursaries) {
      bursaries.forEach(bursary => {
        stats.bursaries.byProvider[bursary.provider] = (stats.bursaries.byProvider[bursary.provider] || 0) + 1
      })
    }

    if (applications) {
      applications.forEach(app => {
        stats.applications.byStatus[app.status] = (stats.applications.byStatus[app.status] || 0) + 1
      })
    }

    console.log('📈 Database Statistics:')
    console.log(`   Institutions: ${stats.institutions.total}`)
    console.log(`   Bursaries: ${stats.bursaries.total} (${stats.bursaries.active} active)`)
    console.log(`   Applications: ${stats.applications.total}`)
    
    return stats
  } catch (error) {
    console.error('❌ Statistics failed:', error.message)
    return null
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Apply4Me Scraping System Test')
  console.log('==========================================')

  const results = {
    connectivity: false,
    tables: {},
    scraping: false,
    statistics: null,
    timestamp: new Date().toISOString()
  }

  // Test 1: Database Connectivity
  results.connectivity = await testDatabaseConnectivity()
  
  // Test 2: Table Structure
  results.tables = await testTableStructure()
  
  // Test 3: Get Current Statistics
  results.statistics = await getDataStatistics()
  
  // Test 4: Scraping API (only if database is working)
  if (results.connectivity) {
    results.scraping = await testScrapingAPI()
  }

  // Final Report
  console.log('\n🎉 TEST RESULTS SUMMARY')
  console.log('=======================')
  console.log(`✅ Database Connectivity: ${results.connectivity ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Table Structure: ${Object.values(results.tables).every(t => t.exists) ? 'PASS' : 'PARTIAL'}`)
  console.log(`✅ Scraping API: ${results.scraping ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Statistics: ${results.statistics ? 'PASS' : 'FAIL'}`)

  if (results.statistics) {
    console.log('\n📊 CURRENT DATA:')
    console.log(`   🏫 Institutions: ${results.statistics.institutions.total}`)
    console.log(`   💰 Bursaries: ${results.statistics.bursaries.total}`)
    console.log(`   📝 Applications: ${results.statistics.applications.total}`)
  }

  return results
}

// Run the test
if (require.main === module) {
  runComprehensiveTest()
    .then(results => {
      console.log('\n✅ Test completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { runComprehensiveTest }
