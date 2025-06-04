'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Database,
  Users,
  GraduationCap,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  BookOpen,
  CreditCard,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { Header } from '@/components/layout/header'

interface DatabaseStats {
  institutions: {
    total: number
    byType: Record<string, number>
  }
  bursaries: {
    total: number
    active: number
    byProvider: Record<string, number>
  }
  applications: {
    total: number
    byStatus: Record<string, number>
  }
  users: {
    total: number
  }
  lastUpdated: string
}

interface LiveData {
  institutions: any[]
  bursaries: any[]
  applications: any[]
  users: any[]
  profiles: any[]
  notifications: any[]
}

export default function DatabaseOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null)
  const [liveData, setLiveData] = useState<LiveData>({
    institutions: [],
    bursaries: [],
    applications: [],
    users: [],
    profiles: [],
    notifications: []
  })
  const [error, setError] = useState<string | null>(null)

  const fetchDatabaseStats = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/database/populate?action=stats')
      const data = await response.json()
      
      if (data.success) {
        setDatabaseStats(data.database.statistics)
        setError(null)
      } else {
        setError('Failed to fetch database statistics')
      }
    } catch (err) {
      setError('Error connecting to database')
      console.error('Database stats error:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const fetchLiveData = async () => {
    try {
      // Fetch institutions
      const institutionsRes = await fetch('/api/institutions')
      const institutionsData = await institutionsRes.json()
      
      // Fetch bursaries
      const bursariesRes = await fetch('/api/bursaries')
      const bursariesData = await bursariesRes.json()

      setLiveData(prev => ({
        ...prev,
        institutions: institutionsData.institutions || [],
        bursaries: bursariesData.bursaries || []
      }))
    } catch (err) {
      console.error('Live data fetch error:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchDatabaseStats(),
        fetchLiveData()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [])

  const handleRefresh = async () => {
    await Promise.all([
      fetchDatabaseStats(),
      fetchLiveData()
    ])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading database overview...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Database Overview
            </h1>
            <p className="text-muted-foreground">
              Real-time view of all database tables and statistics
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Database Stats Overview */}
        {databaseStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                    <p className="text-2xl font-bold">{databaseStats.institutions.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Object.entries(databaseStats.institutions.byType).map(([type, count]) => 
                        `${count} ${type}`
                      ).join(', ')}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bursaries</p>
                    <p className="text-2xl font-bold">{databaseStats.bursaries.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {databaseStats.bursaries.active} active
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applications</p>
                    <p className="text-2xl font-bold">{databaseStats.applications.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Object.entries(databaseStats.applications.byStatus).length > 0 
                        ? Object.entries(databaseStats.applications.byStatus).map(([status, count]) => 
                            `${count} ${status}`
                          ).join(', ')
                        : 'No applications yet'
                      }
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Users</p>
                    <p className="text-2xl font-bold">{databaseStats.users.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {new Date(databaseStats.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Data Tables */}
        <Tabs defaultValue="institutions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="bursaries">Bursaries</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="institutions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Institutions ({liveData.institutions.length})
                </CardTitle>
                <CardDescription>
                  All registered institutions in the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveData.institutions.map((institution, index) => (
                    <div key={institution.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{institution.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline">{institution.type}</Badge>
                          <span className="text-sm text-muted-foreground">{institution.province}</span>
                          {institution.application_fee && (
                            <span className="text-sm font-medium">R{institution.application_fee}</span>
                          )}
                        </div>
                        {institution.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {institution.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {institution.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        <Badge variant="secondary">
                          {institution.created_at ? new Date(institution.created_at).getFullYear() : 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bursaries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bursaries ({liveData.bursaries.length})
                </CardTitle>
                <CardDescription>
                  Available bursaries and funding opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveData.bursaries.map((bursary, index) => (
                    <div key={bursary.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{bursary.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline">{bursary.provider}</Badge>
                          {bursary.type && <Badge variant="secondary">{bursary.type}</Badge>}
                          {bursary.amount_min && bursary.amount_max && (
                            <span className="text-sm font-medium">
                              R{bursary.amount_min.toLocaleString()} - R{bursary.amount_max.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {bursary.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {bursary.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {bursary.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {bursary.application_deadline && (
                          <Badge variant="outline">
                            Due: {new Date(bursary.application_deadline).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Applications ({liveData.applications.length})
                </CardTitle>
                <CardDescription>
                  All user applications in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {liveData.applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground">
                      Applications will appear here once users start applying to institutions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveData.applications.map((application, index) => (
                      <div key={application.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {application.personal_info?.firstName} {application.personal_info?.lastName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline">{application.status}</Badge>
                            <Badge variant={application.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {application.payment_status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              R{application.total_amount}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Institution Types Distribution */}
              {databaseStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Institution Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(databaseStats.institutions.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count / databaseStats.institutions.total) * 100} 
                              className="w-20" 
                            />
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bursary Providers */}
              {databaseStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Bursary Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(databaseStats.bursaries.byProvider)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([provider, count]) => (
                        <div key={provider} className="flex items-center justify-between">
                          <span className="text-sm">{provider}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
