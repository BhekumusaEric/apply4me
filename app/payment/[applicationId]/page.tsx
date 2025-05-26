'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Generate payment reference and calculate totals
  const paymentReference = `APY${params.applicationId?.toString().slice(-6).toUpperCase()}`
  const totalAmount = application?.total_amount || 200

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
      const supabase = createClient()

      // For manual payment methods, mark as pending verification
      if (['eft', 'mobile', 'capitec'].includes(selectedMethod)) {
        const updatedApplication = {
          ...application,
          payment_status: 'pending_verification',
          status: 'payment_pending',
          payment_method: selectedMethod,
          payment_reference: paymentReference,
          payment_date: new Date().toISOString()
        }

        // Try to update in database
        try {
          const { error } = await supabase
            .from('applications')
            .update({
              payment_status: 'pending_verification',
              status: 'payment_pending',
              payment_method: selectedMethod,
              payment_reference: paymentReference,
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

        // Redirect to pending verification page
        router.push(`/payment/pending?ref=${paymentReference}&method=${selectedMethod}&amount=${totalAmount}`)

      } else {
        // For automated payment methods (coming soon)
        alert('This payment method is coming soon! Please use EFT, Capitec Pay, or Mobile Payment for now.')
      }

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment processing failed. Please try again.')
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
                    className={`border rounded-lg p-4 transition-all ${
                      method.available
                        ? `cursor-pointer ${selectedMethod === method.id ? 'ring-2 ring-primary border-primary' : 'hover:border-muted-foreground'}`
                        : 'opacity-60 cursor-not-allowed bg-muted/30'
                    }`}
                    onClick={() => method.available && setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id && method.available
                          ? 'bg-primary border-primary'
                          : method.available
                            ? 'border-muted-foreground'
                            : 'border-muted-foreground/50'
                      }`} />
                      <method.icon className={`h-6 w-6 ${method.available ? 'text-muted-foreground' : 'text-muted-foreground/50'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${method.available ? '' : 'text-muted-foreground'}`}>
                            {method.name}
                          </h4>
                          {method.recommended && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Recommended
                            </Badge>
                          )}
                          {method.comingSoon && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${method.available ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                          {method.description}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className={`font-medium ${method.available ? 'text-green-600' : 'text-muted-foreground/70'}`}>
                          {method.processingTime}
                        </div>
                        <div className={`${method.available ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                          {method.fees}
                        </div>
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
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Card Payments Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Automated Card Payments</h3>
                    <p className="text-muted-foreground mb-4">
                      We're integrating with Yoco and PayFast to provide secure, automated card payments.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Coming Soon:</strong> One-click payments with Visa, Mastercard, and American Express
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'eft' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Bank Transfer Details
                  </CardTitle>
                  <CardDescription>
                    Transfer the exact amount to the account below and we'll verify your payment within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800 dark:text-green-200">Bank:</span>
                      <span className="font-semibold">Capitec Bank</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800 dark:text-green-200">Account Holder:</span>
                      <span className="font-semibold">Ntshwenya</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800 dark:text-green-200">Account Number:</span>
                      <span className="font-mono font-bold text-lg">1643495273</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800 dark:text-green-200">Branch Code:</span>
                      <span className="font-semibold">470010 (Universal Capitec Code)</span>
                    </div>
                    <div className="border-t border-green-200 dark:border-green-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-800 dark:text-green-200">Payment Reference:</span>
                        <span className="font-mono text-primary font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded">
                          {paymentReference}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t border-green-200 dark:border-green-700 pt-3">
                      <span className="text-green-800 dark:text-green-200">Amount to Pay:</span>
                      <span className="text-2xl text-green-600 dark:text-green-400">R{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Payment Instructions:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>Use the exact reference:</strong> {paymentReference}</li>
                      <li>• <strong>Transfer exact amount:</strong> R{totalAmount.toFixed(2)}</li>
                      <li>• <strong>Verification time:</strong> Within 24 hours (usually faster)</li>
                      <li>• <strong>Keep proof of payment</strong> for your records</li>
                      <li>• <strong>SMS/Email confirmation</strong> will be sent once verified</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Quick Payment Options:</h4>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <p>• <strong>Capitec App:</strong> Pay → Someone Else → Use account details above</p>
                      <p>• <strong>Internet Banking:</strong> Beneficiary payment with reference</p>
                      <p>• <strong>ATM/Branch:</strong> Cash deposit with reference number</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'mobile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    Mobile Payment Options
                  </CardTitle>
                  <CardDescription>
                    Quick and easy mobile payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SnapScan */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-600" />
                        SnapScan
                      </h4>
                      <div className="text-center">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <span className="text-green-600 font-bold">QR</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Scan with SnapScan app
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reference: {paymentReference}
                        </p>
                      </div>
                    </div>

                    {/* Zapper */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                        Zapper
                      </h4>
                      <div className="text-center">
                        <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <span className="text-purple-600 font-bold">QR</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Scan with Zapper app
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reference: {paymentReference}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📱 Mobile Payment Instructions:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>Amount:</strong> R{totalAmount.toFixed(2)}</li>
                      <li>• <strong>Reference:</strong> {paymentReference}</li>
                      <li>• <strong>Verification:</strong> Instant to 24 hours</li>
                      <li>• <strong>Confirmation:</strong> SMS/Email notification</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">🚧 QR Codes Coming Soon</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      We're setting up SnapScan and Zapper QR codes. For now, please use the EFT option above for fastest processing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'capitec' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-red-600" />
                    Capitec Pay
                  </CardTitle>
                  <CardDescription>
                    Instant payment using Capitec banking app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">📱 Capitec Pay Instructions:</h4>
                    <ol className="text-sm text-red-700 dark:text-red-300 space-y-2">
                      <li><strong>1.</strong> Open your Capitec banking app</li>
                      <li><strong>2.</strong> Go to "Pay" → "Someone Else"</li>
                      <li><strong>3.</strong> Enter these details:</li>
                      <div className="ml-4 bg-white dark:bg-gray-800 p-3 rounded border">
                        <p><strong>Account:</strong> 1643495273</p>
                        <p><strong>Amount:</strong> R{totalAmount.toFixed(2)}</p>
                        <p><strong>Reference:</strong> {paymentReference}</p>
                      </div>
                      <li><strong>4.</strong> Confirm and pay</li>
                      <li><strong>5.</strong> Screenshot confirmation for your records</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Benefits of Capitec Pay:</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• <strong>Instant transfer</strong> - Payment reflects immediately</li>
                      <li>• <strong>Same bank</strong> - No inter-bank delays</li>
                      <li>• <strong>Fast verification</strong> - Usually within 1 hour</li>
                      <li>• <strong>Secure</strong> - Direct bank-to-bank transfer</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Pro Tip:</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Since both accounts are with Capitec, your payment will be instant and verification will be much faster than other banks!
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
