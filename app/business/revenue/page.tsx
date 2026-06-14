'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, CalendarCheck, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import type { Booking } from '@/types'

export default function RevenuePage() {
  const { profile } = useAuthStore()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-revenue', profile?.id],
    queryFn: async () => {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_id', profile!.id)
      if (!myVenues || myVenues.length === 0) return []
      const venueIds = myVenues.map(v => v.id)
      const { data } = await supabase
        .from('bookings')
        .select('*, venues(name)')
        .in('venue_id', venueIds)
        .order('created_at', { ascending: false })
        .limit(50)
      return (data || []) as (Booking & { venues: { name: string } | null })[]
    },
    enabled: !!profile?.id,
  })

  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_price, 0)
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length
  const avgOrder = confirmed.length > 0 ? totalRevenue / confirmed.length : 0

  const now = new Date()
  const thisMonth = now.toISOString().substring(0, 7)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 7)

  const thisMonthRevenue = confirmed
    .filter(b => b.created_at?.startsWith(thisMonth))
    .reduce((s, b) => s + b.total_price, 0)
  const lastMonthRevenue = confirmed
    .filter(b => b.created_at?.startsWith(lastMonth))
    .reduce((s, b) => s + b.total_price, 0)

  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  const thisMonthCount = confirmed.filter(b => b.created_at?.startsWith(thisMonth)).length
  const lastMonthCount = confirmed.filter(b => b.created_at?.startsWith(lastMonth)).length
  const bookingsChange = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : 0

  const summaryCards = [
    {
      label: 'Oy uchun jami daromad',
      value: `${totalRevenue.toLocaleString()} so'm`,
      change: revenueChange,
      icon: DollarSign,
      color: 'text-brand bg-brand-pale',
    },
    {
      label: 'Faol buyurtmalar',
      value: activeBookings.toString(),
      change: bookingsChange,
      icon: CalendarCheck,
      color: 'text-info bg-info-bg',
    },
    {
      label: "O'rtacha buyurtma summasi",
      value: `${avgOrder.toLocaleString()} so'm`,
      change: 0,
      icon: TrendingUp,
      color: 'text-warning bg-warning-bg',
    },
  ]

  const dailyRevenue = (() => {
    const days: Record<string, number> = {}
    const dayNames = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan']
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days[d.toISOString().split('T')[0]] = 0
    }
    confirmed.forEach(b => {
      const dateKey = b.created_at?.split('T')[0]
      if (dateKey && dateKey in days) {
        days[dateKey] += b.total_price
      }
    })
    return Object.entries(days).map(([date, amount]) => ({
      day: dayNames[new Date(date).getDay()],
      amount,
    }))
  })()

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.amount), 1)

  const recentTransactions = bookings.slice(0, 10)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-ink">Daromad</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height="1.5rem" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${card.change >= 0 ? 'text-success' : 'text-error'}`}>
                    {card.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(card.change)}%
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-tertiary">{card.label}</p>
                <p className="mt-0.5 text-xl font-semibold text-ink">{card.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Haftalik daromad</h2>
        <div className="flex items-end gap-3 h-40" role="img" aria-label={`Haftalik daromad: ${dailyRevenue.map(d => `${d.day} ${d.amount.toLocaleString()} so'm`).join(', ')}`}>
          {dailyRevenue.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2 relative group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-[11px] px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                {day.amount.toLocaleString()} so'm
              </div>
              <div
                className="w-full bg-brand rounded-lg transition-all duration-500"
                style={{
                  height: `${Math.max((day.amount / maxRevenue) * 100, 4)}%`,
                  opacity: isLoading ? 0.3 : 1,
                }}
              />
              <span className="text-xs text-ink-tertiary">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-ink">Oxirgi tranzaksiyalar</h2>
        </div>
        <div className="divide-y divide-border">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton variant="text" width="140px" />
                    <Skeleton variant="text" width="80px" />
                  </div>
                  <Skeleton variant="text" width="100px" />
                </div>
              ))
            : recentTransactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                  <div>
                    <p className="text-sm font-medium text-ink">{tx.venues?.name || tx.service_name}</p>
                    <p className="text-xs text-ink-tertiary">{new Date(tx.created_at).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${tx.status === 'cancelled' ? 'text-error' : 'text-success'}`}>
                      {tx.status === 'cancelled' ? 'Qaytarildi' : 'To\'landi'}
                    </span>
                    <span className={`text-sm font-semibold ${tx.status === 'cancelled' ? 'text-error' : 'text-ink'}`}>
                      {tx.status === 'cancelled' ? '-' : '+'}{tx.total_price.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </Card>
    </div>
  )
}
