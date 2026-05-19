import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, Phone, Star, ChevronLeft, ChevronRight,
  Clock, Tag, ArrowLeft, CalendarDays, MessageSquare,
} from 'lucide-react'
import { getVenueById } from '../api/venues'
import { getReviewsByVenue } from '../api/reviews'
import { useAuthStore } from '../store/authStore'
import { useTitle } from '../hooks/useTitle'
import { formatPrice, formatDate as fmtDate } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SlotPicker from '../components/venue/SlotPicker'
import type { Slot } from '../types'

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id!),
    enabled: !!id,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviewsByVenue(id!),
    enabled: !!id,
  })

  useTitle(venue?.name || 'Joy haqida')

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-64 sm:h-80 bg-gray-200 rounded-2xl" />
        <div className="h-8 w-2/3 bg-gray-200 rounded-lg" />
        <div className="h-4 w-1/3 bg-gray-200 rounded-lg" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Joy topilmadi</h2>
        <p className="text-gray-500 mb-6">Bu venue mavjud emas yoki o'chirilgan</p>
        <Button onClick={() => navigate('/search')}>Qidirishga qaytish</Button>
      </div>
    )
  }

  const photos = venue.photos?.length ? venue.photos : []
  const categoryName = venue.categories?.name_uz || 'Boshqa'

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleBook = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/venues/${venue.id}` } } })
      return
    }
    if (selectedSlot) {
      navigate(`/booking/${venue.id}/${selectedSlot.id}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Photo gallery */}
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
                      onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === photoIndex ? 'bg-white' : 'bg-white/50'
                          }`}
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

          {/* Venue info */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="success" className="text-sm px-3 py-1">
                    {venue.categories?.icon} {categoryName}
                  </Badge>
                  <Badge variant={venue.status === 'active' ? 'success' : 'default'}>
                    {venue.status === 'active' ? 'Faol' : venue.status}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{venue.name}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-lg font-semibold text-emerald-600">
                <Tag className="w-5 h-5" />
                {formatPrice(venue.price_per_slot, venue.currency)}
                <span className="text-sm text-gray-400 font-normal">/soat</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-700 font-medium">{avgRating}</span>
                  <span>({reviews.length} ta izoh)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {venue.address || venue.city}
              </div>
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                  <Phone className="w-4 h-4" /> {venue.phone}
                </a>
              )}
            </div>

            {venue.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{venue.description}</p>
            )}
          </div>

          {/* Slot picker */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Vaqtni tanlang</h2>
            </div>
            <SlotPicker
              venueId={venue.id}
              selectedSlot={selectedSlot?.id || null}
              onSelect={setSelectedSlot}
            />
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Izohlar ({reviews.length})
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <span className="text-4xl">💬</span>
                <p className="text-gray-500 mt-2">Hali izohlar yo'q</p>
                <p className="text-sm text-gray-400">Birinchi bo'lib fikr bildiring</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                          {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {review.profiles?.full_name || 'Foydalanuvchi'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {fmtDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Bron qilish</h3>
            <p className="text-sm text-gray-500 mb-4">{venue.name}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {venue.city}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-emerald-600">{formatPrice(venue.price_per_slot, venue.currency)}</span>
                <span className="text-gray-400">/ soat</span>
              </div>
              {selectedSlot && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {selectedSlot.start_time.slice(0, 5)} — {selectedSlot.end_time.slice(0, 5)}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 my-4 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Jami:</span>
                <span className="text-xl font-bold text-gray-900">
                  {selectedSlot ? formatPrice(venue.price_per_slot, venue.currency) : '—'}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedSlot}
                onClick={handleBook}
              >
                {user ? (selectedSlot ? 'Bron qilish' : 'Vaqt tanlang') : 'Kirish kerak'}
              </Button>

              {!user && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Bron qilish uchun avval kiring
                </p>
              )}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-700 text-center">
                💳 To'lov tizimi keyinroq qo'shiladi. Hozirda joyida to'lash mumkin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueDetail
