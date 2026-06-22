'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Category } from '@/types'

interface CategoryWithMeta extends Category {
  count: number
  icon: string
}

const CATEGORY_ICONS: Record<string, string> = {
  cafe: '☕', restaurant: '🍽️', football: '⚽', sport: '🏋️',
  karaoke: '🎤', coworking: '💻', banquet: '🎂', beauty: '🧖',
  bowling: '🎳', gaming: '🎮', pool: '🏊', lasertag: '🎯',
  photostudio: '📸', recording: '🎵',
}

export function CategoryGrid() {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const { data: rawCategories = [], isLoading } = useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: async () => {
      const { data: cats } = await supabase.from('categories').select('id, slug, name_uz, name_ru, icon')
      if (!cats) return []
      const { data: venues } = await supabase.from('venues').select('category_id').eq('status', 'active')
      const counts: Record<number, number> = {}
      venues?.forEach(v => { counts[v.category_id] = (counts[v.category_id] || 0) + 1 })
      return (cats as Category[]).map(c => ({
        ...c,
        count: counts[c.id] || 0,
        icon: CATEGORY_ICONS[c.slug] || '🏢',
      })) as CategoryWithMeta[]
    },
  })

  const categories = (rawCategories as CategoryWithMeta[]).filter(
    (cat, index, self) => index === self.findIndex((c) => c.slug === cat.slug)
  )
  const curated = categories.slice(0, 8)
  const extra = categories.slice(8)
  const displayed = expanded ? categories : curated

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center">
          {t('home.categoryQuestion')}
        </h2>
        <p className="mt-2 text-sm text-ink-tertiary text-center max-w-md mx-auto">
          {t('home.categorySubtitle')}
        </p>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-surface-subtle text-center">
                <Skeleton variant="circle" className="w-12 h-12 mx-auto" />
                <Skeleton variant="text" width="60%" className="mt-3 mx-auto" />
                <Skeleton variant="text" width="40%" className="mt-1 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {displayed.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="group flex flex-col items-center p-5 rounded-2xl bg-surface-subtle hover:bg-brand hover:text-white transition-all duration-300 ease-out-quart hover:-translate-y-1.5 hover:shadow-card-hover active:scale-[0.98]"
                >
                  <span className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-white/60 group-hover:bg-white/20 transition-all duration-300 ease-out-quart text-3xl group-hover:scale-110 group-hover:-translate-y-0.5">
                    {cat.icon || '🏢'}
                  </span>
                  <span className="mt-3 text-sm font-semibold text-center group-hover:text-white transition-colors">
                    {cat.name_uz || cat.slug}
                  </span>
                  <span className="mt-1 text-xs text-ink-muted group-hover:text-white/70 transition-colors">
                    {cat.count || 0} {t('home.categoryVenueCount')}
                  </span>
                </Link>
              ))}
            </div>

            {extra.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-brand border border-brand/30 hover:bg-brand-light transition-all duration-fast active:scale-95"
                >
                  {expanded ? t('home.showLess') : t('home.showMore', { count: extra.length })}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
