import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: January 2025</span>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <p className="text-muted-foreground">
                    We collect information you provide when creating an account, including your name, email address, 
                    phone number, ID number, and academic information necessary for applications.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Application Data</h4>
                  <p className="text-muted-foreground">
                    When you apply to institutions, we collect academic transcripts, certificates, 
                    and other documents required for your applications.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Usage Information</h4>
                  <p className="text-muted-foreground">
                    We automatically collect information about how you use our platform, including 
                    pages visited, time spent, and interactions with features.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Process and submit your applications to educational institutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide customer support and respond to your inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Send important updates about your applications and our services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Improve our platform and develop new features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Comply with legal obligations and prevent fraud</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Educational Institutions</h4>
                  <p className="text-muted-foreground">
                    We share your application information with the institutions you choose to apply to. 
                    This is necessary to process your applications.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Service Providers</h4>
                  <p className="text-muted-foreground">
                    We work with trusted third-party providers for payment processing, email delivery, 
                    and other essential services. They only access information necessary for their services.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Legal Requirements</h4>
                  <p className="text-muted-foreground">
                    We may disclose information when required by law, to protect our rights, 
                    or to ensure the safety of our users.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>256-bit SSL encryption for all data transmission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure cloud storage with regular backups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Regular security audits and vulnerability assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Access controls and employee training on data protection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Under POPIA (Protection of Personal Information Act), you have the following rights:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Request a copy of the personal information we hold about you
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Correction</h4>
                    <p className="text-sm text-muted-foreground">
                      Request correction of inaccurate or incomplete information
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Deletion</h4>
                    <p className="text-sm text-muted-foreground">
                      Request deletion of your personal information (subject to legal requirements)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Objection</h4>
                    <p className="text-sm text-muted-foreground">
                      Object to certain processing of your personal information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to improve your experience on our platform. 
                  These help us remember your preferences, analyze usage patterns, and provide personalized content. 
                  You can control cookie settings through your browser preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Data Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to provide our services 
                  and comply with legal obligations. Application data is typically retained for 7 years 
                  after your last interaction with our platform, unless you request earlier deletion.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of any 
                  significant changes by email or through our platform. Your continued use of our 
                  services after such changes constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this privacy policy or want to exercise your rights, contact us:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>privacy@apply4me.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+27 (0) 11 123 4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Johannesburg, South Africa</span>
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
