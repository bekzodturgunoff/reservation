'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit3, Eye, Trash2, MapPin, Star, ImageIcon, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/constants/routes'
import toast from 'react-hot-toast'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Venue } from '@/types'

interface BusinessVenuesClientProps {
  userId: string
  initialVenues: (Venue & { categories: { name_uz: string; name_ru: string; icon: string } | null })[]
}

export default function BusinessVenuesClient({ userId, initialVenues }: BusinessVenuesClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: t('common.active'), variant: 'success' },
    pending: { label: t('common.pending'), variant: 'warning' },
    rejected: { label: t('common.rejected'), variant: 'error' },
    human_action_needed: { label: t('admin.needsReview'), variant: 'warning' },
  }

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['my-venues', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(name_uz, name_ru, icon)')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
      return (data || []) as (Venue & { categories: { name_uz: string; name_ru: string; icon: string } | null })[]
    },
    enabled: !!userId,
    initialData: initialVenues,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('venues').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-venues'] })
      setDeleteId(null)
      toast.success(t('business.venueDeleted'))
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="200px" height="2rem" />
          <Skeleton variant="rect" width="160px" height="40px" className="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <Skeleton variant="rect" className="w-full h-44" />
              <div className="p-5 space-y-3">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="w-12 h-12" />}
        title={t('business.noVenues')}
        description={t('business.noVenuesDesc')}
        action={{
          label: t('business.addVenueLink'),
          onClick: () => router.push(ROUTES.BUSINESS_ADD_VENUE),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-ink">{t('business.myVenues')}</h1>
        <Link href={ROUTES.BUSINESS_ADD_VENUE}>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            {t('business.addVenueLink')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-0 overflow-hidden">
            <div className="relative h-44 bg-surface-subtle flex items-center justify-center overflow-hidden">
              {venue.photos && venue.photos[0] ? (
                <Image src={venue.photos[0]} alt={venue.name} width={400} height={220} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 text-ink-muted" />
                  <span className="mt-1 text-xs text-ink-tertiary">{t('business.noPhoto')}</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge variant={statusConfig[venue.status]?.variant || 'default'} size="sm">
                  {statusConfig[venue.status]?.label || venue.status}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{venue.name}</h3>
                  <p className="mt-1 text-sm text-ink-tertiary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {venue.city}{venue.district ? `, ${venue.district}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {(venue.price_per_slot ?? 0).toLocaleString()} {t('common.sum')}
                  </span>
                  {venue.avg_rating && venue.avg_rating > 0 && (
                    <span className="text-sm text-ink-tertiary flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      {venue.avg_rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/business/venues/${venue.id}/edit`} className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors" aria-label={t('business.editVenue')}>
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <Link href={`/venues/${venue.id}`}>
                    <button className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-ink-secondary transition-colors" aria-label={t('business.view')}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                  <button onClick={() => setDeleteId(venue.id)} className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors" aria-label={t('business.deleteVenue')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title={t('business.deleteVenue')}>
        <p className="text-sm text-ink-secondary">{t('business.deleteConfirmText')}</p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending}>{t('business.deleteVenue')}</Button>
        </div>
      </Modal>
    </div>
  )
}
