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
        console.log('🔍 Fetching featured institutions for homepage...')
        const response = await fetch('/api/institutions')
        const result = await response.json()

        console.log('📊 Featured institutions response:', { success: result.success, count: result.count })

        if (!response.ok || !result.success) {
          console.error('❌ API error:', result.error)
          throw new Error(result.error || 'Failed to fetch institutions')
        }

        if (result.data && result.data.length > 0) {
          // Filter for featured institutions and limit to 6
          const featuredInstitutions = result.data
            .filter((inst: any) => inst.is_featured)
            .slice(0, 6)

          console.log('✅ Found featured institutions:', featuredInstitutions.length)
          setInstitutions(featuredInstitutions)
        } else {
          console.log('⚠️ No featured institutions found')
          setInstitutions([])
        }
      } catch (error) {
        console.error('❌ Error fetching institutions:', error)
        console.log('🔄 No institutions available')
        // Set empty array instead of mock data
        setInstitutions([])
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutions()
  }, [])



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

  const getTypeImage = (type: string) => {
    switch (type) {
      case 'university':
        return 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop'
      case 'college':
        return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
      case 'tvet':
        return 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop'
      default:
        return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
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
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
            <Users className="mr-2 h-4 w-4" />
            200+ Partner Institutions
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Institutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover top universities, colleges, and TVET institutions across South Africa.
            Start your application journey with just one click.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {institutions.map((institution) => (
            <Card key={institution.id} className="institution-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
              {/* Institution Background Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={getTypeImage(institution.type)}
                  alt={`${getTypeLabel(institution.type)} campus`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Institution Logo */}
                <div className="absolute top-4 right-4">
                  {institution.logo_url ? (
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white/90 backdrop-blur-sm p-1">
                      <Image
                        src={institution.logo_url}
                        alt={`${institution.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>

                {/* Institution Type Badge */}
                <div className="absolute bottom-4 left-4">
                  <Badge className={`${getTypeColor(institution.type)} backdrop-blur-sm`} variant="secondary">
                    {getTypeLabel(institution.type)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-4">
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
