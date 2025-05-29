'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Database, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  School,
  DollarSign
} from 'lucide-react'

interface ScrapingResult {
  success: boolean
  timestamp: string
  summary: {
    institutionsFound: number
    bursariesFound: number
    errorsCount: number
  }
  institutions: any[]
  bursaries: any[]
  errors: string[]
  message: string
}

export default function ScraperDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<ScrapingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const runScraper = async () => {
    setLoading(true)
    setIsRunning(true)
    
    try {
      const response = await fetch('/api/scraper/test')
      const result = await response.json()
      setLastResult(result)
      console.log('🎉 Scraping completed:', result)
    } catch (error) {
      console.error('❌ Scraping failed:', error)
      setLastResult({
        success: false,
        timestamp: new Date().toISOString(),
        summary: { institutionsFound: 0, bursariesFound: 0, errorsCount: 1 },
        institutions: [],
        bursaries: [],
        errors: ['Failed to connect to scraper'],
        message: 'Scraping failed'
      })
    } finally {
      setLoading(false)
      setIsRunning(false)
    }
  }

  const testSpecificSource = async (source: string, type: 'institution' | 'bursary') => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/scraper/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, type })
      })
      const result = await response.json()
      console.log(`✅ ${type} test completed:`, result)
      
      // Update the last result with specific test data
      if (result.success) {
        setLastResult(prev => ({
          ...prev!,
          [type === 'institution' ? 'institutions' : 'bursaries']: result.result[type === 'institution' ? 'institutions' : 'bursaries'] || [],
          message: result.message
        }))
      }
    } catch (error) {
      console.error(`❌ ${type} test failed:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (autoRefresh) {
      interval = setInterval(() => {
        runScraper()
      }, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🕷️ Real-Time Scraper Dashboard</h1>
          <p className="text-muted-foreground">Monitor and test Apply4Me's web scraping system</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Auto Refresh
          </Button>
          
          <Button
            onClick={runScraper}
            disabled={loading || isRunning}
            className="bg-primary"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Globe className="w-4 h-4 mr-2" />
            )}
            Run Scraper
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {isRunning ? (
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isRunning ? 'Running' : 'Ready'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastResult ? `Last run: ${new Date(lastResult.timestamp).toLocaleTimeString()}` : 'Never run'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <School className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastResult?.summary.institutionsFound || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Universities & Colleges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bursaries</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastResult?.summary.bursariesFound || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Funding Opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastResult?.summary.errorsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scraping Issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Quick Tests</CardTitle>
          <CardDescription>Test specific sources and data types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('University of Cape Town', 'institution')}
              disabled={loading}
            >
              Test UCT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('University of the Witwatersrand', 'institution')}
              disabled={loading}
            >
              Test Wits
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('NSFAS', 'bursary')}
              disabled={loading}
            >
              Test NSFAS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('Sasol Bursaries', 'bursary')}
              disabled={loading}
            >
              Test Sasol
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Tabs defaultValue="institutions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="institutions">
              Institutions ({lastResult.institutions.length})
            </TabsTrigger>
            <TabsTrigger value="bursaries">
              Bursaries ({lastResult.bursaries.length})
            </TabsTrigger>
            <TabsTrigger value="errors">
              Errors ({lastResult.errors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="institutions" className="space-y-4">
            <div className="grid gap-4">
              {lastResult.institutions.map((institution, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{institution.name}</CardTitle>
                      <Badge variant={institution.type === 'university' ? 'default' : 'secondary'}>
                        {institution.type}
                      </Badge>
                    </div>
                    <CardDescription>{institution.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{institution.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>🌐 {institution.website}</span>
                        <span>📅 Deadline: {institution.applicationDeadline}</span>
                        <span>🕐 {new Date(institution.scrapedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bursaries" className="space-y-4">
            <div className="grid gap-4">
              {lastResult.bursaries.map((bursary, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{bursary.title}</CardTitle>
                      <Badge variant={bursary.isActive ? 'default' : 'secondary'}>
                        {bursary.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{bursary.provider}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>💰 {typeof bursary.amount === 'number' ? `R${bursary.amount.toLocaleString()}` : bursary.amount}</span>
                      <span>📅 Deadline: {bursary.applicationDeadline}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            {lastResult.errors.length > 0 ? (
              <div className="space-y-2">
                {lastResult.errors.map((error, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">{error}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">No errors detected</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
