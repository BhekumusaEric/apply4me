import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  Search, 
  ArrowLeft, 
  FileQuestion,
  GraduationCap,
  BookOpen,
  Users
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const quickLinks = [
  {
    title: 'Browse Institutions',
    description: 'Explore universities, colleges, and TVET institutions',
    href: '/institutions',
    icon: GraduationCap,
    color: 'bg-blue-500'
  },
  {
    title: 'Career Profiler',
    description: 'Discover your ideal career path and study options',
    href: '/career-profiler',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    title: 'Bursaries & Funding',
    description: 'Find financial aid and scholarship opportunities',
    href: '/bursaries',
    icon: BookOpen,
    color: 'bg-purple-500'
  },
  {
    title: 'How It Works',
    description: 'Learn about our application process',
    href: '/how-it-works',
    icon: FileQuestion,
    color: 'bg-orange-500'
  }
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Hero */}
          <div className="mb-12">
            <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Oops! The page you're looking for seems to have wandered off. 
              Don't worry, we'll help you find your way back to your educational journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild>
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/institutions">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Institutions
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link) => (
                <Card key={link.href} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <link.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={link.href}>
                        Explore
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <Card className="bg-muted/50">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Need Help Finding Something?</h3>
              <p className="text-muted-foreground mb-6">
                If you were looking for something specific, our support team is here to help you find it.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Search Issues?</h4>
                  <p className="text-muted-foreground mb-3">
                    Try using our search feature or browse by category
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/institutions">
                      Search Institutions
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center">
                  <h4 className="font-medium mb-2">Technical Problems?</h4>
                  <p className="text-muted-foreground mb-3">
                    Report any technical issues to our support team
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/contact">
                      Contact Support
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center">
                  <h4 className="font-medium mb-2">New to Apply4Me?</h4>
                  <p className="text-muted-foreground mb-3">
                    Learn how our platform works and get started
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/how-it-works">
                      How It Works
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact our support team
              </Link>{' '}
              and we'll investigate the issue.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
