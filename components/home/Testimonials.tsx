'use client'

import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const colors = [
  { bg: 'bg-brand-100', text: 'text-brand-700' },
  { bg: 'bg-status-info-bg', text: 'text-status-info' },
  { bg: 'bg-status-warning-bg', text: 'text-status-warning' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export function Testimonials() {
  const { t } = useTranslation()

  const testimonials = [
    {
      quote: t('home.testimonial1Quote'),
      name: t('home.testimonial1Name'),
      location: t('home.testimonial1Location'),
    },
    {
      quote: t('home.testimonial2Quote'),
      name: t('home.testimonial2Name'),
      location: t('home.testimonial2Location'),
    },
    {
      quote: t('home.testimonial3Quote'),
      name: t('home.testimonial3Name'),
      location: t('home.testimonial3Location'),
    },
  ]
  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center">
          {t('home.testimonialTitle')}
        </h2>
        <p className="mt-3 text-base text-ink-tertiary text-center flex items-center justify-center gap-2">
          <span className="text-yellow-400 text-lg">★★★★★</span>
          {t('home.testimonialRating')}
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-card border border-line shadow-card p-7"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-ink-secondary leading-relaxed italic">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="mt-5 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${colors[i].bg} flex items-center justify-center text-sm font-semibold ${colors[i].text}`}>
                  {getInitials(item.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-ink-tertiary">{item.location}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] text-brand-600 font-medium flex items-center gap-0.5">
                    ✓ {t('home.testimonialVerified')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
