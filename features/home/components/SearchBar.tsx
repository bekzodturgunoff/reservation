'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Users } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { supabase } from '@/lib/supabase'
import { UZBEKISTAN_REGIONS } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import type { Category } from '@/types'

export function SearchBar() {
  const { t } = useTranslation()
  const router = useRouter()

  const months = t('common.months.short', { returnObjects: true }) as string[]
  const days = t('common.days.short', { returnObjects: true }) as string[]

  const fmtDate = (d: Date) => `${d.getDate()}-${months[d.getMonth()]}, ${days[d.getDay()]}`
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState(1)
  const [dateOpen, setDateOpen] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['searchbar-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('slug, name_uz').limit(20)
      return (data || []) as Pick<Category, 'slug' | 'name_uz'>[]
    },
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (category) params.set('category', category)
    if (date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      params.set('date', `${y}-${m}-${d}`)
    }
    if (guests > 1) params.set('guests', String(guests))
    router.push(`${ROUTES.SEARCH}?${params.toString()}`)
  }

  return (
    <div className="relative z-10 -mt-7 pb-6">
      <div className="max-w-[760px] mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-modal p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-0">
          {/* City */}
          <div className="flex items-center gap-2 flex-1 px-4 h-14 border-b sm:border-b-0 sm:border-r border-line focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand/30 transition-all duration-normal rounded-[inherit]">
            <MapPin className="w-4 h-4 text-ink-muted shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-ink-secondary cursor-pointer min-h-[44px] transition-colors"
              aria-label={t('common.city')}
            >
              <option value="">{t('search.where')}</option>
              {Object.keys(UZBEKISTAN_REGIONS).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 flex-1 px-4 h-14 border-b sm:border-b-0 sm:border-r border-line focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand/30 transition-all duration-normal rounded-[inherit]">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-ink-secondary cursor-pointer min-h-[44px] transition-colors"
              aria-label={t('common.category')}
            >
              <option value="">{t('home.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.name_uz}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="relative flex items-center gap-2 flex-[0.8] px-4 h-14 border-b sm:border-b-0 sm:border-r border-line focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand/30 transition-all duration-normal rounded-[inherit]">
            <button
              onClick={() => setDateOpen(!dateOpen)}
              className="flex items-center gap-2 flex-1 text-sm text-left outline-none bg-transparent min-h-[44px]"
              aria-label={t('common.date')}
            >
              <span className="text-base">📅</span>
              <span className={date ? 'text-ink font-medium' : 'text-ink-muted'}>
                {date ? fmtDate(date) : t('search.when')}
              </span>
            </button>
            {dateOpen && (
              <div className="absolute top-full left-0 mt-2 z-30 bg-white rounded-2xl shadow-modal border border-line p-3 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                <DayPicker
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setDateOpen(false) }}
                  disabled={{ before: new Date() }}
                />
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="flex items-center gap-2 flex-[0.6] px-4 h-14 border-b sm:border-b-0 border-line focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand/30 transition-all duration-normal rounded-[inherit]">
            <Users className="w-4 h-4 text-ink-muted shrink-0" />
            <div className="flex items-center gap-1 min-h-[44px]">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-7 h-7 rounded-md border border-line text-sm font-medium text-ink-secondary hover:bg-surface-muted active:bg-line transition-all duration-fast active:scale-90"
                aria-label={t('search.decrease')}
              >−</button>
              <span className="w-6 text-center text-sm font-medium text-ink">{guests}</span>
              <button
                onClick={() => setGuests(Math.min(50, guests + 1))}
                className="w-7 h-7 rounded-md border border-line text-sm font-medium text-ink-secondary hover:bg-surface-muted active:bg-line transition-all duration-fast active:scale-90"
                aria-label={t('search.increase')}
              >+</button>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 h-[44px] m-1.5 px-6 bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-xl transition-all duration-normal ease-out-quart hover:-translate-y-0.5 active:scale-[0.97] shrink-0"
          >
            <Search className="w-4 h-4" />
            {t('common.search')}
          </button>
        </div>
      </div>
    </div>
  )
}
