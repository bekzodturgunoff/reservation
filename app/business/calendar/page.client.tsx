'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, ChevronRight, CalendarDays, X, Ban,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Drawer } from '@/components/shared/Drawer'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import toast from 'react-hot-toast'

interface CalendarBooking {
  id: string
  booking_date: string
  start_time: string | null
  end_time: string | null
  status: string
  profiles: { full_name: string | null } | null
  venues: { name: string | null } | null
}

const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const today = new Date()

interface BusinessCalendarClientProps {
  userId: string
  initialBookings: CalendarBooking[]
  initialBlockedDates: string[]
  initialVenues: { id: string; name: string }[]
}

export default function BusinessCalendarClient({ userId, initialBookings, initialBlockedDates, initialVenues }: BusinessCalendarClientProps) {
  const queryClient = useQueryClient()
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [blockTarget, setBlockTarget] = useState<Date | null>(null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const dateStr = (d: Date) => d.toISOString().split('T')[0] ?? ''
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()

  const { data: myVenues = [] } = useQuery({
    queryKey: ['my-venue-ids', userId],
    queryFn: async () => {
      const { data } = await supabase.from('venues').select('id, name').eq('owner_id', userId)
      return data || []
    },
    enabled: !!userId,
    initialData: initialVenues,
  })
  const venueIds = myVenues.map(v => v.id)

  const fromDate = dateStr(firstDay)
  const toDate = dateStr(lastDay)

  const { data: monthBookings = [] } = useQuery({
    queryKey: ['business-calendar', userId, year, month],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_date, start_time, end_time, status, profiles!user_id(full_name), venues!venue_id(name)')
        .in('venue_id', venueIds)
        .gte('booking_date', fromDate)
        .lte('booking_date', toDate)
        .not('status', 'in', '("cancelled","no_show")')
      return (data || []) as unknown as CalendarBooking[]
    },
    enabled: venueIds.length > 0,
    initialData: initialBookings,
  })

  const { data: blockedDates = [] } = useQuery({
    queryKey: ['blocked-dates', userId, year, month],
    queryFn: async () => {
      const { data } = await supabase
        .from('blocked_dates')
        .select('date')
        .in('venue_id', venueIds)
        .gte('date', fromDate)
        .lte('date', toDate)
      return (data || []).map(d => d.date)
    },
    enabled: venueIds.length > 0,
    initialData: initialBlockedDates,
  })

  const blockMutation = useMutation({
    mutationFn: async (date: Date) => {
      await supabase.from('blocked_dates').insert({
        venue_id: venueIds[0], date: dateStr(date), created_by: userId,
      })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blocked-dates'] }); toast.success('Kun yopildi'); setBlockTarget(null) },
    onError: () => toast.error('Xatolik'),
  })

  const unblockMutation = useMutation({
    mutationFn: async (date: Date) => {
      await supabase.from('blocked_dates').delete().in('venue_id', venueIds).eq('date', dateStr(date))
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blocked-dates'] }); toast.success('Kun ochildi') },
    onError: () => toast.error('Xatolik'),
  })

  const bookingsByDate = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {}
    monthBookings.forEach(b => {
      const d = b.booking_date
      if (!map[d]) map[d] = []
      map[d].push(b)
    })
    return map
  }, [monthBookings])

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates])

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const dayKey = selectedDay ? dateStr(selectedDay) : null
  const dayBookings = dayKey ? (bookingsByDate[dayKey] ?? []) : []
  const isToday = (d: Date) => dateStr(d) === dateStr(today)

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Kalendar</h1>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="font-display text-lg font-bold text-ink">
            {currentMonth.toLocaleDateString('uz', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {WEEKDAYS.map(d => (
            <div key={d} className="bg-surface-bg px-2 py-2 text-center text-xs font-semibold text-ink-muted">{d}</div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-white min-h-[80px] p-1" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = new Date(year, month, i + 1)
            const ds = dateStr(d)
            const bks = bookingsByDate[ds] || []
            const blocked = blockedSet.has(ds)
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(d)}
                className={`bg-white min-h-[80px] p-1.5 text-left transition-colors hover:bg-surface-bg relative ${isToday(d) ? 'ring-2 ring-brand ring-inset' : ''} ${blocked ? 'bg-gray-100 opacity-50' : ''}`}
              >
                <span className={`text-xs font-medium ${isToday(d) ? 'text-brand' : 'text-ink'}`}>{i + 1}</span>
                {bks.slice(0, 2).map(b => (
                  <div key={b.id} className={`mt-0.5 px-1 py-0.5 rounded text-[10px] leading-tight truncate ${b.status === 'confirmed' ? 'bg-brand-light text-brand-dark' : 'bg-amber-100 text-amber-700'}`}>
                    {b.start_time?.slice(0, 5)} {b.profiles?.full_name?.split(' ')[0]}
                  </div>
                ))}
                {bks.length > 2 && <p className="text-[10px] text-ink-muted mt-0.5">+{bks.length - 2} ta</p>}
              </button>
            )
          })}
        </div>
      </Card>

      <Drawer
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? selectedDay.toLocaleDateString('uz', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
      >
        {selectedDay && (
          <div className="space-y-4">
            {dayBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-ink-muted mx-auto mb-2" />
                <p className="text-sm text-ink-tertiary">Bu kunga bronlar yo'q</p>
                {!blockedSet.has(dateStr(selectedDay)) ? (
                  <button onClick={() => setBlockTarget(selectedDay)} className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg bg-surface-muted text-sm text-ink-secondary hover:bg-border transition-colors">
                    <Ban className="w-4 h-4" /> Bu kunni yoping
                  </button>
                ) : (
                  <button onClick={() => unblockMutation.mutate(selectedDay)} className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm hover:bg-red-100 transition-colors">
                    <X className="w-4 h-4" /> Kunni ochish
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {dayBookings.map(b => (
                  <div key={b.id} className="p-3 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-ink">{b.profiles?.full_name}</span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-ink-tertiary">
                      {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)} · {b.venues?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmModal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={() => { if (blockTarget) blockMutation.mutate(blockTarget) }}
        title="Kunni yopish"
        description="Bu kundagi barcha vaqtlarni bron uchun yopishni xohlaysizmi?"
        confirmLabel="Yopish"
        isLoading={blockMutation.isPending}
      />
    </div>
  )
}
