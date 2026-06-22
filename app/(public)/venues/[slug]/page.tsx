import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { MapPin, Star, Phone, Users, Shield, Wifi, Car, Tv, Fan } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import { createServerT } from '@/lib/i18n/server'
import { VenueDetailClient } from '@/features/venues/components/VenueDetailClient'
import { BookingWidget } from '@/features/venues/components/BookingWidget'
import type { Venue, Review } from '@/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bronuz.uz'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)
  const supabase = await createSupabaseServerClient()
  const { data: venue } = await supabase
    .from('venues')
    .select('name, description, photos')
    .eq('id', slug)
    .single()

  if (!venue) {
    return { title: `${t('venue.notFound')} — BronUz` }
  }

  return {
    title: `${venue.name} — BronUz`,
    description: venue.description?.slice(0, 200) || `${venue.name} — ${t('venue.about')}`,
    openGraph: {
      title: `${venue.name} — BronUz`,
      description: `${venue.name} — ${t('venue.about')}`,
      url: `${siteUrl}/venues/${slug}`,
      images: venue.photos?.[0] ? [{ url: venue.photos[0], width: 1200, height: 630 }] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/venues/${slug}`,
    },
  }
}

export default async function VenueDetailPage({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)
  const supabase = await createSupabaseServerClient()

  const [venueResult, reviewsResult, similarResult] = await Promise.all([
    supabase.from('venues').select('*, categories(*)').eq('id', slug).single(),
    supabase.from('reviews').select('*, profiles(*)').eq('venue_id', slug).order('created_at', { ascending: false }).limit(10),
    (async () => {
      const venueData = await supabase.from('venues').select('category_id').eq('id', slug).single()
      const categoryId = venueData.data?.category_id
      if (!categoryId) return { data: [] }
      return supabase.from('venues').select('*, categories(*)').eq('category_id', categoryId).eq('status', 'active').neq('id', slug).limit(4)
    })(),
  ])

  const venue = venueResult.data as Venue | null
  const reviews = (reviewsResult.data || []) as Review[]
  const similarVenues = (similarResult as { data: Venue[] | null })?.data || []

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <MapPin className="w-10 h-10 mx-auto text-ink-muted mb-4" />
        <h1 className="text-xl font-display font-semibold text-ink">{t('venue.notFound')}</h1>
        <p className="text-sm text-ink-tertiary mt-2">{t('venue.notFoundDesc')}</p>
        <Link href={ROUTES.SEARCH} className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
          {t('venue.backToSearch')}
        </Link>
      </div>
    )
  }

  const featureItems = [
    { icon: Wifi, label: t('venue.wifi'), show: true },
    { icon: Car, label: t('venue.parking'), show: true },
    { icon: Tv, label: t('venue.projector'), show: true },
    { icon: Fan, label: t('venue.ac'), show: true },
  ]

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
        url: `${siteUrl}/venues/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('common.home'), item: siteUrl },
          ...(venue.categories
            ? [{ '@type': 'ListItem', position: 2, name: venue.categories.name_uz, item: `${siteUrl}/search?category=${venue.categories.slug}` }]
            : []),
          { '@type': 'ListItem', position: venue.categories ? 3 : 2, name: venue.name, item: `${siteUrl}/venues/${slug}` },
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

        {/* Photo Gallery (client) */}
        <VenueDetailClient venue={venue} />

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
                    {t('venue.minNotice', { hours: venue.max_group_size })}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">{venue.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                {(venue.review_count ?? 0) >= 1 && (
                  <>
                    {(venue.review_count ?? 0) >= 3 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-ink">{venue.avg_rating?.toFixed(1)}</span>
                      </div>
                    )}
                    <span className="text-ink-tertiary">({t('venue.reviews', { count: venue.review_count ?? 0 })})</span>
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
              <div className="relative pt-8">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
                <h2 className="font-display text-xl font-semibold text-ink mb-3">{t('venue.about')}</h2>
                <p className="text-base text-ink-secondary leading-relaxed whitespace-pre-line">{venue.description}</p>
              </div>
            )}

            {/* Features */}
            <div className="relative pt-8">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
              <h2 className="font-display text-xl font-semibold text-ink mb-4">{t('venue.features')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {featureItems.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 p-3 rounded-card bg-surface-bg transition-all duration-normal hover:shadow-card hover:-translate-y-0.5 hover:bg-surface-subtle">
                    <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0 transition-transform duration-normal group-hover:scale-110">
                      <f.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-ink-secondary">{f.label}</span>
                  </div>
                ))}
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="flex items-center gap-3 p-3 rounded-card bg-surface-bg hover:bg-surface-subtle transition-all duration-normal hover:shadow-card hover:-translate-y-0.5">
                    <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-ink-secondary">{venue.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="relative pt-8">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
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
              <p className="flex items-center gap-2 text-sm text-ink-secondary">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <span>{venue.address}</span>
              </p>
            </div>

            {/* Cancellation Policy */}
            {venue.cancellation_policy && (
              <div className="relative pt-8">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
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
            <div className="relative pt-8">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
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
                <>
                  {/* Review Stats Summary */}
                  {reviews.length >= 3 && (() => {
                    const total = reviews.reduce((s, r) => s + (r.rating ?? 0), 0)
                    const avg = total / reviews.length
                    const dist = [0, 0, 0, 0, 0]
                    reviews.forEach((r) => { const rate = r.rating ?? 0; if (rate >= 1 && rate <= 5) dist[5 - rate] = (dist[5 - rate] || 0) + 1 })
                    return (
                      <div className="p-5 rounded-card bg-surface-bg border border-border mb-6">
                        <div className="flex items-start gap-6 sm:gap-10">
                          <div className="text-center shrink-0">
                            <p className="text-4xl font-bold text-ink">{avg.toFixed(1)}</p>
                            <div className="flex items-center gap-0.5 mt-1 justify-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                              ))}
                            </div>
                            <p className="text-xs text-ink-tertiary mt-1">{t('venue.reviews', { count: reviews.length })}</p>
                          </div>
                          <div className="flex-1 space-y-1.5 min-w-0">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = dist[5 - star] ?? 0
                              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                              return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                  <span className="w-3 text-ink-secondary font-medium shrink-0">{star}</span>
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                                  <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                                    <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="w-6 text-right text-ink-tertiary shrink-0">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const isVerified = !!review.profiles?.full_name
                      return (
                        <div key={review.id} className="p-4 rounded-card bg-white border border-border transition-all duration-normal hover:shadow-card hover:-translate-y-0.5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand shrink-0">
                              {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-sm font-semibold text-ink truncate">
                                    {review.profiles?.full_name || t('venue.user')}
                                  </p>
                                  {isVerified && (
                                    <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {t('common.verified')}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">{review.comment}</p>
                              )}
                              <p className="text-xs text-ink-tertiary mt-2">
                                {new Date(review.created_at).toLocaleDateString('uz-UZ', {
                                  day: 'numeric', month: 'long', year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right - Booking Widget (client) */}
          <div id="booking-widget" className="lg:col-span-1">
            <BookingWidget venue={venue} />
          </div>
        </div>

        {/* Similar Venues */}
        {similarVenues.length > 0 && (
          <div className="mt-16 pt-10 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-ink">{t('venue.similarVenues')}</h2>
              <Link href={`/search?category=${venue.categories?.slug || ''}`} className="text-sm font-medium text-brand hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarVenues.map((v: Venue) => {
                const simShowPrice = (v.price_per_slot ?? 0) > 0
                return (
                  <Link key={v.id} href={`/venues/${v.id}`} className="group block">
                    <Card className="p-0 overflow-hidden">
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={v.photos?.[0] || PLACEHOLDER_IMAGE}
                          alt={`${v.name} — ${t('venue.about')}`}
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
                        <h3 className="font-semibold text-ink group-hover:text-brand transition-colors truncate">{v.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-tertiary">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{v.city}{v.district ? `, ${v.district}` : ''}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-bold text-ink">
                            {simShowPrice ? `${(v.price_per_slot).toLocaleString()} UZS` : t('common.negotiablePrice')}
                          </span>
                          {(v.review_count ?? 0) >= 1 && (
                            <div className="flex items-center gap-1 text-xs font-medium text-ink-secondary">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{(v.review_count ?? 0) >= 3 ? v.avg_rating?.toFixed(1) : '—'}</span>
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
