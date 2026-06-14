'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { BadgeVariant } from '@/components/ui/Badge'

interface MockBooking {
  id: string
  venue: string
  customer: string
  date: string
  time: string
  status: 'confirmed' | 'cancelled' | 'completed'
  amount: number
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Tasdiqlangan', variant: 'success' },
  completed: { label: 'Yakunlangan', variant: 'default' },
  cancelled: { label: 'Bekor qilingan', variant: 'error' },
}

const mockBookings: MockBooking[] = [
  { id: '1', venue: 'Grand Ballroom', customer: 'Ali Karimov', date: '2026-06-20', time: '14:00', status: 'confirmed', amount: 1500000 },
  { id: '2', venue: 'Sky Lounge', customer: 'Zarina Ahmedova', date: '2026-06-21', time: '18:00', status: 'confirmed', amount: 2500000 },
  { id: '3', venue: 'Grand Ballroom', customer: 'Bobur Ismoilov', date: '2026-06-18', time: '10:00', status: 'completed', amount: 1500000 },
  { id: '4', venue: 'Green Garden', customer: 'Dilnoza Rahimova', date: '2026-06-22', time: '16:00', status: 'confirmed', amount: 800000 },
  { id: '5', venue: 'Cozy Corner', customer: 'Jasur Toshmatov', date: '2026-06-15', time: '12:00', status: 'cancelled', amount: 500000 },
  { id: '6', venue: 'Sky Lounge', customer: 'Malika Azizova', date: '2026-06-23', time: '20:00', status: 'confirmed', amount: 2500000 },
]

export default function BookingsPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<MockBooking[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBookings(mockBookings)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
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
                <p className="font-medium text-ink">{booking.venue}</p>
                <p className="text-sm text-ink-tertiary mt-1">{booking.customer}</p>
              </div>
              <Badge variant={statusConfig[booking.status].variant} size="sm">
                {statusConfig[booking.status].label}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink-tertiary">
                {booking.date} • {booking.time}
              </span>
              <span className="font-semibold text-ink">
                {booking.amount.toLocaleString()} so'm
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
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Vaqt</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Holat</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Summa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-ink">{booking.venue}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{booking.customer}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{booking.date}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{booking.time}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[booking.status].variant} size="sm">
                    {statusConfig[booking.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-ink text-right">
                  {booking.amount.toLocaleString()} so'm
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
