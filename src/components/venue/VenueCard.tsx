import { Link } from 'react-router-dom'
import { MapPin, Star, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Venue } from '../../types'
import { formatPrice } from '../../lib/utils'
import Badge from '../ui/Badge'

interface VenueCardProps {
  venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
  const { t } = useTranslation()
  const categoryName = venue.categories?.name_uz || t('common.other')
  const photo = venue.photos?.[0] || null
  const rating = venue.avg_rating ?? null
  const reviewCount = venue.review_count ?? 0

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
              <span className="text-5xl">
                {venue.categories?.icon || '🏢'}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="bg-white/90 text-emerald-700 backdrop-blur-sm shadow-sm">
              {venue.categories?.icon} {categoryName}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{venue.address || venue.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {rating !== null ? (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({reviewCount})</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">{t('venue.noRating')}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">
                {formatPrice(venue.price_per_slot, venue.currency)}
              </span>
              <span className="text-xs text-gray-400">{t('venue.perHour')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default VenueCard
