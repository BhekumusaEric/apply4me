'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  School,
  DollarSign,
  Database,
  Eye,
  Settings,
  Zap,
  Target,
  Activity
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface ScraperManagerProps {
  onRefresh: () => void
}

export function RealTimeScraperManager({ onRefresh }: ScraperManagerProps) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<ScrapingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [scraperStats, setScraperStats] = useState({
    totalRuns: 0,
    successRate: 0,
    avgInstitutions: 0,
    avgBursaries: 0,
    lastRunTime: null as string | null
  })

  // Run the new real-time scraper
  const runRealTimeScraper = async () => {
    setLoading(true)
    setIsRunning(true)
    
    try {
      console.log('🕷️ Running real-time scraper with deadline filtering...')
      const response = await fetch('/api/scraper/test')
      const result = await response.json()
      
      if (result.success) {
        setLastResult(result)
        updateScraperStats(result)
        
        toast({
          title: "🎉 Real-Time Scraper Success",
          description: `Found ${result.summary.institutionsFound} institutions, ${result.summary.bursariesFound} bursaries`,
        })
        
        // Refresh the main admin data
        onRefresh()
      } else {
        throw new Error(result.error || 'Scraper failed')
      }
    } catch (error) {
      console.error('❌ Real-time scraping failed:', error)
      
      const errorResult: ScrapingResult = {
        success: false,
        timestamp: new Date().toISOString(),
        summary: { institutionsFound: 0, bursariesFound: 0, errorsCount: 1 },
        institutions: [],
        bursaries: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Real-time scraping failed'
      }
      
      setLastResult(errorResult)
      
      toast({
        title: "❌ Scraper Error",
        description: "Real-time scraping failed. Check the logs for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsRunning(false)
    }
  }

  // Test specific source
  const testSpecificSource = async (source: string, type: 'institution' | 'bursary') => {
    setLoading(true)
    
    try {
      console.log(`🧪 Testing ${type}: ${source}`)
      const response = await fetch('/api/scraper/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, type })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: `✅ ${type} Test Success`,
          description: `${source} test completed successfully`,
        })
        
        // Update the last result with specific test data
        if (lastResult) {
          setLastResult(prev => ({
            ...prev!,
            [type === 'institution' ? 'institutions' : 'bursaries']: 
              result.result[type === 'institution' ? 'institutions' : 'bursaries'] || [],
            message: result.message
          }))
        }
      } else {
        throw new Error(result.error || 'Test failed')
      }
    } catch (error) {
      console.error(`❌ ${type} test failed:`, error)
      toast({
        title: `❌ ${type} Test Failed`,
        description: `${source} test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update scraper statistics
  const updateScraperStats = (result: ScrapingResult) => {
    setScraperStats(prev => ({
      totalRuns: prev.totalRuns + 1,
      successRate: result.success ? 
        Math.round(((prev.successRate * prev.totalRuns) + 100) / (prev.totalRuns + 1)) :
        Math.round(((prev.successRate * prev.totalRuns) + 0) / (prev.totalRuns + 1)),
      avgInstitutions: Math.round(((prev.avgInstitutions * prev.totalRuns) + result.summary.institutionsFound) / (prev.totalRuns + 1)),
      avgBursaries: Math.round(((prev.avgBursaries * prev.totalRuns) + result.summary.bursariesFound) / (prev.totalRuns + 1)),
      lastRunTime: result.timestamp
    }))
  }

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (autoRefresh) {
      interval = setInterval(() => {
        runRealTimeScraper()
      }, 60000) // Refresh every minute
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                🕷️ Real-Time Web Scraper
              </CardTitle>
              <CardDescription>
                Advanced scraper with deadline filtering and real-time application status detection
              </CardDescription>
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
                onClick={runRealTimeScraper}
                disabled={loading || isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Run Scraper
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              {lastResult ? `Last: ${new Date(lastResult.timestamp).toLocaleTimeString()}` : 'Never run'}
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
              Avg: {scraperStats.avgInstitutions}
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
              Avg: {scraperStats.avgBursaries}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scraperStats.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {scraperStats.totalRuns} total runs
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
              Current run
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            🧪 Quick Source Tests
          </CardTitle>
          <CardDescription>Test individual sources and data types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('University of Cape Town', 'institution')}
              disabled={loading}
              className="flex flex-col h-16"
            >
              <School className="h-4 w-4 mb-1" />
              Test UCT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('University of the Witwatersrand', 'institution')}
              disabled={loading}
              className="flex flex-col h-16"
            >
              <School className="h-4 w-4 mb-1" />
              Test Wits
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('NSFAS', 'bursary')}
              disabled={loading}
              className="flex flex-col h-16"
            >
              <DollarSign className="h-4 w-4 mb-1" />
              Test NSFAS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSpecificSource('Sasol Bursaries', 'bursary')}
              disabled={loading}
              className="flex flex-col h-16"
            >
              <DollarSign className="h-4 w-4 mb-1" />
              Test Sasol
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              📊 Latest Scraping Results
            </CardTitle>
            <CardDescription>
              Results from the most recent scraping run with deadline filtering applied
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="institutions">
                  Institutions ({lastResult.institutions.length})
                </TabsTrigger>
                <TabsTrigger value="bursaries">
                  Bursaries ({lastResult.bursaries.length})
                </TabsTrigger>
                {lastResult.errors.length > 0 && (
                  <TabsTrigger value="errors">
                    Errors ({lastResult.errors.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{lastResult.summary.institutionsFound}</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Institutions Found</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">With deadline validation</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{lastResult.summary.bursariesFound}</div>
                    <p className="text-sm text-green-700 dark:text-green-300">Bursaries Found</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Active opportunities only</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{lastResult.summary.errorsCount}</div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Errors Encountered</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">With graceful fallbacks</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">🎯 Scraping Features Active:</h4>
                  <ul className="text-sm space-y-1">
                    <li>✅ Real-time deadline validation and filtering</li>
                    <li>✅ Application status detection (open/closed)</li>
                    <li>✅ Smart content extraction from official sources</li>
                    <li>✅ Automatic expired opportunity removal</li>
                    <li>✅ South African university calendar awareness</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="institutions" className="space-y-4">
                <div className="grid gap-4">
                  {lastResult.institutions.slice(0, 5).map((institution, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{institution.name}</h4>
                          <Badge variant={institution.type === 'university' ? 'default' : 'secondary'}>
                            {institution.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{institution.location}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>🌐 {institution.website}</span>
                          <span>📅 {institution.applicationDeadline}</span>
                          <span>🕐 {new Date(institution.scrapedAt).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {lastResult.institutions.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {lastResult.institutions.length - 5} more institutions
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bursaries" className="space-y-4">
                <div className="grid gap-4">
                  {lastResult.bursaries.map((bursary, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{bursary.title}</h4>
                          <Badge variant={bursary.isActive ? 'default' : 'secondary'}>
                            {bursary.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{bursary.provider}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>💰 {typeof bursary.amount === 'number' ? `R${bursary.amount.toLocaleString()}` : bursary.amount}</span>
                          <span>📅 {bursary.applicationDeadline}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {lastResult.errors.length > 0 && (
                <TabsContent value="errors" className="space-y-4">
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
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
