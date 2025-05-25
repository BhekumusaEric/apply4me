import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, GraduationCap, Users, Award } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-sa-green via-sa-green/90 to-sa-blue relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your
            <span className="block text-sa-gold">Higher Education Journey?</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of South African students who have successfully applied to their dream institutions through Apply4Me. 
            Your future starts with a single click.
          </p>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-sa-gold" />
              </div>
              <h3 className="font-semibold mb-2">200+ Institutions</h3>
              <p className="text-white/80 text-sm">Universities, colleges, and TVET institutions across all 9 provinces</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-sa-gold" />
              </div>
              <h3 className="font-semibold mb-2">10,000+ Students</h3>
              <p className="text-white/80 text-sm">Successfully helped students from all backgrounds and provinces</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-sa-gold" />
              </div>
              <h3 className="font-semibold mb-2">95% Success Rate</h3>
              <p className="text-white/80 text-sm">Our students get accepted to their preferred institutions</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="xl" className="bg-sa-gold hover:bg-sa-gold/90 text-black font-semibold" asChild>
              <Link href="/auth/signup">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button size="xl" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <Link href="/career-profiler">
                Take Career Test First
              </Link>
            </Button>
          </div>

          {/* Pricing Info */}
          <div className="bg-white/10 rounded-lg p-6 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Simple, Transparent Pricing</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold text-sa-gold mb-2">Standard Service - R50</div>
                <ul className="space-y-1 text-white/90">
                  <li>• Application processing within 5 days</li>
                  <li>• Email and WhatsApp support</li>
                  <li>• Application tracking</li>
                  <li>• Document verification</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 border border-sa-gold/30">
                <div className="font-semibold text-sa-gold mb-2">Express Service - R100</div>
                <ul className="space-y-1 text-white/90">
                  <li>• 24-hour processing guarantee</li>
                  <li>• Priority support</li>
                  <li>• Real-time status updates</li>
                  <li>• Dedicated application manager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap gap-6 justify-center text-white/80 text-sm">
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
            <div className="flex items-center">
              <span className="w-2 h-2 bg-sa-gold rounded-full mr-2" />
              Money-Back Guarantee
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
