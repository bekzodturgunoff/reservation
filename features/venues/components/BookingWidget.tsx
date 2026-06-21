'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Clock, Star, Shield, CreditCard } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { SERVICE_FEE_PERCENTAGE } from '@/lib/constants/config'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import type { Venue } from '@/types'

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
]

interface BookingWidgetProps {
  venue: Venue
}

export function BookingWidget({ venue }: BookingWidgetProps) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const hours = startTime && endTime
    ? parseInt(endTime.split(':')[0] ?? '0') - parseInt(startTime.split(':')[0] ?? '0')
    : 0

  const rate = venue.price_per_slot || 0
  const hasPrice = rate > 0
  const subtotal = hours > 0 ? hours * rate : 0
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE)
  const total = subtotal + serviceFee

  const canBook = selectedDate && startTime && endTime && hours > 0

  const handleBook = () => {
    if (!canBook) {
      toast.error(t('booking.selectDateTime'))
      return
    }
    if (!user) {
      toast.error(t('booking.loginRequired'))
      router.push(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    router.push(`${ROUTES.BOOK}?venue=${venue.id}&date=${dateStr}&start=${startTime}&end=${endTime}`)
  }

  return (
    <div className="sticky top-24 bg-white rounded-card border border-border shadow-card p-5 sm:p-6">
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-ink">
          {hasPrice ? `${rate.toLocaleString()} UZS` : t('common.negotiablePrice')}
        </span>
        {hasPrice && <span className="text-sm text-ink-tertiary">{t('venue.perHour')}</span>}
      </div>

      <div className="flex items-center gap-1 text-sm mb-6">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-ink">
          {(venue.review_count ?? 0) >= 3 ? venue.avg_rating?.toFixed(1) : '—'}
        </span>
        <span className="text-ink-tertiary">
          {(venue.review_count ?? 0) >= 1
            ? `(${venue.review_count} ${t('venue.reviews')})`
            : t('venue.noReviews')}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            {t('venue.selectDate')}
          </label>
          <div className="flex justify-center border border-border rounded-card p-2 bg-white">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: today }}
              locale={uz}
              fromDate={today}
              toDate={new Date(today.getFullYear(), today.getMonth() + 2, 0)}
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-2',
                caption: 'flex items-center justify-between pt-1 relative',
                caption_label: 'text-sm font-semibold text-ink',
                nav: 'flex items-center gap-1',
                nav_button:
                  'w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-bg transition-colors text-ink-secondary',
                nav_button_previous: '',
                nav_button_next: '',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell:
                  'w-9 h-8 text-xs font-medium text-ink-tertiary flex items-center justify-center',
                row: 'flex w-full',
                cell: 'flex items-center justify-center w-9 h-9 text-sm',
                day: 'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light hover:text-brand transition-colors text-ink',
                day_selected:
                  'bg-brand text-white hover:bg-brand-dark hover:text-white font-semibold',
                day_today: 'font-bold text-brand',
                day_disabled: 'text-ink-disabled opacity-40 hover:bg-transparent hover:text-ink-disabled cursor-not-allowed',
                day_outside: 'text-ink-disabled opacity-30',
              }}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2">
            <Clock className="w-3.5 h-3.5" />
            {t('venue.selectTime')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted block mb-1.5">{t('common.start')}</label>
              <div className="relative">
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value)
                    if (endTime && e.target.value >= endTime) setEndTime('')
                  }}
                  className="w-full h-[48px] px-3 text-sm bg-white border border-border rounded-input outline-none appearance-none cursor-pointer focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
                >
                  <option value="">—:—</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Clock className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1.5">{t('common.end')}</label>
              <div className="relative">
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!startTime}
                  className="w-full h-[48px] px-3 text-sm bg-white border border-border rounded-input outline-none appearance-none cursor-pointer focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed text-ink"
                >
                  <option value="">—:—</option>
                  {TIME_SLOTS.filter((t) => startTime && t > startTime).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Clock className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {hours > 0 && (
          <div className="p-4 bg-surface-bg rounded-card space-y-2 text-sm">
            <div className="flex items-center justify-between text-ink-secondary">
              <span>{hours} {t('common.hour')} × {rate.toLocaleString()} UZS</span>
              <span>{subtotal.toLocaleString()} UZS</span>
            </div>
            <div className="flex items-center justify-between text-ink-secondary">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {t('venue.serviceFee')}
              </span>
              <span>{serviceFee.toLocaleString()} UZS</span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between font-semibold text-ink text-base">
              <span>{t('booking.total')}</span>
              <span>{total.toLocaleString()} UZS</span>
            </div>
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={!canBook}
          className="w-full h-[52px] bg-brand hover:bg-brand-dark disabled:bg-brand/40 text-white font-semibold text-base rounded-btn shadow-btn transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:shadow-none enabled:hover:-translate-y-0.5"
        >
          <CalendarDays className="w-4 h-4" />
          {t('common.book')}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-ink-tertiary">
          <CreditCard className="w-3.5 h-3.5" />
          {t('venue.noCardRequired')}
        </div>
      </div>
    </div>
  )
}
