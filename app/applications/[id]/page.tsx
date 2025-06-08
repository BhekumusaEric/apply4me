'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useAuth } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  User,
  GraduationCap,
  TrendingUp,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface Application {
  id: string
  user_id: string
  institution_id: string
  personal_info: any
  academic_info: any
  service_type: string
  total_amount: number
  status: string
  payment_status: string
  payment_method?: string
  payment_date?: string
  created_at: string
  updated_at?: string
  institution_name?: string
}

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    fetchApplicationDetails()
  }, [user, params.id, router])

  const fetchApplicationDetails = async () => {
    try {
      const supabase = createClient()

      // First try to get from database
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            institutions!inner(name)
          `)
          .eq('id', params.id)
          .eq('user_id', user?.id)
          .single()

        if (!error && data) {
          setApplication({
            ...data,
            institution_name: data.institutions.name
          })
          setLoading(false)
          return
        }
      } catch (dbError) {
        console.warn('Database fetch failed, trying localStorage:', dbError)
      }

      // Fallback to localStorage
      const storedApplication = localStorage.getItem(`application_${params.id}`)
      if (storedApplication) {
        const appData = JSON.parse(storedApplication)

        if (appData.user_id === user?.id) {
          setApplication({
            ...appData,
            institution_name: 'University of the Witwatersrand' // Mock institution name
          })
        } else {
          router.push('/dashboard')
        }
      } else {
        console.error('Application not found')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

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
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'submitted':
        return <TrendingUp className="h-5 w-5 text-yellow-600" />
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'draft':
        return 25
      case 'submitted':
        return 50
      case 'processing':
        return 75
      case 'completed':
        return 100
      default:
        return 0
    }
  }

  const handleWithdrawApplication = async () => {
    if (!application || !confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return
    }

    try {
      // Update in localStorage
      const updatedApplication = {
        ...application,
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      }

      localStorage.setItem(`application_${application.id}`, JSON.stringify(updatedApplication))
      setApplication(updatedApplication)

      // Try to update in database as well
      const supabase = createClient()
      await supabase
        .from('applications')
        .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
        .eq('id', application.id)

    } catch (error) {
      console.error('Error withdrawing application:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading application details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{application.institution_name}</h1>
            <p className="text-muted-foreground">
              Application #{application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(application.status)}
            <Badge className={getStatusColor(application.status)} variant="secondary">
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{getProgressPercentage(application.status)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(application.status)} />

                  <div className="grid grid-cols-4 gap-4 text-center text-xs">
                    <div className={`${['draft', 'submitted', 'processing', 'completed'].includes(application.status) ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className="font-medium">Draft</div>
                    </div>
                    <div className={`${['submitted', 'processing', 'completed'].includes(application.status) ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className="font-medium">Submitted</div>
                    </div>
                    <div className={`${['processing', 'completed'].includes(application.status) ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className="font-medium">Processing</div>
                    </div>
                    <div className={`${application.status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className="font-medium">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Applicant Name</h4>
                    <p>{application.personal_info?.firstName} {application.personal_info?.lastName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Service Type</h4>
                    <Badge variant={application.service_type === 'express' ? 'default' : 'secondary'}>
                      {application.service_type === 'express' ? 'Express' : 'Standard'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Application Date</h4>
                    <p>{formatDate(application.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Total Amount</h4>
                    <p className="font-semibold">{formatCurrency(application.total_amount)}</p>
                  </div>
                </div>

                {application.payment_date && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Payment Date</h4>
                    <p>{formatDate(application.payment_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Payment Status</span>
                    <Badge variant={application.payment_status === 'paid' ? 'default' : 'destructive'}>
                      {application.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Institution Fee</span>
                      <span>{formatCurrency((application.total_amount || 0) - (application.service_type === 'express' ? 100 : 50))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Apply4Me Service Fee ({application.service_type})</span>
                      <span>{formatCurrency(application.service_type === 'express' ? 100 : 50)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(application.total_amount)}</span>
                    </div>
                  </div>

                  {application.payment_method && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Payment Method</h4>
                      <p className="capitalize">{application.payment_method}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.payment_status === 'pending' && (
                  <Button className="w-full" asChild>
                    <Link href={`/payment/${application.id}`}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Payment
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Application
                </Button>

                {['draft', 'submitted'].includes(application.status) && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleWithdrawApplication}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Withdraw Application
                  </Button>
                )}

                <Button variant="outline" className="w-full" onClick={fetchApplicationDetails}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>apply4me2025@outlook.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+27 69 343 4126</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/help">
                    Get Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
