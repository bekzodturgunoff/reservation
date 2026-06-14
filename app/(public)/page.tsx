'use client'

import { useTitle } from '@/hooks/useTitle'
import { HeroSection } from '@/components/home/HeroSection'
import { SearchBar } from '@/components/home/SearchBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { BugunBronSection } from '@/components/home/BugunBronSection'
import { FeaturedVenues } from '@/components/home/FeaturedVenues'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const HomePage = () => {
  useTitle('BronUz — Onlayn Bron')

  return (
    <div>
      <HeroSection />
      <ScrollReveal><SearchBar /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.1}><CategoryGrid /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.15}><BugunBronSection /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.2}><FeaturedVenues /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.25}><HowItWorks /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.3}><Testimonials /></ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal direction="up" delay={0.35}>
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 py-16 px-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Biznesingizni ro'yxatdan o'tkazing
            </h2>
            <p className="text-base text-white/80 mt-4 max-w-lg mx-auto">
              Joyingizni minglab mijozlarga tanishtiring va bronlarni avtomatik boshqaring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white text-brand-600 font-semibold text-base rounded-xl shadow-btn hover:bg-brand-50 transition-colors"
              >
                Hoziroq boshlash
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-white font-medium text-base rounded-xl border-2 border-white/30 hover:border-white/50 transition-colors"
              >
                Batafsil ma'lumot
              </a>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  )
}

export default HomePage
