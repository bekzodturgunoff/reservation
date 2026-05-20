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
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:lg:px-8 py-4 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="sm:w-40 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-700"
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
              className="sm:w-40 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-700"
            >
              <option value={selectedRegion}>All cities</option>
              {citiesInRegion.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-colors ${
              hasActiveFilters
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontalIcon className="w-4 h-4" />
            {t('search.filters')}
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-medium">
                {[search, category, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
            {filtersOpen ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('search.grid')}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('search.map')}</span>
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('common.category')}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('search.minPrice')}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('search.maxPrice')}</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            category === ''
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
          }`}
        >
          {t('search.allCategories')}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              category === cat.slug
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
            }`}
          >
            {cat.icon} {getLangName(cat.name_uz, cat.name_ru)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-600">
            {isLoading ? (
              <span className="animate-pulse">{t('search.searching')}</span>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{venues.length}</span> {t('search.results')}
                {activeCategory && (
                  <span className="ml-1 text-gray-500">
                    — {activeCategory.icon} {getLangName(activeCategory.name_uz, activeCategory.name_ru)}
                  </span>
                )}
                {city ? <span className="ml-1 text-gray-500">· {city}</span> : <span className="ml-1 text-gray-500">· All cities</span>}
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
