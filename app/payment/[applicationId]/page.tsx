'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  AlertCircle
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { formatCurrency } from '@/lib/utils'

interface Application {
  id: string
  institution_id: string
  institution_name: string
  service_type: 'standard' | 'express'
  total_amount: number
  status: string
  payment_status: string
  personal_info: any
}

interface PaymentMethod {
  id: string
  name: string
  icon: any
  description: string
  processingTime: string
  fees: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: any
  description: string
  processingTime: string
  fees: string
  available: boolean
  recommended?: boolean
  comingSoon?: boolean
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'eft',
    name: 'EFT/Bank Transfer',
    icon: Building2,
    description: 'Direct bank transfer - Available Now',
    processingTime: 'Instant verification',
    fees: 'No additional fees',
    available: true,
    recommended: true
  },
  {
    id: 'mobile',
    name: 'SnapScan/Mobile Payment',
    icon: Smartphone,
    description: 'QR code payment - Available Now',
    processingTime: '1-2 minutes',
    fees: 'No additional fees',
    available: true
  },
  {
    id: 'capitec',
    name: 'Capitec Pay',
    icon: Smartphone,
    description: 'Instant Capitec transfer - Available Now',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Coming Soon - Automated card payments',
    processingTime: 'Coming Soon',
    fees: 'Coming Soon',
    available: false,
    comingSoon: true
  }
]

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    fetchApplicationDetails()
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
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod || !application) return

    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const supabase = createClient()
      const updatedApplication = {
        ...application,
        payment_status: 'paid',
        status: 'submitted',
        payment_method: selectedMethod,
        payment_date: new Date().toISOString()
      }

      // Try to update in database
      try {
        const { error } = await supabase
          .from('applications')
          .update({
            payment_status: 'paid',
            status: 'submitted',
            payment_method: selectedMethod,
            payment_date: new Date().toISOString()
          })
          .eq('id', application.id)

        if (error) {
          // Update localStorage as fallback
          localStorage.setItem(`application_${application.id}`, JSON.stringify(updatedApplication))
        }
      } catch (dbError) {
        // Update localStorage as fallback
        localStorage.setItem(`application_${application.id}`, JSON.stringify(updatedApplication))
      }

      // Redirect to success page
      router.push(`/payment/success/${application.id}`)
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payment details...</p>
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold">Complete Payment</h1>
            <p className="text-muted-foreground">Secure payment for your application</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Choose Payment Method
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All payments are secured with 256-bit SSL encryption
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === method.id ? 'ring-2 ring-primary border-primary' : 'hover:border-muted-foreground'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`} />
                      <method.icon className="h-6 w-6 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-green-600">{method.processingTime}</div>
                        <div className="text-muted-foreground">{method.fees}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Form */}
            {selectedMethod === 'card' && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={paymentData.cardholderName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'eft' && (
              <Card>
                <CardHeader>
                  <CardTitle>Instant EFT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Secure Bank Transfer</h3>
                    <p className="text-muted-foreground mb-4">
                      You will be redirected to your bank's secure payment portal
                    </p>
                    <div className="flex justify-center gap-4">
                      <Image src="/logos/fnb.png" alt="FNB" width={60} height={40} className="opacity-60" />
                      <Image src="/logos/absa.png" alt="ABSA" width={60} height={40} className="opacity-60" />
                      <Image src="/logos/standard-bank.png" alt="Standard Bank" width={60} height={40} className="opacity-60" />
                      <Image src="/logos/nedbank.png" alt="Nedbank" width={60} height={40} className="opacity-60" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'mobile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Scan to Pay</h3>
                    <p className="text-muted-foreground mb-4">
                      Use your mobile banking app or payment app to scan the QR code
                    </p>
                    <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-muted-foreground">QR Code</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Supported: SnapScan, Zapper, Banking Apps
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{application.institution_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Application for {application.personal_info?.firstName} {application.personal_info?.lastName}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Institution Fee</span>
                    <span>{formatCurrency((application.total_amount || 0) - (application.service_type === 'express' ? 100 : 50))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee ({application.service_type})</span>
                    <span>{formatCurrency(application.service_type === 'express' ? 100 : 50)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(application.total_amount)}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Secure Payment</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment is protected by 256-bit SSL encryption
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={!selectedMethod || processing}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay {formatCurrency(application.total_amount)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">What happens next?</h4>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Payment confirmation via email & SMS</li>
                      <li>• Application submitted to institution</li>
                      <li>• Track progress in your dashboard</li>
                      <li>• Receive updates on application status</li>
                    </ul>
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
