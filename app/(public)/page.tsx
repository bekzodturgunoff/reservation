import type { Metadata } from 'next'
import { ROUTES } from '@/lib/constants/routes'
import { HeroSection } from '@/features/home/components/HeroSection'
import { SearchBar } from '@/features/home/components/SearchBar'
import { CategoryGrid } from '@/features/home/components/CategoryGrid'
import { FeaturedVenues } from '@/features/home/components/FeaturedVenues'
import { HowItWorks } from '@/features/home/components/HowItWorks'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bronuz.uz'

export const metadata: Metadata = {
  title: 'BronUz — Onlayn bron qilish | O\'zbekistondagi №1 bron platformasi',
  description: 'Kafe, restoran, futbol maydonlari, sport zallari va boshqa joylarni onlayn bron qiling. 30+ toifadagi 1000+ joy.',
  openGraph: {
    title: 'BronUz — Onlayn bron qilish',
    description: 'O\'zbekistondagi eng yaxshi joylarni bir joydan topib, tezda bron qiling.',
    url: siteUrl,
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ScrollReveal><SearchBar /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.1}><CategoryGrid /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.15}><FeaturedVenues /></ScrollReveal>
      <ScrollReveal direction="up" delay={0.2}><HowItWorks /></ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal direction="up" delay={0.35}>
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 py-16 px-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Biznesingizni bron platformasiga qo&apos;shing
            </h2>
            <p className="text-base text-white/80 mt-4 max-w-lg mx-auto">
              O&apos;zingizning joyingizni ro&apos;yxatdan o&apos;tkazing va yangi mijozlarni toping
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href={ROUTES.REGISTER}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white text-brand-600 font-semibold text-base rounded-xl shadow-btn hover:bg-brand-50 transition-colors"
              >
                Boshlash
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
              <a
                href={ROUTES.SEARCH}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-white font-medium text-base rounded-xl border-2 border-white/30 hover:border-white/50 transition-colors"
              >
                Joylarni ko&apos;rish
              </a>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  )
}
