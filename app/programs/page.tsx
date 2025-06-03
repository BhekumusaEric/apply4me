'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Filter,
  BookOpen,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

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
  institutions: {
    id: string
    name: string
    type: string
    province: string
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedField, setSelectedField] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    filterPrograms()
  }, [programs, searchQuery, selectedField, selectedLevel, selectedProvince])

  const fetchPrograms = async () => {
    try {
      console.log('🎓 Fetching enhanced programs from API...')

      const response = await fetch('/api/programs/enhanced')
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'API request failed')
      }

      console.log(`✅ Fetched ${data.data.programs?.length || 0} enhanced programs`)
      setPrograms(data.data.programs || [])
    } catch (error) {
      console.error('❌ Failed to fetch programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPrograms = () => {
    let filtered = programs

    if (searchQuery) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.field_of_study.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.institutions.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.qualification_level.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedField && selectedField !== 'all') {
      filtered = filtered.filter(program => program.field_of_study === selectedField)
    }

    if (selectedLevel && selectedLevel !== 'all') {
      filtered = filtered.filter(program => program.qualification_level === selectedLevel)
    }

    if (selectedProvince && selectedProvince !== 'all') {
      filtered = filtered.filter(program => program.institutions.province === selectedProvince)
    }

    setFilteredPrograms(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedField('all')
    setSelectedLevel('all')
    setSelectedProvince('all')
  }

  const getProgramStatus = (program: Program) => {
    if (program.application_deadline) {
      const deadline = new Date(program.application_deadline)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDeadline <= 7) {
        return { status: 'urgent', label: `${daysUntilDeadline} days left`, color: 'bg-orange-100 text-orange-800', icon: Clock }
      } else if (daysUntilDeadline <= 30) {
        return { status: 'open', label: `${daysUntilDeadline} days left`, color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      }
    }

    return { status: 'open', label: 'Open for Applications', color: 'bg-green-100 text-green-800', icon: CheckCircle }
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

  // Get unique values for filters
  const uniqueFields = Array.from(new Set(programs.map(p => p.field_of_study))).sort()
  const uniqueLevels = Array.from(new Set(programs.map(p => p.qualification_level))).sort()
  const uniqueProvinces = Array.from(new Set(programs.map(p => (p.institutions as any)?.province))).sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p>Loading available programs...</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🎓 Available Programs</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover programs from top South African institutions with real-time availability and deadlines
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{filteredPrograms.length}</div>
                <div className="text-sm text-muted-foreground">Available Programs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredPrograms.filter(p => p.is_popular).length}
                </div>
                <div className="text-sm text-muted-foreground">Popular Programs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredPrograms.reduce((sum, p) => sum + (p.available_spots || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Spots</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(filteredPrograms.reduce((sum, p) => sum + (p.success_rate || 0), 0) / filteredPrograms.length) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search programs, institutions, or fields of study..."
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
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Field of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {uniqueFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Qualification Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {uniqueProvinces.map(province => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length > 0 ? (
          <div className="grid gap-6">
            {filteredPrograms.map((program) => {
              const programStatus = getProgramStatus(program)
              const StatusIcon = programStatus.icon

              return (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-5 w-5" />
                          {program.name}
                        </CardTitle>

                        {/* Institution Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{program.institutions.name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{program.institutions.province}</span>
                        </div>

                        {/* Program Badges */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{program.qualification_level}</Badge>
                          <Badge variant="outline">{program.duration_years} year{program.duration_years !== 1 ? 's' : ''}</Badge>
                          <Badge variant="outline">{program.field_of_study}</Badge>
                          {program.is_popular && (
                            <Badge variant="default">Popular</Badge>
                          )}
                          {program.success_rate && program.success_rate > 90 && (
                            <Badge variant="default" className="bg-green-600">High Success Rate</Badge>
                          )}
                        </div>

                        {/* Program Status and Details */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${programStatus.color}`}>
                            <StatusIcon className="h-3 w-3" />
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

                      {/* Apply Button */}
                      <div className="ml-4">
                        <Button asChild>
                          <Link href={`/apply/${program.institutions.id}?program=${program.id}`}>
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
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
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Programs Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find available programs.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
