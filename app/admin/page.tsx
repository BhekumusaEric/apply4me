'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Award,
  Clock,
  FileText
} from 'lucide-react'
import { useAuth } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading'

interface Institution {
  id: string
  name: string
  type: string
  location: string
  logo_url?: string
  application_fee: number
  description?: string
  website?: string
  created_at: string
}

interface Application {
  id: string
  user_id: string
  institution_id: string
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  personal_info: any
  institutions?: Institution
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalApplications: 0,
    totalRevenue: 0,
    successRate: 0
  })

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin (specific email addresses)
    const adminEmails = [
      'bhntshwcjc025@student.wethinkcode.co.za',
      'admin@apply4me.co.za',
      'bhekumusa@apply4me.co.za'
    ]

    if (!adminEmails.includes(user.email || '')) {
      router.push('/')
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Fetch institutions
      const { data: institutionsData } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch applications
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          institutions (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })

      setInstitutions(institutionsData || [])
      setApplications(applicationsData || [])

      // Calculate stats
      const totalRevenue = (applicationsData || []).reduce((sum, app) => sum + (app.total_amount || 0), 0)
      const successfulApps = (applicationsData || []).filter(app => app.status === 'accepted').length
      const successRate = applicationsData?.length ? (successfulApps / applicationsData.length) * 100 : 0

      setStats({
        totalInstitutions: institutionsData?.length || 0,
        totalApplications: applicationsData?.length || 0,
        totalRevenue,
        successRate: Math.round(successRate)
      })

    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [newInstitution, setNewInstitution] = useState({
    name: '',
    type: '',
    location: '',
    application_fee: 0,
    description: '',
    website: ''
  })

  const handleAddInstitution = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('institutions')
        .insert([{
          ...newInstitution,
          id: crypto.randomUUID()
        }])

      if (!error) {
        setNewInstitution({
          name: '',
          type: '',
          location: '',
          application_fee: 0,
          description: '',
          website: ''
        })
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error adding institution:', error)
    }
  }

  // Automation trigger functions
  const triggerScraping = async (type: 'institutions' | 'bursaries' | 'both') => {
    try {
      console.log(`🚀 Triggering ${type} scraping...`)
      const response = await fetch('/api/automation/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ ${type} scraping completed:`, result.results)
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error(`❌ Error triggering ${type} scraping:`, error)
    }
  }

  const triggerNotifications = async (type: 'deadlines' | 'digest') => {
    try {
      console.log(`📧 Triggering ${type} notifications...`)
      const response = await fetch('/api/automation/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ ${type} notifications sent: ${result.emailsSent} emails`)
      }
    } catch (error) {
      console.error(`❌ Error triggering ${type} notifications:`, error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage institutions, applications, and monitor platform performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Institutions</p>
                  <p className="text-2xl font-bold">{stats.totalInstitutions}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">R{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="institutions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="institutions" className="space-y-6">
            {/* Add Institution Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Institution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Institution Name</Label>
                    <Input
                      id="name"
                      value={newInstitution.name}
                      onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                      placeholder="University of Cape Town"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newInstitution.type} onValueChange={(value) => setNewInstitution({...newInstitution, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="tvet">TVET College</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newInstitution.location}
                      onChange={(e) => setNewInstitution({...newInstitution, location: e.target.value})}
                      placeholder="Cape Town, Western Cape"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee">Application Fee (R)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={newInstitution.application_fee}
                      onChange={(e) => setNewInstitution({...newInstitution, application_fee: parseInt(e.target.value) || 0})}
                      placeholder="200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newInstitution.description}
                      onChange={(e) => setNewInstitution({...newInstitution, description: e.target.value})}
                      placeholder="Brief description of the institution..."
                    />
                  </div>
                </div>
                <Button onClick={handleAddInstitution} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Institution
                </Button>
              </CardContent>
            </Card>

            {/* Institutions List */}
            <Card>
              <CardHeader>
                <CardTitle>Institutions ({institutions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutions.map((institution) => (
                    <div key={institution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{institution.name}</h3>
                        <p className="text-sm text-muted-foreground">{institution.location} • {institution.type}</p>
                        <p className="text-sm">Application Fee: R{institution.application_fee}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <CardTitle>Recent Applications ({applications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">
                          {application.personal_info?.firstName} {application.personal_info?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {(application.institutions as any)?.name} • R{application.total_amount}
                        </p>
                        <p className="text-sm">
                          Applied: {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
                          {application.status}
                        </Badge>
                        <Badge variant={application.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {application.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Automation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  🤖 Data Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Manual Data Discovery</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => triggerScraping('institutions')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Discover New Institutions
                      </Button>
                      <Button
                        onClick={() => triggerScraping('bursaries')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Find New Bursaries
                      </Button>
                      <Button
                        onClick={() => triggerScraping('both')}
                        className="w-full justify-start"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Full Data Refresh
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Manual Notifications</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => triggerNotifications('deadlines')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Send Deadline Reminders
                      </Button>
                      <Button
                        onClick={() => triggerNotifications('digest')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Send Weekly Digest
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    🤖 Automation Status
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 dark:text-blue-300">Daily Scraping</p>
                      <p className="font-semibold">✅ Active</p>
                    </div>
                    <div>
                      <p className="text-blue-600 dark:text-blue-300">Email Alerts</p>
                      <p className="font-semibold">✅ Active</p>
                    </div>
                    <div>
                      <p className="text-blue-600 dark:text-blue-300">Last Update</p>
                      <p className="font-semibold">2 hours ago</p>
                    </div>
                    <div>
                      <p className="text-blue-600 dark:text-blue-300">Success Rate</p>
                      <p className="font-semibold">95%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">2,847</div>
                    <p className="text-sm text-muted-foreground">Total Students Helped</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">R2.4M</div>
                    <p className="text-sm text-muted-foreground">Bursaries Secured</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                    <p className="text-sm text-muted-foreground">Application Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
