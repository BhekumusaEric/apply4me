'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, GraduationCap, Users, Award, TrendingUp, ArrowRight, Play } from 'lucide-react'

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { icon: GraduationCap, label: 'Institutions', value: '200+' },
    { icon: Users, label: 'Students Helped', value: '10,000+' },
    { icon: Award, label: 'Success Rate', value: '95%' },
    { icon: TrendingUp, label: 'Applications Processed', value: '25,000+' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/institutions?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sa-green via-sa-green/90 to-sa-blue">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
      
      <div className="container relative py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white mb-6">
              <span className="mr-2">🎓</span>
              Trusted by 10,000+ South African students
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Gateway to
              <span className="block text-sa-gold">Higher Education</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Apply to universities, colleges, and TVET institutions across South Africa 
              with just one application. We handle the paperwork, you focus on your future.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search institutions or programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white/95 border-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 bg-sa-gold hover:bg-sa-gold/90 text-black font-semibold">
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="xl" variant="gradient" asChild>
                <Link href="/career-profiler">
                  Start Career Test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="xl" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-white/80 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-sa-gold rounded-full mr-2" />
                POPIA Compliant
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-sa-gold rounded-full mr-2" />
                Secure Payments
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-sa-gold rounded-full mr-2" />
                24/7 Support
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-8 w-8 text-sa-gold mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  )
}
