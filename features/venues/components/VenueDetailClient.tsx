'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FavoriteButton } from '@/features/venues/components/FavoriteButton'
import { PhotoGallery } from '@/features/venues/components/PhotoGallery'
import { BookingWidget } from '@/features/venues/components/BookingWidget'
import type { Venue } from '@/types'

export function VenueDetailClient({ venue }: { venue: Venue }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(venue.address || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
    </>
  )
}

VenueDetailClient.BookingWidget = BookingWidget
