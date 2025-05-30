'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  RefreshCw,
  School,
  DollarSign,
  BookOpen,
  Target,
  Activity,
  Zap
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ApplicationStatus {
  institutions: {
    total: number
    open: number
    closed: number
    openRate: number
  }
  programs: {
    total: number
    available: number
    unavailable: number
    availabilityRate: number
  }
  bursaries: {
    total: number
    active: number
    expired: number
    activeRate: number
  }
  deadlines: {
    upcoming: number
    urgentCount: number
    warningCount: number
  }
}

interface StatusResponse {
  success: boolean
  summary: ApplicationStatus
  insights: {
    applicationSeason: string
    recommendations: string[]
    alerts: string[]
  }
  timestamp: string
}

interface DeadlineManagerProps {
  onRefresh: () => void
}

export function DeadlineStatusManager({ onRefresh }: DeadlineManagerProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      console.log('📊 Fetching deadline status...')
      const response = await fetch('/api/scraper/status')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data)
        setLastUpdated(new Date())
        
        toast({
          title: "📊 Status Updated",
          description: "Deadline status refreshed successfully",
        })
      } else {
        throw new Error(data.error || 'Failed to fetch status')
      }
    } catch (error) {
      console.error('❌ Error fetching status:', error)
      toast({
        title: "❌ Status Error",
        description: "Failed to fetch deadline status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markExpired = async () => {
    setLoading(true)
    try {
      console.log('🗓️ Marking expired items...')
      const response = await fetch('/api/scraper/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_expired' })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✅ Cleanup Complete",
          description: `Marked expired items: ${data.result.institutionsUpdated} institutions, ${data.result.programsUpdated} programs, ${data.result.bursariesUpdated} bursaries`,
        })
        
        // Refresh status and main data
        await fetchStatus()
        onRefresh()
      } else {
        throw new Error(data.error || 'Failed to mark expired items')
      }
    } catch (error) {
      console.error('❌ Error marking expired items:', error)
      toast({
        title: "❌ Cleanup Error",
        description: "Failed to mark expired items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading deadline status...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                📅 Smart Deadline Management
              </CardTitle>
              <CardDescription>
                Real-time monitoring of application deadlines and availability with automatic filtering
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={markExpired}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark Expired
              </Button>
              <Button
                onClick={fetchStatus}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Season */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Application Season
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold text-blue-600 mb-2">
            {status.insights.applicationSeason}
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated?.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Institutions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <School className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.institutions.open}</div>
            <p className="text-xs text-muted-foreground">
              of {status.summary.institutions.total} accepting applications
            </p>
            <Progress 
              value={status.summary.institutions.openRate} 
              className="mt-2"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-green-600">
                {status.summary.institutions.open} open
              </span>
              <span className="text-red-600">
                {status.summary.institutions.closed} closed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Programs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.programs.available}</div>
            <p className="text-xs text-muted-foreground">
              of {status.summary.programs.total} programs available
            </p>
            <Progress 
              value={status.summary.programs.availabilityRate} 
              className="mt-2"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-green-600">
                {status.summary.programs.available} available
              </span>
              <span className="text-red-600">
                {status.summary.programs.unavailable} unavailable
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bursaries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bursaries</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.bursaries.active}</div>
            <p className="text-xs text-muted-foreground">
              of {status.summary.bursaries.total} bursaries active
            </p>
            <Progress 
              value={status.summary.bursaries.activeRate} 
              className="mt-2"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-green-600">
                {status.summary.bursaries.active} active
              </span>
              <span className="text-red-600">
                {status.summary.bursaries.expired} expired
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>
            Applications closing in the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {status.summary.deadlines.upcoming}
          </div>
          <p className="text-sm text-muted-foreground">
            deadlines approaching
          </p>
          
          {status.summary.deadlines.upcoming > 10 && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                ⚠️ High deadline volume detected. Consider sending urgent notifications to users.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {status.insights.alerts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.insights.alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{alert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {status.insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered suggestions based on current deadline status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deadline Management Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            🎯 Active Deadline Features
          </CardTitle>
          <CardDescription>
            Smart deadline management capabilities currently active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Active Features</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Real-time deadline validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Automatic expired item filtering
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  SA university calendar awareness
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Application window detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Smart database maintenance
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">🎯 Benefits</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  Students see only open opportunities
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  No expired deadlines shown
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  Accurate application status
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  Automated data freshness
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  Improved user trust
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
