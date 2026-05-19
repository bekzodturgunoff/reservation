import type { Venue } from '../../types'

interface VenueMapProps {
  venues: Venue[]
}

const VenueMap = ({ venues }: VenueMapProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 h-[500px] flex items-center justify-center text-gray-400">
      <p className="text-sm">Map view (Leaflet will be integrated here)</p>
    </div>
  )
}

export default VenueMap
