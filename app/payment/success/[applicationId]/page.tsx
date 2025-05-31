'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Download,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Home,
  Eye
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Application {
  id: string
  institution_name: string
  service_type: 'standard' | 'express'
  total_amount: number
  payment_date: string
  personal_info: any
  academic_info: any
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplicationDetails()

    // Check for PayFast return parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const paymentId = urlParams.get('pf_payment_id')
      const paymentStatus = urlParams.get('payment_status')

      if (paymentId && paymentStatus) {
        console.log('PayFast return detected:', { paymentId, paymentStatus })
        // PayFast will handle the status update via ITN webhook
        // This is just for user feedback
      }
    }
  }, [params.applicationId])

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
          .eq('id', params.applicationId)
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
        // Database fetch failed, trying localStorage
      }

      // Fallback to localStorage
      const storedApplication = localStorage.getItem(`application_${params.applicationId}`)
      if (storedApplication) {
        const appData = JSON.parse(storedApplication)

        // Mock institution data for demo
        const mockInstitution = {
          name: 'University of the Witwatersrand',
          application_fee: 150,
          logo_url: '/images/institutions/wits-logo.png'
        }

        setApplication({
          ...appData,
          institution_name: mockInstitution.name,
          institutions: mockInstitution
        })
      }
    } catch (error) {
      // Error fetching application
    } finally {
      setLoading(false)
    }
  }

  const generateReceiptNumber = () => {
    return `APY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading confirmation...</p>
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
      <main className="container py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Your application has been submitted to {application.institution_name}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Application ID</h4>
                    <p className="font-mono text-sm">{application.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Receipt Number</h4>
                    <p className="font-mono text-sm">{generateReceiptNumber()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Institution</h4>
                    <p>{application.institution_name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Service Type</h4>
                    <Badge variant={application.service_type === 'express' ? 'default' : 'secondary'}>
                      {application.service_type === 'express' ? 'Express' : 'Standard'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Applicant</h4>
                    <p>{application.personal_info?.firstName} {application.personal_info?.lastName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Payment Date</h4>
                    <p>{formatDate(application.payment_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="payment-summary">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm card-content-text">
                    <span>Institution Application Fee</span>
                    <span>{formatCurrency((application.total_amount || 0) - (application.service_type === 'express' ? 100 : 50))}</span>
                  </div>
                  <div className="flex justify-between text-sm card-content-text">
                    <span>Apply4Me Service Fee ({application.service_type})</span>
                    <span>{formatCurrency(application.service_type === 'express' ? 100 : 50)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg card-content-text">
                    <span>Total Paid</span>
                    <span className="text-green-600">{formatCurrency(application.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Application Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Your application is being processed and will be submitted to {application.institution_name} within{' '}
                        {application.service_type === 'express' ? '1-2 business days' : '5-7 business days'}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Institution Review</h4>
                      <p className="text-sm text-muted-foreground">
                        The institution will review your application and may request additional documents.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Decision Notification</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll receive notification of the institution's decision via email and SMS.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/dashboard">
                    <Eye className="mr-2 h-4 w-4" />
                    View in Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-sm">Email Confirmation</h4>
                    <p className="text-xs text-muted-foreground">Sent to {application.personal_info?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-sm">SMS Updates</h4>
                    <p className="text-xs text-muted-foreground">Sent to {application.personal_info?.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you have any questions about your application, our support team is here to help.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Email:</strong> support@apply4me.co.za
                  </div>
                  <div>
                    <strong>Phone:</strong> +27 (0) 11 123 4567
                  </div>
                  <div>
                    <strong>Hours:</strong> Mon-Fri 8AM-6PM
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
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
