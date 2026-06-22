'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp, CalendarCheck, DollarSign, ArrowUpRight, ArrowDownRight,
  ChevronDown,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Booking } from '@/types'

type Range = '7' | '30' | '90'

interface BusinessRevenueClientProps {
  userId: string
  initialBookings: (Booking & { venues: { name: string } | null })[]
}

export default function BusinessRevenueClient({ userId, initialBookings }: BusinessRevenueClientProps) {
  const { t } = useTranslation()
  const [range, setRange] = useState<Range>('7')

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-revenue', userId],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_id', userId)
      if (!myVenues || myVenues.length === 0) return []
      const venueIds = myVenues.map(v => v.id)
      const { data } = await supabase
        .from('bookings')
        .select('*, venues(name)')
        .in('venue_id', venueIds)
        .order('created_at', { ascending: false })
        .limit(100)
      return (data || []) as (Booking & { venues: { name: string } | null })[]
    },
    enabled: !!userId,
    initialData: initialBookings,
  })

  const confirmed = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings])
  const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0)
  const activeCount = confirmed.length
  const avgOrder = activeCount > 0 ? totalRevenue / activeCount : 0

  const now = new Date()
  const thisMonth = now.toISOString().substring(0, 7)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 7)

  const thisMonthRevenue = confirmed
    .filter(b => b.created_at?.startsWith(thisMonth))
    .reduce((s, b) => s + (b.total_price || 0), 0)
  const lastMonthRevenue = confirmed
    .filter(b => b.created_at?.startsWith(lastMonth))
    .reduce((s, b) => s + (b.total_price || 0), 0)

  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  const rangeDays = parseInt(range)
  const rangeStart = new Date()
  rangeStart.setDate(rangeStart.getDate() - rangeDays)

  const dailyMap: Record<string, number> = {}
  const startStr = rangeStart.toISOString().split('T')[0] ?? ''
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().split('T')[0] ?? ''
    dailyMap[dateKey] = 0
  }
  confirmed.forEach(b => {
    const dateKey = b.created_at?.split('T')[0] ?? ''
    if (dateKey && dateKey >= startStr && dateKey in dailyMap) {
      dailyMap[dateKey] = (dailyMap[dateKey] ?? 0) + (b.total_price || 0)
    }
  })

  const dailyRevenue = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    day: new Date(date).toLocaleDateString('uz', { weekday: 'short' }),
    amount,
  }))

  const cumulativeData = dailyRevenue.reduce<{ date: string; cum: number }[]>((acc, d) => {
    const cum = (acc.length > 0 ? (acc[acc.length - 1]?.cum ?? 0) : 0) + d.amount
    acc.push({ date: d.date, cum })
    return acc
  }, [])

  const recentTransactions = bookings.slice(0, 10)

  const summaryCards = [
    {
      label: t('admin.statsRevenue'),
      value: `${totalRevenue.toLocaleString()} ${t('common.sum')}`,
      change: revenueChange,
      icon: DollarSign,
      color: 'text-brand bg-brand-pale',
    },
    {
      label: t('business.activeBookings'),
      value: activeCount.toString(),
      icon: CalendarCheck,
      color: 'text-info bg-info-bg',
    },
    {
      label: t('business.avgOrderAmount'),
      value: `${avgOrder.toLocaleString()} ${t('common.sum')}`,
      icon: TrendingUp,
      color: 'text-warning bg-warning-bg',
    },
  ]

  if (bookings.length === 0 && !initialBookings.length) {
    return (
      <EmptyState
        icon={<DollarSign className="w-12 h-12" />}
        title={t('business.emptyRevenue')}
        description={t('business.emptyRevenueDesc')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">{t('admin.revenuePage.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              {card.change !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.change >= 0 ? 'text-success' : 'text-error'}`}>
                  {card.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(card.change)}%
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-ink-tertiary">{card.label}</p>
            <p className="mt-0.5 text-xl font-semibold text-ink">{card.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-ink">{t('business.dailyRevenue')}</h2>
          <div className="relative">
            <select
              value={range}
              onChange={e => setRange(e.target.value as Range)}
              className="appearance-none h-9 pl-3 pr-8 text-sm bg-white border border-border rounded-lg outline-none text-ink-secondary"
            >
              <option value="7">{t('business.days7')}</option>
              <option value="30">{t('business.days30')}</option>
              <option value="90">{t('business.days90')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          </div>
        </div>
        {dailyRevenue.some(d => d.amount > 0) ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRevenue} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(v) => `${(v as number).toLocaleString()} ${t('common.sum')}`}
                  labelFormatter={l => l}
                />
                <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-ink-tertiary py-10 text-center">{t('business.noRevenueData')}</p>
        )}
      </Card>

      {range === '30' && (
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-ink mb-4">{t('business.cumulativeRevenue')}</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => `${(v as number).toLocaleString()} ${t('common.sum')}`} />
                <Line type="monotone" dataKey="cum" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display text-sm font-bold text-ink">{t('business.recentTransactions')}</h2>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-ink-tertiary">{t('business.noTransactions')}</div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                <div>
                  <p className="text-sm font-medium text-ink">{tx.venues?.name || tx.service_name}</p>
                  <p className="text-xs text-ink-tertiary">{tx.created_at ? new Date(tx.created_at).toLocaleDateString('uz-UZ') : '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${tx.status === 'cancelled' ? 'text-error' : 'text-success'}`}>
                    {tx.status === 'cancelled' ? t('business.refunded') : t('business.paid')}
                  </span>
                  <span className={`text-sm font-semibold ${tx.status === 'cancelled' ? 'text-error' : 'text-ink'}`}>
                    {tx.status === 'cancelled' ? '-' : '+'}{(tx.total_price || 0).toLocaleString()} {t('common.sum')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
