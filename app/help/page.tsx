import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  HelpCircle, 
  Search, 
  FileText, 
  CreditCard, 
  Users,
  Phone,
  Mail,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const helpCategories = [
  {
    title: 'Getting Started',
    icon: Users,
    description: 'Learn how to create an account and start your application journey',
    articles: [
      'How to create an account',
      'Completing your profile',
      'Understanding the application process',
      'Choosing the right institutions'
    ],
    href: '/faq#getting-started'
  },
  {
    title: 'Applications',
    icon: FileText,
    description: 'Everything you need to know about submitting applications',
    articles: [
      'Application requirements',
      'Document upload guidelines',
      'Tracking application status',
      'Making changes to applications'
    ],
    href: '/faq#applications'
  },
  {
    title: 'Payments & Billing',
    icon: CreditCard,
    description: 'Payment methods, fees, and billing information',
    articles: [
      'Payment methods accepted',
      'Understanding fees',
      'Refund policies',
      'Payment security'
    ],
    href: '/faq#payments'
  },
  {
    title: 'Technical Support',
    icon: HelpCircle,
    description: 'Troubleshooting and technical assistance',
    articles: [
      'Login issues',
      'Document upload problems',
      'Browser compatibility',
      'Mobile app support'
    ],
    href: '/faq#technical-support'
  }
]

const quickActions = [
  {
    title: 'Track Application',
    description: 'Check the status of your submitted applications',
    icon: Search,
    href: '/dashboard',
    color: 'bg-blue-500'
  },
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: MessageSquare,
    href: '/contact',
    color: 'bg-green-500'
  },
  {
    title: 'View FAQ',
    description: 'Find answers to common questions',
    icon: BookOpen,
    href: '/faq',
    color: 'bg-purple-500'
  }
]

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Find answers, get support, and learn how to make the most of Apply4Me
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, guides, or FAQs..."
              className="pl-10 h-12 text-lg"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={action.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {category.articles.map((article, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{article}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={category.href}>
                      View All Articles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Still Need Help?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Get personalized help from our support team. We're here to assist you with any questions or issues.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-sm">Email Support</h4>
                      <p className="text-xs text-muted-foreground">support@apply4me.co.za</p>
                      <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-sm">Phone Support</h4>
                      <p className="text-xs text-muted-foreground">+27 (0) 11 123 4567</p>
                      <p className="text-xs text-muted-foreground">Mon-Fri 8AM-6PM SAST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-sm">Live Chat</h4>
                      <p className="text-xs text-muted-foreground">Available during business hours</p>
                      <p className="text-xs text-muted-foreground">Instant responses</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Contact Support Team
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Community & Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Resources & Guides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Explore our comprehensive guides and resources to help you succeed in your educational journey.
                </p>
                
                <div className="space-y-3">
                  <Link href="/how-it-works" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium text-sm">How Apply4Me Works</h4>
                    <p className="text-xs text-muted-foreground">Complete guide to our platform</p>
                  </Link>
                  
                  <Link href="/faq" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium text-sm">Frequently Asked Questions</h4>
                    <p className="text-xs text-muted-foreground">Answers to common questions</p>
                  </Link>
                  
                  <Link href="/career-profiler" className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium text-sm">Career Guidance</h4>
                    <p className="text-xs text-muted-foreground">Find your ideal career path</p>
                  </Link>
                </div>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/faq">
                    Browse All Resources
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
