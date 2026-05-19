import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDaysIcon, ClockIcon, MapPinIcon, TagIcon, CheckCircleIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline'
import { getBookingById } from '../api/bookings'
import { useTitle } from '../hooks/useTitle'
import { formatPrice, formatDate } from '../lib/utils'
import Button from '../components/ui/Button'
import { useTranslation } from 'react-i18next'

const Confirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { t } = useTranslation()
  useTitle(t('confirmation.title'))

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  })

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse space-y-6 py-12">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
        <div className="h-8 w-1/2 bg-gray-200 rounded-lg mx-auto" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('confirmation.notFound')}</h2>
        <p className="text-gray-500 mb-6">{t('confirmation.notFoundDesc')}</p>
        <Link to="/"><Button>{t('confirmation.backHome')}</Button></Link>
      </div>
    )
  }

  const venue = booking.venues
  const slot = booking.slots

  return (
    <div className="max-w-lg mx-auto text-center py-8">

      {/* Success animation */}
      <div className="mb-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('confirmation.successTitle')}</h1>
      <p className="text-gray-500 text-sm mb-8">
        {t('confirmation.bookingNumber')} <span className="font-mono text-gray-700 font-medium">{booking.id.slice(0, 8)}</span>
      </p>

      {/* Booking details card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-left mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t('confirmation.details')}</h3>

        {venue && (
          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
              🏢
            </div>
            <div>
              <p className="font-medium text-gray-900">{venue.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPinIcon className="w-3 h-3" /> {venue.address}
              </p>
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="text-sm text-emerald-600 hover:underline mt-0.5 block">
                  {venue.phone}
                </a>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2.5 text-sm">
          {slot && (
            <>
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{formatDate(slot.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{slot.start_time?.slice(0, 5)} — {slot.end_time?.slice(0, 5)}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-3">
            <TagIcon className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-emerald-600">{formatPrice(booking.total_price)}</span>
          </div>
          {booking.note && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{t('confirmation.note')}</p>
              <p className="text-gray-600">{booking.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Telegram reminder */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6 text-left">
        <p className="text-sm text-blue-800">
          {t('confirmation.telegramNote')}
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <Link to="/profile?tab=bookings">
          <Button variant="secondary" className="w-full">
            <UserIcon className="w-4 h-4" /> {t('confirmation.myBookings')}
          </Button>
        </Link>
        <Link to="/">
          <Button className="w-full">
            <HomeIcon className="w-4 h-4" /> {t('confirmation.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Confirmation
