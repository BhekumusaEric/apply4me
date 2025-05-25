'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Calendar, DollarSign, Filter, ArrowRight, GraduationCap } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getProvinces, getInstitutionTypes } from '@/lib/utils'

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

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchInstitutions()
  }, [])

  useEffect(() => {
    filterInstitutions()
  }, [institutions, searchQuery, selectedProvince, selectedType])

  const fetchInstitutions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error
      setInstitutions(data || [])
    } catch (error) {
      console.error('Error fetching institutions:', error)
      // Fallback to mock data
      setInstitutions(mockInstitutions)
    } finally {
      setLoading(false)
    }
  }

  const filterInstitutions = () => {
    let filtered = institutions

    if (searchQuery) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedProvince && selectedProvince !== 'all') {
      filtered = filtered.filter(institution => institution.province === selectedProvince)
    }

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(institution => institution.type === selectedType)
    }

    setFilteredInstitutions(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedProvince('all')
    setSelectedType('all')
  }

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

  // Mock data for fallback
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading institutions...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Institution</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore universities, colleges, and TVET institutions across South Africa.
            Find the perfect match for your academic and career goals.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search institutions or programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {getProvinces().map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Institution Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getInstitutionTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredInstitutions.length} of {institutions.length} institutions
          </p>
        </div>

        {/* Institution Grid */}
        {filteredInstitutions.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutions.map((institution) => (
              <Card key={institution.id} className="institution-card group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Badge className={getTypeColor(institution.type)} variant="secondary">
                        {getTypeLabel(institution.type)}
                      </Badge>
                      {institution.is_featured && (
                        <Badge variant="default" className="ml-2">
                          Featured
                        </Badge>
                      )}
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
        )}
      </main>
      <Footer />
    </div>
  )
}
