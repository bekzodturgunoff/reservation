'use client'

import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { supabase } from '@/lib/supabase'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Booking } from '@/types'

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Tasdiqlangan', variant: 'success' },
  completed: { label: 'Yakunlangan', variant: 'default' },
  cancelled: { label: 'Bekor qilingan', variant: 'error' },
}

export default function BookingsPage() {
  const { profile } = useAuthStore()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', profile?.id],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', profile!.id)
      if (!myVenues || myVenues.length === 0) return []
      const venueIds = myVenues.map(v => v.id)
      const { data } = await supabase
        .from('bookings')
        .select('*, venues(name), profiles(full_name)')
        .in('venue_id', venueIds)
        .order('created_at', { ascending: false })
        .limit(50)
      return (data || []) as (Booking & { venues: { name: string } | null; profiles: { full_name: string } | null })[]
    },
    enabled: !!profile?.id,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" height="2rem" />
        <Card className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton variant="rect" className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" />
              </div>
              <Skeleton variant="rect" width="80px" height="28px" className="rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<CalendarCheck className="w-12 h-12" />}
        title="Buyurtmalar yo'q"
        description="Hozircha hech qanday buyurtma mavjud emas."
      />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-ink">Buyurtmalar</h1>

      {/* Mobile: card view */}
      <div className="lg:hidden space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{booking.venues?.name || booking.service_name}</p>
                <p className="text-sm text-ink-tertiary mt-1">{booking.profiles?.full_name || 'Noma\'lum'}</p>
              </div>
              <Badge variant={statusConfig[booking.status]?.variant || 'default'} size="sm">
                {statusConfig[booking.status]?.label || booking.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink-tertiary">
                {new Date(booking.created_at).toLocaleDateString('uz-UZ')}
              </span>
              <span className="font-semibold text-ink">
                {booking.total_price.toLocaleString()} so'm
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table view */}
      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Joy</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Mijoz</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Sana</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Holat</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Summa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-ink">{booking.venues?.name || booking.service_name}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{booking.profiles?.full_name || 'Noma\'lum'}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{new Date(booking.created_at).toLocaleDateString('uz-UZ')}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[booking.status]?.variant || 'default'} size="sm">
                    {statusConfig[booking.status]?.label || booking.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-ink text-right">
                  {booking.total_price.toLocaleString()} so'm
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
