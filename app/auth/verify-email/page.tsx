'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle,
  Mail,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Clock
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !searchParams) return

    try {
      const token = searchParams.get('token')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const emailParam = searchParams.get('email')

      if (emailParam) {
        setEmail(decodeURIComponent(emailParam))
      }

      // Handle email verification from Supabase email links
      if ((token || tokenHash) && type === 'email') {
        const verificationToken = token || tokenHash
        if (verificationToken) {
          verifyEmail(verificationToken)
        }
      } else if ((token || tokenHash) && type === 'signup') {
        // Handle signup confirmation
        const verificationToken = token || tokenHash
        if (verificationToken) {
          verifyEmail(verificationToken)
        }
      } else if (type === 'signup') {
        // Just show confirmation message for signup
        setStatus('success')
        setMessage('Please check your email and click the verification link to complete your registration.')
      } else {
        // Show general verification page
        setStatus('success')
        setMessage('Please check your email for a verification link.')
      }
    } catch (error) {
      console.error('Error processing search params:', error)
      setStatus('error')
      setMessage('An error occurred while loading the page. Please try again.')
    }
  }, [mounted, searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (error) {
        console.error('Email verification error:', error)
        if (error.message.includes('expired')) {
          setStatus('expired')
          setMessage('Your verification link has expired. Please request a new one.')
        } else {
          setStatus('error')
          setMessage('Invalid or expired verification link. Please try again.')
        }
      } else if (data.user) {
        setStatus('success')
        setMessage('Your email has been successfully verified! Redirecting to your dashboard...')

        // User is now automatically signed in after verification
        // Redirect to dashboard immediately
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setMessage('Verification completed but user session could not be established. Please try signing in.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while verifying your email. Please try again.')
    }
  }

  const resendVerification = async () => {
    if (!email) {
      alert('Please provide your email address')
      return
    }

    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        alert('Failed to resend verification email. Please try again.')
      } else {
        alert('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case 'error':
      case 'expired':
        return <AlertCircle className="h-12 w-12 text-red-600" />
      default:
        return <Mail className="h-12 w-12 text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-900'
      case 'error':
      case 'expired':
        return 'text-red-900'
      default:
        return 'text-blue-900'
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
      case 'expired':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-2xl">
        <div className="text-center mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/auth/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verification'}
              {status === 'error' && 'Verification Failed'}
              {status === 'expired' && 'Link Expired'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`rounded-lg p-4 ${getBackgroundColor()}`}>
              <p className={`text-center ${getStatusColor()}`}>
                {message}
              </p>
            </div>

            {status === 'success' && !searchParams.get('token') && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Didn't receive an email? Check your spam folder</span>
                </div>

                {email && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Verification email sent to: <strong>{email}</strong>
                    </p>
                    <Button
                      variant="outline"
                      onClick={resendVerification}
                      disabled={resending}
                    >
                      {resending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                  <Button
                    onClick={resendVerification}
                    disabled={resending || !email}
                    className="w-full"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send New Verification Email
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Or try these options:</p>
                  <div className="flex justify-center gap-4 mt-2">
                    <Link href="/auth/signin" className="text-primary hover:underline">
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="text-primary hover:underline">
                      Create New Account
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {status === 'success' && searchParams.get('token') && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Email Successfully Verified!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You are now signed in. Redirecting to your dashboard in 2 seconds...
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/dashboard">
                      Go to Dashboard Now
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 text-center">Need Help?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Email not arriving?</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Add apply4me2025@outlook.com to your contacts</li>
                <li>Try resending the verification email</li>
              </ul>

              <div className="mt-4 pt-4 border-t">
                <p className="text-center">
                  Still having trouble?{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact our support team
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading verification page...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
