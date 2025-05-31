'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitted(true)
    setSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      })
    }, 3000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about your application or need help with our platform?
            We're here to support you on your educational journey.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-muted-foreground">apply4me2025@outlook.com</p>
                      <p className="text-xs text-muted-foreground">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">+27 69 343 4126</p>
                      <p className="text-xs text-muted-foreground">Mon-Fri 8AM-6PM SAST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515"/>
                    </svg>
                    <div>
                      <h4 className="font-medium">WhatsApp Support</h4>
                      <p className="text-sm text-muted-foreground">+27 69 343 4126</p>
                      <p className="text-xs text-muted-foreground">Quick responses via WhatsApp</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Office Address</h4>
                      <p className="text-sm text-muted-foreground">
                        Online Business - <br />
                        Johannesburg, <br />
                        South Africa
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Business Hours</h4>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 8:00 AM - 6:00 PM<br />
                        Saturday: 9:00 AM - 2:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Application Status</h4>
                    <p className="text-xs text-muted-foreground">Track your application progress</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Payment Issues</h4>
                    <p className="text-xs text-muted-foreground">Help with payments and refunds</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Technical Support</h4>
                    <p className="text-xs text-muted-foreground">Platform and login issues</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Institution Information</h4>
                    <p className="text-xs text-muted-foreground">Questions about specific institutions</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-muted-foreground">
                        Thank you for contacting us. We'll respond to your message within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="application">Application Support</SelectItem>
                              <SelectItem value="payment">Payment Issues</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="institution">Institution Information</SelectItem>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            placeholder="Brief description of your inquiry"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          placeholder="Please provide details about your inquiry..."
                          rows={6}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" disabled={submitting} className="w-full">
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our Privacy Policy and Terms of Service.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
