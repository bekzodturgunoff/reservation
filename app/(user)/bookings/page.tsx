'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Calendar,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Drawer } from '@/components/shared/Drawer'

export default function UserBookings() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, venues!venue_id(id, name, photos, city, address)')
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })
      return data || []
    },
    enabled: !!user?.id,
  })

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = b.venues?.name?.toLowerCase() || ''
      if (!name.includes(q)) return false
    }
    return true
  })

  const sel = selectedBooking

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-ink">Buyurtmalarim</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Joy nomi bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">Barcha holatlar</option>
          <option value="pending">Kutilmoqda</option>
          <option value="confirmed">Tasdiqlangan</option>
          <option value="completed">Yakunlangan</option>
          <option value="cancelled">Bekor qilingan</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="Buyurtmalar mavjud emas"
          description="Sizda hali hech qanday buyurtma yo'q"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(booking => (
            <button
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="w-full text-left p-4 rounded-xl border border-border bg-surface hover:bg-surface-subtle transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-surface-subtle shrink-0 overflow-hidden">
                  {booking.venues?.photos?.[0] ? (
                    <img src={booking.venues.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted text-xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{booking.venues?.name || 'Noma\'lum joy'}</p>
                  <p className="text-xs text-ink-tertiary mt-0.5">
                    {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('uz-UZ') : ''}
                    {booking.start_time ? ` ${booking.start_time}` : ''}
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    {booking.venues?.city}{booking.venues?.address ? `, ${booking.venues.address}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <BookingStatusBadge status={booking.status} />
                  <p className="text-sm font-semibold text-ink mt-1">{booking.total_price?.toLocaleString()} UZS</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer isOpen={!!sel} onClose={() => setSelectedBooking(null)} title="Buyurtma tafsilotlari">
        {sel && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-subtle shrink-0 overflow-hidden">
                {sel.venues?.photos?.[0] ? (
                  <img src={sel.venues.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-muted"><Calendar className="w-6 h-6" /></div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{sel.venues?.name || 'Noma\'lum joy'}</h3>
                <p className="text-sm text-ink-tertiary">{sel.venues?.city}{sel.venues?.address ? `, ${sel.venues.address}` : ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink-tertiary">Holat</p>
                <BookingStatusBadge status={sel.status} />
              </div>
              <div>
                <p className="text-xs text-ink-tertiary">Narxi</p>
                <p className="text-sm font-semibold text-ink">{sel.total_price?.toLocaleString()} UZS</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary">Sana</p>
                <p className="text-sm text-ink">{sel.booking_date ? new Date(sel.booking_date).toLocaleDateString('uz-UZ') : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary">Vaqt</p>
                <p className="text-sm text-ink">{sel.start_time || '—'}{sel.end_time ? ` - ${sel.end_time}` : ''}</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary">Kishilar soni</p>
                <p className="text-sm text-ink">{sel.group_size || 1}</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary">Yaratilgan</p>
                <p className="text-sm text-ink">{sel.created_at ? new Date(sel.created_at).toLocaleDateString('uz-UZ') : '—'}</p>
              </div>
            </div>

            {sel.note && (
              <div>
                <p className="text-xs text-ink-tertiary mb-1">Eslatma</p>
                <p className="text-sm text-ink bg-surface-subtle p-3 rounded-xl">{sel.note}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
