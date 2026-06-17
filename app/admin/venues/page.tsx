'use client'

import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Building2, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Venue, Profile } from '@/types'

const statusConfig: Record<string, BadgeVariant> = {
  active: 'success',
  pending: 'warning',
  rejected: 'error',
  human_action_needed: 'warning',
}

export default function AdminVenuesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: 'common.active',
      pending: 'common.pending',
      rejected: 'common.rejected',
      human_action_needed: 'admin.needsReview',
    }
    return t(map[status] || status)
  }

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
    toast.success(status === 'active' ? t('admin.venueApproved') : t('admin.venueStatusChanged'))
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
        title={t('admin.venuesPage.noVenues')}
        description={t('admin.venuesPage.noVenuesDesc')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">{t('admin.venuesPage.title')}</h1>
        <p className="mt-1 text-sm text-ink-tertiary">{t('admin.venuesPage.subtitle')}</p>
      </div>

      <div className="lg:hidden space-y-3">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{venue.name}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  {ownerMap.get(venue.owner_id) || t('admin.unknown')} • {venue.categories?.name_uz || ''}
                </p>
                <p className="text-xs text-ink-tertiary">{venue.city}</p>
              </div>
              <Badge variant={statusConfig[venue.status] || 'default'} size="sm">
                {statusLabel(venue.status)}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                  {(venue.price_per_slot ?? 0).toLocaleString()} {t('common.sum')}
              </span>
              {venue.status === 'pending' ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => updateStatus(venue.id, 'active')} className="p-1.5 rounded-lg text-success hover:bg-success-bg transition-colors" title={t('admin.approve')}>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateStatus(venue.id, 'rejected')} className="p-1.5 rounded-lg text-error hover:bg-error-bg transition-colors" title={t('admin.reject')}>
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href={`/business/venues/${venue.id}/edit`} className="p-1.5 rounded-lg text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors">
                  <Edit3 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('admin.venuesPage.venueName')}</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('admin.venuesPage.owner')}</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('common.category')}</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('common.city')}</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('common.status')}</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('common.price')}</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('common.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-ink">{venue.name}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{ownerMap.get(venue.owner_id) || t('admin.unknown')}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.categories?.name_uz || ''}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.city}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[venue.status] || 'default'} size="sm">
                    {statusLabel(venue.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-ink text-right">
                {(venue.price_per_slot ?? 0).toLocaleString()} {t('common.sum')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/business/venues/${venue.id}/edit`}
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    {venue.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateStatus(venue.id, 'active')}
                          className="p-2 rounded-xl text-success hover:bg-success-bg transition-colors"
                          title={t('admin.approve')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(venue.id, 'rejected')}
                          className="p-2 rounded-xl text-error hover:bg-error-bg transition-colors"
                          title={t('admin.reject')}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateStatus(venue.id, venue.status === 'active' ? 'rejected' : 'active')}
                        className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors"
                        title={venue.status === 'active' ? t('admin.venuesPage.deactivate') : t('admin.venuesPage.activate')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
