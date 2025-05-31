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
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515"/>
                    </svg>
                    <span>WhatsApp: +27 69 343 4126</span>
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
