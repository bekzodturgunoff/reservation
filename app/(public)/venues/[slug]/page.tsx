'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useTranslation } from 'react-i18next'
import { useTitle } from '@/hooks/useTitle'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import {
  MapPin, Star, Phone, Users,
  Shield, Check, Copy, Wifi, Car, Tv, Fan,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { PhotoGallery } from '@/components/venue/PhotoGallery'
import { BookingWidget } from '@/components/venue/BookingWidget'
import type { Venue, Review } from '@/types'

function VenueSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton className="h-5 w-48 rounded-lg" />
      <Skeleton className="h-[300px] sm:h-[400px] lg:h-[460px] rounded-card" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-10 w-96 rounded-lg" />
          <Skeleton className="h-5 w-64 rounded-lg" />
          <Skeleton className="h-32 rounded-card" />
        </div>
        <div>
          <Skeleton className="h-[450px] rounded-card" />
        </div>
      </div>
    </div>
  )
}

export default function VenueDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(*)')
        .eq('id', slug)
        .single()
      return data as Venue
    },
    enabled: !!slug,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['venue-reviews', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('venue_id', slug)
        .order('created_at', { ascending: false })
        .limit(10)
      return (data || []) as Review[]
    },
    enabled: !!slug,
  })

  const { data: similarVenues = [] } = useQuery({
    queryKey: ['similar-venues', venue?.category_id],
    queryFn: async () => {
      if (!venue?.category_id) return []
      const { data } = await supabase
        .from('venues')
        .select('*, categories(*)')
        .eq('category_id', venue.category_id)
        .eq('status', 'active')
        .neq('id', venue.id)
        .limit(4)
      return (data || []) as Venue[]
    },
    enabled: !!venue?.category_id,
  })

  useTitle(venue ? `${venue.name} — BronUz` : t('common.loading'))

  const copyAddress = () => {
    navigator.clipboard.writeText(venue!.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const featureItems = [
    { icon: Wifi, label: 'Wi-Fi', show: true },
    { icon: Car, label: t('venue.parking'), show: true },
    { icon: Tv, label: t('venue.projector'), show: true },
    { icon: Fan, label: t('venue.ac'), show: true },
  ]

  if (isLoading) return <VenueSkeleton />

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<MapPin className="w-10 h-10" />}
          title={t('venue.notFound')}
          description={t('venue.notFoundDesc')}
          action={{
            label: t('venue.backToSearch'),
            onClick: () => router.push('/search'),
          }}
        />
      </div>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: venue.name,
        description: venue.description || '',
        ...(venue.photos && venue.photos.length > 0 ? { image: venue.photos[0] } : {}),
        priceRange: `${(venue.price_per_slot || 0).toLocaleString()} UZS/soat`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: venue.city,
          addressCountry: 'UZ',
        },
        ...(venue.lat && venue.lng ? {
          geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng },
        } : {}),
        aggregateRating: (venue.review_count ?? 0) > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: venue.avg_rating,
          reviewCount: venue.review_count,
          bestRating: 5,
        } : undefined,
        url: `https://bronuz.uz/venues/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: 'https://bronuz.uz/' },
          ...(venue.categories
            ? [{ '@type': 'ListItem', position: 2, name: venue.categories.name_uz, item: `https://bronuz.uz/search?category=${venue.categories.slug}` }]
            : []),
          { '@type': 'ListItem', position: venue.categories ? 3 : 2, name: venue.name, item: `https://bronuz.uz/venues/${slug}` },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-tertiary mb-6">
        <Link href="/" className="hover:text-brand transition-colors">{t('common.home')}</Link>
        <span>/</span>
        {venue.categories && (
          <>
            <Link href={`/search?category=${venue.categories.slug}`} className="hover:text-brand transition-colors">
              {venue.categories.name_uz}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink font-medium truncate">{venue.name}</span>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery photos={venue.photos} name={venue.name} />

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Left - Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {venue.categories && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-brand-light text-brand-dark">
                  {venue.categories.icon} {venue.categories.name_uz}
                </span>
              )}
              {venue.max_group_size && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-surface-bg text-ink-secondary">
                  <Users className="w-3 h-3" />
                  {venue.max_group_size} kishigacha
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
                {venue.name}
              </h1>
              <FavoriteButton venueId={venue.id} className="bg-surface-bg border border-border hover:bg-surface-subtle shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              {(venue.review_count ?? 0) >= 1 && (
                <>
                  <div className="flex items-center gap-1">
                    {(venue.review_count ?? 0) >= 3 && (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    )}
                    <span className="font-semibold text-ink">
                      {(venue.review_count ?? 0) >= 3 ? venue.avg_rating?.toFixed(1) : '—'}
                    </span>
                    <span className="text-ink-tertiary">
                      ({(venue.review_count ?? 0)} {t('venue.reviews')})
                    </span>
                  </div>
                  <span className="text-ink-muted">•</span>
                </>
              )}
              <div className="flex items-center gap-1 text-ink-tertiary">
                <MapPin className="w-4 h-4" />
                {venue.city}{venue.district ? `, ${venue.district}` : ''}
              </div>
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">{t('venue.about')}</h2>
              <p className="text-base text-ink-secondary leading-relaxed whitespace-pre-line">
                {venue.description}
              </p>
            </div>
          )}

          {/* Features */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-4">{t('venue.features')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featureItems.map((f) => (
                <div key={f.label} className="flex items-center gap-3 p-3 rounded-card bg-surface-bg">
                  <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-ink-secondary">{f.label}</span>
                </div>
              ))}
              {venue.phone && (
                <a
                  href={`tel:${venue.phone}`}
                  className="flex items-center gap-3 p-3 rounded-card bg-surface-bg hover:bg-surface-subtle transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-ink-secondary">{venue.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">{t('common.address')}</h2>
            <div className="h-[280px] sm:h-[320px] rounded-card overflow-hidden mb-3">
              {venue.lat && venue.lng ? (
                <iframe
                  src={`https://maps.google.com/maps?q=${venue.lat},${venue.lng}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${venue.name} — ${t('venue.onMap')}`}
                />
              ) : (
                <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-ink-tertiary">
                  <div className="text-center p-4">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{venue.address}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm text-ink-secondary">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <span>{venue.address}</span>
              </p>
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
          </div>

          {/* Cancellation Policy */}
          {venue.cancellation_policy && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">{t('venue.cancellationPolicy')}</h2>
              <div className="flex items-start gap-3 p-4 rounded-card bg-surface-bg">
                <Shield className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {venue.cancellation_policy === 'flexible'
                      ? t('venue.flexible')
                      : venue.cancellation_policy === 'standard'
                      ? t('venue.standard')
                      : t('venue.strict')}
                  </p>
                  <p className="text-sm text-ink-secondary mt-0.5">
                    {venue.cancellation_policy === 'flexible'
                      ? t('venue.cancelFlexDesc')
                      : venue.cancellation_policy === 'standard'
                      ? t('venue.cancelStandardDesc')
                      : t('venue.cancelStrictDesc')}
                  </p>
                  {venue.min_notice_hours > 0 && (
                    <p className="text-xs text-ink-tertiary mt-1">
                      {t('venue.minNotice', { hours: venue.min_notice_hours })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-4">
              {t('venue.reviewsTitle')}
              {reviews.length > 0 && (
                <span className="text-base font-normal text-ink-tertiary ml-1">({reviews.length})</span>
              )}
            </h2>

            {reviews.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Star className="w-8 h-8 text-ink-muted" />
                <p className="text-sm text-ink-secondary">{t('venue.noReviews')}</p>
                <p className="text-xs text-ink-tertiary">{t('venue.beFirst')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-card bg-white border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand shrink-0">
                        {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink truncate">
                            {review.profiles?.full_name || t('venue.user')}
                          </p>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-border'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        <p className="text-xs text-ink-tertiary mt-2">
                          {new Date(review.created_at).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Booking Widget */}
        <div className="lg:col-span-1">
          <BookingWidget venue={venue} />
        </div>
      </div>

      {/* Similar Venues */}
      {similarVenues.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-ink">{t('venue.similarVenues')}</h2>
            <Link
              href={`/search?category=${venue.categories?.slug || ''}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarVenues.map((v) => {
              const simPrice = v.price_per_slot || 0
              return (
                <Link key={v.id} href={`/venues/${v.id}`} className="group block">
                  <Card className="p-0 overflow-hidden">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={v.photos?.[0] || PLACEHOLDER_IMAGE}
                        alt={`${v.name} — BronUz'da bron qilish`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {v.categories && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-ink-secondary backdrop-blur-sm">
                          {v.categories.icon} {v.categories.name_uz}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-ink group-hover:text-brand transition-colors truncate">
                        {v.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-tertiary">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{v.city}{v.district ? `, ${v.district}` : ''}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-ink">
                          {simPrice.toLocaleString()} UZS
                        </span>
                        {(v.review_count ?? 0) >= 1 && (
                          <div className="flex items-center gap-1 text-xs font-medium text-ink-secondary">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>
                              {(v.review_count ?? 0) >= 3 ? v.avg_rating?.toFixed(1) : '—'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
