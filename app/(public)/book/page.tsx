'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTranslation } from 'react-i18next'
import { useTitle } from '@/hooks/useTitle'
import { getErrorMessage } from '@/lib/handleError'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/Skeleton'
import { CalendarDays, Clock, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { Venue } from '@/types'

export default function BookPage() {
  const { t } = useTranslation()
  useTitle('Bron qilish — BronUz')
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)

  const venueId = searchParams.get('venue')
  const dateStr = searchParams.get('date')
  const startTime = searchParams.get('start')
  const endTime = searchParams.get('end')
  const [groupSize, setGroupSize] = useState(1)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.error(t('booking.loginRequired'))
      router.push(`/login?returnTo=/book?venue=${venueId}&date=${dateStr}&start=${startTime}&end=${endTime}`)
    }
  }, [user, router, t, venueId, dateStr, startTime, endTime])

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue-for-book', venueId],
    queryFn: async () => {
      if (!venueId) return null
      const { data } = await supabase
        .from('venues')
        .select('*, categories(*)')
        .eq('id', venueId)
        .single()
      return data as Venue | null
    },
    enabled: !!venueId,
  })

  if (!user) return null

  if (!venueId || !dateStr || !startTime || !endTime) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-secondary">{t('booking.notFound')}</p>
        <Link href="/search" className="mt-4 text-brand hover:underline inline-block">{t('common.backToSearch')}</Link>
      </div>
    )
  }

  const hours = parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])
  const rate = venue?.price_per_slot || 0
  const subtotal = hours * rate
  const serviceFee = Math.round(subtotal * 0.05)
  const totalPrice = subtotal + serviceFee

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const { error } = await supabase.from('bookings').insert({
        venue_id: venueId,
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
      setDone(true)
      toast.success(t('booking.success'))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="text-2xl font-display font-semibold text-ink">{t('confirmation.successTitle')}</h1>
        <p className="mt-2 text-ink-tertiary">{t('confirmation.contactNote')}</p>
        <div className="mt-8 bg-surface border border-border rounded-card p-5 text-left space-y-2">
          <p className="text-sm font-semibold text-ink-tertiary uppercase tracking-wider">{t('confirmation.details')}</p>
          <div className="flex justify-between text-sm">
            <span className="text-ink-tertiary">{t('common.venue')}</span>
            <span className="text-ink font-medium">{venue?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-tertiary">{t('common.date')}</span>
            <span className="text-ink font-medium">{dateStr}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-tertiary">{t('common.time')}</span>
            <span className="text-ink font-medium">{startTime} – {endTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-tertiary">{t('booking.total')}</span>
            <span className="text-ink font-bold">{totalPrice.toLocaleString()} UZS</span>
          </div>
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center h-11 px-6 border border-border rounded-xl text-sm font-medium text-ink hover:bg-surface-muted transition-colors">
            {t('confirmation.backHome')}
          </Link>
          <Link href="/search" className="inline-flex items-center justify-center h-11 px-6 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-dark transition-colors">
            {t('common.search')}
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-40 rounded-card" />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-secondary">{t('venue.notFound')}</p>
        <Link href="/search" className="mt-4 text-brand hover:underline inline-block">{t('common.backToSearch')}</Link>
      </div>
    )
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
