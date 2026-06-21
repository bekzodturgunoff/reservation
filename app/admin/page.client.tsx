'use client'

import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Users,
  Building2,
  CalendarCheck,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/constants/routes'

interface RoleDistributionItem {
  key: string
  value: number
  percent: number
}

interface RecentUser {
  name: string
  email: string
  role: string
  date: string
}

interface AdminDashboardClientProps {
  userCount: number
  venueCount: number
  bookingCount: number
  totalRevenue: number
  roleDistribution: RoleDistributionItem[]
  recentUsers: RecentUser[]
}

export default function AdminDashboardClient({
  userCount: initialUserCount,
  venueCount: initialVenueCount,
  bookingCount: initialBookingCount,
  totalRevenue: initialTotalRevenue,
  roleDistribution: initialRoleDistribution,
  recentUsers: initialRecentUsers,
}: AdminDashboardClientProps) {
  const { t } = useTranslation()

  const { data: userCount = 0, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      return count || 0
    },
    initialData: initialUserCount,
  })

  const { data: venueCount = 0, isLoading: venuesLoading } = useQuery({
    queryKey: ['admin-venue-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('venues')
        .select('id', { count: 'exact', head: true })
      return count || 0
    },
    initialData: initialVenueCount,
  })

  const { data: bookingCount = 0, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-booking-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
      return count || 0
    },
    initialData: initialBookingCount,
  })

  const { data: totalRevenueData = 0, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-total-revenue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'confirmed')
      return (data || []).reduce((sum, b) => sum + (b.total_price || 0), 0)
    },
    initialData: initialTotalRevenue,
  })

  const { data: roleData = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-role-distribution'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('role')
      if (!data || data.length === 0) return []
      const counts: Record<string, number> = {}
      data.forEach(p => { counts[p.role] = (counts[p.role] || 0) + 1 })
      const total = data.length
      return Object.entries(counts).map(([role, value]) => ({
        label: t(`admin.roles.${role}`),
        key: role,
        value,
        percent: Math.round((value / total) * 100),
      }))
    },
    initialData: initialRoleDistribution.map(r => ({
      ...r,
      label: t(`admin.roles.${r.key}`),
    })),
  })

  const { data: recentUsers = [], isLoading: recentLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      return (data || []).map(p => ({
        name: p.full_name,
        email: p.phone || '',
        role: p.role,
        date: new Date(p.created_at).toISOString().split('T')[0] ?? '',
      }))
    },
    initialData: initialRecentUsers,
  })

  const loading = usersLoading || venuesLoading || bookingsLoading || revenueLoading || rolesLoading || recentLoading

  const roleColors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-700',
    business: 'bg-brand-pale text-brand',
    admin: 'bg-purple-50 text-purple-700',
    blocked: 'bg-error-bg text-error',
  }

  const roleBarColors: Record<string, string> = {
    user: 'bg-ink-muted',
    business: 'bg-brand',
    admin: 'bg-purple-500',
    blocked: 'bg-error',
  }

  const statCards = [
    { label: t('admin.statsUsers'), value: userCount.toLocaleString(), icon: Users, href: '/admin/users', color: 'bg-blue-50 text-blue-600' },
    { label: t('admin.statsVenues'), value: venueCount.toLocaleString(), icon: Building2, href: '/admin/venues', color: 'bg-violet-50 text-violet-600' },
    { label: t('admin.statsBookings'), value: bookingCount.toLocaleString(), icon: CalendarCheck, href: '', color: 'bg-emerald-50 text-emerald-600' },
    { label: t('admin.statsRevenue'), value: `${(totalRevenueData / 1e9).toFixed(1)} ${t('admin.revenuePage.billionSuffix')}`, icon: TrendingUp, href: '/admin/revenue', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">{t('admin.dashboard')}</h1>
        <p className="mt-1 text-sm text-ink-tertiary">{t('admin.subtitle')}</p>
      </div>

      {/* Stats */}
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
          {statCards.map((stat) => {
            const content = (
              <Card className="p-5 hover:shadow-card-hover transition-shadow cursor-default">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="mt-4 text-sm text-ink-tertiary">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-ink">{stat.value}</p>
                {stat.href && (
                  <div className="mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-brand flex items-center gap-1">
                      {t('admin.moreDetails')} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </Card>
            )
            if (stat.href) return <Link key={stat.label} href={stat.href} className="block group">{content}</Link>
            return <div key={stat.label} className="group">{content}</div>
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role distribution */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-ink mb-4">{t('admin.userRoles')}</h2>
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="rect" className="w-full h-4 rounded-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="text" width="60%" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex h-3 rounded-full overflow-hidden">
                {roleData.map((role) => (
                    <div
                      key={role.label}
                      className={roleBarColors[role.key] || 'bg-ink-muted'}
                      style={{ width: `${role.percent}%` }}
                    />
                ))}
              </div>
              <div className="space-y-3">
                {roleData.map((role) => (
                  <div key={role.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${roleBarColors[role.key] || 'bg-ink-muted'}`} />
                      <span className="text-ink-secondary">{role.label}</span>
                    </div>
                    <span className="font-medium text-ink">{role.value.toLocaleString()} ({role.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Recent users */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">{t('admin.recentUsers')}</h2>
            <Link href={ROUTES.ADMIN_USERS} className="text-xs font-medium text-brand hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="circle" className="w-8 h-8" />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="60%" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 mx-auto text-ink-muted mb-2" />
              <p className="text-sm text-ink-secondary">{t('admin.noUsers')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentUsers.map((user, i) => (
                <div key={i} className="px-6 py-3.5 flex items-center gap-3 hover:bg-surface-subtle transition-colors">
                  <div className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-sm font-semibold text-ink-tertiary shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                    <p className="text-xs text-ink-tertiary">{user.email || '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${roleColors[user.role] || 'bg-surface-subtle text-ink-secondary'}`}>
                      {t(`admin.roles.${user.role}`)}
                    </span>
                    <span className="text-xs text-ink-tertiary">{user.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
