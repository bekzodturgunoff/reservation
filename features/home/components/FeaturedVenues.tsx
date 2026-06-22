'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { showRating } from '@/lib/validation'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { VENUES_PER_PAGE } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'
import { Skeleton } from '@/components/ui/Skeleton'
import { FavoriteButton } from '@/features/venues/components/FavoriteButton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Venue } from '@/types'

const filterPills = [
  { label: 'home.allCategories', value: '' },
  { label: 'home.filterCafe', value: 'cafe' },
  { label: 'home.filterRestaurant', value: 'restaurant' },
  { label: 'home.filterFootball', value: 'football' },
  { label: 'home.filterSport', value: 'sport' },
  { label: 'home.filterKaraoke', value: 'karaoke' },
  { label: 'home.filterCoworking', value: 'coworking' },
]

export function FeaturedVenues() {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState('')

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(VENUES_PER_PAGE)
      return (data || []) as (Venue & { categories: { name_uz: string; name_ru: string; icon: string } | null })[]
    },
  })

  const filtered = activeFilter
    ? venues.filter((v) => v.categories?.name_uz?.toLowerCase().includes(activeFilter) || v.categories?.name_ru?.toLowerCase().includes(activeFilter))
    : venues



  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">{t('home.popularTitle')}</h2>
            <p className="mt-1 text-sm text-ink-tertiary">{t('home.popularDescription')}</p>
          </div>
          <Link href={ROUTES.SEARCH} className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            {t('common.viewAll')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setActiveFilter(pill.value)}
              className={`shrink-0 h-9 px-4 rounded-full text-xs font-medium transition-colors ${
                activeFilter === pill.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-muted text-ink-secondary hover:bg-line'
              }`}
            >
              {t(pill.label)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-line">
                <Skeleton variant="rect" className="w-full h-[220px]" />
                <div className="p-4 space-y-3">
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="50%" />
                  <div className="pt-3 border-t border-line">
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-10 h-10" />}
            title={t('home.filterEmpty')}
            description={t('home.filterEmptyDesc')}
            action={{ label: t('home.filterEmptyAction'), onClick: () => setActiveFilter('') }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((venue) => {
              const rating = showRating(venue.avg_rating, venue.review_count)
              return (
                <Link
                  key={venue.id}
                  href={`/venues/${venue.id}`}
                  className="group bg-white rounded-2xl border border-line shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Image area */}
                  <div className="relative h-[220px] overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${venue.photos?.[0] || PLACEHOLDER_IMAGE})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                      {venue.categories?.icon || '🏢'} {venue.categories?.name_uz || ''}
                    </span>

                    <FavoriteButton venueId={venue.id} className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30" />

                    {/* Rating */}
                    {rating.showStars && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{rating.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Info area */}
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-ink truncate">{venue.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-ink-tertiary mt-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {venue.city}
                    </p>

                    {/* Feature chips */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[10px] font-medium bg-surface-muted text-ink-secondary px-2 py-0.5 rounded-full">Wi-Fi</span>
                      <span className="text-[10px] font-medium bg-surface-muted text-ink-secondary px-2 py-0.5 rounded-full">{t('home.featureParking')}</span>
                      <span className="text-[10px] font-medium bg-surface-muted text-ink-secondary px-2 py-0.5 rounded-full">{t('home.featureMore', { count: 2 })}</span>
                    </div>

                    {/* Price row */}
                    <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-ink-muted uppercase tracking-wider">{t('common.pricing_units.per_hour')}</span>
                        <p className="text-lg font-display font-bold text-ink">
                          {(venue.price_per_slot ?? 0) > 0 ? `${(venue.price_per_slot).toLocaleString()} UZS` : t('common.negotiablePrice')}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 group-hover:underline flex items-center gap-1">
                        {t('common.book')}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
