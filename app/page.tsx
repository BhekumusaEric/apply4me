import { Hero } from '@/components/sections/hero'
import { InstitutionShowcase } from '@/components/sections/institution-showcase'
import { Features } from '@/components/sections/features'
import { HowItWorks } from '@/components/sections/how-it-works'
// import { ComingSoonTestimonials } from '@/components/sections/coming-soon-testimonials'
import { CTA } from '@/components/sections/cta'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <InstitutionShowcase />
        <Features />
        <HowItWorks />
        {/* Uncomment the line below if you want to add an honest "coming soon" testimonials section */}
        {/* <ComingSoonTestimonials /> */}
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
