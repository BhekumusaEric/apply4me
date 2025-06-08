import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  HelpCircle, 
  Search, 
  Clock, 
  CreditCard, 
  Shield, 
  FileText,
  Users,
  Phone
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const faqCategories = [
  {
    title: 'Getting Started',
    icon: Users,
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Get Started" on our homepage, fill in your details, and verify your email address. It\'s completely free to create an account.'
      },
      {
        question: 'Is Apply4Me free to use?',
        answer: 'Creating an account and browsing institutions is free. We only charge service fees when you submit applications (R50 for standard, R100 for express service).'
      },
      {
        question: 'Which institutions can I apply to?',
        answer: 'We partner with universities, colleges, and TVET institutions across South Africa. You can browse all available institutions on our platform.'
      }
    ]
  },
  {
    title: 'Applications',
    icon: FileText,
    faqs: [
      {
        question: 'How long does the application process take?',
        answer: 'Standard service takes 5-7 business days, while Express service takes 1-2 business days. This is the time to process and submit your application to the institution.'
      },
      {
        question: 'Can I apply to multiple institutions?',
        answer: 'Yes! You can apply to as many institutions as you want. Each application is processed separately with its own fee.'
      },
      {
        question: 'What documents do I need?',
        answer: 'Typically you\'ll need your ID document, academic transcripts, matric certificate, and any additional documents specified by the institution.'
      },
      {
        question: 'Can I edit my application after submission?',
        answer: 'Once submitted and paid for, applications cannot be edited. However, you can contact our support team if you need to make urgent changes.'
      }
    ]
  },
  {
    title: 'Payments',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept credit/debit cards, instant EFT, and mobile payments including SnapScan and Zapper.'
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees! Our pricing is transparent: R50 for standard service, R100 for express service, plus the institution\'s application fee.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are available if your application hasn\'t been processed yet. Once submitted to the institution, refunds are subject to their policies.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use 256-bit SSL encryption and comply with PCI DSS standards to protect your payment information.'
      }
    ]
  },
  {
    title: 'Technical Support',
    icon: Shield,
    faqs: [
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password" on the sign-in page, enter your email address, and follow the instructions in the reset email.'
      },
      {
        question: 'Why can\'t I upload my documents?',
        answer: 'Ensure your files are in PDF, JPG, or PNG format and under 5MB each. Clear your browser cache and try again if issues persist.'
      },
      {
        question: 'The website is loading slowly. What should I do?',
        answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. Contact support if problems continue.'
      },
      {
        question: 'Can I use Apply4Me on my mobile phone?',
        answer: 'Yes! Our platform is fully responsive and works on all devices including smartphones and tablets.'
      }
    ]
  },
  {
    title: 'Institution Information',
    icon: Search,
    faqs: [
      {
        question: 'How do I know if an institution is legitimate?',
        answer: 'All institutions on our platform are verified and registered with the Department of Higher Education and Training.'
      },
      {
        question: 'Can I contact institutions directly?',
        answer: 'Yes, we provide contact information for each institution. However, for application-related queries, it\'s best to contact us first.'
      },
      {
        question: 'What if my preferred institution isn\'t listed?',
        answer: 'Contact our support team and we\'ll work to add your preferred institution to our platform.'
      }
    ]
  },
  {
    title: 'Account & Profile',
    icon: Users,
    faqs: [
      {
        question: 'How do I update my personal information?',
        answer: 'Log into your account, go to your profile settings, and update your information. Remember to save your changes.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can request account deletion by contacting our support team. Note that this action cannot be undone.'
      },
      {
        question: 'How do I track my applications?',
        answer: 'Log into your dashboard to see all your applications and their current status. You\'ll also receive email and SMS updates.'
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about using Apply4Me. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>
                
                <div className="grid gap-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <Card key={faqIndex}>
                      <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Phone className="h-12 w-12 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
              <p className="text-muted-foreground mb-8">
                Our support team is here to help you with any questions not covered in our FAQ.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-muted-foreground mb-1">apply4me2025@outlook.com</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Phone Support</h4>
                  <p className="text-muted-foreground mb-1">+27 69 343 4126</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri 8AM-6PM SAST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
