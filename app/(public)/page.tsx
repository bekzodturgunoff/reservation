import { cookies } from 'next/headers'
import { ROUTES } from '@/lib/constants/routes'
import { createServerT } from '@/lib/i18n/server'
import { HeroSection } from '@/features/home/components/HeroSection'
import { SearchBar } from '@/features/home/components/SearchBar'
import { CategoryGrid } from '@/features/home/components/CategoryGrid'
import { FeaturedVenues } from '@/features/home/components/FeaturedVenues'
import { HowItWorks } from '@/features/home/components/HowItWorks'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bronuz.uz'

export async function generateMetadata() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)

  return {
    title: t('home.heroBadge'),
    description: t('home.heroDescription'),
    openGraph: {
      title: t('home.heroBadge'),
      description: t('home.heroDescription'),
      url: siteUrl,
    },
    alternates: {
      canonical: siteUrl,
    },
  }
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-brand-darker py-16 px-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-base text-white/80 mt-4 max-w-lg mx-auto">
              {t('home.ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href={ROUTES.REGISTER}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white text-brand font-semibold text-base rounded-xl shadow-btn hover:bg-brand-pale transition-colors"
              >
                {t('home.ctaButton')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
              <a
                href={ROUTES.SEARCH}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-white font-medium text-base rounded-xl border-2 border-white/30 hover:border-white/50 transition-colors"
              >
                {t('home.filterEmptyAction')}
              </a>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  )
}
