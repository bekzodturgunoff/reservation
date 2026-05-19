import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import type { Venue } from '../../types'
import Badge from '../ui/Badge'

interface VenueCardProps {
  venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
  const photo = venue.photos?.[0]

  return (
    <Link to={`/venues/${venue.id}`} className="group block">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-[4/3] bg-gray-100">
          {photo ? (
            <img src={photo} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            {venue.categories && (
              <Badge>{venue.categories.icon} {venue.categories.name_uz}</Badge>
            )}
            {venue.avg_rating && (
              <span className="flex items-center gap-1 text-sm text-yellow-500">
                <Star className="w-3.5 h-3.5 fill-current" /> {venue.avg_rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5" /> {venue.city}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600">
              {venue.price_per_slot.toLocaleString()} {venue.currency}
            </span>
            <span className="text-xs font-medium text-blue-600 group-hover:underline">Book Now</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default VenueCard
