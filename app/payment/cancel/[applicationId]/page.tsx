'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  Home,
  CreditCard
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'

interface Application {
  id: string
  institution_name: string
  total_amount: number
  service_type: 'standard' | 'express'
}

export default function PaymentCancelPage() {
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
    
    // Check for PayFast cancel parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const paymentId = urlParams.get('pf_payment_id')
      
      if (paymentId) {
        console.log('PayFast cancellation detected:', { paymentId })
      }
    }
  }, [user, params.applicationId, router])

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
        setApplication({
          ...appData,
          institution_name: appData.institution_name || 'Selected Institution'
        })
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = () => {
    router.push(`/payment/${params.applicationId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
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
      <main className="container py-8 max-w-2xl">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-900 mb-2">Payment Cancelled</h1>
          <p className="text-lg text-muted-foreground">
            Your payment was cancelled and your application is still pending
          </p>
        </div>

        {/* Application Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Application ID</h4>
                <p className="font-mono text-sm">{application.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Institution</h4>
                <p>{application.institution_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Amount Due</h4>
                <p className="font-semibold text-lg">R{application.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Payment Pending
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happened */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your payment was cancelled before completion. This could happen if:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>You clicked the back button or closed the payment window</li>
              <li>The payment session timed out</li>
              <li>There was an issue with your payment method</li>
              <li>You chose to cancel the transaction</li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>What Would You Like to Do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRetryPayment} className="w-full" size="lg">
              <CreditCard className="mr-2 h-5 w-5" />
              Try Payment Again
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Need help with payment?
              </p>
              <Button variant="link" size="sm">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
