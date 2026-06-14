'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Building2, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const stats = [
  { label: 'Jami daromad', value: '8.2 mlrd so\'m', change: '+18.5%', icon: DollarSign, color: 'text-brand bg-brand-pale' },
  { label: 'Platforma to\'lovlari (8%)', value: '656 mln so\'m', change: '+18.5%', icon: TrendingUp, color: 'text-info bg-info-bg' },
  { label: 'Premium joylar', value: '24', change: '+4', icon: Building2, color: 'text-warning bg-warning-bg' },
  { label: "O'rtacha reyting", value: '4.6', change: '+0.2', icon: Star, color: 'text-success bg-success-bg' },
]

const breakdown = [
  { label: 'Platforma to\'lovlari', amount: 656000000, percent: 65, color: 'bg-brand' },
  { label: 'Premium listinglar', amount: 246000000, percent: 24, color: 'bg-info' },
  { label: 'Promo aksiyalar', amount: 110000000, percent: 11, color: 'bg-warning' },
]

const monthlyRevenue = [
  { month: 'Yan', amount: 520 },
  { month: 'Fev', amount: 580 },
  { month: 'Mar', amount: 610 },
  { month: 'Apr', amount: 590 },
  { month: 'May', amount: 650 },
  { month: 'Iyun', amount: 720 },
  { month: 'Iyl', amount: 680 },
  { month: 'Avg', amount: 750 },
  { month: 'Sen', amount: 820 },
  { month: 'Okt', amount: 780 },
  { month: 'Noy', amount: 710 },
  { month: 'Dek', amount: 760 },
]

const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.amount))

export default function AdminRevenuePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Daromad</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Platforma daromadlari haqida umumiy ma'lumot.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            {loading ? (
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
                  <span className="text-xs font-medium text-success">{stat.change}</span>
                </div>
                <p className="mt-3 text-sm text-ink-tertiary">{stat.label}</p>
                <p className="mt-0.5 text-xl font-semibold text-ink">{stat.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue breakdown */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink mb-4">Daromad tahlili</h2>
          {loading ? (
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
                    <span className="font-medium text-ink">{(item.amount / 1e6).toFixed(0)} mln so'm</span>
                  </div>
                  <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Monthly revenue chart */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink mb-4">Oylik daromad (mln so'm)</h2>
          <div className="flex items-end gap-2 h-48">
            {monthlyRevenue.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-brand rounded-lg transition-all duration-500 ease-out-quart"
                  style={{
                    height: `${(month.amount / maxRevenue) * 100}%`,
                    opacity: loading ? 0.3 : 1,
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
