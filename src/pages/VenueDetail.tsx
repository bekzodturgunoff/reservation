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
        <div className="h-64 sm:h-80 rounded-2xl" style={{background: 'var(--color-surface)'}} />
        <div className="h-8 w-2/3 rounded-lg" style={{background: 'var(--color-surface)'}} />
        <div className="h-4 w-1/3 rounded-lg" style={{background: 'var(--color-surface)'}} />
        <div className="h-24 rounded-xl" style={{background: 'var(--color-surface)'}} />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>{t('venue.notFound')}</h2>
        <p className="mb-6" style={{color: 'var(--color-text-secondary)'}}>{t('venue.notFoundDesc')}</p>
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
      <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm mb-4 transition-colors" style={{color: 'var(--color-text-secondary)'}}>
        <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
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
                <h1 className="text-2xl sm:text-3xl font-bold" style={{color: 'var(--color-text-primary)'}}>{venue.name}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-lg font-semibold" style={{color: 'var(--color-brand)'}}>
                <TagIcon className="w-5 h-5" />
                {formatPrice(effectivePrice)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm" style={{color: 'var(--color-text-secondary)'}}>
              {avgRating && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium" style={{color: 'var(--color-text-primary)'}}>{avgRating}</span>
                  <span>({reviews.length} {t('venue.reviews')})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" /> {venue.address || venue.city}
              </div>
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="flex items-center gap-1" style={{color: 'var(--color-text-secondary)'}}>
                  <PhoneIcon className="w-4 h-4" /> {venue.phone}
                </a>
              )}
            </div>

            {venue.description && (
              <p className="mt-4 leading-relaxed" style={{color: 'var(--color-text-secondary)'}}>{venue.description}</p>
            )}
          </div>

          <VenueDetailServices services={services} selectedService={selectedService} onSelect={setSelectedService} />

          <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDaysIcon className="w-5 h-5" style={{color: 'var(--color-brand)'}} />
              <h2 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>{t('venue.selectTime')}</h2>
            </div>
            <SlotPicker venueId={venue.id} selectedSlot={selectedSlot?.id || null} onSelect={setSelectedSlot} />
          </div>

          <VenueDetailReviews reviews={reviews} venueId={venue.id} hasUser={!!user} />
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
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
