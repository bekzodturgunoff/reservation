'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FavoriteButton } from '@/features/venues/components/FavoriteButton'
import { PhotoGallery } from '@/features/venues/components/PhotoGallery'
import type { Venue } from '@/types'

export function VenueDetailClient({ venue }: { venue: Venue }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(venue.address || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToBooking = () => {
    const el = document.getElementById('booking-widget')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasPrice = (venue.price_per_slot ?? 0) > 0

  return (
    <>
      <PhotoGallery photos={venue.photos} name={venue.name} />

      <div className="flex items-center gap-3 mt-4">
        <FavoriteButton venueId={venue.id} className="bg-surface-bg border border-border hover:bg-surface-subtle shrink-0" />
        <button
          onClick={copyAddress}
          className="flex items-center gap-1.5 text-sm text-brand hover:underline shrink-0 transition-colors"
        >
          {copied ? (
            <><Check className="w-4 h-4" /> {t('common.copied')}</>
          ) : (
            <><Copy className="w-4 h-4" /> {t('common.copyAddress')}</>
          )}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-line p-4 z-50 shadow-modal pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-tertiary">{t('venue.perHour')}</span>
            <p className="text-lg font-display font-bold text-ink">
              {hasPrice ? `${(venue.price_per_slot ?? 0).toLocaleString()} UZS` : t('common.negotiablePrice')}
            </p>
          </div>
          <button
            onClick={scrollToBooking}
            className="h-[48px] px-6 bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-btn shadow-btn transition-all duration-normal active:scale-[0.97]"
          >
            {t('common.book')}
          </button>
        </div>
      </div>
    </>
  )
}
