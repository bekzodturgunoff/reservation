'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTranslation } from 'react-i18next'
import { useTitle } from '@/hooks/useTitle'
import { getErrorMessage } from '@/lib/handleError'
import { ROUTES } from '@/lib/constants/routes'
import { SERVICE_FEE_PERCENTAGE } from '@/lib/constants/config'
import toast from 'react-hot-toast'
import { CalendarDays, Clock, Shield, ArrowLeft } from 'lucide-react'
import type { Venue } from '@/types'

interface BookClientProps {
  venue: Venue
  date: string
  start: string
  end: string
}

export function BookClient({ venue, date: dateStr, start: startTime, end: endTime }: BookClientProps) {
  const { t } = useTranslation()
  useTitle('Bron qilish — BronUz')
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [groupSize, setGroupSize] = useState(1)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.error(t('booking.loginRequired'))
      router.push(`${ROUTES.LOGIN}?returnTo=${ROUTES.BOOK}?venue=${venue.id}&date=${dateStr}&start=${startTime}&end=${endTime}`)
    }
  }, [user, router, t, venue.id, dateStr, startTime, endTime])

  if (!user) return null

  const startHour = parseInt(startTime.split(':')[0] ?? '0')
  const endHour = parseInt(endTime.split(':')[0] ?? '0')
  const hours = endHour - startHour
  const rate = venue?.price_per_slot || 0
  const subtotal = hours * rate
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE)
  const totalPrice = subtotal + serviceFee

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const { error } = await supabase.from('bookings').insert({
        venue_id: venue.id,
        user_id: user.id,
        booking_date: dateStr,
        start_time: startTime,
        end_time: endTime,
        total_price: totalPrice,
        group_size: groupSize,
        note: notes || null,
        status: 'pending',
      })
      if (error) throw error
      router.push(`${ROUTES.BOOKING_SUCCESS}?venue=${encodeURIComponent(venue?.name || '')}&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(`${startTime} – ${endTime}`)}`)
      return
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <h1 className="text-2xl font-display font-bold text-ink">{t('booking.confirmBooking')}</h1>
      <p className="text-sm text-ink-tertiary mt-1">{venue.name}</p>

      <div className="mt-6 bg-surface border border-border rounded-card p-5 space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <CalendarDays className="w-5 h-5 text-brand shrink-0" />
          <div>
            <p className="text-ink-secondary">{t('common.date')}: <span className="font-medium text-ink">{dateStr}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 text-brand shrink-0" />
          <div>
            <p className="text-ink-secondary">{t('common.time')}: <span className="font-medium text-ink">{startTime} – {endTime}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-5 h-5 text-brand shrink-0" />
          <div>
            <p className="text-ink-secondary">{t('booking.groupSize')}: <span className="font-medium text-ink">{groupSize} {t('common.persons')}</span></p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
            {t('booking.groupSize')}
          </label>
          <input
            type="number"
            min={1}
            max={venue.max_group_size || 100}
            value={groupSize}
            onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
            className="w-full h-[48px] px-4 text-sm bg-white border border-border rounded-input focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
            {t('booking.note')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-input focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink resize-none"
          />
        </div>
      </div>

      <div className="mt-6 bg-surface-bg rounded-card p-5 space-y-2 text-sm">
        <div className="flex justify-between text-ink-secondary">
          <span>{hours} {t('common.hour')} × {rate.toLocaleString()} UZS</span>
          <span>{subtotal.toLocaleString()} UZS</span>
        </div>
        <div className="flex justify-between text-ink-secondary">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            {t('venue.serviceFee')}
          </span>
          <span>{serviceFee.toLocaleString()} UZS</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-semibold text-ink text-base">
          <span>{t('booking.total')}</span>
          <span>{totalPrice.toLocaleString()} UZS</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="mt-6 w-full h-[52px] bg-brand hover:bg-brand-dark disabled:bg-brand/40 text-white font-semibold text-base rounded-btn shadow-btn transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>{t('booking.confirmBooking')}</>
        )}
      </button>
    </div>
  )
}
