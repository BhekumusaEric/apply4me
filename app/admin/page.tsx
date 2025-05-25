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
  Eye
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
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features coming soon!
                  </p>
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
