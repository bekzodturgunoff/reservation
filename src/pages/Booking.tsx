import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDaysIcon, ClockIcon, MapPinIcon, TagIcon, CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getVenueById } from '../api/venues'
import { getSlotById, updateSlotAvailability } from '../api/slots'
import { createBooking } from '../api/bookings'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import { formatPrice, formatDate } from '../lib/utils'
import { sendTelegramNotification } from '../api/telegram'
import Button from '../components/ui/Button'
import { useTranslation } from 'react-i18next'

const Booking = () => {
  const { venueId, slotId } = useParams<{ venueId: string; slotId: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)

  useTitle(t('booking.title'))

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: () => getVenueById(venueId!),
    enabled: !!venueId,
  })

  const { data: slot, isLoading: slotLoading } = useQuery({
    queryKey: ['slot', slotId],
    queryFn: () => getSlotById(slotId!),
    enabled: !!slotId,
  })

  const loading = venueLoading || slotLoading

  const handleConfirm = async () => {
    if (!user || !venue || !slot) return

    setConfirming(true)
    try {
      const booking = await createBooking({
        user_id: user.id,
        venue_id: venue.id,
        slot_id: slot.id,
        total_price: venue.price_per_slot,
        note: note || null,
        status: 'confirmed',
      })

      await updateSlotAvailability(slot.id, false)

      sendTelegramNotification({
        venue_id: venue.id,
        venue_name: venue.name,
        customer_name: profile?.full_name || user.user_metadata?.full_name || user.email || 'Mijoz',
        customer_phone: profile?.phone || user.phone || undefined,
        date: slot.date,
        start_time: slot.start_time.slice(0, 5),
        end_time: slot.end_time.slice(0, 5),
        note: note || undefined,
        booking_id: booking.id,
      })

      addToast({ type: 'success', message: t('booking.success') })
      navigate(`/confirmation/${booking.id}`)
    } catch {
      addToast({ type: 'error', message: t('booking.error') })
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-6 py-8">
        <div className="h-8 w-1/2 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  if (!venue || !slot) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('booking.notFound')}</h2>
        <p className="text-gray-500 mb-6">{t('booking.notFoundDesc')}</p>
        <Button onClick={() => navigate('/')}>{t('booking.backHome')}</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('booking.confirmBooking')}</h1>

      <div className="space-y-6">

        {/* Venue info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
              {venue.categories?.icon || '🏢'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-lg">{venue.name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPinIcon className="w-3.5 h-3.5" /> {venue.address || venue.city}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  {venue.categories?.icon} {venue.categories?.name_uz || t('common.other')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">{t('booking.details')}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{formatDate(slot.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TagIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-emerald-600">{formatPrice(venue.price_per_slot, venue.currency)}</span>
            </div>
          </div>
        </div>

        {/* Note field */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label htmlFor="note" className="font-semibold text-gray-900 block mb-2">
            {t('booking.note')}
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t('booking.notePlaceholder')}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Payment section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCardIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">{t('booking.payment')}</h3>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 mb-4">
            <p className="text-xs text-yellow-800 leading-relaxed">
              {t('booking.paymentDesc')}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCardIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">{t('booking.payOnArrival')}</p>
                <p className="text-xs text-green-600">{t('booking.payOnArrivalDesc')}</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
          </div>
        </div>

        {/* Total + Confirm */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">{t('booking.total')}</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{formatPrice(venue.price_per_slot, venue.currency)}</p>
              <p className="text-xs text-gray-400">{t('booking.perHour')}</p>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            loading={confirming}
            onClick={handleConfirm}
          >
            {t('booking.confirmBooking')}
          </Button>

          <p className="text-xs text-gray-400 text-center mt-3">
            {t('booking.terms')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Booking
