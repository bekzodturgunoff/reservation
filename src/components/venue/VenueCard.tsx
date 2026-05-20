import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPinIcon, StarIcon, TagIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'
import type { Venue, VenueService } from '../../types'
import { formatPrice } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { isFavorited, addFavorite, removeFavorite } from '../../api/favorites'
import { getVenueSocialProof } from '../../api/venues'
import { useToastStore } from '../../store/toastStore'
import { queryKeys } from '../../lib/queryKeys'
import Badge from '../ui/Badge'
import Card from '../ui/Card'

interface VenueCardProps {
  venue: Venue
}

const unitLabel = (unit: string, t: (key: string) => string): string => {
  const map: Record<string, string> = {
    per_hour: t('venue.perHour'),
    per_session: '/ ' + t('common.perSession'),
    per_day: '/ ' + t('common.perDay'),
    per_month: '/ ' + t('common.perMonth'),
    per_person: '/ ' + t('common.perPerson'),
    fixed: '',
  }
  return map[unit] || ''
}

const VenueCard = ({ venue }: VenueCardProps) => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { addToast } = useToastStore()
  const photo = venue.photos?.[0] || null
  const rating = venue.avg_rating ?? null
  const reviewCount = venue.review_count ?? 0
  const [fav, setFav] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)

  const services: VenueService[] = venue.services || []
  const unit = venue.pricing_unit || 'per_hour'
  const showServices = unit !== 'per_hour' && services.length > 0
  const categoryName = venue.categories?.name_uz || t('common.other')

  const { data: favorited } = useQuery({
    queryKey: ['favorited', user?.id, venue.id],
    queryFn: () => isFavorited(user!.id, venue.id),
    enabled: !!user,
  })

  const { data: socialProof } = useQuery({
    queryKey: queryKeys.venues.socialProof(venue.id),
    queryFn: () => getVenueSocialProof(venue.id),
    staleTime: 120_000,
  })

  useEffect(() => { if (favorited !== undefined) setFav(favorited) }, [favorited])

  useEffect(() => {
    if (!socialProof?.recentReviews?.length) return
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % socialProof.recentReviews.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [socialProof])

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { addToast({ type: 'info', message: t('auth.loginTitle') }); return }
    const wasFav = fav
    setFav(!fav)
    try {
      if (wasFav) { await removeFavorite(user.id, venue.id) }
      else { await addFavorite(user.id, venue.id) }
    } catch {
      setFav(wasFav)
      addToast({ type: 'error', message: t('common.error') })
    }
  }

  return (
    <Link to={`/venues/${venue.id}`} className="group block">
      <Card padding="none" hover>
        <div className="relative h-48 overflow-hidden rounded-t-[14px]">
          {photo ? (
            <img
              src={photo}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--color-brand-light)' }}
            >
              <span className="text-5xl">{venue.categories?.icon || '🏢'}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="shadow-sm">
              {venue.categories?.icon} {categoryName}
            </Badge>
          </div>
          <button
            onClick={toggleFav}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {fav ? (
              <HeartIconSolid className="w-4 h-4" style={{ color: '#FF4D4D' }} />
            ) : (
              <HeartIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
            )}
          </button>
        </div>

        <div className="p-5">
          <h3
            className="font-semibold text-base leading-snug mb-1 line-clamp-1 transition-colors duration-200 group-hover:text-[var(--color-brand)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {venue.name}
          </h3>
          <div
            className="flex items-center gap-1 text-sm mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{venue.address || venue.city}</span>
          </div>

          {showServices ? (
            <div className="space-y-1.5 mb-2">
              {services.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="truncate mr-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {s.name}
                  </span>
                  <span className="font-semibold shrink-0" style={{ color: 'var(--color-brand)' }}>
                    {formatPrice(s.price)}
                    {s.unit !== 'fixed' && (
                      <span className="text-xs font-normal" style={{ color: 'var(--color-text-tertiary)' }}>
                        {unitLabel(s.unit, t)}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              {services.length > 3 && (
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  +{services.length - 3} more
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {rating !== null ? (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      ({reviewCount})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('venue.noRating')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1" style={{ color: 'var(--color-brand)' }}>
                <TagIcon className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">
                  {formatPrice(venue.price_per_slot, venue.currency)}
                </span>
                {unit !== 'fixed' && (
                  <span className="text-xs font-normal" style={{ color: 'var(--color-text-tertiary)' }}>
                    {unitLabel(unit, t)}
                  </span>
                )}
              </div>
            </div>
          )}

          {socialProof && (
            <div
              className="mt-3 pt-3 space-y-1.5"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              {socialProof.recommendationPercent > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">👍</span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--color-border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${socialProof.recommendationPercent}%`,
                        background: 'var(--color-brand)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {socialProof.recommendationPercent}%
                  </span>
                </div>
              )}
              {socialProof.recentReviews.length > 0 && (
                <div
                  className="flex items-center gap-1.5 text-xs overflow-hidden"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <span>🗣️</span>
                  <span className="truncate italic">
                    &ldquo;{socialProof.recentReviews[quoteIndex % socialProof.recentReviews.length]?.text?.slice(0, 60)}&rdquo;
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

export default VenueCard
