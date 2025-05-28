'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Building2,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  Mail,
  MessageSquare
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatCurrency } from '@/lib/utils'

function PaymentPendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const paymentReference = searchParams.get('ref') || ''
  const paymentMethod = searchParams.get('method') || ''
  const amount = searchParams.get('amount') || '200'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'eft':
        return {
          name: 'Bank Transfer',
          icon: Building2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          verificationTime: '24 hours',
          instructions: 'Transfer to TymeBank account 53002508162'
        }
      case 'capitec':
        return {
          name: 'Capitec Pay',
          icon: Smartphone,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          verificationTime: '1-2 hours',
          instructions: 'Pay via TymeBank app to account 53002508162'
        }
      case 'mobile':
        return {
          name: 'Mobile Payment',
          icon: Smartphone,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          verificationTime: '2-24 hours',
          instructions: 'SnapScan or Zapper payment'
        }
      default:
        return {
          name: 'Payment',
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          verificationTime: '24 hours',
          instructions: 'Manual payment verification'
        }
    }
  }

  const methodDetails = getMethodDetails(paymentMethod)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Payment Pending Status */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="relative">
                <Clock className="h-16 w-16 text-yellow-600 mx-auto" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-yellow-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Payment Pending Verification</CardTitle>
            <p className="text-muted-foreground">
              We're waiting to verify your {methodDetails.name.toLowerCase()} payment
            </p>
          </CardHeader>
        </Card>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <methodDetails.icon className={`h-5 w-5 ${methodDetails.color}`} />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`${methodDetails.bgColor} ${methodDetails.borderColor} border rounded-lg p-4`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">{methodDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(parseFloat(amount))}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Payment Reference</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-white dark:bg-gray-800 px-3 py-2 rounded border font-mono text-sm flex-1">
                      {paymentReference}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(paymentReference)}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Verification Timeline
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Expected verification time:</strong> {methodDetails.verificationTime}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You'll receive an email and SMS confirmation once your payment is verified.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details Reminder */}
        {(paymentMethod === 'eft' || paymentMethod === 'capitec') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Bank Details Reminder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Bank:</p>
                    <p>TymeBank</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Account Holder:</p>
                    <p>Denga Emmanuel Siphugu</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Account Number:</p>
                    <p className="font-mono font-bold">53002508162</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Branch Code:</p>
                    <p>678910</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What Happens Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Payment Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will verify your payment within {methodDetails.verificationTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Confirmation Notification</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive email and SMS confirmation once verified
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Application Submission</h4>
                  <p className="text-sm text-muted-foreground">
                    Your application will be automatically submitted to the institution
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Track Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your application status in your dashboard
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4" asChild>
                <Link href="/contact">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Email Support</p>
                      <p className="text-xs text-muted-foreground">Get help via email</p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4" asChild>
                <Link href="/help">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Live Chat</p>
                      <p className="text-xs text-muted-foreground">Chat with our team</p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => router.refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payment details...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  )
}
