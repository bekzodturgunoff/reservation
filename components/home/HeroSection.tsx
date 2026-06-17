'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function HeroSection() {
  const { t } = useTranslation()
  const statsRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState([
    { value: '500+', label: t('home.statVenues') },
    { value: '12,000+', label: t('home.statUsers') },
    { value: '4.8', label: t('home.statRating'), star: true },
  ])

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats([
          { value: `${data.venueCount}+`, label: t('home.statVenues') },
          { value: `${data.userCount}+`, label: t('home.statUsers') },
          { value: data.avgRating, label: t('home.statRating'), star: true },
        ])
      })
      .catch(() => {})
  }, [t])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 65% 20%, #065F46 0%, #022c22 55%, #0A0A0A 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 lg:py-0">
        <div className="flex items-center min-h-screen">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-white tracking-[0.05em] mb-8">
              <span>🇺🇿</span>
              <span>{t('home.heroBadge')}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[68px] sm:text-[68px] leading-[1.05] -tracking-[0.04em] font-extrabold text-white">
              {t('home.heroTitle1')}
              <br />
              <span className="text-[#34D399]">{t('home.heroTitleHighlight')}</span>
              <br />
              {t('home.heroTitle2')}
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-[17px] text-white/65 max-w-[460px] leading-relaxed">
              {t('home.heroDescription')}
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 h-[52px] px-7 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base rounded-xl shadow-btn transition-all hover:-translate-y-[1px] active:translate-y-0"
              >
                {t('home.searchButton')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 h-[52px] px-7 bg-white/12 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-medium text-base rounded-xl transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
                {t('home.howItWorks')}
              </a>
            </div>

            {/* Social proof */}
            <div ref={statsRef} className="mt-12 flex gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                      {stat.star && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                      {stat.label}
                    </p>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-7 bg-white/15" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
