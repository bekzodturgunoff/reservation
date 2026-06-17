'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Eye, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminVenueReview() {
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const { data: pendingVenues = [], isLoading } = useQuery({
    queryKey: ['admin-venues-pending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, profiles!owner_id(full_name, phone, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('venues').update({ status: 'active', moderated_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-venues-pending'] }); toast.success('Joy tasdiqlandi') },
    onError: () => toast.error('Xatolik'),
  })

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('venues').update({ status: 'rejected', moderated_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-venues-pending'] }); toast.success('Joy rad etildi'); setRejectTarget(null) },
    onError: () => toast.error('Xatolik'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Tekshiruv</h1>
        <Link href="/admin/venues" className="text-sm text-brand hover:underline">Barcha joylar</Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-card" />)}
        </div>
      ) : pendingVenues.length === 0 ? (
        <EmptyState icon={<Building2 className="w-12 h-12" />} title="Ko'rib chiqiladigan joylar yo'q" description="Barcha joylar tasdiqlangan yoki rad etilgan" />
      ) : (
        <div className="space-y-4">
          {pendingVenues.map(v => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{v.name}</h3>
                  <p className="text-sm text-ink-tertiary mt-1">{v.city}{v.district ? `, ${v.district}` : ''}</p>
                </div>
                <Badge variant="warning">Kutilmoqda</Badge>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-ink-tertiary">
                <span>{v.profiles?.full_name || 'Noma\'lum'}</span>
                {v.profiles?.phone && <span>{v.profiles.phone}</span>}
              </div>
              <p className="mt-2 text-sm text-ink-secondary line-clamp-2">{v.description || 'Tavsif yo\'q'}</p>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => approveMutation.mutate(v.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
                  <CheckCircle className="w-4 h-4" /> Tasdiqlash
                </button>
                <button onClick={() => setRejectTarget(v.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors">
                  <XCircle className="w-4 h-4" /> Rad etish
                </button>
                <Link href={`/venues/${v.id}`} className="p-2 rounded-lg text-ink-tertiary hover:bg-surface-bg transition-colors ml-auto">
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => { if (rejectTarget) rejectMutation.mutate(rejectTarget) }}
        title="Joyni rad etish"
        description="Bu joyni rad etmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
        confirmLabel="Rad etish"
        confirmVariant="danger"
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}
