'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner, ButtonLoading } from '@/components/ui/loading'

interface Institution {
  id: string
  name: string
  type: string
  logo_url: string | null
  application_fee: number | null
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Simple form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/apply/${params.institutionId}`))
      return
    }

    // Set email from user
    if (user.email) {
      setEmail(user.email)
    }

    const fetchInstitution = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('institutions')
          .select('id, name, type, logo_url, application_fee')
          .eq('id', params.institutionId)
          .single()

        if (error) throw error
        setInstitution(data)
      } catch (error) {
        console.error('Error:', error)
        router.push('/institutions')
      } finally {
        setLoading(false)
      }
    }

    fetchInstitution()
  }, [user, params.institutionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Generate application ID
      const applicationId = crypto.randomUUID()

      // Create application data
      const applicationData = {
        id: applicationId,
        user_id: user?.id,
        institution_id: params.institutionId,
        personal_info: {
          firstName,
          lastName,
          email,
          phone
        },
        status: 'draft',
        payment_status: 'pending',
        total_amount: (institution?.application_fee || 0) + 50,
        created_at: new Date().toISOString()
      }

      // Store in localStorage as fallback
      localStorage.setItem(`application_${applicationId}`, JSON.stringify(applicationData))

      // Redirect to payment
      router.push(`/payment/${applicationId}`)
    } catch (error) {
      alert('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading institution details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Institution Not Found</h1>
            <Button asChild>
              <Link href="/institutions">Back to Institutions</Link>
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href={`/institutions/${institution.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Apply to {institution.name}</h1>
            <p className="text-muted-foreground">Complete your application</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Institution Fee:</span>
                    <span>R{institution.application_fee || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apply4Me Service Fee:</span>
                    <span>R50</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total:</span>
                    <span>R{(institution.application_fee || 0) + 50}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !firstName || !lastName || !email || !phone}
              >
                <ButtonLoading loading={submitting}>
                  {submitting ? 'Processing Application...' : 'Continue to Payment'}
                </ButtonLoading>
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
