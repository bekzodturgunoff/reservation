'use client'

import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTitle } from '@/hooks/useTitle'

function BookingSuccessInner() {
  const { t } = useTranslation()
  useTitle('Bron tasdiqlandi — BronUz')
  const searchParams = useSearchParams()

  const details = {
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    venue: searchParams.get('venue') || '',
  }

  const hasDetails = details.date || details.time || details.venue

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        <CheckCircle2 className="w-20 h-20 text-success mb-6" strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
          {t('confirmation.successTitle')}
        </h1>
        <p className="mt-2 text-ink-tertiary">
          {t('confirmation.contactNote')}
        </p>

        {hasDetails && (
          <div className="mt-8 w-full bg-surface border border-border rounded-2xl shadow-card p-5 space-y-3 text-left">
            <h3 className="text-sm font-semibold text-ink-tertiary uppercase tracking-wider">
              {t('confirmation.details')}
            </h3>
            <div className="space-y-2">
              {details.venue && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">{t('common.venue')}</span>
                  <span className="text-ink font-medium">{details.venue}</span>
                </div>
              )}
              {details.date && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">{t('common.date')}</span>
                  <span className="text-ink font-medium">{details.date}</span>
                </div>
              )}
              {details.time && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">{t('common.time')}</span>
                  <span className="text-ink font-medium">{details.time}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full">
              {t('confirmation.backHome')}
            </Button>
          </Link>
          <Link href="/search" className="flex-1">
            <Button variant="primary" className="w-full">
              {t('common.search')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingSuccessInner />
    </Suspense>
  )
}
