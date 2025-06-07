'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Thabo Mthembu',
      location: 'Johannesburg, Gauteng',
      institution: 'University of the Witwatersrand',
      program: 'Computer Science',
      rating: 5,
      quote: "Apply4Me made my university application so much easier! I applied to 5 universities in just one afternoon. The career profiler helped me choose the right program, and I got accepted to my dream university.",
      avatar: '/images/testimonials/thabo-mthembu.jpg',
      fallbackAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Nomsa Dlamini',
      location: 'Durban, KwaZulu-Natal',
      institution: 'University of KwaZulu-Natal',
      program: 'Medicine',
      rating: 5,
      quote: "The bursary finder feature was a game-changer for me. I found 3 bursaries I qualified for and Apply4Me helped me apply for all of them. I'm now studying medicine with full funding!",
      avatar: '/images/testimonials/nomsa-dlamini.jpg',
      fallbackAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Sipho Ndlovu',
      location: 'Cape Town, Western Cape',
      institution: 'University of Cape Town',
      program: 'Engineering',
      rating: 5,
      quote: "I was overwhelmed by all the different application forms and deadlines. Apply4Me organized everything for me and made sure I didn't miss any deadlines. Highly recommended!",
      avatar: '/images/testimonials/sipho-ndlovu.jpg',
      fallbackAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Lerato Mokwena',
      location: 'Polokwane, Limpopo',
      institution: 'Tshwane University of Technology',
      program: 'Information Technology',
      rating: 5,
      quote: "Coming from a rural area, I didn't know much about university applications. The support team guided me through everything via WhatsApp. I'm now studying IT and loving it!",
      avatar: '/images/testimonials/lerato-mokwena.jpg',
      fallbackAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Michael van der Merwe',
      location: 'Stellenbosch, Western Cape',
      institution: 'Stellenbosch University',
      program: 'Business Administration',
      rating: 5,
      quote: "The express service was worth every rand. My application was processed in 24 hours and I got early acceptance. Apply4Me's efficiency is unmatched.",
      avatar: '/images/testimonials/michael-van-der-merwe.jpg',
      fallbackAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Zanele Khumalo',
      location: 'Bloemfontein, Free State',
      institution: 'University of the Free State',
      program: 'Education',
      rating: 5,
      quote: "As a first-generation university student, I had no idea where to start. Apply4Me's career profiler showed me that teaching was perfect for me. Now I'm training to be a teacher!",
      avatar: '/images/testimonials/zanele-khumalo.jpg',
      fallbackAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
            <Star className="mr-2 h-4 w-4 fill-current" />
            Trusted by thousands of students
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hear from thousands of students who have successfully started their higher education journey with Apply4Me.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                {/* Student Avatar */}
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Image
                      src={testimonial.fallbackAvatar}
                      alt={`${testimonial.name} - Apply4Me Success Story`}
                      width={60}
                      height={60}
                      className="rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm text-muted-foreground">({testimonial.rating}.0)</span>
                </div>

                {/* Quote */}
                <blockquote className="text-muted-foreground mb-6 italic relative">
                  <Quote className="h-6 w-6 text-primary/20 absolute -top-2 -left-1" />
                  <span className="pl-6">"{testimonial.quote}"</span>
                </blockquote>

                {/* Program Info */}
                <div className="border-t pt-4">
                  <div className="text-sm">
                    <span className="font-medium text-primary">{testimonial.program}</span>
                    <br />
                    <span className="text-muted-foreground">{testimonial.institution}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Student Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Acceptance Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24hrs</div>
              <div className="text-sm text-muted-foreground">Express Processing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
