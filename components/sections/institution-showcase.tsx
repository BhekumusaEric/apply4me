'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react'
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
  is_featured: boolean
}

export function InstitutionShowcase() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('is_featured', true)
          .limit(6)
          .order('created_at', { ascending: false })

        if (error) throw error
        setInstitutions(data || [])
      } catch (error) {
        console.error('Error fetching institutions:', error)
        // Fallback to mock data for demo
        setInstitutions(mockInstitutions)
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  const mockInstitutions: Institution[] = [
    {
      id: '1',
      name: 'University of the Witwatersrand',
      type: 'university',
      province: 'Gauteng',
      logo_url: '/logos/wits.svg',
      description: 'Leading research university offering diverse undergraduate and postgraduate programs.',
      application_deadline: '2024-09-30',
      application_fee: 200,
      is_featured: true,
    },
    {
      id: '2',
      name: 'University of Cape Town',
      type: 'university',
      province: 'Western Cape',
      logo_url: '/logos/uct.svg',
      description: 'Premier African university with world-class facilities and academic excellence.',
      application_deadline: '2024-09-30',
      application_fee: 250,
      is_featured: true,
    },
    {
      id: '3',
      name: 'Stellenbosch University',
      type: 'university',
      province: 'Western Cape',
      logo_url: '/logos/stellenbosch.svg',
      description: 'Innovative university known for research excellence and beautiful campus.',
      application_deadline: '2024-09-30',
      application_fee: 200,
      is_featured: true,
    },
    {
      id: '4',
      name: 'University of KwaZulu-Natal',
      type: 'university',
      province: 'KwaZulu-Natal',
      logo_url: '/logos/ukzn.svg',
      description: 'Comprehensive university with strong focus on African scholarship.',
      application_deadline: '2024-09-30',
      application_fee: 180,
      is_featured: true,
    },
    {
      id: '5',
      name: 'Tshwane University of Technology',
      type: 'university',
      province: 'Gauteng',
      logo_url: '/logos/tut.svg',
      description: 'Technology-focused university offering practical and career-oriented programs.',
      application_deadline: '2024-10-31',
      application_fee: 150,
      is_featured: true,
    },
    {
      id: '6',
      name: 'Cape Peninsula University of Technology',
      type: 'university',
      province: 'Western Cape',
      logo_url: '/logos/cput.svg',
      description: 'Leading university of technology with industry-relevant programs.',
      application_deadline: '2024-10-31',
      application_fee: 150,
      is_featured: true,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'university':
        return 'bg-blue-100 text-blue-800'
      case 'college':
        return 'bg-green-100 text-green-800'
      case 'tvet':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'university':
        return 'University'
      case 'college':
        return 'College'
      case 'tvet':
        return 'TVET College'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Institutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover top universities, colleges, and TVET institutions across South Africa
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Institutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover top universities, colleges, and TVET institutions across South Africa.
            Start your application journey with just one click.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {institutions.map((institution) => (
            <Card key={institution.id} className="institution-card group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Badge className={getTypeColor(institution.type)} variant="secondary">
                      {getTypeLabel(institution.type)}
                    </Badge>
                  </div>
                  {institution.logo_url && (
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={institution.logo_url}
                        alt={`${institution.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">{institution.name}</CardTitle>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {institution.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{institution.province}</span>
                  </div>

                  {institution.application_deadline && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Deadline: {formatDate(institution.application_deadline)}</span>
                    </div>
                  )}

                  {institution.application_fee && (
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Application fee: {formatCurrency(institution.application_fee)}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link href={`/institutions/${institution.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/institutions">
              <Users className="mr-2 h-5 w-5" />
              View All Institutions
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
