import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  UserCheck, 
  Search, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: UserCheck,
      title: 'Create Your Profile',
      description: 'Sign up and complete your student profile with personal details, academic records, and career interests.',
      time: '5 minutes',
      features: ['Personal information', 'Academic history', 'Career preferences', 'Document upload']
    },
    {
      step: 2,
      icon: Search,
      title: 'Discover & Match',
      description: 'Use our career profiler and institution finder to discover programs that match your goals and qualifications.',
      time: '10 minutes',
      features: ['Career assessment', 'Institution search', 'Program matching', 'Bursary finder']
    },
    {
      step: 3,
      icon: FileText,
      title: 'Complete Applications',
      description: 'Fill out smart application forms that auto-populate with your information. Apply to multiple institutions at once.',
      time: '15 minutes',
      features: ['Pre-filled forms', 'Multiple applications', 'Document management', 'Auto-save progress']
    },
    {
      step: 4,
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Choose your service level and pay securely. Standard (R50) or Express (R100) processing available.',
      time: '2 minutes',
      features: ['Multiple payment options', 'Secure processing', 'Instant confirmation', 'Receipt generation']
    },
    {
      step: 5,
      icon: CheckCircle,
      title: 'Track & Submit',
      description: 'Monitor your application status and receive updates. We handle submission to institutions on your behalf.',
      time: 'Ongoing',
      features: ['Real-time tracking', 'Status notifications', 'Institution submission', 'Support assistance']
    }
  ]

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Apply to multiple institutions with one form instead of filling out dozens separately.'
    },
    {
      icon: Shield,
      title: 'Reduce Errors',
      description: 'Our smart forms validate your information and prevent common application mistakes.'
    },
    {
      icon: CheckCircle,
      title: 'Increase Success',
      description: 'Get matched with programs that fit your profile and receive guidance throughout the process.'
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How Apply4Me Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our simple 5-step process makes applying to higher education institutions 
            easier than ever before. Get started in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 1
            
            return (
              <div key={step.step} className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-lg mb-4">{step.description}</p>
                  
                  <div className="inline-flex items-center text-sm text-primary font-medium mb-6">
                    <Clock className="h-4 w-4 mr-2" />
                    Estimated time: {step.time}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-w-md mx-auto lg:mx-0">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-sa-green mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <Card className="w-full max-w-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 mt-32">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Benefits */}
        <div className="bg-background rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl font-bold text-center mb-8">Why Students Love Our Process</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-sa-green/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-sa-green" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              )
            })}
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
