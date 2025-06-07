'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Users, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function ComingSoonTestimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
            <Users className="mr-2 h-4 w-4" />
            Building our community
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Your Success Story Starts Here</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We're just getting started! Be among the first students to use Apply4Me and help us build something amazing together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Placeholder Cards */}
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Your Story Here</h3>
              <p className="text-muted-foreground text-sm">
                Be the first to share your Apply4Me success story and inspire other students.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Share Your Experience</h3>
              <p className="text-muted-foreground text-sm">
                Help us improve by sharing your application journey and feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Join Our Community</h3>
              <p className="text-muted-foreground text-sm">
                Connect with other students and be part of our growing community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-primary/10">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6">
              Join Apply4Me today and be among the first students to experience our streamlined application process. 
              Your success story could be featured here soon!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">
                  Learn How It Works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
