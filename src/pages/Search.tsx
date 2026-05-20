import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MagnifyingGlassIcon as SearchIcon, AdjustmentsHorizontalIcon as SlidersHorizontalIcon, MapIcon, Squares2X2Icon,
  XMarkIcon, ChevronDownIcon, ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { getVenues, type VenueFilters } from '../api/venues'
import { getCategories } from '../api/categories'
import VenueGrid from '../components/venue/VenueGrid'
import VenueMap from '../components/venue/VenueMap'
import { useTitle } from '../hooks/useTitle'
import { useTranslation } from 'react-i18next'
import { UZBEKISTAN_REGIONS } from '../lib/constants'

type ViewMode = 'grid' | 'map'

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const Search = () => {
  const { t, i18n } = useTranslation()
  useTitle(t('common.search'))
  const [searchParams, setSearchParams] = useSearchParams()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [selectedRegion, setSelectedRegion] = useState(() => {
    const c = searchParams.get('city') || ''
    return c in UZBEKISTAN_REGIONS ? c : ''
  })
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const getLangName = (uz: string, ru: string) =>
    i18n.language === 'uz' ? uz : ru

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const filters: VenueFilters = {
    search: search || undefined,
    city: city || undefined,
    category: category || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  }

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues', filters],
    queryFn: () => getVenues(filters),
    staleTime: 30_000,
  })

  const sortedVenues = useMemo(() => {
    if (!userLocation) return venues
    return [...venues].sort((a, b) => {
      if (!a.lat || !a.lng) return 1
      if (!b.lat || !b.lng) return -1
      return haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
             haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
    })
  }, [venues, userLocation])

  useEffect(() => {
    if (viewMode === 'map' && !userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      )
    }
  }, [viewMode])

  const syncToUrl = useCallback(() => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (city) params.city = city
    if (category) params.category = category
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    setSearchParams(params, { replace: true })
  }, [search, city, category, minPrice, maxPrice, setSearchParams])

  useEffect(() => {
    const timeout = setTimeout(syncToUrl, 400)
    return () => clearTimeout(timeout)
  }, [syncToUrl])

  const clearFilters = () => {
    setSearch('')
    setSelectedRegion('')
    setCity('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  const citiesInRegion = selectedRegion ? UZBEKISTAN_REGIONS[selectedRegion] : []

  const hasActiveFilters = !!(search || category || minPrice || maxPrice)

  const activeCategory = categories.find(c => c.slug === category)

  return (
    <div className="min-h-screen">
      <div className="border-b sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:lg:px-8 py-4 shadow-sm overflow-hidden" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl"
              style={{borderColor: 'var(--color-border)', outline: 'none', background: 'var(--color-bg)'}}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{color: 'var(--color-text-tertiary)'}}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={selectedRegion}
            onChange={e => {
              const region = e.target.value
              setSelectedRegion(region)
              if (region) {
                setCity(region)
              } else {
                setCity('')
              }
            }}
            className="sm:w-40 px-3 py-2.5 text-sm border rounded-xl"
            style={{borderColor: 'var(--color-border)', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text-primary)'}}
          >
            <option value="">{t('common.all')}</option>
            {Object.keys(UZBEKISTAN_REGIONS).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {selectedRegion && (
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="sm:w-40 px-3 py-2.5 text-sm border rounded-xl"
              style={{borderColor: 'var(--color-border)', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text-primary)'}}
            >
              <option value={selectedRegion}>All cities</option>
              {citiesInRegion.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-colors"
            style={hasActiveFilters
              ? { background: 'var(--color-brand-light)', borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }
            }
          >
            <SlidersHorizontalIcon className="w-4 h-4" />
            {t('search.filters')}
            {hasActiveFilters && (
              <span className="w-5 h-5 text-white rounded-full text-xs flex items-center justify-center font-medium" style={{background: 'var(--color-brand)'}}>
                {[search, category, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
            {filtersOpen ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center rounded-xl p-1 gap-1" style={{background: 'var(--color-bg)'}}>
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={viewMode === 'grid'
                ? { background: 'var(--color-surface)', color: 'var(--color-text-primary)' }
                : { color: 'var(--color-text-secondary)' }
              }
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('search.grid')}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={viewMode === 'map'
                ? { background: 'var(--color-surface)', color: 'var(--color-text-primary)' }
                : { color: 'var(--color-text-secondary)' }
              }
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('search.map')}</span>
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="max-w-7xl mx-auto mt-4 p-4 rounded-2xl border-none shadow-[var(--shadow-sm)]" style={{background: 'var(--color-surface)'}}>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium mb-1.5" style={{color: 'var(--color-text-secondary)'}}>{t('common.category')}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm min-h-[44px] border rounded-xl"
                  style={{borderColor: 'var(--color-border)', outline: 'none', background: 'var(--color-surface)'}}
                >
                  <option value="">{t('search.allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.icon} {getLangName(cat.name_uz, cat.name_ru)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium mb-1.5" style={{color: 'var(--color-text-secondary)'}}>{t('search.minPrice')}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm min-h-[44px] border rounded-xl"
                  style={{borderColor: 'var(--color-border)', outline: 'none', background: 'var(--color-surface)'}}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium mb-1.5" style={{color: 'var(--color-text-secondary)'}}>{t('search.maxPrice')}</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm min-h-[44px] border rounded-xl"
                  style={{borderColor: 'var(--color-border)', outline: 'none', background: 'var(--color-surface)'}}
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                >
                  <XMarkIcon className="w-4 h-4" /> {t('search.clear')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategory('')}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border"
          style={category === ''
            ? { background: 'var(--color-brand)', color: 'white', borderColor: 'var(--color-brand)' }
            : { background: 'var(--color-surface)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
          }
        >
          {t('search.allCategories')}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border"
            style={category === cat.slug
              ? { background: 'var(--color-brand)', color: 'white', borderColor: 'var(--color-brand)' }
              : { background: 'var(--color-surface)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
            }
          >
            {cat.icon} {getLangName(cat.name_uz, cat.name_ru)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>
            {isLoading ? (
              <span className="animate-pulse">{t('search.searching')}</span>
            ) : (
              <>
                <span className="font-semibold" style={{color: 'var(--color-text-primary)'}}>{venues.length}</span> {t('search.results')}
                {activeCategory && (
                  <span className="ml-1" style={{color: 'var(--color-text-secondary)'}}>
                    — {activeCategory.icon} {getLangName(activeCategory.name_uz, activeCategory.name_ru)}
                  </span>
                )}
                {city ? <span className="ml-1" style={{color: 'var(--color-text-secondary)'}}>· {city}</span> : <span className="ml-1" style={{color: 'var(--color-text-secondary)'}}>· All cities</span>}
              </>
            )}
          </p>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <VenueGrid
          venues={sortedVenues}
          loading={isLoading}
          emptyMessage={t('search.empty')}
        />
      ) : (
        <div className="space-y-4">
          <VenueMap venues={sortedVenues} userLocation={userLocation} />
          {sortedVenues.length > 0 && (
            <div className="mt-4">
              <VenueGrid venues={sortedVenues} loading={isLoading} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
