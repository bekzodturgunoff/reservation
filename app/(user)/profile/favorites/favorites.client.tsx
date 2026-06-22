'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Star } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTitle } from '@/hooks/useTitle'

interface FavoriteVenueData {
  id: string
  name: string
  photos: string[]
  city: string
  price_per_slot: number
  avg_rating: number | null
}

interface FavoriteItem {
  id: string
  venue_id: string
  created_at: string
  venues: FavoriteVenueData | null
}

interface FavoritesClientProps {
  favorites: FavoriteItem[]
}

export function FavoritesClient({ favorites }: FavoritesClientProps) {
  useTitle('Sevimlilar — BronUz')

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-ink">Sevimlilar</h1>
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="Sevimlilar ro'yxati bo'sh"
          description="Sizga yoqqan joylarni yurakcha belgilab qo'ying"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-ink">Sevimlilar</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {favorites.map((fav) => {
          const venue = fav.venues
          if (!venue) return null
          return (
            <Link
              key={fav.id}
              href={`/venues/${venue.id}`}
              className="group block rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-surface-subtle relative overflow-hidden">
                {venue.photos?.[0] ? (
                  <Image src={venue.photos[0]} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="160px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-muted">
                    <Heart className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink group-hover:text-brand transition-colors truncate">{venue.name}</h3>
                <p className="text-xs text-ink-tertiary mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {venue.city}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-ink">{venue.price_per_slot?.toLocaleString()} UZS</span>
                  {venue.avg_rating ? (
                    <span className="text-xs text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      {venue.avg_rating}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
