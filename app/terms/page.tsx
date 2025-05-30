import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, Mail, Phone } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            These terms govern your use of Apply4Me and our services. Please read them carefully.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: January 2025</span>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By accessing and using Apply4Me, you accept and agree to be bound by the terms and provision 
                  of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Apply4Me is an online platform that facilitates applications to South African educational institutions. 
                  Our services include:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Application processing and submission to educational institutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Career profiling and guidance services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Information about bursaries and funding opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Customer support and guidance throughout the application process</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Information</h4>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account and password. 
                    You agree to provide accurate, current, and complete information during registration.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Application Information</h4>
                  <p className="text-muted-foreground">
                    You warrant that all information provided in your applications is true, accurate, 
                    and complete. False information may result in rejection of applications and termination of services.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Prohibited Uses</h4>
                  <p className="text-muted-foreground">
                    You may not use our service for any unlawful purpose, to submit false information, 
                    or to interfere with the proper working of the platform.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Fees and Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Fees</h4>
                  <p className="text-muted-foreground">
                    Apply4Me charges service fees for application processing: R50 for standard service 
                    (5-7 business days) and R100 for express service (1-2 business days).
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Institution Fees</h4>
                  <p className="text-muted-foreground">
                    Institution application fees are separate and vary by institution. These fees are 
                    collected on behalf of the institutions and are non-refundable once submitted.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Payment Terms</h4>
                  <p className="text-muted-foreground">
                    All fees must be paid before application submission. We accept various payment methods 
                    including credit cards, EFT, and mobile payments.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Refund Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Refunds for Apply4Me service fees may be available if your application has not been 
                  processed or submitted to the institution. Institution fees are generally non-refundable 
                  once submitted. Please refer to our detailed Refund Policy for complete terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Apply4Me acts as an intermediary between students and educational institutions. 
                  We do not guarantee acceptance to any institution. Our liability is limited to 
                  the fees paid for our services. We are not responsible for decisions made by 
                  educational institutions regarding applications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All content on Apply4Me, including text, graphics, logos, and software, is the 
                  property of Apply4Me and is protected by copyright and other intellectual property laws. 
                  You may not reproduce, distribute, or create derivative works without our written permission.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Our collection and use of personal information is 
                  governed by our Privacy Policy, which complies with the Protection of Personal 
                  Information Act (POPIA). Please review our Privacy Policy for detailed information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to our services at our sole discretion, 
                  without prior notice, for conduct that we believe violates these Terms of Service or is 
                  harmful to other users, us, or third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  These Terms of Service are governed by the laws of South Africa. Any disputes arising 
                  from these terms or your use of our services will be subject to the jurisdiction of 
                  South African courts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of any 
                  significant changes via email or through our platform. Your continued use of our 
                  services after such changes constitutes acceptance of the new terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>apply4me2025@outlook.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+27 69 343 4126</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
