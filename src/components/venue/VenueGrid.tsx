import type { Venue } from '../../types'
import VenueCard from './VenueCard'

interface VenueGridProps {
  venues: Venue[]
}

const VenueGrid = ({ venues }: VenueGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  )
}

export default VenueGrid
