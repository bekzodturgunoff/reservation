'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarCheck, Clock, TrendingUp, Star,
  CheckCircle, XCircle, Phone,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import toast from 'react-hot-toast'

const today = new Date().toISOString().split('T')[0] ?? ''

export interface TodayBooking {
  id: string
  start_time: string
  end_time: string
  status: string
  total_price: number
  booking_date: string
  profiles: { full_name: string; phone: string } | null
  venues: { name: string } | null
}

interface BusinessDashboardClientProps {
  userId: string
  initialVenues: { id: string; name: string }[]
  initialStats: {
    todayCount: number
    pendingCount: number
    todayRevenue: number
    avgRating: string | null
    reviewCount: number
  }
  initialTodayBookings: TodayBooking[]
}

export default function BusinessDashboardClient({
  userId,
  initialVenues,
  initialStats,
  initialTodayBookings,
}: BusinessDashboardClientProps) {
  const queryClient = useQueryClient()
  const [cancelTarget, setCancelTarget] = useState<{ id: string; venueId: string } | null>(null)

  const { data: myVenues = [] } = useQuery({
    queryKey: ['my-venue-ids', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues').select('id, name').eq('owner_id', userId)
      return data || []
    },
    enabled: !!userId,
    initialData: initialVenues,
  })

  const venueIds = myVenues.map(v => v.id)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['business-today-stats', userId, today],
    queryFn: async () => {
      const [todayBk, pendingBk, reviews] = await Promise.all([
        supabase.from('bookings').select('id, total_price').in('venue_id', venueIds).eq('booking_date', today),
        supabase.from('bookings').select('id').in('venue_id', venueIds).eq('booking_date', today).eq('status', 'pending'),
        supabase.from('reviews').select('rating').in('venue_id', venueIds),
      ])
      const todayTotal = (todayBk.data || []).reduce((s, b) => s + (b.total_price || 0), 0)
      const avgRating = reviews.data?.length
        ? (reviews.data.reduce((s, r) => s + r.rating, 0) / reviews.data.length).toFixed(1)
        : null
      return {
        todayCount: todayBk.data?.length || 0,
        pendingCount: pendingBk.data?.length || 0,
        todayRevenue: todayTotal,
        avgRating,
        reviewCount: reviews.data?.length || 0,
      }
    },
    enabled: venueIds.length > 0,
    initialData: initialStats,
  })

  const { data: todayBookings = [], isLoading: bkLoading } = useQuery<TodayBooking[]>({
    queryKey: ['business-today-bookings', userId, today],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status, total_price, booking_date, profiles!user_id(full_name, phone), venues!venue_id(name)')
        .in('venue_id', venueIds)
        .eq('booking_date', today)
        .order('start_time')
      return (data || []) as never as TodayBooking[]
    },
    enabled: venueIds.length > 0,
    initialData: initialTodayBookings,
  })

  const confirmMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await supabase.from('bookings').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', bookingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-today'] })
      toast.success('Bron tasdiqlandi')
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-today'] })
      toast.success('Bron bekor qilindi')
      setCancelTarget(null)
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  const pendingBookings = todayBookings.filter((b: TodayBooking) => b.status === 'pending')
  const confirmedBookings = todayBookings.filter((b: TodayBooking) => b.status === 'confirmed')
  const hours = Array.from({ length: 16 }, (_, i) => String(i + 7).padStart(2, '0'))

  const isLoading = statsLoading || bkLoading

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Bugun — {today}</h1>

      {/* Stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-brand mb-2"><CalendarCheck className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">Bugungi bronlar</span></div>
            <p className="text-2xl font-bold text-ink">{stats?.todayCount || 0}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-2"><Clock className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">Kutilayotgan</span></div>
            <p className="text-2xl font-bold text-ink">{stats?.pendingCount || 0}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">Bugungi daromad</span></div>
            <p className="text-2xl font-bold text-ink">{stats?.todayRevenue.toLocaleString() || 0} UZS</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-2"><Star className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">O&apos;rtacha reyting</span></div>
            <p className="text-2xl font-bold text-ink">{stats?.avgRating || '—'}</p>
          </Card>
        </div>
      )}

      {/* Pending bookings alert */}
      {!isLoading && pendingBookings.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50/50">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-4">
            <Clock className="w-4 h-4" />
            Tasdiqlashni kutayotgan bronlar ({pendingBookings.length} ta)
          </h2>
          <div className="space-y-3">
              {pendingBookings.map((bk: TodayBooking) => (
              <div key={bk.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{bk.profiles?.full_name || 'Noma\'lum'}</p>
                  <p className="text-xs text-ink-tertiary flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{bk.profiles?.phone || '—'}
                  </p>
                  <p className="text-xs text-ink-tertiary mt-0.5">
                    {bk.start_time?.slice(0, 5)} – {bk.end_time?.slice(0, 5)} · {bk.venues?.name}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => confirmMutation.mutate(bk.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Tasdiqlash
                  </button>
                  <button
                    onClick={() => setCancelTarget({ id: bk.id, venueId: '' })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rad etish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Today's schedule */}
      <div>
        <h2 className="font-display text-lg font-bold text-ink mb-4">Bugungi jadval</h2>
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-12 w-full rounded-card" /></div>
        ) : confirmedBookings.length === 0 && pendingBookings.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="w-10 h-10 text-ink-muted" />}
            title="Bugun bronlar yo'q"
            description="Bugungi kunga hech qanday bron qilinmagan"
          />
        ) : (
          <div className="space-y-1">
            {hours.map(h => {
              const bkAtHour = [...confirmedBookings, ...pendingBookings].filter(
                (b: TodayBooking) => b.start_time?.slice(0, 2) === h
              )
              return (
                <div key={h} className="flex gap-3">
                  <div className="w-12 text-xs text-ink-muted font-medium pt-2 shrink-0">{h}:00</div>
                  <div className="flex-1 min-h-[36px]">
                    {bkAtHour.length > 0 ? bkAtHour.map((b: TodayBooking) => (
                      <div
                        key={b.id}
                        className={`p-2 rounded-lg text-xs mb-1 ${b.status === 'pending' ? 'bg-amber-50 border border-amber-200' : 'bg-brand-50 border border-brand-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink">{b.profiles?.full_name}</span>
                          <BookingStatusBadge status={b.status} />
                        </div>
                        <p className="text-ink-tertiary mt-0.5">
                          {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)} · {b.venues?.name}
                          {b.total_price ? ` · ${b.total_price.toLocaleString()} UZS` : ''}
                        </p>
                      </div>
                    )) : (
                      <div className="h-8 flex items-center">
                        <span className="text-xs text-ink-muted/50">— bo'sh —</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => { if (cancelTarget) cancelMutation.mutate(cancelTarget) }}
        title="Bronni bekor qilish"
        description="Bu brondan voz kechishni xohlaysizmi?"
        confirmLabel="Bekor qilish"
        confirmVariant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
