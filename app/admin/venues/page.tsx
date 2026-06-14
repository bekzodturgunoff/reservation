'use client'

import { useState, useEffect } from 'react'
import { Building2, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { BadgeVariant } from '@/components/ui/Badge'

interface MockVenue {
  id: string
  name: string
  owner: string
  category: string
  city: string
  status: 'active' | 'pending' | 'inactive'
  price: number
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Faol', variant: 'success' },
  pending: { label: 'Kutilmoqda', variant: 'warning' },
  inactive: { label: 'Nofaol', variant: 'default' },
}

const mockVenues: MockVenue[] = [
  { id: '1', name: 'Grand Ballroom', owner: 'Zarina Ahmedova', category: 'Restoran', city: 'Toshkent', status: 'active', price: 1500000 },
  { id: '2', name: 'Sky Lounge', owner: 'Shavkat Mirzaev', category: 'Kafe', city: 'Toshkent', status: 'active', price: 2500000 },
  { id: '3', name: 'Green Garden', owner: 'Bobur Ismoilov', category: 'Ochiq maydon', city: 'Samarqand', status: 'pending', price: 800000 },
  { id: '4', name: 'Cozy Corner', owner: 'Malika Azizova', category: 'Studiya', city: 'Toshkent', status: 'inactive', price: 500000 },
  { id: '5', name: 'Oqshom Saroyi', owner: 'Dilnoza Rahimova', category: 'Banket zali', city: 'Buxoro', status: 'pending', price: 2000000 },
  { id: '6', name: 'Moviy Moyil', owner: 'Lola Abdurahmonova', category: 'Kafe', city: 'Farg\'ona', status: 'active', price: 600000 },
]

export default function AdminVenuesPage() {
  const [loading, setLoading] = useState(true)
  const [venues, setVenues] = useState<MockVenue[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setVenues(mockVenues)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" height="2rem" />
        <Card className="overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="50%" />
                </div>
                <Skeleton variant="rect" width="80px" height="24px" className="rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="w-12 h-12" />}
        title="Joylar yo'q"
        description="Hozircha hech qanday joy mavjud emas."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Barcha joylar</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Platformadagi barcha joylarni boshqarish.</p>
      </div>

      {/* Mobile: card view */}
      <div className="lg:hidden space-y-3">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{venue.name}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">{venue.owner} • {venue.category}</p>
                <p className="text-xs text-ink-tertiary">{venue.city}</p>
              </div>
              <Badge variant={statusConfig[venue.status].variant} size="sm">
                {statusConfig[venue.status].label}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                {venue.price.toLocaleString()} so'm
              </span>
              {venue.status === 'pending' && (
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg text-success hover:bg-success-bg transition-colors" title="Tasdiqlash">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg text-error hover:bg-error-bg transition-colors" title="Rad etish">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Joy nomi</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Egasi</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Kategoriya</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Shahar</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Holat</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Narxi</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-ink">{venue.name}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.owner}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.category}</td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{venue.city}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[venue.status].variant} size="sm">
                    {statusConfig[venue.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-ink text-right">
                  {venue.price.toLocaleString()} so'm
                </td>
                <td className="px-6 py-4 text-right">
                  {venue.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-2 rounded-xl text-success hover:bg-success-bg transition-colors"
                        title="Tasdiqlash"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-xl text-error hover:bg-error-bg transition-colors"
                        title="Rad etish"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors"
                      title={venue.status === 'active' ? 'Nofaol qilish' : 'Faol qilish'}
                    >
                      {venue.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
