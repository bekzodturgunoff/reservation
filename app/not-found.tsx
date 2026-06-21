'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useTitle } from '@/hooks/useTitle'

export default function NotFound() {
  const { t } = useTranslation()
  useTitle('404 — Sahifa topilmadi — BronUz')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg px-6">
      <h1 className="text-[120px] sm:text-[160px] font-display font-bold text-brand leading-none tracking-tight">
        {t('notFound.title')}
      </h1>
      <h2 className="mt-4 text-2xl sm:text-3xl font-display font-semibold text-ink text-center">
        {t('notFound.heading')}
      </h2>
      <p className="mt-2 text-ink-tertiary text-center max-w-md">
        {t('notFound.message')}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center px-6 py-3 bg-brand text-white text-sm font-semibold rounded-xl shadow-button hover:bg-brand-dark transition-colors"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}
