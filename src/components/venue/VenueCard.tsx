import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, StarIcon, TagIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import type { Venue, VenueService } from '../../types'
import { formatPrice } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { isFavorited, addFavorite, removeFavorite } from '../../api/favorites'
import { useToastStore } from '../../store/toastStore'
import Badge from '../ui/Badge'

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
  const categoryName = venue.categories?.name_uz || t('common.other')
  const photo = venue.photos?.[0] || null
  const rating = venue.avg_rating ?? null
  const reviewCount = venue.review_count ?? 0
  const [fav, setFav] = useState(false)

  const services: VenueService[] = venue.services || []
  const unit = venue.pricing_unit || 'per_hour'
  const showServices = unit !== 'per_hour' && services.length > 0

  const { data: favorited } = useQuery({
    queryKey: ['favorited', user?.id, venue.id],
    queryFn: () => isFavorited(user!.id, venue.id),
    enabled: !!user,
  })

  useEffect(() => { if (favorited !== undefined) setFav(favorited) }, [favorited])

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { addToast({ type: 'info', message: t('auth.loginTitle') }); return }
    try {
      if (fav) { await removeFavorite(user.id, venue.id); setFav(false) }
      else { await addFavorite(user.id, venue.id); setFav(true) }
    } catch { addToast({ type: 'error', message: t('common.error') }) }
  }

  return (
    <Link to={`/venues/${venue.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
              <span className="text-5xl">{venue.categories?.icon || '🏢'}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="bg-white/90 text-emerald-700 backdrop-blur-sm shadow-sm">
              {venue.categories?.icon} {categoryName}
            </Badge>
          </div>
          <button onClick={toggleFav} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            {fav ? <HeartIconSolid className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4 text-gray-400" />}
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{venue.address || venue.city}</span>
          </div>

          {showServices ? (
            <div className="space-y-1.5 mb-2">
              {services.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{s.name}</span>
                  <span className="font-semibold text-emerald-600 shrink-0">
                    {formatPrice(s.price)}{s.unit !== 'fixed' && <span className="text-xs text-gray-400 font-normal">{unitLabel(s.unit, t)}</span>}
                  </span>
                </div>
              ))}
              {services.length > 3 && (
                <p className="text-xs text-gray-400">+{services.length - 3} more</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {rating !== null ? (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({reviewCount})</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">{t('venue.noRating')}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <TagIcon className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">{formatPrice(venue.price_per_slot, venue.currency)}</span>
                {unit !== 'fixed' && <span className="text-xs text-gray-400">{unitLabel(unit, t)}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default VenueCard