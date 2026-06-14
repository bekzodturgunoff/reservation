'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, CalendarCheck, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface SummaryCard {
  label: string
  value: string
  change: number
  icon: typeof TrendingUp
  color: string
}

interface Transaction {
  id: string
  venue: string
  amount: number
  date: string
  type: 'booking' | 'refund'
}

const summaryCards: SummaryCard[] = [
  {
    label: 'Oy uchun jami daromad',
    value: '28 500 000 so\'m',
    change: 12.5,
    icon: DollarSign,
    color: 'text-brand bg-brand-pale',
  },
  {
    label: 'Faol buyurtmalar',
    value: '23',
    change: 8.3,
    icon: CalendarCheck,
    color: 'text-info bg-info-bg',
  },
  {
    label: "O'rtacha buyurtma summasii",
    value: '1 239 000 so\'m',
    change: -2.1,
    icon: TrendingUp,
    color: 'text-warning bg-warning-bg',
  },
]

const recentTransactions: Transaction[] = [
  { id: '1', venue: 'Grand Ballroom', amount: 1500000, date: '2026-06-20', type: 'booking' },
  { id: '2', venue: 'Sky Lounge', amount: 2500000, date: '2026-06-19', type: 'booking' },
  { id: '3', venue: 'Cozy Corner', amount: 500000, date: '2026-06-18', type: 'refund' },
  { id: '4', venue: 'Grand Ballroom', amount: 1500000, date: '2026-06-17', type: 'booking' },
  { id: '5', venue: 'Green Garden', amount: 800000, date: '2026-06-16', type: 'booking' },
]

const dailyRevenue = [
  { day: 'Du', amount: 3200000 },
  { day: 'Se', amount: 4800000 },
  { day: 'Chor', amount: 2500000 },
  { day: 'Pay', amount: 6100000 },
  { day: 'Ju', amount: 3900000 },
  { day: 'Shan', amount: 7200000 },
  { day: 'Yak', amount: 2800000 },
]

const maxRevenue = Math.max(...dailyRevenue.map((d) => d.amount))

export default function RevenuePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-ink">Daromad</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-5">
            {loading ? (
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

      {/* Bar chart mock */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Haftalik daromad</h2>
        <div className="flex items-end gap-3 h-40">
          {dailyRevenue.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-brand rounded-lg transition-all duration-500 ease-out-quart"
                style={{
                  height: `${(day.amount / maxRevenue) * 100}%`,
                  opacity: loading ? 0.3 : 1,
                }}
              />
              <span className="text-xs text-ink-tertiary">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent transactions */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-ink">Oxirgi tranzaksiyalar</h2>
        </div>
        <div className="divide-y divide-border">
          {loading
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
                    <p className="text-sm font-medium text-ink">{tx.venue}</p>
                    <p className="text-xs text-ink-tertiary">{tx.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${tx.type === 'refund' ? 'text-error' : 'text-success'}`}>
                      {tx.type === 'refund' ? 'Qaytarildi' : 'To\'landi'}
                    </span>
                    <span className={`text-sm font-semibold ${tx.type === 'refund' ? 'text-error' : 'text-ink'}`}>
                      {tx.type === 'refund' ? '-' : '+'}{tx.amount.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </Card>
    </div>
  )
}
