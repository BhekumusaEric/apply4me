'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, DollarSign, Calendar, ExternalLink, Filter, Award, Users } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getFieldsOfStudy } from '@/lib/utils'

interface Bursary {
  id: string
  name: string
  provider: string
  type: 'national' | 'provincial' | 'sector' | 'institutional'
  field_of_study: string[]
  eligibility_criteria: string[]
  amount: number | null
  application_deadline: string | null
  application_url: string | null
  description: string
  is_active: boolean
}

export default function BursariesPage() {
  const [bursaries, setBursaries] = useState<Bursary[]>([])
  const [filteredBursaries, setFilteredBursaries] = useState<Bursary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedField, setSelectedField] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchBursaries()
  }, [])

  useEffect(() => {
    filterBursaries()
  }, [bursaries, searchQuery, selectedType, selectedField])

  const fetchBursaries = async () => {
    try {
      console.log('🔍 Fetching bursaries from API...')
      const response = await fetch('/api/bursaries')
      const result = await response.json()

      console.log('📊 API response:', { success: result.success, count: result.count })

      if (!response.ok || !result.success) {
        console.error('❌ API error:', result.error)
        throw new Error(result.error || 'Failed to fetch bursaries')
      }

      if (result.data && result.data.length > 0) {
        console.log('✅ Found bursaries:', result.data.length)
        console.log('📋 Sample bursary:', result.data[0])
        setBursaries(result.data)
      } else {
        console.log('⚠️ No bursaries found in database')
        setBursaries([])
      }
    } catch (error) {
      console.error('❌ Error fetching bursaries:', error)
      console.log('🔄 No bursaries available')
      // Set empty array instead of mock data
      setBursaries([])
    } finally {
      setLoading(false)
    }
  }

  const filterBursaries = () => {
    let filtered = bursaries

    if (searchQuery) {
      filtered = filtered.filter(bursary =>
        bursary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bursary.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bursary.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(bursary => bursary.type === selectedType)
    }

    if (selectedField && selectedField !== 'all') {
      filtered = filtered.filter(bursary =>
        bursary.field_of_study.includes(selectedField) ||
        bursary.field_of_study.includes('All Fields')
      )
    }

    setFilteredBursaries(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedField('all')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'national':
        return 'bg-blue-100 text-blue-800'
      case 'provincial':
        return 'bg-green-100 text-green-800'
      case 'sector':
        return 'bg-purple-100 text-purple-800'
      case 'institutional':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'national':
        return 'National'
      case 'provincial':
        return 'Provincial'
      case 'sector':
        return 'Sector'
      case 'institutional':
        return 'Institutional'
      default:
        return type
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading bursaries...</p>
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
          <h1 className="text-4xl font-bold mb-4">Find Funding for Your Studies</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover bursaries, scholarships, and financial aid opportunities from government,
            private companies, and institutions across South Africa.
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
                placeholder="Search bursaries, providers, or fields of study..."
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
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Bursary Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="provincial">Provincial</SelectItem>
                <SelectItem value="sector">Sector</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Field of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {getFieldsOfStudy().map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
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
            Showing {filteredBursaries.length} of {bursaries.length} bursaries
          </p>
        </div>

        {/* Bursaries Grid */}
        {filteredBursaries.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bursaries found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBursaries.map((bursary) => (
              <Card key={bursary.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getTypeColor(bursary.type)} variant="secondary">
                      {getTypeLabel(bursary.type)}
                    </Badge>
                    {bursary.amount && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-sa-green">
                          {formatCurrency(bursary.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">per year</div>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{bursary.name}</CardTitle>
                  <CardDescription>{bursary.provider}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {bursary.description}
                  </p>

                  {/* Fields of Study */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Fields of Study</h4>
                    <div className="flex flex-wrap gap-1">
                      {bursary.field_of_study.slice(0, 3).map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {bursary.field_of_study.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{bursary.field_of_study.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Key Requirements */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Requirements</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {bursary.eligibility_criteria.slice(0, 3).map((criteria, index) => (
                        <li key={index}>• {criteria}</li>
                      ))}
                      {bursary.eligibility_criteria.length > 3 && (
                        <li>• And {bursary.eligibility_criteria.length - 3} more...</li>
                      )}
                    </ul>
                  </div>

                  {/* Deadline */}
                  {bursary.application_deadline && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Deadline: {formatDate(bursary.application_deadline)}</span>
                    </div>
                  )}

                  {/* Apply Button */}
                  <div className="pt-2">
                    {bursary.application_url ? (
                      <Button asChild className="w-full">
                        <Link href={bursary.application_url} target="_blank" rel="noopener noreferrer">
                          Apply Now
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Contact Provider
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 bg-muted/30 rounded-2xl p-8 text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Need Help Finding the Right Bursary?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team can help you identify bursaries that match your profile and assist with applications.
            Get personalized guidance to maximize your funding opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">Get Personalized Help</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/career-profiler">Take Career Test First</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
