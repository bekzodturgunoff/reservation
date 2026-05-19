import type { Venue } from '../../types'
import VenueCard from './VenueCard'
import { VenueCardSkeleton } from '../ui/Skeleton'

interface VenueGridProps {
  venues: Venue[]
  loading?: boolean
  emptyMessage?: string
}

const VenueGrid = ({ venues, loading, emptyMessage = 'Hech narsa topilmadi' }: VenueGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <VenueCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-gray-500 text-base">{emptyMessage}</p>
        <p className="text-gray-400 text-sm mt-1">Boshqa kategoriya yoki shaharni sinab ko'ring</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {venues.map(venue => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  )
}

export default VenueGrid
