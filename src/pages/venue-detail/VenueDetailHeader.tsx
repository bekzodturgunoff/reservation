import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Venue } from '../../types'

interface Props {
  venue: Venue
  photoIndex: number
  onPhotoIndexChange: (i: number) => void
}

const VenueDetailHeader = ({ venue, photoIndex, onPhotoIndexChange }: Props) => {
  const photos = venue.photos?.length ? venue.photos : []

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100">
      {photos.length > 0 ? (
        <>
          <img
            src={photos[photoIndex]}
            alt={`${venue.name} ${photoIndex + 1}`}
            className="w-full h-64 sm:h-80 object-cover"
          />
          {photos.length > 1 && (
            <>
              <button
                onClick={() => onPhotoIndexChange((photoIndex - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onPhotoIndexChange((photoIndex + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onPhotoIndexChange(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="h-64 sm:h-80 flex items-center justify-center text-6xl bg-gradient-to-br from-emerald-50 to-emerald-100">
          {venue.categories?.icon || '🏢'}
        </div>
      )}
    </div>
  )
}

export default VenueDetailHeader
