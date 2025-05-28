'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [institutions, setInstitutions] = useState<any[]>([])
  const [bursaries, setBursaries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Testing database connection...')

      // Check environment variables
      console.log('Environment check:', {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
      })

      // Test API endpoint first
      console.log('🌐 Testing API endpoint...')
      const apiResponse = await fetch('/api/test-data')
      const apiData = await apiResponse.json()
      console.log('📊 API Response:', apiData)

      if (apiData.success) {
        setInstitutions(apiData.data.institutions || [])
        setBursaries(apiData.data.bursaries || [])
        console.log('✅ API test successful')
      }

      // Also test direct Supabase connection
      console.log('🔗 Testing direct Supabase connection...')
      const supabase = createClient()

      // Test institutions
      console.log('📊 Fetching institutions directly...')
      const { data: institutionsData, error: institutionsError } = await supabase
        .from('institutions')
        .select('*')
        .limit(3)

      if (institutionsError) {
        console.error('❌ Institutions error:', institutionsError)
        console.log('🔄 Using API data instead')
      } else {
        console.log('✅ Direct institutions fetched:', institutionsData?.length)
        console.log('📋 Sample institution:', institutionsData?.[0])
      }

      // Test bursaries
      console.log('💰 Fetching bursaries directly...')
      const { data: bursariesData, error: bursariesError } = await supabase
        .from('bursaries')
        .select('*')
        .limit(3)

      if (bursariesError) {
        console.error('❌ Bursaries error:', bursariesError)
        console.log('🔄 Using API data instead')
      } else {
        console.log('✅ Direct bursaries fetched:', bursariesData?.length)
        console.log('📋 Sample bursary:', bursariesData?.[0])
      }

    } catch (err) {
      console.error('❌ Database test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testDatabase()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Database Debug Page</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
              <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p>URL Preview: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testDatabase} disabled={loading}>
              {loading ? 'Testing...' : 'Test Database Connection'}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">Error: {error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Institutions ({institutions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {institutions.length > 0 ? (
              <div className="space-y-2">
                {institutions.map((inst, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <p><strong>{inst.name}</strong></p>
                    <p>Type: {inst.type} | Province: {inst.province}</p>
                    <p>Featured: {inst.is_featured ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No institutions found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bursaries ({bursaries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {bursaries.length > 0 ? (
              <div className="space-y-2">
                {bursaries.map((bursary, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <p><strong>{bursary.name}</strong></p>
                    <p>Provider: {bursary.provider}</p>
                    <p>Amount: R{bursary.amount?.toLocaleString() || 'N/A'}</p>
                    <p>Active: {bursary.is_active ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No bursaries found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
