'use client'

import { Suspense, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  MapPin, Star, LayoutGrid, List,
  Map as MapIcon, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from 'react-i18next'
import { useTitle } from '@/hooks/useTitle'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { SearchFilters } from '@/features/search/components/SearchFilters'
import { SearchMap } from '@/features/search/components/SearchMap'
import { SearchAutocomplete } from '@/features/search/components/SearchAutocomplete'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { FavoriteButton } from '@/features/venues/components/FavoriteButton'
import type { Venue, Category } from '@/types'
import type { FilterState } from '@/features/search/components/SearchFilters'

const ITEMS_PER_PAGE = 12

function VenueCard({ venue }: { venue: Venue }) {
  const { t } = useTranslation()
  const rating = venue.review_count && venue.review_count >= 3
    ? venue.avg_rating?.toFixed(1)
    : venue.review_count && venue.review_count >= 1 ? '—' : null
  const showPrice = (venue.price_per_slot ?? 0) > 0

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group bg-white rounded-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-[200px] sm:h-[220px] overflow-hidden">
        <Image
          src={venue.photos?.[0] || PLACEHOLDER_IMAGE}
          alt={`${venue.name} — BronUz'da bron qilish`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white">
          {venue.categories?.icon || '🏢'} {venue.categories?.name_uz || ''}
        </span>
        <FavoriteButton venueId={venue.id} className="absolute top-3 right-3" />

        {rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              {venue.avg_rating?.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-ink truncate">{venue.name}</h3>
        <p className="flex items-center gap-1 text-xs text-ink-tertiary mt-1 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {venue.city}{venue.district ? `, ${venue.district}` : ''}
        </p>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-ink-muted uppercase tracking-wider">{t('common.perHour')}</span>
            <p className="text-lg font-display font-bold text-ink">
              {showPrice ? `${(venue.price_per_slot).toLocaleString()} UZS` : t('common.negotiablePrice')}
            </p>
          </div>
          <span className="text-xs font-semibold text-brand group-hover:underline flex items-center gap-1">
            {t('common.book')}
            <ChevronDown className="w-3 h-3 -rotate-90" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function VenueListItem({ venue }: { venue: Venue }) {
  const { t } = useTranslation()
  const showPrice = (venue.price_per_slot ?? 0) > 0
  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group flex gap-4 p-4 bg-white rounded-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative w-28 sm:w-36 h-24 sm:h-28 shrink-0 rounded-lg overflow-hidden">
        <Image
          src={venue.photos?.[0] || PLACEHOLDER_IMAGE}
          alt={`${venue.name} — BronUz'da bron qilish`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 25vw, 10vw"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-ink truncate">{venue.name}</h3>
            <span className="shrink-0 text-[10px] font-medium bg-surface-bg text-ink-secondary px-2 py-0.5 rounded-full">
              {venue.categories?.icon} {venue.categories?.name_uz}
            </span>
          </div>
          <p className="flex items-center gap-1 text-xs text-ink-tertiary mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {venue.city}{venue.district ? `, ${venue.district}` : ''}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-[10px] text-ink-muted uppercase tracking-wider">{t('common.perHour')}</span>
            <p className="text-base font-bold text-ink">
              {showPrice ? `${(venue.price_per_slot).toLocaleString()} UZS` : t('common.negotiablePrice')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(venue.review_count ?? 0) >= 3 && (
              <div className="flex items-center gap-1 text-xs text-ink-secondary">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {venue.avg_rating?.toFixed(1)}
              </div>
            )}
            <span className="text-xs font-semibold text-brand group-hover:underline">
              {t('common.book')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const SearchPageInner = () => {
  const { t } = useTranslation()
  useTitle(t('search.title') + ' — BronUz')
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minCapacity: '',
  })
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMap, setShowMap] = useState(false)
  const [sortBy, setSortBy] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id, slug, name_uz, icon')
      return (data || []) as unknown as Category[]
    },
  })

  const { data: allVenues = [], isLoading } = useQuery({
    queryKey: ['venues', 'search', filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select('id, name, slug, city, district, price_per_slot, avg_rating, review_count, photos, categories:category_id(id, slug, name_uz, icon)')
        .eq('status', 'active')
        .limit(100)

      if (filters.search) query = query.ilike('name', `%${filters.search}%`)
      if (filters.city) query = query.eq('city', filters.city)
      if (filters.category) {
        const catId = categories.find((c: Category) => c.slug === filters.category)?.id
        if (catId) query = query.eq('category_id', catId)
      }
      if (filters.minPrice) query = query.gte('price_per_slot', parseInt(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price_per_slot', parseInt(filters.maxPrice))
      if (filters.minCapacity) query = query.gte('max_group_size', parseInt(filters.minCapacity))

      const { data } = await query
      return (data || []) as unknown as Venue[]
    },
  })

  const sorted = useMemo(() => {
    const list = [...allVenues]
    if (sortBy === 'price-asc') list.sort((a, b) => (a.price_per_slot || 0) - (b.price_per_slot || 0))
    if (sortBy === 'price-desc') list.sort((a, b) => (b.price_per_slot || 0) - (a.price_per_slot || 0))
    if (sortBy === 'rating') list.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    return list
  }, [allVenues, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setFilters({ search: '', city: '', category: '', minPrice: '', maxPrice: '', minCapacity: '' })
    setPage(1)
  }

  const activeCategory = categories.find((c) => c.slug === filters.category)

  if (showMap) {
    return (
      <div className="h-[calc(100vh-72px)] flex flex-col">
        <div className="sticky top-[72px] z-30 bg-white border-b border-border px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setShowMap(false)}
              className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('search.grid')}
            </button>
            <span className="text-sm text-ink-tertiary">
              <span className="font-semibold text-ink">{sorted.length}</span> {t('search.results')}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <SearchMap venues={sorted} />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <SearchAutocomplete
              value={filters.search}
              onChange={(val) => { setFilters({ ...filters, search: val }); setPage(1) }}
              onClear={() => { setFilters({ ...filters, search: '' }); setPage(1) }}
            />

            <div className="hidden sm:flex items-center gap-2 ml-auto">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-[42px] px-3 text-xs bg-white border border-border rounded-input outline-none text-ink-secondary"
              >
                <option value="">{t('common.default')}</option>
                <option value="price-asc">{t('common.price')}: {t('common.asc')}</option>
                <option value="price-desc">{t('common.price')}: {t('common.desc')}</option>
                <option value="rating">{t('common.rating')}</option>
              </select>

              {/* View toggle */}
              <div className="flex border border-border rounded-input overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-brand text-white' : 'bg-white text-ink-muted hover:text-ink'}`}
                  aria-label={t('common.gridView')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-brand text-white' : 'bg-white text-ink-muted hover:text-ink'}`}
                  aria-label={t('common.listView')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Map toggle */}
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1.5 h-[42px] px-4 text-xs border border-border rounded-input text-ink-secondary hover:text-ink hover:border-border-strong transition-colors"
              >
                <MapIcon className="w-4 h-4" />
                {t('search.map')}
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
            <button
              onClick={() => { setFilters({ ...filters, category: '' }); setPage(1) }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                filters.category === ''
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface-bg text-ink-secondary border-border hover:border-border-strong'
              }`}
            >
              {t('search.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setFilters({ ...filters, category: cat.slug === filters.category ? '' : cat.slug })
                  setPage(1)
                }}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  filters.category === cat.slug
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-ink-secondary border-border hover:border-border-strong'
                }`}
              >
                {cat.icon} {cat.name_uz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <SearchFilters
            categories={categories}
            filters={filters}
            onChange={(f) => { setFilters(f); setPage(1) }}
            onClear={clearFilters}
            totalResults={sorted.length}
          />

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-ink-tertiary">
                {isLoading ? (
                  <span className="animate-pulse">{t('search.searching')}</span>
                ) : (
                  <>
                    <span className="font-semibold text-ink">{sorted.length}</span> {t('search.results')}
                    {activeCategory && (
                      <span className="ml-1">— {activeCategory.icon} {activeCategory.name_uz}</span>
                    )}
                    {filters.city && <span className="ml-1">· {filters.city}</span>}
                  </>
                )}
              </p>

              {/* Mobile sort (hidden on desktop) */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sm:hidden h-[36px] px-2 text-xs bg-white border border-border rounded-input outline-none text-ink-secondary"
              >
                <option value="">{t('common.default')}</option>
                <option value="price-asc">{t('common.price')}: ↑</option>
                <option value="price-desc">{t('common.price')}: ↓</option>
                <option value="rating">{t('common.rating')}</option>
              </select>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className={viewMode === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-4'
              }>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={viewMode === 'grid' ? '' : 'flex gap-4'}>
                    <Skeleton className={viewMode === 'grid' ? 'h-[220px] rounded-card' : 'w-36 h-28 rounded-lg shrink-0'} />
                    <div className={viewMode === 'grid' ? 'space-y-2 mt-3' : 'space-y-2 flex-1'}>
                      <Skeleton className="h-5 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-1/2 rounded-lg" />
                      <Skeleton className="h-5 w-1/3 rounded-lg mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-10 h-10 text-ink-muted" />}
                title={t('search.empty')}
                description={t('search.emptyDesc')}
                action={{
                  label: t('search.clear'),
                  onClick: clearFilters,
                }}
              />
            ) : (
              <>
                {/* Results grid/list */}
                {viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {paginated.map((venue) => (
                      <VenueCard key={venue.id} venue={venue} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginated.map((venue) => (
                      <VenueListItem key={venue.id} venue={venue} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={t('common.previousPage')}
                    >
                      <ChevronLeft className="w-4 h-4 text-ink-secondary" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1
                      if (totalPages > 7 && p > 2 && p < totalPages - 1) {
                        if (p === 3) return <span key={p} className="text-ink-muted text-sm">...</span>
                        if (p < totalPages - 1 && Math.abs(p - page) > 2) return null
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? 'bg-brand text-white'
                              : 'text-ink-secondary border border-border hover:border-border-strong hover:bg-surface-bg'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={t('common.nextPage')}
                    >
                      <ChevronRight className="w-4 h-4 text-ink-secondary" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-[42px] rounded-input w-full max-w-md" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-[220px] rounded-card" />
              <div className="space-y-2 mt-3">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  )
}
