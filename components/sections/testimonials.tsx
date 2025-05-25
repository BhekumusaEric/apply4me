import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Thabo Mthembu',
      location: 'Johannesburg, Gauteng',
      institution: 'University of the Witwatersrand',
      program: 'Computer Science',
      rating: 5,
      quote: "Apply4Me made my university application so much easier! I applied to 5 universities in just one afternoon. The career profiler helped me choose the right program, and I got accepted to my dream university.",
      avatar: '/avatars/thabo.jpg'
    },
    {
      name: 'Nomsa Dlamini',
      location: 'Durban, KwaZulu-Natal',
      institution: 'University of KwaZulu-Natal',
      program: 'Medicine',
      rating: 5,
      quote: "The bursary finder feature was a game-changer for me. I found 3 bursaries I qualified for and Apply4Me helped me apply for all of them. I'm now studying medicine with full funding!",
      avatar: '/avatars/nomsa.jpg'
    },
    {
      name: 'Sipho Ndlovu',
      location: 'Cape Town, Western Cape',
      institution: 'University of Cape Town',
      program: 'Engineering',
      rating: 5,
      quote: "I was overwhelmed by all the different application forms and deadlines. Apply4Me organized everything for me and made sure I didn't miss any deadlines. Highly recommended!",
      avatar: '/avatars/sipho.jpg'
    },
    {
      name: 'Lerato Mokwena',
      location: 'Polokwane, Limpopo',
      institution: 'Tshwane University of Technology',
      program: 'Information Technology',
      rating: 5,
      quote: "Coming from a rural area, I didn't know much about university applications. The support team guided me through everything via WhatsApp. I'm now studying IT and loving it!",
      avatar: '/avatars/lerato.jpg'
    },
    {
      name: 'Michael van der Merwe',
      location: 'Stellenbosch, Western Cape',
      institution: 'Stellenbosch University',
      program: 'Business Administration',
      rating: 5,
      quote: "The express service was worth every rand. My application was processed in 24 hours and I got early acceptance. Apply4Me's efficiency is unmatched.",
      avatar: '/avatars/michael.jpg'
    },
    {
      name: 'Zanele Khumalo',
      location: 'Bloemfontein, Free State',
      institution: 'University of the Free State',
      program: 'Education',
      rating: 5,
      quote: "As a first-generation university student, I had no idea where to start. Apply4Me's career profiler showed me that teaching was perfect for me. Now I'm training to be a teacher!",
      avatar: '/avatars/zanele.jpg'
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
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hear from thousands of students who have successfully started their higher education journey with Apply4Me.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Quote */}
                <blockquote className="text-muted-foreground mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Student Info */}
                <div className="border-t pt-4">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground mb-2">{testimonial.location}</div>
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
