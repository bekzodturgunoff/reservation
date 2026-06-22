'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Phone,
  CheckCircle, XCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Drawer } from '@/components/shared/Drawer'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import toast from 'react-hot-toast'

export interface BusinessBooking {
  id: string
  booking_date: string | null
  start_time: string | null
  end_time: string | null
  status: string
  total_price: number | null
  profiles: { full_name: string | null; phone: string | null } | null
  venues: { id: string; name: string | null } | null
}

interface BusinessBookingsClientProps {
  userId: string
  initialBookings: BusinessBooking[]
  initialVenues: { id: string; name: string }[]
}

export default function BusinessBookingsClient({ userId, initialBookings, initialVenues }: BusinessBookingsClientProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<BusinessBooking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

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

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['business-bookings', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, profiles!user_id(full_name, phone), venues!venue_id(id, name)')
        .in('venue_id', venueIds)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })
      return (data || []) as BusinessBooking[]
    },
    enabled: venueIds.length > 0,
    initialData: initialBookings,
  })

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = b.profiles?.full_name?.toLowerCase() || ''
      if (!name.includes(q)) return false
    }
    return true
  })

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('bookings').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['business-bookings'] }); toast.success('Tasdiqlandi'); setSelectedBooking(null) },
    onError: () => toast.error('Xatolik'),
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['business-bookings'] }); toast.success('Bekor qilindi'); setCancelTarget(null); setSelectedBooking(null) },
    onError: () => toast.error('Xatolik'),
  })

  const sel = selectedBooking

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Bronlar</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Mijoz ismi..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand text-ink"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-border rounded-input outline-none text-ink-secondary"
        >
          <option value="">Barcha holatlar</option>
          <option value="pending">Kutilmoqda</option>
          <option value="confirmed">Tasdiqlangan</option>
          <option value="completed">Yakunlangan</option>
          <option value="cancelled">Bekor qilingan</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Bronlar topilmadi" description={search ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hali bronlar yo\'q'} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Mijoz</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Joy</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Sana</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Vaqt</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Summa</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Holat</th>
                <th className="text-right px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="border-b border-border hover:bg-surface-bg cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{b.profiles?.full_name || 'Noma\'lum'}</p>
                    <p className="text-xs text-ink-tertiary">{b.profiles?.phone || ''}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-secondary">{b.venues?.name}</td>
                  <td className="px-3 py-3 text-ink-secondary">{b.booking_date}</td>
                  <td className="px-3 py-3 text-ink-secondary">{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</td>
                  <td className="px-3 py-3 font-semibold text-ink">{(b.total_price || 0).toLocaleString()} UZS</td>
                  <td className="px-3 py-3"><BookingStatusBadge status={b.status} /></td>
                  <td className="px-3 py-3 text-right">
                    {b.status === 'pending' && (
                      <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                        <button onClick={() => confirmMutation.mutate(b.id)} className="p-1.5 rounded-lg text-brand hover:bg-brand-light transition-colors"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => setCancelTarget(b.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <button onClick={e => { e.stopPropagation(); setCancelTarget(b.id) }} className="text-xs text-red-600 hover:underline">Bekor qilish</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      <Drawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Bron tafsilotlari"
        footer={sel && (sel.status === 'pending' || sel.status === 'confirmed') ? (
          <div className="flex gap-3">
            {sel.status === 'pending' && (
              <button onClick={() => confirmMutation.mutate(sel.id)} className="flex-1 h-11 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors">Tasdiqlash</button>
            )}
            <button onClick={() => setCancelTarget(sel.id)} className={`${sel.status === 'confirmed' ? 'flex-1' : ''} h-11 rounded-xl border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 transition-colors`}>
              Bekor qilish
            </button>
          </div>
        ) : undefined}
      >
        {sel && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Mijoz</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-sm font-bold text-brand">
                  {sel.profiles?.full_name?.charAt(0) || 'N'}
                </div>
                <div>
                  <p className="font-semibold text-ink">{sel.profiles?.full_name || 'Noma\'lum'}</p>
                  {sel.profiles?.phone && (
                    <a href={`tel:${sel.profiles.phone}`} className="text-sm text-brand hover:underline flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />{sel.profiles.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Bron ma'lumotlari</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-tertiary">Joy</span><span className="font-medium text-ink">{sel.venues?.name}</span></div>
                <div className="flex justify-between"><span className="text-ink-tertiary">Sana</span><span className="font-medium text-ink">{sel.booking_date}</span></div>
                <div className="flex justify-between"><span className="text-ink-tertiary">Vaqt</span><span className="font-medium text-ink">{sel.start_time?.slice(0, 5)} – {sel.end_time?.slice(0, 5)}</span></div>
                <div className="flex justify-between"><span className="text-ink-tertiary">Holat</span><BookingStatusBadge status={sel.status} /></div>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">To'lov</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-tertiary">Summa</span><span className="font-semibold text-ink">{(sel.total_price || 0).toLocaleString()} UZS</span></div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

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
