import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      benefits: ['Auto-save progress', 'Pre-filled data', 'Document upload', 'Form validation']
    },
    {
      icon: CreditCard,
      title: 'Secure Payment Gateway',
      description: 'Multiple payment options including bank transfer, instant EFT, and mobile payments. All transactions are secure and encrypted.',
      benefits: ['Multiple payment methods', 'Secure encryption', 'Instant confirmation', 'Receipt generation']
    },
    {
      icon: Shield,
      title: 'POPIA Compliant',
      description: 'Your personal data is protected according to South African privacy laws. We never share your information without consent.',
      benefits: ['Data protection', 'Privacy compliance', 'Secure storage', 'Consent management']
    },
    {
      icon: Clock,
      title: 'Express Processing',
      description: 'Choose between standard (R50) or express (R100) processing. Express applications are processed within 24 hours.',
      benefits: ['24-hour turnaround', 'Priority processing', 'Status tracking', 'Deadline management']
    },
    {
      icon: Users,
      title: 'Career Guidance',
      description: 'Take our career profiler test to discover programs that match your interests, skills, and career goals.',
      benefits: ['Personality assessment', 'Career matching', 'Program recommendations', 'Future planning']
    },
    {
      icon: Award,
      title: 'Bursary Finder',
      description: 'Discover funding opportunities from NSFAS, private companies, and government programs that match your profile.',
      benefits: ['Funding discovery', 'Eligibility matching', 'Application assistance', 'Deadline alerts']
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Apply from anywhere using your smartphone or tablet. Our platform works seamlessly across all devices.',
      benefits: ['Mobile optimized', 'Offline capability', 'Touch-friendly', 'App-like experience']
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Get help when you need it through WhatsApp, email, or phone. Our support team is here to guide you.',
      benefits: ['WhatsApp support', 'Email assistance', 'Phone support', 'FAQ resources']
    },
    {
      icon: CheckCircle,
      title: 'Application Tracking',
      description: 'Monitor your application status in real-time. Get notifications about updates and next steps.',
      benefits: ['Real-time tracking', 'Status notifications', 'Progress updates', 'Next step guidance']
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
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-muted/30">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
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
              <div className="text-3xl font-bold text-sa-gold mb-2">10,000+</div>
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
