'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Building2,
  CalendarCheck,
  TrendingUp,
  MessageSquare,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  href,
  color,
}: {
  label: string
  value: string
  icon: typeof Building2
  trend?: { value: string; positive: boolean }
  href?: string
  color: string
}) {
  const content = (
    <Card className="p-5 hover:shadow-card-hover transition-shadow group cursor-default">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} transition-colors`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
            <svg className={`w-3 h-3 ${trend.positive ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-ink-tertiary">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-ink">{value}</p>
      {href && (
        <div className="mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium text-brand flex items-center gap-1">
            Batafsil <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </Card>
  )

  if (href) return <Link href={href} className="block">{content}</Link>
  return content
}

export default function BusinessDashboard() {
  const { profile } = useAuthStore()

  const { data: venueCount = 0, isLoading: venuesLoading } = useQuery({
    queryKey: ['my-venues-count', profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', profile!.id)
      return count || 0
    },
    enabled: !!profile?.id,
  })

  const today = new Date().toISOString().split('T')[0]

  const { data: todayBookings = 0, isLoading: bookingsLoading } = useQuery({
    queryKey: ['today-bookings-count', profile?.id, today],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', profile!.id)
      if (!myVenues || myVenues.length === 0) return 0
      const venueIds = myVenues.map(v => v.id)
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('venue_id', venueIds)
        .gte('created_at', today)
        .lt('created_at', new Date(Date.now() + 86400000).toISOString().split('T')[0])
      return count || 0
    },
    enabled: !!profile?.id,
  })

  const { data: monthlyRevenue = 0, isLoading: revenueLoading } = useQuery({
    queryKey: ['monthly-revenue', profile?.id],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', profile!.id)
      if (!myVenues || myVenues.length === 0) return 0
      const venueIds = myVenues.map(v => v.id)
      const monthStart = new Date()
      monthStart.setDate(1)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price')
        .in('venue_id', venueIds)
        .gte('created_at', monthStart.toISOString().split('T')[0])
        .eq('status', 'confirmed')
      return (bookings || []).reduce((sum, b) => sum + (b.total_price || 0), 0)
    },
    enabled: !!profile?.id,
  })

  const { data: reviewCount = 0, isLoading: reviewsLoading } = useQuery({
    queryKey: ['my-reviews-count', profile?.id],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', profile!.id)
      if (!myVenues || myVenues.length === 0) return 0
      const venueIds = myVenues.map(v => v.id)
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .in('venue_id', venueIds)
      return count || 0
    },
    enabled: !!profile?.id,
  })

  const loading = venuesLoading || bookingsLoading || revenueLoading || reviewsLoading

  const { data: recentBookings = [] } = useQuery({
    queryKey: ['my-recent-bookings', profile?.id],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_id', profile!.id)
      if (!myVenues || myVenues.length === 0) return []
      const venueIds = myVenues.map(v => v.id)
      const venueMap = Object.fromEntries(myVenues.map(v => [v.id, v.name]))
      const { data } = await supabase
        .from('bookings')
        .select('*, profiles(full_name)')
        .in('venue_id', venueIds)
        .order('created_at', { ascending: false })
        .limit(5)
      return (data || []).map(b => ({
        id: b.id,
        venue_name: venueMap[b.venue_id] || 'Noma\'lum',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customer: (b as any).profiles?.full_name || '—',
        total_price: b.total_price || 0,
        status: b.status,
        date: new Date(b.created_at).toLocaleDateString('uz-UZ'),
      }))
    },
    enabled: !!profile?.id,
  })

  const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
    confirmed: { label: 'Tasdiqlangan', variant: 'success' },
    completed: { label: 'Yakunlangan', variant: 'default' },
    cancelled: { label: 'Bekor qilingan', variant: 'error' },
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-brand to-emerald-800 border-0">
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-white">
          Xush kelibsiz, {profile?.full_name?.split(' ')[0] || 'Foydalanuvchi'}
        </h1>
        <p className="mt-1.5 text-brand-100 text-sm sm:text-base">
          Biznes panelga xush kelibsiz. Bugungi faoliyatingizni kuzatib boring.
        </p>
      </Card>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="space-y-3">
                <Skeleton variant="rect" className="w-11 h-11 rounded-xl" />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="80%" height="1.75rem" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Faol joylar"
            value={venueCount.toLocaleString()}
            icon={Building2}
            href="/business/venues"
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Bugungi buyurtmalar"
            value={todayBookings.toLocaleString()}
            icon={CalendarCheck}
            href="/business/bookings"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Oylik daromad"
            value={`${(monthlyRevenue / 1e6).toFixed(1)} mln so'm`}
            icon={TrendingUp}
            href="/business/revenue"
            color="bg-violet-50 text-violet-600"
          />
          <StatCard
            label="Yangi sharhlar"
            value={reviewCount.toLocaleString()}
            icon={MessageSquare}
            color="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {/* Recent bookings */}
      <Card>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Oxirgi buyurtmalar</h2>
          <Link href="/business/bookings" className="text-xs font-medium text-brand hover:underline">
            Barchasi
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="rect" className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarCheck className="w-8 h-8 mx-auto text-ink-muted mb-2" />
            <p className="text-sm text-ink-secondary">Hali buyurtmalar yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map((b) => {
              const cfg = statusConfig[b.status] || { label: b.status, variant: 'default' as const }
              return (
                <div key={b.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-surface-subtle transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{b.venue_name}</p>
                    <p className="text-xs text-ink-tertiary">
                      {b.customer} · {b.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-ink">{b.total_price.toLocaleString()} UZS</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-0.5
                      ${cfg.variant === 'success' ? 'bg-success-bg text-success' :
                        cfg.variant === 'error' ? 'bg-error-bg text-error' :
                        'bg-surface-bg text-ink-secondary'}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
