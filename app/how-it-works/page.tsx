import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock,
  Shield,
  Users,
  Award,
  ArrowRight,
  Play,
  Star,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const steps = [
  {
    number: 1,
    title: 'Discover & Explore',
    description: 'Browse through hundreds of South African institutions, universities, colleges, and TVET institutions.',
    icon: Search,
    details: [
      'Search by location, field of study, or institution type',
      'View detailed institution profiles and requirements',
      'Compare different programs and their outcomes',
      'Read reviews and success stories from other students'
    ],
    color: 'bg-blue-500'
  },
  {
    number: 2,
    title: 'Complete Your Profile',
    description: 'Use our career profiler to get personalized recommendations based on your interests and goals.',
    icon: FileText,
    details: [
      'Answer questions about your interests and skills',
      'Get matched with suitable career paths',
      'Receive personalized institution recommendations',
      'Save your profile for future applications'
    ],
    color: 'bg-green-500'
  },
  {
    number: 3,
    title: 'Apply with Ease',
    description: 'Submit applications to multiple institutions through our streamlined application process.',
    icon: FileText,
    details: [
      'Fill out one application for multiple institutions',
      'Upload documents once, use everywhere',
      'Track application progress in real-time',
      'Get expert guidance throughout the process'
    ],
    color: 'bg-purple-500'
  },
  {
    number: 4,
    title: 'Secure Payment',
    description: 'Pay application fees securely with multiple payment options and transparent pricing.',
    icon: CreditCard,
    details: [
      'Multiple payment methods (Card, EFT, Mobile)',
      'Transparent pricing with no hidden fees',
      'Secure 256-bit SSL encryption',
      'Instant payment confirmation'
    ],
    color: 'bg-orange-500'
  },
  {
    number: 5,
    title: 'Track & Succeed',
    description: 'Monitor your applications and receive updates until you get accepted to your dream institution.',
    icon: CheckCircle,
    details: [
      'Real-time application status updates',
      'SMS and email notifications',
      'Direct communication with institutions',
      'Support throughout your journey'
    ],
    color: 'bg-sa-green'
  }
]

const features = [
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Apply to multiple institutions with one application instead of filling out separate forms.'
  },
  {
    icon: Shield,
    title: 'Secure & Safe',
    description: 'Your personal information and payments are protected with bank-level security.'
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: 'Get help from our education consultants throughout your application journey.'
  },
  {
    icon: Award,
    title: 'Higher Success Rate',
    description: 'Our guided process increases your chances of acceptance with optimized applications.'
  }
]

const pricing = [
  {
    name: 'Standard Service',
    price: 'R50',
    duration: '5-7 business days',
    features: [
      'Application processing',
      'Email confirmation',
      'Application tracking',
      'Standard support'
    ],
    popular: false
  },
  {
    name: 'Express Service',
    price: 'R100',
    duration: '1-2 business days',
    features: [
      'Priority processing',
      'SMS + Email confirmation',
      'Real-time tracking',
      'Priority support',
      'Application review'
    ],
    popular: true
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How Apply4Me Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Simplifying your journey to higher education in South Africa. 
            From discovery to acceptance, we're with you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Journey in 5 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes applying to South African institutions easier than ever before.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-24 bg-border hidden md:block" />
                )}
                
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Step Icon */}
                  <div className={`w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {step.number}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <step.icon className="h-6 w-6 text-primary" />
                          <CardTitle className="text-xl">{step.title}</CardTitle>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Apply4Me?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've designed our platform to address the common challenges students face when applying to institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the service level that works best for you. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricing.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">Processing time: {plan.duration}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              * Plus institution application fees (varies by institution)
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How long does the application process take?</h3>
                <p className="text-sm text-muted-foreground">
                  With our Standard service, applications are processed within 5-7 business days. 
                  Express service takes only 1-2 business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Can I apply to multiple institutions?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can apply to as many institutions as you want using the same application form. 
                  Each application is processed separately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept credit/debit cards, instant EFT, and mobile payments including SnapScan and Zapper.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Is my personal information secure?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely. We use 256-bit SSL encryption and follow strict data protection protocols 
                  to keep your information safe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of South African students who have successfully applied to their dream institutions through Apply4Me.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
