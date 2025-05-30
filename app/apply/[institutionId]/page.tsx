'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, BookOpen, Calendar, DollarSign, Users, Clock, ArrowRight } from 'lucide-react'
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

interface Program {
  id: string
  name: string
  qualification_level: string
  duration_years: number
  field_of_study: string
  application_deadline?: string
  is_available?: boolean
  available_spots?: number
  application_fee?: number
  application_status?: string
  is_popular?: boolean
  priority_level?: number
  application_count?: number
  success_rate?: number
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Get program ID from URL params
  const programId = searchParams.get('program')

  // State management
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'program-selection' | 'application-form'>('program-selection')
  const [mounted, setMounted] = useState(false)

  // Simple form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Ensure component is mounted before using router
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!user) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/apply/${params.institutionId}`))
      return
    }

    // Set email from user
    if (user.email) {
      setEmail(user.email)
    }

    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch institution
        const { data: institutionData, error: institutionError } = await supabase
          .from('institutions')
          .select('id, name, type, logo_url, application_fee')
          .eq('id', params.institutionId)
          .single()

        if (institutionError) throw institutionError
        setInstitution(institutionData)

        // Fetch available programs for this institution
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .eq('institution_id', params.institutionId)
          .eq('is_available', true)
          .eq('application_status', 'open')
          .gte('application_deadline', new Date().toISOString().split('T')[0])
          .order('is_popular', { ascending: false })
          .order('priority_level', { ascending: false })
          .order('name', { ascending: true })

        if (programsError) throw programsError
        setPrograms(programsData || [])

        // Determine initial step based on URL params
        if (programId) {
          // Direct program application - find the specific program
          const specificProgram = programsData?.find(p => p.id === programId)
          if (specificProgram) {
            setSelectedProgram(specificProgram)
            setCurrentStep('application-form')
          } else {
            // Program not found or not available, show selection
            setCurrentStep('program-selection')
          }
        } else {
          // Institution application - show program selection
          setCurrentStep('program-selection')
        }

      } catch (error) {
        console.error('Error:', error)
        router.push('/institutions')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [mounted, user, params.institutionId, programId])

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program)
    setCurrentStep('application-form')
  }

  const handleBackToProgramSelection = () => {
    setCurrentStep('program-selection')
    setSelectedProgram(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!selectedProgram) {
        throw new Error('No program selected')
      }

      // Generate application ID
      const applicationId = crypto.randomUUID()

      // Calculate total amount (program fee + service fee)
      const programFee = selectedProgram.application_fee || institution?.application_fee || 0
      const serviceFee = 50
      const totalAmount = programFee + serviceFee

      // Create application data
      const applicationData = {
        id: applicationId,
        user_id: user?.id,
        institution_id: params.institutionId,
        program_id: selectedProgram.id,
        program_info: {
          name: selectedProgram.name,
          qualification_level: selectedProgram.qualification_level,
          field_of_study: selectedProgram.field_of_study,
          application_deadline: selectedProgram.application_deadline
        },
        personal_info: {
          firstName,
          lastName,
          email,
          phone
        },
        status: 'draft',
        payment_status: 'pending',
        total_amount: totalAmount,
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

  // Helper functions
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number): string => {
    return `R${amount.toLocaleString()}`
  }

  const getProgramStatus = (program: Program) => {
    if (program.application_deadline) {
      const deadline = new Date(program.application_deadline)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDeadline <= 7) {
        return { status: 'urgent', label: `${daysUntilDeadline} days left`, color: 'bg-orange-100 text-orange-800' }
      } else if (daysUntilDeadline <= 30) {
        return { status: 'open', label: `${daysUntilDeadline} days left`, color: 'bg-yellow-100 text-yellow-800' }
      }
    }
    return { status: 'open', label: 'Open for Applications', color: 'bg-green-100 text-green-800' }
  }

  // Don't render anything until mounted to prevent SSR issues
  if (!mounted) {
    return null
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

  // Render program selection step
  if (currentStep === 'program-selection') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href={`/institutions/${institution.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Apply to {institution.name}</h1>
              <p className="text-muted-foreground">Select a program to apply for</p>
            </div>
          </div>

          {programs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Available Programs</h3>
                <p className="text-muted-foreground mb-4">
                  This institution currently has no open programs accepting applications.
                </p>
                <Button asChild>
                  <Link href="/programs">Browse Other Programs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Available Programs</h2>
                <p className="text-muted-foreground">
                  Choose from {programs.length} available program{programs.length !== 1 ? 's' : ''} at {institution.name}
                </p>
              </div>

              <div className="grid gap-4">
                {programs.map((program) => {
                  const programStatus = getProgramStatus(program)

                  return (
                    <Card key={program.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProgramSelect(program)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-5 w-5" />
                              {program.name}
                            </CardTitle>

                            {/* Program Badges */}
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline">{program.qualification_level}</Badge>
                              <Badge variant="outline">{program.duration_years} year{program.duration_years !== 1 ? 's' : ''}</Badge>
                              <Badge variant="outline">{program.field_of_study}</Badge>
                              {program.is_popular && (
                                <Badge variant="default">Popular</Badge>
                              )}
                            </div>

                            {/* Program Status and Details */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${programStatus.color}`}>
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{programStatus.label}</span>
                              </div>

                              {program.application_deadline && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>Deadline: {formatDate(program.application_deadline)}</span>
                                </div>
                              )}

                              {program.application_fee && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatCurrency(program.application_fee)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Select Button */}
                          <div className="ml-4">
                            <Button>
                              Select Program
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Enhanced Program Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {program.available_spots && (
                            <div className="text-center">
                              <div className="font-medium text-blue-600">{program.available_spots}</div>
                              <div className="text-muted-foreground">Available Spots</div>
                            </div>
                          )}
                          {program.application_count !== undefined && (
                            <div className="text-center">
                              <div className="font-medium text-orange-600">{program.application_count}</div>
                              <div className="text-muted-foreground">Applications</div>
                            </div>
                          )}
                          {program.success_rate && (
                            <div className="text-center">
                              <div className="font-medium text-green-600">{program.success_rate}%</div>
                              <div className="text-muted-foreground">Success Rate</div>
                            </div>
                          )}
                          {program.priority_level && (
                            <div className="text-center">
                              <div className="font-medium text-purple-600">Level {program.priority_level}</div>
                              <div className="text-muted-foreground">Priority</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    )
  }

  // Render application form step
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBackToProgramSelection}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Program Selection
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Apply to {institution.name}</h1>
            <p className="text-muted-foreground">
              {selectedProgram ? `${selectedProgram.name} - ${selectedProgram.qualification_level}` : 'Complete your application'}
            </p>
          </div>
        </div>

        {selectedProgram && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Selected Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">{selectedProgram.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedProgram.qualification_level}</p>
                  <p className="text-sm text-muted-foreground">{selectedProgram.field_of_study}</p>
                </div>
                <div className="text-right">
                  {selectedProgram.application_deadline && (
                    <p className="text-sm text-muted-foreground">
                      Deadline: {formatDate(selectedProgram.application_deadline)}
                    </p>
                  )}
                  {selectedProgram.application_fee && (
                    <p className="text-sm font-medium">
                      Program Fee: {formatCurrency(selectedProgram.application_fee)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                    <span>Program Fee:</span>
                    <span>{formatCurrency(selectedProgram?.application_fee || institution?.application_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apply4Me Service Fee:</span>
                    <span>R50</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total:</span>
                    <span>{formatCurrency((selectedProgram?.application_fee || institution?.application_fee || 0) + 50)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !firstName || !lastName || !email || !phone || !selectedProgram}
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
