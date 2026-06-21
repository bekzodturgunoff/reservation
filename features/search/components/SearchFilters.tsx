'use client'

import { useState } from 'react'
import { SlidersHorizontal, X, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Category } from '@/types'
import { UZBEKISTAN_REGIONS } from '@/lib/constants'

export interface FilterState {
  search: string
  city: string
  category: string
  minPrice: string
  maxPrice: string
  minCapacity: string
}

interface SearchFiltersProps {
  categories: Category[]
  filters: FilterState
  onChange: (filters: FilterState) => void
  onClear: () => void
  totalResults: number
}

export function SearchFilters({ categories, filters, onChange, onClear, totalResults }: SearchFiltersProps) {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasActiveFilters = !!(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.minCapacity)

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const filterCount = [filters.search, filters.category, filters.minPrice, filters.maxPrice, filters.minCapacity]
    .filter(Boolean).length

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal className="w-4 h-4" />
              {t('search.filters')}
            </div>
            {hasActiveFilters && (
              <button onClick={onClear} className="text-xs text-brand hover:underline">
                {t('search.clear')}
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">
              {t('common.category')}
            </label>
            <div className="space-y-1">
              <button
                onClick={() => update('category', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !filters.category
                    ? 'bg-brand text-white font-medium'
                    : 'text-ink-secondary hover:bg-surface-bg'
                }`}
              >
                {t('search.allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => update('category', cat.slug === filters.category ? '' : cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    filters.category === cat.slug
                      ? 'bg-brand text-white font-medium'
                      : 'text-ink-secondary hover:bg-surface-bg'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name_uz}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">
              {t('common.city')}
            </label>
            <select
              value={filters.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
            >
              <option value="">{t('common.all')}</option>
              {Object.keys(UZBEKISTAN_REGIONS).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">
              {t('common.price')} ({t('common.sum')})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={t('search.minPrice')}
                value={filters.minPrice}
                onChange={(e) => update('minPrice', e.target.value)}
                className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
              />
              <span className="text-ink-muted">—</span>
              <input
                type="number"
                placeholder={t('search.maxPrice')}
                value={filters.maxPrice}
                onChange={(e) => update('maxPrice', e.target.value)}
                className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {t('common.capacity')}
            </label>
            <select
              value={filters.minCapacity}
              onChange={(e) => update('minCapacity', e.target.value)}
              className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
            >
              <option value="">{t('common.any')}</option>
              <option value="2">2+ kishi</option>
              <option value="5">5+ kishi</option>
              <option value="10">10+ kishi</option>
              <option value="20">20+ kishi</option>
              <option value="50">50+ kishi</option>
            </select>
          </div>

          {/* Results count */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-ink-secondary">
              <span className="font-semibold text-ink">{totalResults}</span> {t('search.results')}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile filter button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 h-[48px] px-5 rounded-full shadow-btn text-sm font-semibold transition-all ${
          hasActiveFilters
            ? 'bg-brand text-white'
            : 'bg-white text-ink border border-border shadow-card'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        {t('search.filters')}
        {filterCount > 0 && (
          <span className="w-5 h-5 bg-white/20 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {filterCount}
          </span>
        )}
      </button>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-modal p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <SlidersHorizontal className="w-4 h-4" />
                {t('search.filters')}
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-surface-bg rounded-lg">
                <X className="w-5 h-5 text-ink-secondary" />
              </button>
            </div>

            {/* Same filters for mobile */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">
                  {t('common.category')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => update('category', cat.slug === filters.category ? '' : cat.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
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

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">
                  {t('common.city')}
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none text-ink"
                >
                  <option value="">{t('common.all')}</option>
                  {Object.keys(UZBEKISTAN_REGIONS).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">
                  {t('common.price')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => update('minPrice', e.target.value)}
                    className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none text-ink"
                  />
                  <span className="text-ink-muted">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => update('maxPrice', e.target.value)}
                    className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {t('common.capacity')}
                </label>
                <select
                  value={filters.minCapacity}
                  onChange={(e) => update('minCapacity', e.target.value)}
                  className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none text-ink"
                >
                  <option value="">{t('common.any')}</option>
                  <option value="2">2+ kishi</option>
                  <option value="5">5+ kishi</option>
                  <option value="10">10+ kishi</option>
                  <option value="20">20+ kishi</option>
                  <option value="50">50+ kishi</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClear}
                className="flex-1 h-[48px] border border-border rounded-btn text-sm font-medium text-ink-secondary hover:bg-surface-bg transition-colors"
              >
                {t('search.clear')}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-[48px] bg-brand text-white rounded-btn text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                {t('search.viewResults')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
