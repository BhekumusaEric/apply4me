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
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Clock,
  Users,
  Award,
  BookOpen,
  ArrowLeft,
  ExternalLink
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
  qualification_type: string
  duration: string
  requirements: string[]
  career_outcomes: string[]
  is_popular: boolean
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
        .select('*')
        .eq('institution_id', params.id)
        .order('is_popular', { ascending: false })
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
              {institution.website_url && (
                <Button variant="outline" size="lg" asChild>
                  <a href={institution.website_url} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
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
                {programs.map((program) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {program.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{program.qualification_type}</Badge>
                            <Badge variant="outline">{program.duration}</Badge>
                            {program.is_popular && (
                              <Badge variant="default">Popular</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Requirements</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {program.requirements.map((req, index) => (
                              <li key={index}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Career Outcomes</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {program.career_outcomes.map((outcome, index) => (
                              <li key={index}>• {outcome}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {institution.contact_email && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={`mailto:${institution.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {institution.contact_email}
                    </a>
                  </CardContent>
                </Card>
              )}

              {institution.contact_phone && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Phone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={`tel:${institution.contact_phone}`}
                      className="text-primary hover:underline"
                    >
                      {institution.contact_phone}
                    </a>
                  </CardContent>
                </Card>
              )}

              {institution.website_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Website
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={institution.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{institution.province}, South Africa</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
