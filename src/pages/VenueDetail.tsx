import { ArrowLeftIcon, StarIcon, MapPinIcon, PhoneIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { useVenueDetail } from '../hooks/useVenueDetail'
import { useTitle } from '../hooks/useTitle'
import { formatPrice } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SlotPicker from '../components/venue/SlotPicker'
import VenueDetailHeader from './venue-detail/VenueDetailHeader'
import VenueDetailServices from './venue-detail/VenueDetailServices'
import VenueDetailReviews from './venue-detail/VenueDetailReviews'
import VenueDetailSidebar from './venue-detail/VenueDetailSidebar'

const VenueDetail = () => {
  const { t } = useTranslation()
  const {
    venue, reviews, staff, isLoading,
    selectedSlot, selectedService, selectedStaff,
    effectivePrice, effectiveUnit, services, user,
    setSelectedSlot, setSelectedService, setSelectedStaff, setPhotoIndex, photoIndex,
    handleBook,
  } = useVenueDetail()

  useTitle(venue?.name || t('venue.about'))

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('venue.notFound')}</h2>
        <p className="text-gray-500 mb-6">{t('venue.notFoundDesc')}</p>
        <Button onClick={() => window.history.back()}>{t('venue.backToSearch')}</Button>
      </div>
    )
  }

  const categoryName = venue.categories?.name_uz || t('common.other')
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <VenueDetailHeader venue={venue} photoIndex={photoIndex} onPhotoIndexChange={setPhotoIndex} />

          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="success" className="text-sm px-3 py-1">
                    {venue.categories?.icon} {categoryName}
                  </Badge>
                  <Badge variant={venue.status === 'active' ? 'success' : 'default'}>
                    {venue.status === 'active' ? t('common.active') : venue.status}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{venue.name}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-lg font-semibold text-emerald-600">
                <TagIcon className="w-5 h-5" />
                {formatPrice(effectivePrice)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {avgRating && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-700 font-medium">{avgRating}</span>
                  <span>({reviews.length} {t('venue.reviews')})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" /> {venue.address || venue.city}
              </div>
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                  <PhoneIcon className="w-4 h-4" /> {venue.phone}
                </a>
              )}
            </div>

            {venue.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{venue.description}</p>
            )}
          </div>

          <VenueDetailServices services={services} selectedService={selectedService} onSelect={setSelectedService} />

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('venue.selectTime')}</h2>
            </div>
            <SlotPicker venueId={venue.id} selectedSlot={selectedSlot?.id || null} onSelect={setSelectedSlot} />
          </div>

          <VenueDetailReviews reviews={reviews} venueId={venue.id} hasUser={!!user} />
        </div>

        <div className="lg:col-span-1">
          <VenueDetailSidebar
            venue={venue}
            effectivePrice={effectivePrice}
            effectiveUnit={effectiveUnit}
            selectedService={selectedService}
            selectedSlot={selectedSlot}
            selectedStaff={selectedStaff}
            staff={staff}
            user={user}
            onBook={handleBook}
            onStaffSelect={setSelectedStaff}
          />
        </div>
      </div>
    </div>
  )
}

export default VenueDetail
