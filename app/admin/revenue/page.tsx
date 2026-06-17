'use client'

import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, DollarSign, Building2, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'

export default function AdminRevenuePage() {
  const { t } = useTranslation()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('total_price, status, created_at')
        .order('created_at', { ascending: true })
      return (data || []) as { total_price: number; status: string; created_at: string }[]
    },
  })

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
  const platformFee = Math.round(totalRevenue * 0.08)

  const { data: avgRating = 0 } = useQuery({
    queryKey: ['admin-avg-rating'],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('avg_rating')
        .not('avg_rating', 'is', null)
      const ratings = (data || []).map(v => v.avg_rating).filter(Boolean) as number[]
      if (ratings.length === 0) return 0
      return ratings.reduce((a, b) => a + b, 0) / ratings.length
    },
  })

  const { data: premiumCount = 0 } = useQuery({
    queryKey: ['admin-premium-venues'],
    queryFn: async () => {
      const { count } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      return count || 0
    },
  })

  const stats = [
    { label: t('admin.statsRevenue'), value: `${(totalRevenue / 1e9).toFixed(1)} ${t('admin.revenuePage.billionSuffix')}`, change: '', icon: DollarSign, color: 'text-brand bg-brand-pale' },
    { label: t('admin.revenuePage.platformFee'), value: `${(platformFee / 1e6).toFixed(0)} ${t('admin.revenuePage.millionSuffix')}`, change: '', icon: TrendingUp, color: 'text-info bg-info-bg' },
    { label: t('admin.revenuePage.activeVenues'), value: premiumCount.toString(), change: '', icon: Building2, color: 'text-warning bg-warning-bg' },
    { label: t('admin.revenuePage.avgRating'), value: avgRating.toFixed(1), change: '', icon: Star, color: 'text-success bg-success-bg' },
  ]

  const breakdown = [
    { label: t('admin.revenuePage.platformFee'), amount: platformFee, percent: 100, color: 'bg-brand' },
  ]

  const monthlyMap: Record<string, number> = {}
  confirmedBookings.forEach(b => {
    if (!b.created_at) return
    const monthKey = b.created_at.substring(0, 7)
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + (b.total_price || 0)
  })

  const monthNames = t('common.months.short', { returnObjects: true }) as string[]
  const monthlyRevenue = Object.entries(monthlyMap).map(([key, amount]) => ({
    month: monthNames[parseInt(key.split('-')[1]) - 1] || key,
    amount: Math.round(amount / 1e6),
  }))

  const maxMonthly = Math.max(...monthlyRevenue.map(d => d.amount), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">{t('admin.revenuePage.title')}</h1>
        <p className="mt-1 text-sm text-ink-tertiary">{t('admin.revenuePage.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height="1.5rem" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-medium text-success">{stat.change}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-ink-tertiary">{stat.label}</p>
                <p className="mt-0.5 text-xl font-semibold text-ink">{stat.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink mb-4">{t('admin.revenuePage.breakdown')}</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rect" className="w-full h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-ink-secondary">{item.label}</span>
                    <span className="font-medium text-ink">{(item.amount / 1e6).toFixed(0)} {t('admin.revenuePage.millionSuffix')}</span>
                  </div>
                  <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink mb-4">{t('admin.revenuePage.monthlyChart')}</h2>
          <div className="flex items-end gap-2 h-48">
            {monthlyRevenue.length === 0 && !isLoading && (
              <p className="text-sm text-ink-tertiary">{t('admin.revenuePage.noData')}</p>
            )}
            {monthlyRevenue.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2 relative group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-[11px] px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                  {month.amount} {t('admin.revenuePage.millionSuffix')}
                </div>
                <div
                  className="w-full bg-brand rounded-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((month.amount / maxMonthly) * 100, 4)}%`,
                    opacity: isLoading ? 0.3 : 1,
                  }}
                />
                <span className="text-[10px] text-ink-tertiary">{month.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
