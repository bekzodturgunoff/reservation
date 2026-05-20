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

      await updateSlotAvailability(slot.id, false)

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

      if (promoCodeId) {
        await incrementPromoUsage(promoCodeId).catch(() => {})
      }

      queryClient.setQueryData(
        ['slots', venue.id, slot.date],
        (old: any[] = []) =>
          old.map((s: any) => s.id === slot.id ? { ...s, is_available: false } : s)
      )

      const notified = await sendTelegramNotification({
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

      if (!notified) {
        addToast({ type: 'warning', message: t('booking.telegramFailed', "Telegram bildirishnoma yuborilmadi. Admin bilan bog'lanishingiz mumkin.") })
      }

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
        <div className="h-8 w-1/2 rounded-lg" style={{background: 'var(--color-surface)'}} />
        <div className="h-32 rounded-2xl" style={{background: 'var(--color-surface)'}} />
        <div className="h-24 rounded-2xl" style={{background: 'var(--color-surface)'}} />
      </div>
    )
  }

  if (!venue || !slot) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>{t('booking.notFound')}</h2>
        <p className="mb-6" style={{color: 'var(--color-text-secondary)'}}>{t('booking.notFoundDesc')}</p>
        <Button onClick={() => navigate('/')}>{t('booking.backHome')}</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{color: 'var(--color-text-secondary)'}}
      >
        <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold mb-6" style={{color: 'var(--color-text-primary)'}}>{t('booking.confirmBooking')}</h1>

      <div className="space-y-6">

        {/* Venue info */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background: 'var(--color-brand-light)'}}>
              {venue.categories?.icon || '🏢'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg" style={{color: 'var(--color-text-primary)'}}>{venue.name}</h2>
              <p className="text-sm flex items-center gap-1 mt-0.5" style={{color: 'var(--color-text-secondary)'}}>
                <MapPinIcon className="w-3.5 h-3.5" /> {venue.address || venue.city}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: 'var(--color-brand-light)', color: 'var(--color-brand)'}}>
                  {venue.categories?.icon} {venue.categories?.name_uz || t('common.other')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <h3 className="font-semibold mb-4" style={{color: 'var(--color-text-primary)'}}>{t('booking.details')}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDaysIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
              <span style={{color: 'var(--color-text-primary)'}}>{formatDate(slot.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ClockIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
              <span style={{color: 'var(--color-text-primary)'}}>
                {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
              </span>
            </div>
            {selectedService && (
              <div className="flex items-center gap-3 text-sm">
                <TagIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
                <span style={{color: 'var(--color-text-primary)'}}>
                  {t('booking.selectedService')} <strong>{selectedService.name}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <TagIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
              <span className="font-semibold" style={{color: 'var(--color-brand)'}}>{formatPrice(basePrice)}</span>
              {venue.pricing_unit !== 'fixed' && (
                <span style={{color: 'var(--color-text-tertiary)'}}>
                  {t(`common.pricing_units.${venue.pricing_unit}`)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Group size */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon className="w-5 h-5" style={{color: 'var(--color-brand)'}} />
            <h3 className="font-semibold" style={{color: 'var(--color-text-primary)'}}>Party Size</h3>
          </div>
          <select
            value={groupSize}
            onChange={e => setGroupSize(Number(e.target.value))}
            className="w-full border rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] input-field"
            style={{borderColor: 'var(--color-border)'}}
          >
            {Array.from({ length: venue.max_group_size || 20 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>

        {/* Staff selection */}
        {staff.filter(s => s.is_active).length > 0 && (
          <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <h3 className="font-semibold mb-3" style={{color: 'var(--color-text-primary)'}}>Choose Staff (optional)</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedStaff(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors border ${
                  selectedStaff === null
                    ? ''
                    : 'hover:border-gray-300'
                }`}
                style={
                  selectedStaff === null
                    ? {borderColor: 'var(--color-brand)', background: 'var(--color-brand-light)', color: 'var(--color-brand)'}
                    : {borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)'}
                }
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{background: 'var(--color-surface)'}}>🤖</div>
                <span>No preference</span>
              </button>
              {staff.filter(s => s.is_active).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors border ${
                    selectedStaff === s.id
                      ? ''
                      : 'hover:border-gray-300'
                  }`}
                  style={
                    selectedStaff === s.id
                      ? {borderColor: 'var(--color-brand)', background: 'var(--color-brand-light)', color: 'var(--color-brand)'}
                      : {borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)'}
                  }
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{background: 'var(--color-brand-light)', color: 'var(--color-brand)'}}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{s.name}</p>
                    {s.title && <p className="text-xs" style={{color: 'var(--color-text-tertiary)'}}>{s.title}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Promo code */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <h3 className="font-semibold mb-3" style={{color: 'var(--color-text-primary)'}}>Promo Code</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
              placeholder="Enter promo code"
              className="flex-1 border rounded-xl px-4 py-2.5 text-sm input-field"
              style={{borderColor: 'var(--color-border)'}}
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
            <p className="text-xs mt-1.5 font-medium" style={{color: 'var(--color-brand)'}}>
              Discount applied: -{formatPrice(promoDiscount)}
            </p>
          )}
        </div>

        {/* Loyalty points redeem */}
        {canRedeem && (
          <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold" style={{color: 'var(--color-text-primary)'}}>Loyalty Points</h3>
                <p className="text-sm mt-0.5" style={{color: 'var(--color-text-secondary)'}}>
                  🪙 {totalLoyaltyPoints} points available
                </p>
                {redeemPoints > 0 ? (
                  <p className="text-xs mt-1" style={{color: 'var(--color-brand)'}}>
                    Redeeming for {formatPrice(redeemDiscount)} off
                  </p>
                ) : (
                  <p className="text-xs mt-1" style={{color: 'var(--color-text-tertiary)'}}>
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
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="w-5 h-5 shrink-0" style={{color: 'var(--color-brand)'}} />
              <h3 className="font-semibold" style={{color: 'var(--color-text-primary)'}}>Repeat Booking</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableRecurring}
                onChange={e => setEnableRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={enableRecurring ? {background: 'var(--color-brand)'} : {background: 'var(--color-surface)'}} />
            </label>
          </div>
          {enableRecurring && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'var(--color-text-secondary)'}}>Frequency</label>
                <select
                  value={recurringFreq}
                  onChange={e => setRecurringFreq(e.target.value as RecurringPattern['frequency'])}
                  className="w-full border rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] input-field"
                  style={{borderColor: 'var(--color-border)'}}
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'var(--color-text-secondary)'}}>Occurrences</label>
                <select
                  value={recurringOccurrences}
                  onChange={e => setRecurringOccurrences(Number(e.target.value))}
                  className="w-full border rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] input-field"
                  style={{borderColor: 'var(--color-border)'}}
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
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <label htmlFor="note" className="font-semibold block mb-2" style={{color: 'var(--color-text-primary)'}}>
            {t('booking.note')}
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t('booking.notePlaceholder')}
            className="w-full border rounded-xl px-4 py-3 text-sm resize-none input-field"
            style={{borderColor: 'var(--color-border)', color: 'var(--color-text-primary)'}}
          />
        </div>

        {/* Payment section */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCardIcon className="w-5 h-5" style={{color: 'var(--color-brand)'}} />
            <h3 className="font-semibold" style={{color: 'var(--color-text-primary)'}}>{t('booking.payment')}</h3>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 mb-4">
            <p className="text-xs text-yellow-800 leading-relaxed">
              {t('booking.paymentDesc')}
            </p>
          </div>

          <div className="p-4 rounded-xl border flex items-center justify-between" style={{background: 'var(--color-brand-light)', borderColor: 'var(--color-brand)'}}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'var(--color-brand-light)'}}>
                <CreditCardIcon className="w-4 h-4" style={{color: 'var(--color-brand)'}} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{color: 'var(--color-brand)'}}>{t('booking.payOnArrival')}</p>
                <p className="text-xs" style={{color: 'var(--color-brand)'}}>{t('booking.payOnArrivalDesc')}</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{borderColor: 'var(--color-brand)'}}>
              <div className="w-2.5 h-2.5 rounded-full" style={{background: 'var(--color-brand)'}} />
            </div>
          </div>
        </div>

        {/* Total + Confirm */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span style={{color: 'var(--color-text-secondary)'}}>Base price</span>
              <span style={{color: 'var(--color-text-primary)'}}>{formatPrice(basePrice)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span style={{color: 'var(--color-brand)'}}>Promo discount</span>
                <span style={{color: 'var(--color-brand)'}}>-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            {redeemDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span style={{color: 'var(--color-brand)'}}>Points discount</span>
                <span style={{color: 'var(--color-brand)'}}>-{formatPrice(redeemDiscount)}</span>
              </div>
            )}
            {groupSize > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span style={{color: 'var(--color-text-secondary)'}}>Party size</span>
                <span style={{color: 'var(--color-text-primary)'}}>×{groupSize}</span>
              </div>
            )}
            <div className="border-t pt-2 flex items-center justify-between" style={{borderColor: 'var(--color-border)'}}>
              <span style={{color: 'var(--color-text-secondary)'}}>{t('booking.total')}</span>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>{formatPrice(effectivePrice)}</p>
                {venue.pricing_unit !== 'fixed' && (
                  <p className="text-xs" style={{color: 'var(--color-text-tertiary)'}}>
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

          <p className="text-xs text-center mt-3" style={{color: 'var(--color-text-tertiary)'}}>
            {t('booking.terms')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Booking
