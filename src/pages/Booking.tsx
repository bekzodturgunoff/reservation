import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDaysIcon, ClockIcon, MapPinIcon, TagIcon, CreditCardIcon, ArrowLeftIcon, UsersIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { getVenueById, getVenueServices } from '../api/venues'
import { getSlotById, updateSlotAvailability } from '../api/slots'
import { getVenueStaff } from '../api/staff'
import { createBooking } from '../api/bookings'
import { validatePromoCode, incrementPromoUsage } from '../api/promoCodes'
import { checkRedeemable, getMyPoints } from '../api/loyalty'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import { formatPrice, formatDate } from '../lib/utils'
import { sendTelegramNotification } from '../api/telegram'
import Button from '../components/ui/Button'
import { useTranslation } from 'react-i18next'
import type { RecurringPattern } from '../types'

const Booking = () => {
  const { venueId, slotId } = useParams<{ venueId: string; slotId: string }>()
  const [searchParams] = useSearchParams()
  const serviceId = searchParams.get('serviceId')
  const staffIdParam = searchParams.get('staffId')
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)

  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const [selectedStaff, setSelectedStaff] = useState<string | null>(staffIdParam || null)
  const [groupSize, setGroupSize] = useState(1)
  const [enableRecurring, setEnableRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState<RecurringPattern['frequency']>('weekly')
  const [recurringOccurrences, setRecurringOccurrences] = useState(4)

  const [redeemPoints, setRedeemPoints] = useState(0)
  const [redeemDiscount, setRedeemDiscount] = useState(0)

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

  const { data: services = [] } = useQuery({
    queryKey: ['venue-services', venueId],
    queryFn: () => getVenueServices(venueId!),
    enabled: !!venueId && !!serviceId,
  })

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', venueId],
    queryFn: () => getVenueStaff(venueId!),
    enabled: !!venueId,
  })

  const { data: loyaltyPoints } = useQuery({
    queryKey: ['loyalty', 'points', user?.id],
    queryFn: () => getMyPoints(),
    enabled: !!user,
  })

  const totalLoyaltyPoints = (loyaltyPoints ?? []).reduce((sum, p) => sum + p.balance, 0)
  const { canRedeem, value: maxRedeemValue } = checkRedeemable(totalLoyaltyPoints)

  const selectedService = services.find(s => s.id === serviceId) || null
  const basePrice = selectedService ? selectedService.price : (venue?.price_per_slot || 0)
  const effectivePrice = basePrice - promoDiscount - redeemDiscount

  const loading = venueLoading || slotLoading

  const handleValidatePromo = async () => {
    if (!promoCode.trim() || !venueId) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const result = await validatePromoCode(promoCode.trim(), venueId, basePrice)
      if (result.valid) {
        setPromoDiscount(result.discount)
        setPromoCodeId(result.promoCode.id)
        addToast({ type: 'success', message: `Promo code applied! Discount: ${formatPrice(result.discount)}` })
      } else {
        setPromoError('Invalid or expired promo code')
        setPromoDiscount(0)
        setPromoCodeId(null)
      }
    } catch {
      setPromoError('Failed to validate promo code')
    }
    setPromoLoading(false)
  }

  const handleRedeemPoints = () => {
    if (!canRedeem) return
    setRedeemPoints(totalLoyaltyPoints)
    setRedeemDiscount(maxRedeemValue)
    addToast({ type: 'info', message: `Redeeming ${totalLoyaltyPoints} points for ${formatPrice(maxRedeemValue)} off` })
  }

  const handleConfirm = async () => {
    if (!user || !venue || !slot) return

    setConfirming(true)
    try {
      const recurringPattern = enableRecurring
        ? { frequency: recurringFreq, occurrences: recurringOccurrences }
        : null

      const booking = await createBooking({
        user_id: user.id,
        venue_id: venue.id,
        slot_id: slot.id,
        service_id: selectedService?.id || null,
        service_name: selectedService?.name || '',
        service_price: selectedService?.price || 0,
        total_price: effectivePrice,
        promo_code_id: promoCodeId,
        staff_id: selectedStaff,
        group_size: groupSize,
        recurring_pattern: recurringPattern as unknown as RecurringPattern,
        note: note || null,
        status: 'confirmed',
      })

      await updateSlotAvailability(slot.id, false)

      if (promoCodeId) {
        await incrementPromoUsage(promoCodeId).catch(() => {})
      }

      queryClient.setQueryData(
        ['slots', venue.id, slot.date],
        (old: any[] = []) =>
          old.map((s: any) => s.id === slot.id ? { ...s, is_available: false } : s)
      )

      sendTelegramNotification({
        venue_id: venue.id,
        venue_name: venue.name,
        customer_name: profile?.full_name || user.user_metadata?.full_name || user.email || 'Mijoz',
        customer_email: user.email || undefined,
        customer_phone: profile?.phone || user.phone || undefined,
        service_name: selectedService?.name || undefined,
        date: slot.date,
        start_time: slot.start_time.slice(0, 5),
        end_time: slot.end_time.slice(0, 5),
        note: note || undefined,
        booking_id: booking.id,
      })

      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })

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
            {selectedService && (
              <div className="flex items-center gap-3 text-sm">
                <TagIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {t('booking.selectedService')} <strong>{selectedService.name}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <TagIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-emerald-600">{formatPrice(basePrice)}</span>
              {venue.pricing_unit !== 'fixed' && (
                <span className="text-gray-400">
                  {t(`common.pricing_units.${venue.pricing_unit}`)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Group size */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Party Size</h3>
          </div>
          <select
            value={groupSize}
            onChange={e => setGroupSize(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {Array.from({ length: venue.max_group_size || 20 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>

        {/* Staff selection */}
        {staff.filter(s => s.is_active).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Choose Staff (optional)</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedStaff(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors border ${
                  selectedStaff === null
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">🤖</div>
                <span>No preference</span>
              </button>
              {staff.filter(s => s.is_active).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors border ${
                    selectedStaff === s.id
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{s.name}</p>
                    {s.title && <p className="text-xs text-gray-400">{s.title}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Promo code */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
              placeholder="Enter promo code"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button
              variant="secondary"
              onClick={handleValidatePromo}
              loading={promoLoading}
              disabled={!promoCode.trim()}
            >
              Apply
            </Button>
          </div>
          {promoError && <p className="text-xs text-red-500 mt-1.5">{promoError}</p>}
          {promoDiscount > 0 && (
            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
              Discount applied: -{formatPrice(promoDiscount)}
            </p>
          )}
        </div>

        {/* Loyalty points redeem */}
        {canRedeem && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Loyalty Points</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  🪙 {totalLoyaltyPoints} points available
                </p>
                {redeemPoints > 0 ? (
                  <p className="text-xs text-emerald-600 mt-1">
                    Redeeming for {formatPrice(redeemDiscount)} off
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    Redeem {totalLoyaltyPoints} pts for {formatPrice(maxRedeemValue)} off
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRedeemPoints}
                disabled={redeemPoints > 0}
              >
                {redeemPoints > 0 ? 'Applied' : 'Redeem'}
              </Button>
            </div>
          </div>
        )}

        {/* Recurring booking */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-semibold text-gray-900">Repeat Booking</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableRecurring}
                onChange={e => setEnableRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          {enableRecurring && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                <select
                  value={recurringFreq}
                  onChange={e => setRecurringFreq(e.target.value as RecurringPattern['frequency'])}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Occurrences</label>
                <select
                  value={recurringOccurrences}
                  onChange={e => setRecurringOccurrences(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'time' : 'times'}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Base price</span>
              <span className="text-gray-700">{formatPrice(basePrice)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Promo discount</span>
                <span className="text-green-600">-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            {redeemDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Points discount</span>
                <span className="text-green-600">-{formatPrice(redeemDiscount)}</span>
              </div>
            )}
            {groupSize > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Party size</span>
                <span className="text-gray-700">×{groupSize}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
              <span className="text-gray-600">{t('booking.total')}</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatPrice(effectivePrice)}</p>
                {venue.pricing_unit !== 'fixed' && (
                  <p className="text-xs text-gray-400">
                    {t('common.pricing_units.' + venue.pricing_unit)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {enableRecurring && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
              <p className="text-xs text-blue-700">
                This booking will repeat {recurringFreq} for {recurringOccurrences} occurrences.
              </p>
            </div>
          )}

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
