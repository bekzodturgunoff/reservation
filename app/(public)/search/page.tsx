'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Search, MapPin, SlidersHorizontal, X, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTitle } from '@/hooks/useTitle'
import { useTranslation } from 'react-i18next'
import { UZBEKISTAN_REGIONS } from '@/lib/constants'
import type { Venue, Category } from '@/types'

const SearchPageInner = () => {
  const { t, i18n } = useTranslation()
  useTitle('Qidirish — BronUz')
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*')
      return (data || []) as Category[]
    },
  })

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues', 'search', searchInput, city, category, minPrice, maxPrice],
    queryFn: async () => {
      let query = supabase.from('venues').select('*, categories(*)').eq('status', 'active')

      if (searchInput) query = query.ilike('name', `%${searchInput}%`)
      if (city) query = query.eq('city', city)
      if (category) query = query.eq('category_id', parseInt(category))
      if (minPrice) query = query.gte('price_per_slot', parseInt(minPrice))
      if (maxPrice) query = query.lte('price_per_slot', parseInt(maxPrice))

      const { data } = await query.limit(50)
      return (data || []) as Venue[]
    },
  })

  const getLangName = (uz: string, ru: string) => i18n.language === 'uz' ? uz : ru

  const activeCategory = categories.find(c => c.slug === category)

  const hasActiveFilters = !!(searchInput || category || minPrice || maxPrice)

  const clearFilters = () => {
    setSearchInput('')
    setCity('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <div>
      {/* Top search bar */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                placeholder={t('search.placeholder', 'Joy nomi yoki shaharni kiriting...')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 h-[44px] text-sm bg-surface-bg border border-border rounded-xl outline-none text-ink placeholder:text-ink-muted"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="sm:w-40 h-[44px] px-3 text-sm bg-surface-bg border border-border rounded-xl outline-none text-ink"
            >
              <option value="">{t('common.all', 'Hammasi')}</option>
              {Object.keys(UZBEKISTAN_REGIONS).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 h-[44px] px-4 text-sm rounded-xl border transition-colors ${
                hasActiveFilters
                  ? 'bg-brand-pale border-brand text-brand'
                  : 'bg-white border-border text-ink-secondary hover:border-border-strong'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('search.filters', 'Filter')}
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-brand text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {[searchInput, category, minPrice, maxPrice].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-4 p-4 bg-surface-bg rounded-2xl">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-ink-secondary mb-1.5">{t('common.category', 'Kategoriya')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-xl outline-none"
                  >
                    <option value="">{t('search.allCategories', 'Hamma kategoriyalar')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.icon} {getLangName(cat.name_uz, cat.name_ru)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-ink-secondary mb-1.5">{t('search.minPrice', 'Min narx')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-xl outline-none"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-ink-secondary mb-1.5">{t('search.maxPrice', 'Max narx')}</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-xl outline-none"
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 h-[44px] px-4 text-sm text-error hover:bg-error-bg rounded-xl border border-error/20 transition-colors"
                  >
                    <X className="w-4 h-4" /> {t('search.clear', 'Tozalash')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCategory('')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              category === ''
                ? 'bg-brand text-white border-brand'
                : 'bg-surface-bg text-ink-secondary border-border hover:border-border-strong'
            }`}
          >
            {t('search.allCategories', 'Hammasi')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                category === cat.slug
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-ink-secondary border-border hover:border-border-strong'
              }`}
            >
              {cat.icon} {getLangName(cat.name_uz, cat.name_ru)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ink-tertiary">
            {isLoading ? (
              <span className="animate-pulse">{t('search.searching', 'Qidirilmoqda...')}</span>
            ) : (
              <>
                <span className="font-semibold text-ink">{venues.length}</span> {t('search.results', 'ta joy topildi')}
                {activeCategory && (
                  <span className="ml-1">— {activeCategory.icon} {getLangName(activeCategory.name_uz, activeCategory.name_ru)}</span>
                )}
                {city && <span className="ml-1">· {city}</span>}
              </>
            )}
          </p>
        </div>

        {venues.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-semibold text-ink mt-4">{t('search.empty', 'Hech narsa topilmadi')}</h3>
            <p className="text-sm text-ink-tertiary mt-2">{t('search.emptyDesc', 'Boshqa qidiruv so\'rovini kiriting yoki filtrlarni o\'zgartiring')}</p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              {t('search.clearFilters', 'Filtrlarni tozalash')}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {venues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="group bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-[180px] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${venue.photos?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-sm text-white">
                      {venue.categories?.icon || '🏢'} {venue.categories ? getLangName(venue.categories.name_uz, venue.categories.name_ru) : ''}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{venue.avg_rating?.toFixed(1) || '4.8'}</span>
                    <span className="text-xs text-white/70">({venue.review_count || 0})</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-ink truncate">{venue.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-ink-tertiary mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {venue.city}
                    {venue.district && `, ${venue.district}`}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div>
                      <span className="text-xs text-ink-tertiary">soatiga</span>
                      <p className="text-base font-bold text-ink">
                        {new Intl.NumberFormat('uz-UZ').format(venue.price_per_slot)} UZS
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-brand group-hover:underline">Bron qilish</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-[44px] bg-gray-200 rounded-xl w-full" />
          <div className="h-[180px] bg-gray-200 rounded-2xl w-full" />
        </div>
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  )
}
