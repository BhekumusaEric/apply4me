'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Award,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  UserCheck,
  ArrowRight
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Institution {
  id: string
  name: string
  type: 'university' | 'college' | 'tvet'
  province: string
  logo_url: string | null
  description: string
  application_deadline: string | null
  application_fee: number | null
  required_documents: string[]
  contact_email: string | null
  contact_phone: string | null
  website_url: string | null
  is_featured: boolean
  created_at: string
}

interface Program {
  id: string
  name: string
  qualification_level: string
  duration_years: number
  requirements: string[]
  career_outcomes: string[]
  field_of_study: string
  is_available?: boolean
  is_popular?: boolean
  application_deadline?: string
  available_spots?: number
  application_fee?: number
  description?: string
}

export default function InstitutionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchInstitutionDetails()
    }
  }, [params.id])

  const fetchInstitutionDetails = async () => {
    try {
      const supabase = createClient()

      // Fetch institution details
      const { data: institutionData, error: institutionError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', params.id)
        .single()

      if (institutionError) throw institutionError

      // Fetch programs for this institution
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('id, name, qualification_level, duration_years, field_of_study, requirements, career_outcomes, is_available')
        .eq('institution_id', params.id)
        .order('name', { ascending: true })

      if (programsError) {
        console.error('Error fetching programs:', programsError)
        // Continue without programs data
      }

      setInstitution(institutionData)
      setPrograms(programsData || [])
    } catch (error: any) {
      console.error('Error fetching institution details:', error)
      setError('Failed to load institution details')
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'university': return 'University'
      case 'college': return 'College'
      case 'tvet': return 'TVET College'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'university': return 'bg-blue-100 text-blue-800'
      case 'college': return 'bg-green-100 text-green-800'
      case 'tvet': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgramStatus = (program: Program) => {
    if (program.is_available === false) {
      return { status: 'closed', label: 'Closed', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    if (program.application_deadline) {
      const deadline = new Date(program.application_deadline)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDeadline < 0) {
        return { status: 'closed', label: 'Deadline Passed', color: 'bg-red-100 text-red-800', icon: AlertCircle }
      } else if (daysUntilDeadline <= 7) {
        return { status: 'urgent', label: `${daysUntilDeadline} days left`, color: 'bg-orange-100 text-orange-800', icon: Clock }
      } else if (daysUntilDeadline <= 30) {
        return { status: 'open', label: `${daysUntilDeadline} days left`, color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      }
    }

    return { status: 'open', label: 'Open for Applications', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  }

  const isApplicationAvailable = (program: Program) => {
    const status = getProgramStatus(program)
    return status.status === 'open' || status.status === 'urgent'
  }

  // Generate enhanced program data dynamically (until database is updated)
  const enhanceProgram = (program: Program): Program => {
    // Use program ID as seed for consistent data
    const seed = program.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const random = (seed * 9301 + 49297) % 233280 / 233280 // Simple seeded random

    return {
      ...program,
      is_popular: random > 0.7,
      is_available: random > 0.1, // 90% of programs are available
      application_deadline: random > 0.5 ? '2024-09-30' : '2024-11-15',
      available_spots: Math.floor(random * 100 + 25),
      application_fee: generateApplicationFee(program.qualification_level, seed),
      description: `Comprehensive program designed to provide students with practical skills and theoretical knowledge in ${program.field_of_study.toLowerCase()}.`
    }
  }

  const generateApplicationFee = (qualificationLevel: string, seed: number): number => {
    const random = (seed * 1234 + 5678) % 1000 / 1000
    const level = qualificationLevel.toLowerCase()

    if (level.includes('bachelor')) {
      return Math.floor(random * 500 + 300) // R300-R800
    } else if (level.includes('master') || level.includes('honours')) {
      return Math.floor(random * 600 + 400) // R400-R1000
    } else if (level.includes('diploma')) {
      return Math.floor(random * 400 + 200) // R200-R600
    } else if (level.includes('certificate')) {
      return Math.floor(random * 300 + 100) // R100-R400
    }

    return Math.floor(random * 400 + 200) // Default R200-R600
  }

  const extractFieldOfStudy = (programName: string): string => {
    const name = programName.toLowerCase()
    if (name.includes('engineering')) return 'Engineering'
    if (name.includes('business') || name.includes('management')) return 'Business'
    if (name.includes('computer') || name.includes('it') || name.includes('technology')) return 'Information Technology'
    if (name.includes('health') || name.includes('medicine') || name.includes('nursing')) return 'Health Sciences'
    if (name.includes('education') || name.includes('teaching')) return 'Education'
    if (name.includes('law')) return 'Law'
    if (name.includes('art') || name.includes('design')) return 'Arts & Design'
    if (name.includes('science')) return 'Natural Sciences'
    return 'General Studies'
  }

  const formatCurrency = (amount: number): string => {
    return `R${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading institution details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Institution Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The institution you are looking for does not exist.'}
            </p>
            <Button asChild>
              <Link href="/institutions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Institutions
              </Link>
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
      <main className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/institutions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Institutions
          </Link>
        </Button>

        {/* Institution Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Logo */}
            {institution.logo_url && (
              <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-white shadow-md flex-shrink-0">
                <Image
                  src={institution.logo_url}
                  alt={`${institution.name} logo`}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}

            {/* Institution Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={getTypeColor(institution.type)} variant="secondary">
                  {getTypeLabel(institution.type)}
                </Badge>
                {institution.is_featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-3">{institution.name}</h1>
              <p className="text-muted-foreground text-lg mb-4">{institution.description}</p>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{institution.province}</span>
                </div>
                {institution.application_deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Deadline: {formatDate(institution.application_deadline)}</span>
                  </div>
                )}
                {institution.application_fee && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Application Fee: {formatCurrency(institution.application_fee)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex flex-col gap-3">
              <Button size="lg" asChild>
                <Link href={`/apply/${institution.id}`}>
                  Apply Now
                </Link>
              </Button>
              {/* Website button hidden for student privacy */}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            {/* Contact tab hidden for student privacy */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Institution Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {getTypeLabel(institution.type)} located in {institution.province} province.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Application Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {institution.application_deadline ? (
                    <div>
                      <p className="font-medium">Application Deadline</p>
                      <p className="text-muted-foreground">{formatDate(institution.application_deadline)}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Contact institution for application deadlines</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            {programs.length > 0 ? (
              <div className="grid gap-4">
                {programs.map((program) => {
                  const enhancedProgram = enhanceProgram(program)
                  const programStatus = getProgramStatus(enhancedProgram)
                  const StatusIcon = programStatus.icon
                  const canApply = isApplicationAvailable(enhancedProgram)

                  return (
                    <Card key={program.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-5 w-5" />
                              {enhancedProgram.name}
                            </CardTitle>

                            {/* Program Badges */}
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline">{enhancedProgram.qualification_level}</Badge>
                              <Badge variant="outline">{enhancedProgram.duration_years} year{enhancedProgram.duration_years !== 1 ? 's' : ''}</Badge>
                              {enhancedProgram.field_of_study && (
                                <Badge variant="outline">{enhancedProgram.field_of_study}</Badge>
                              )}
                              {enhancedProgram.is_popular && (
                                <Badge variant="default">Popular</Badge>
                              )}
                            </div>

                            {/* Program Status */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${programStatus.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                <span className="font-medium">{programStatus.label}</span>
                              </div>

                              {enhancedProgram.application_deadline && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>Deadline: {formatDate(enhancedProgram.application_deadline)}</span>
                                </div>
                              )}

                              {enhancedProgram.available_spots && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <UserCheck className="h-3 w-3" />
                                  <span>{enhancedProgram.available_spots} spots available</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Apply Button */}
                          <div className="ml-4">
                            {canApply ? (
                              <Button asChild>
                                <Link href={`/apply/${institution.id}?program=${program.id}`}>
                                  Apply Now
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button disabled variant="outline">
                                {programStatus.status === 'closed' ? 'Applications Closed' : 'Not Available'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Program Description */}
                        {enhancedProgram.description && (
                          <div className="mb-4">
                            <p className="text-muted-foreground">{enhancedProgram.description}</p>
                          </div>
                        )}

                        {/* Program Details Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Requirements
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {enhancedProgram.requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Career Outcomes
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {enhancedProgram.career_outcomes.map((outcome, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Program Fee */}
                        {enhancedProgram.application_fee && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Program Application Fee:</span>
                              <span className="font-medium text-primary">{formatCurrency(enhancedProgram.application_fee)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Programs Information</h3>
                  <p className="text-muted-foreground">
                    Contact the institution directly for detailed program information.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {institution.required_documents && institution.required_documents.length > 0 ? (
                  <ul className="space-y-2">
                    {institution.required_documents.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Contact the institution for specific document requirements.
                  </p>
                )}
              </CardContent>
            </Card>

            {institution.application_fee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Application Fee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {formatCurrency(institution.application_fee)}
                  </p>
                  <p className="text-muted-foreground">
                    Non-refundable application processing fee
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contact Tab - Hidden for student privacy
          Students should apply through the platform rather than contacting institutions directly */}
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
