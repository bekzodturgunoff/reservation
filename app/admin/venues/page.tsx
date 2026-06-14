'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Venue, Profile } from '@/types'

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Faol', variant: 'success' },
  pending: { label: 'Kutilmoqda', variant: 'warning' },
  rejected: { label: 'Rad etilgan', variant: 'error' },
  human_action_needed: { label: 'Tekshirish kerak', variant: 'warning' },
}

export default function AdminVenuesPage() {
  const queryClient = useQueryClient()

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['admin-venues'],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(name_uz, name_ru, icon)')
        .order('created_at', { ascending: false })
      return (data || []) as (Venue & {
        categories: { name_uz: string; name_ru: string; icon: string } | null
      })[]
    },
  })

  const ownerIds = [...new Set(venues.map(v => v.owner_id).filter(Boolean))]

  const { data: owners = [] } = useQuery({
    queryKey: ['venue-owners', ownerIds],
    queryFn: async () => {
      if (ownerIds.length === 0) return []
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ownerIds)
      return (data || []) as Pick<Profile, 'id' | 'full_name'>[]
    },
    enabled: ownerIds.length > 0,
  })

  const ownerMap = new Map(owners.map(o => [o.id, o.full_name]))

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('venues').update({ status } as Partial<Venue>).eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    queryClient.invalidateQueries({ queryKey: ['admin-venues'] })
    toast.success(status === 'active' ? 'Joy tasdiqlandi' : 'Joy holati o\'zgartirildi')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" height="2rem" />
        <Card className="overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="50%" />
                </div>
                <Skeleton variant="rect" width="80px" height="24px" className="rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="w-12 h-12" />}
        title="Joylar yo'q"
        description="Hozircha hech qanday joy mavjud emas."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Barcha joylar</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Platformadagi barcha joylarni boshqarish.</p>
      </div>

      <div className="lg:hidden space-y-3">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{venue.name}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  {ownerMap.get(venue.owner_id) || 'Noma\'lum'} • {venue.categories?.name_uz || ''}
                </p>
                <p className="text-xs text-ink-tertiary">{venue.city}</p>
              </div>
              <Badge variant={statusConfig[venue.status]?.variant || 'default'} size="sm">
                {statusConfig[venue.status]?.label || venue.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                {venue.price_per_slot.toLocaleString()} so'm
              </span>
              {venue.status === 'pending' && (
                <div className="flex items-center gap-1">
                  <button onClick={() => updateStatus(venue.id, 'active')} className="p-1.5 rounded-lg text-success hover:bg-success-bg transition-colors" title="Tasdiqlash">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateStatus(venue.id, 'rejected')} className="p-1.5 rounded-lg text-error hover:bg-error-bg transition-colors" title="Rad etish">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Joy nomi</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Egasi</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Kategoriya</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Shahar</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Holat</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Narxi</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-ink">{venue.name}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{ownerMap.get(venue.owner_id) || 'Noma\'lum'}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.categories?.name_uz || ''}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.city}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[venue.status]?.variant || 'default'} size="sm">
                    {statusConfig[venue.status]?.label || venue.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-ink text-right">
                  {venue.price_per_slot.toLocaleString()} so'm
                </td>
                <td className="px-6 py-4 text-right">
                  {venue.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => updateStatus(venue.id, 'active')}
                        className="p-2 rounded-xl text-success hover:bg-success-bg transition-colors"
                        title="Tasdiqlash"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(venue.id, 'rejected')}
                        className="p-2 rounded-xl text-error hover:bg-error-bg transition-colors"
                        title="Rad etish"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateStatus(venue.id, venue.status === 'active' ? 'rejected' : 'active')}
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors"
                      title={venue.status === 'active' ? 'Nofaol qilish' : 'Faol qilish'}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
