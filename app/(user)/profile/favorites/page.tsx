'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Heart, MapPin, Star } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function FavoritesPage() {
  const { user } = useAuthStore()

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['my-favorites', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('favorites')
        .select('*, venues!venue_id(id, name, photos, city, price_per_slot, avg_rating)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return data || []
    },
    enabled: !!user?.id,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-ink">Sevimlilar</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="Sevimlilar ro'yxati bo'sh"
          description="Sizga yoqqan joylarni yurakcha belgilab qo'ying"
        />
      ) : (
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
                    <img src={venue.photos[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
      )}
    </div>
  )
}
