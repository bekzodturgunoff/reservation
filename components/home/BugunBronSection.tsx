'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { MapPin, ChevronRight } from 'lucide-react'
import type { Venue } from '@/types'

const quickFilters = [
  { label: "Hozir", value: 'now' },
  { label: 'Kechqurun (18:00–22:00)', value: 'evening' },
  { label: 'Tun (22:00+)', value: 'night' },
]

export function BugunBronSection() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const { data: todayVenues = [], isLoading } = useQuery({
    queryKey: ['today-venues'],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(name_uz, icon)')
        .eq('status', 'active')
        .limit(6)
      return (data || []).slice(0, 4) as Venue[]
    },
  })

  return (
    <section className="bg-surface-subtle py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Bugun mavjud joylar
            </h2>
            <p className="mt-2 text-sm text-ink-tertiary">
              Ayni damda bo'sh bo'lgan joylarni toping
            </p>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-brand hover:underline flex items-center gap-1"
          >
            Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Time filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(activeFilter === f.value ? null : f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeFilter === f.value
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-ink-secondary border-border hover:border-border-strong'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-card overflow-hidden shadow-card">
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </div>
              </div>
            ))}
          </div>
        ) : todayVenues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <p className="text-ink-tertiary text-sm">Bugun uchun mavjud joylar hozircha yo'q</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {todayVenues.map((venue) => {
              const price = venue.price_per_slot || 0
              const cat = venue.categories as { name_uz?: string; icon?: string } | null
              return (
                <Link
                  key={venue.id}
                  href={`/venues/${venue.id}`}
                  className="group bg-white rounded-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={venue.photos?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                      {cat?.icon || '🏢'} {cat?.name_uz || ''}
                    </span>
                    <span className="absolute bottom-3 left-3 text-xs text-white bg-brand/80 px-2.5 py-1 rounded-full">
                      Bugun bo'sh
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-ink truncate">{venue.name}</h3>
                    <p className="text-xs text-ink-tertiary mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {venue.city}{venue.district ? `, ${venue.district}` : ''}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <p className="text-base font-bold text-ink">
                        {price.toLocaleString()} UZS
                      </p>
                      <span className="text-xs font-semibold text-brand group-hover:underline">
                        Bron qilish
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
