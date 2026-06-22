'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Drawer } from '@/components/shared/Drawer'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import toast from 'react-hot-toast'

export interface AdminBooking {
  id: string
  booking_date: string | null
  start_time: string | null
  end_time: string | null
  status: string
  total_price: number | null
  profiles: { full_name: string | null; phone: string | null } | null
  venues: { id: string; name: string | null } | null
}

interface AdminBookingsClientProps {
  initialBookings: AdminBooking[]
}

export default function AdminBookingsClient({ initialBookings }: AdminBookingsClientProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, profiles!user_id(full_name, phone), venues!venue_id(id, name)')
        .order('created_at', { ascending: false })
        .limit(100)
      return (data || []) as AdminBooking[]
    },
    initialData: initialBookings,
  })

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = b.profiles?.full_name?.toLowerCase() || ''
      const venue = b.venues?.name?.toLowerCase() || ''
      if (!name.includes(q) && !venue.includes(q)) return false
    }
    return true
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Bekor qilindi'); setCancelTarget(null); setSelectedBooking(null) },
    onError: () => toast.error('Xatolik'),
  })

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Bronlar</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mijoz yoki joy nomi..." className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand text-ink" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 text-sm bg-white border border-border rounded-input outline-none text-ink-secondary">
          <option value="">Barcha holatlar</option>
          <option value="pending">Kutilmoqda</option>
          <option value="confirmed">Tasdiqlangan</option>
          <option value="completed">Yakunlangan</option>
          <option value="cancelled">Bekor qilingan</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Bronlar topilmadi" description="Hech qanday bron mavjud emas" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Mijoz</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Joy</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Sana</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Summa</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Holat</th>
                <th className="text-right px-3 py-3 text-xs font-semibold uppercase text-ink-muted">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} onClick={() => setSelectedBooking(b)} className="border-b border-border hover:bg-surface-bg cursor-pointer transition-colors">
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{b.profiles?.full_name || 'Noma\'lum'}</p>
                    <p className="text-xs text-ink-tertiary">{b.profiles?.phone || ''}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-secondary">{b.venues?.name}</td>
                  <td className="px-3 py-3 text-ink-secondary">{b.booking_date}</td>
                  <td className="px-3 py-3 font-semibold text-ink">{(b.total_price || 0).toLocaleString()} UZS</td>
                  <td className="px-3 py-3"><BookingStatusBadge status={b.status} /></td>
                  <td className="px-3 py-3 text-right">
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button onClick={e => { e.stopPropagation(); setCancelTarget(b.id) }} className="text-xs text-red-600 hover:underline">Bekor qilish</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Bron tafsilotlari">
        {selectedBooking && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Mijoz</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-sm font-bold text-brand">
                  {selectedBooking.profiles?.full_name?.charAt(0) || 'N'}
                </div>
                <div>
                  <p className="font-semibold text-ink">{selectedBooking.profiles?.full_name || 'Noma\'lum'}</p>
                  <p className="text-sm text-ink-tertiary">{selectedBooking.profiles?.phone}</p>
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-tertiary">Joy</span><span className="font-medium text-ink">{selectedBooking.venues?.name}</span></div>
              <div className="flex justify-between"><span className="text-ink-tertiary">Sana</span><span className="font-medium text-ink">{selectedBooking.booking_date}</span></div>
              <div className="flex justify-between"><span className="text-ink-tertiary">Vaqt</span><span className="font-medium text-ink">{selectedBooking.start_time?.slice(0, 5)} – {selectedBooking.end_time?.slice(0, 5)}</span></div>
              <div className="flex justify-between"><span className="text-ink-tertiary">Holat</span><BookingStatusBadge status={selectedBooking.status} /></div>
              <div className="flex justify-between"><span className="text-ink-tertiary">Summa</span><span className="font-semibold text-ink">{(selectedBooking.total_price || 0).toLocaleString()} UZS</span></div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => { if (cancelTarget) cancelMutation.mutate(cancelTarget) }}
        title="Bronni bekor qilish"
        description="Bu bronni bekor qilishni xohlaysizmi?"
        confirmLabel="Bekor qilish"
        confirmVariant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
