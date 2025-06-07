'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import {
  FileText,
  CreditCard,
  Shield,
  Clock,
  Users,
  Award,
  Smartphone,
  HeadphonesIcon,
  CheckCircle
} from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: FileText,
      title: 'Smart Application Forms',
      description: 'Pre-filled forms that mimic official institution applications. Auto-save functionality ensures you never lose your progress.',
      benefits: ['Auto-save progress', 'Pre-filled data', 'Document upload', 'Form validation'],
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
      imageAlt: 'Student filling out application forms on laptop'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment Gateway',
      description: 'Multiple payment options including bank transfer, instant EFT, and mobile payments. All transactions are secure and encrypted.',
      benefits: ['Multiple payment methods', 'Secure encryption', 'Instant confirmation', 'Receipt generation'],
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
      imageAlt: 'Secure online payment processing'
    },
    {
      icon: Shield,
      title: 'POPIA Compliant',
      description: 'Your personal data is protected according to South African privacy laws. We never share your information without consent.',
      benefits: ['Data protection', 'Privacy compliance', 'Secure storage', 'Consent management'],
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop',
      imageAlt: 'Data security and privacy protection'
    },
    {
      icon: Clock,
      title: 'Express Processing',
      description: 'Choose between standard (R50) or express (R100) processing. Express applications are processed within 24 hours.',
      benefits: ['24-hour turnaround', 'Priority processing', 'Status tracking', 'Deadline management'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      imageAlt: 'Fast processing and time management'
    },
    {
      icon: Users,
      title: 'Career Guidance',
      description: 'Take our career profiler test to discover programs that match your interests, skills, and career goals.',
      benefits: ['Personality assessment', 'Career matching', 'Program recommendations', 'Future planning'],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop',
      imageAlt: 'Career guidance and counseling session'
    },
    {
      icon: Award,
      title: 'Bursary Finder',
      description: 'Discover funding opportunities from NSFAS, private companies, and government programs that match your profile.',
      benefits: ['Funding discovery', 'Eligibility matching', 'Application assistance', 'Deadline alerts'],
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
      imageAlt: 'Scholarship and bursary opportunities'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Apply from anywhere using your smartphone or tablet. Our platform works seamlessly across all devices.',
      benefits: ['Mobile optimized', 'Offline capability', 'Touch-friendly', 'App-like experience'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
      imageAlt: 'Mobile application interface'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Get help when you need it through WhatsApp, email, or phone. Our support team is here to guide you.',
      benefits: ['WhatsApp support', 'Email assistance', 'Phone support', 'FAQ resources'],
      image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&h=400&fit=crop',
      imageAlt: 'Customer support team helping students'
    },
    {
      icon: CheckCircle,
      title: 'Application Tracking',
      description: 'Monitor your application status in real-time. Get notifications about updates and next steps.',
      benefits: ['Real-time tracking', 'Status notifications', 'Progress updates', 'Next step guidance'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      imageAlt: 'Application tracking dashboard'
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Apply4Me?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We've built the most comprehensive platform to simplify your higher education journey. 
            Here's what makes us different.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                {/* Feature Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-sa-green mr-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-sa-green to-sa-blue rounded-2xl p-8 lg:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Trusted by Students Across South Africa</h3>
            <p className="text-white/90">Join thousands of students who have successfully applied through our platform</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-sa-gold mb-2">200+</div>
              <div className="text-white/90">Students Helped</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sa-gold mb-2">200+</div>
              <div className="text-white/90">Partner Institutions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sa-gold mb-2">95%</div>
              <div className="text-white/90">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sa-gold mb-2">24/7</div>
              <div className="text-white/90">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
