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
        <div className="grid lg:grid-cols-[55%_45%] gap-12 items-center min-h-screen">
          {/* LEFT COLUMN */}
          <div className="max-w-2xl">
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

          {/* RIGHT COLUMN - Brand visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-[380px] h-[440px]">
              {/* Decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-emerald-400/10 to-transparent" />
              </div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_16px_48px_rgba(5,150,105,0.3)] flex items-center justify-center -rotate-6">
                  <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
              {/* Feature list */}
              <div className="absolute bottom-0 left-0 right-0 space-y-3">
                {[
                  { icon: '⚡', text: t('home.featureFast') },
                  { icon: '🛡️', text: t('home.featureSecure') },
                  { icon: '✅', text: t('home.featureVerified') },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm text-white/80 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
