'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit3, Eye, Trash2, MapPin, Star, ImageIcon, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { BadgeVariant } from '@/components/ui/Badge'

interface MockVenue {
  id: string
  name: string
  address: string
  city: string
  price_per_slot: number
  avg_rating: number
  status: 'active' | 'pending' | 'inactive'
  photo: string
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Faol', variant: 'success' },
  pending: { label: 'Kutilmoqda', variant: 'warning' },
  inactive: { label: 'Nofaol', variant: 'error' },
}

const mockVenues: MockVenue[] = [
  {
    id: '1',
    name: 'Grand Ballroom',
    address: "Amir Temur shoh ko'chasi, 15",
    city: 'Toshkent',
    price_per_slot: 1500000,
    avg_rating: 4.8,
    status: 'active',
    photo: '',
  },
  {
    id: '2',
    name: 'Sky Lounge',
    address: 'Minor mozor, 7',
    city: 'Toshkent',
    price_per_slot: 2500000,
    avg_rating: 4.5,
    status: 'active',
    photo: '',
  },
  {
    id: '3',
    name: 'Green Garden',
    address: "Bog' ko'chasi, 22",
    city: 'Samarqand',
    price_per_slot: 800000,
    avg_rating: 4.2,
    status: 'pending',
    photo: '',
  },
  {
    id: '4',
    name: 'Cozy Corner',
    address: 'Navoiy ko\'chasi, 5',
    city: 'Toshkent',
    price_per_slot: 500000,
    avg_rating: 0,
    status: 'inactive',
    photo: '',
  },
]

export default function VenuesPage() {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="200px" height="2rem" />
          <Skeleton variant="rect" width="160px" height="40px" className="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <Skeleton variant="rect" className="w-full h-44" />
              <div className="p-5 space-y-3">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="w-12 h-12" />}
        title="Hozircha joylar yo'q"
        description="Biznesingizni boshlash uchun birinchi joyni qo'shing."
        action={{
          label: "Yangi joy qo'shish",
          onClick: () => window.location.href = '/business/venues/add',
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-ink">Mening joylarim</h1>
        <Link href="/business/venues/add">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Yangi joy qo'shish
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-0 overflow-hidden">
            <div className="relative h-44 bg-surface-subtle flex items-center justify-center overflow-hidden">
              {venue.photo ? (
                <img src={venue.photo} alt={venue.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-ink-muted" />
              )}
              <div className="absolute top-3 right-3">
                <Badge variant={statusConfig[venue.status].variant} size="sm">
                  {statusConfig[venue.status].label}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{venue.name}</h3>
                  <p className="mt-1 text-sm text-ink-tertiary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {venue.city}, {venue.address}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {venue.price_per_slot.toLocaleString()} so'm
                  </span>
                  {venue.avg_rating > 0 && (
                    <span className="text-sm text-ink-tertiary flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      {venue.avg_rating}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors" title="Tahrirlash">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-ink-secondary transition-colors" title="Ko'rish">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors" title="O'chirish">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
