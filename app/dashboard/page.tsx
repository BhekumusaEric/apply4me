'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  GraduationCap,
  CreditCard,
  Award,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Shield
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'

interface Application {
  id: string
  institution_name: string
  status: 'draft' | 'submitted' | 'processing' | 'completed'
  service_type: 'standard' | 'express'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [stats, setStats] = useState({
    totalApplications: 0,
    submittedApplications: 0,
    completedApplications: 0,
    pendingPayments: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Check if user just verified their email (new user)
    const urlParams = new URLSearchParams(window.location.search)
    const isNewUser = urlParams.get('welcome') === 'true'
    if (isNewUser) {
      setShowWelcome(true)
      // Remove the welcome parameter from URL
      window.history.replaceState({}, '', '/dashboard')
      // Hide welcome message after 5 seconds
      setTimeout(() => setShowWelcome(false), 5000)
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()
      let formattedApplications: Application[] = []

      // First try to fetch from database
      try {
        const { data: applicationsData, error: appsError } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            service_type,
            payment_status,
            created_at,
            institutions (
              name
            )
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (!appsError && applicationsData) {
          formattedApplications = applicationsData.map(app => ({
            id: app.id,
            institution_name: (app.institutions as any)?.name || 'Unknown Institution',
            status: app.status,
            service_type: app.service_type,
            payment_status: app.payment_status,
            created_at: app.created_at
          }))
        }
      } catch (dbError) {
        console.warn('Database fetch failed, checking localStorage:', dbError)
      }

      // Also check localStorage for applications
      const localStorageApplications: Application[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('application_')) {
          try {
            const appData = JSON.parse(localStorage.getItem(key) || '{}')
            if (appData.user_id === user?.id) {
              localStorageApplications.push({
                id: appData.id,
                institution_name: 'University of the Witwatersrand', // Mock institution name
                status: appData.status || 'draft',
                service_type: appData.service_type || 'standard',
                payment_status: appData.payment_status || 'pending',
                created_at: appData.created_at || new Date().toISOString()
              })
            }
          } catch (parseError) {
            console.warn('Error parsing localStorage application:', parseError)
          }
        }
      }

      // Combine database and localStorage applications, removing duplicates
      const allApplications = [...formattedApplications]
      localStorageApplications.forEach(localApp => {
        if (!allApplications.find(dbApp => dbApp.id === localApp.id)) {
          allApplications.push(localApp)
        }
      })

      // Sort by created_at (newest first)
      allApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setApplications(allApplications)

      // Calculate stats
      const totalApplications = allApplications.length
      const submittedApplications = allApplications.filter(app =>
        ['submitted', 'processing', 'completed'].includes(app.status)
      ).length
      const completedApplications = allApplications.filter(app =>
        app.status === 'completed'
      ).length
      const pendingPayments = allApplications.filter(app =>
        app.payment_status === 'pending'
      ).length

      setStats({
        totalApplications,
        submittedApplications,
        completedApplications,
        pendingPayments
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use mock data for demo
      setApplications(mockApplications)
      setStats({
        totalApplications: 3,
        submittedApplications: 2,
        completedApplications: 1,
        pendingPayments: 1
      })
    } finally {
      setLoading(false)
    }
  }

  const mockApplications: Application[] = [
    {
      id: '1',
      institution_name: 'University of the Witwatersrand',
      status: 'completed',
      service_type: 'express',
      payment_status: 'paid',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      institution_name: 'University of Cape Town',
      status: 'processing',
      service_type: 'standard',
      payment_status: 'paid',
      created_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      institution_name: 'Stellenbosch University',
      status: 'draft',
      service_type: 'standard',
      payment_status: 'pending',
      created_at: '2024-01-25T09:15:00Z'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'processing':
        return <Clock className="h-4 w-4" />
      case 'submitted':
        return <TrendingUp className="h-4 w-4" />
      case 'draft':
        return <FileText className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (!user) {
    return null // Will redirect to signin
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        {/* Welcome Banner for New Users */}
        {showWelcome && (
          <div className="mb-6 p-6 bg-gradient-to-r from-sa-green/10 to-sa-blue/10 border border-sa-green/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-sa-green" />
              <h2 className="text-xl font-bold text-sa-green">Welcome to Apply4Me!</h2>
            </div>
            <p className="text-muted-foreground mb-3">
              🎉 Your email has been verified successfully! You're now ready to start your higher education journey.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/career-profiler">
                  <Award className="h-4 w-4 mr-2" />
                  Take Career Test
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/institutions">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Browse Institutions
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {showWelcome ? 'Welcome to your dashboard' : 'Welcome back'}, {user?.user_metadata?.full_name || user?.email || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            {showWelcome
              ? 'Start your higher education journey with Apply4Me'
              : 'Track your applications and continue your higher education journey'
            }
          </p>

          {/* Admin Access */}
          {user?.email && [
            'bhntshwcjc025@student.wethinkcode.co.za',
            'admin@apply4me.co.za',
            'bhekumusa@apply4me.co.za'
          ].includes(user.email) && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                🔐 Admin Access Available
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                You have admin privileges. Access the admin dashboard to manage institutions and applications.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Open Admin Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/login">
                    Admin Login
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Applications created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submittedApplications}</div>
              <p className="text-xs text-muted-foreground">
                Applications in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedApplications}</div>
              <p className="text-xs text-muted-foreground">
                Successfully processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Applications</CardTitle>
                  <CardDescription>
                    Track the status of your institution applications
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button asChild>
                    <Link href="/institutions">
                      <Plus className="h-4 w-4 mr-2" />
                      New Application
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your journey by applying to your first institution
                    </p>
                    <Button asChild>
                      <Link href="/institutions">Browse Institutions</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <div>
                              <h4 className="font-medium">{application.institution_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {application.service_type === 'express' ? 'Express' : 'Standard'} Service
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(application.status)} variant="secondary">
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>

                          {application.payment_status === 'pending' && (
                            <Badge variant="destructive">Payment Due</Badge>
                          )}

                          <div className="flex gap-2">
                            {application.payment_status === 'pending' && (
                              <Button size="sm" asChild>
                                <Link href={`/payment/${application.id}`}>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay Now
                                </Link>
                              </Button>
                            )}

                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/applications/${application.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/career-profiler">
                    <Award className="h-4 w-4 mr-2" />
                    Take Career Test
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/institutions">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Browse Institutions
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/bursaries">
                    <Award className="h-4 w-4 mr-2" />
                    Find Bursaries
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
                <CardDescription>
                  Your overall application completion rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Completion</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Documents Uploaded</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Applications Submitted</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
