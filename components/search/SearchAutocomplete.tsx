'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, MapPin, Building2, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Suggestion {
  type: 'venue' | 'city' | 'category'
  label: string
  slug?: string
  icon?: string
}

interface SearchAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onClear: () => void
}

async function fetchSuggestions(q: string): Promise<Suggestion[]> {
  if (q.trim().length < 2) return []
  const [venueRes, cityRes, catRes] = await Promise.all([
    supabase.from('venues').select('id, name').ilike('name', `%${q}%`).eq('status', 'active').limit(5),
    supabase.from('venues').select('city').ilike('city', `%${q}%`).limit(5),
    supabase.from('categories').select('slug, name_uz, icon').ilike('name_uz', `%${q}%`).limit(5),
  ])

  const result: Suggestion[] = []
  ;(cityRes.data || []).forEach((c) => {
    if (!result.some((r) => r.type === 'city' && r.label === c.city)) {
      result.push({ type: 'city', label: c.city })
    }
  })
  ;(catRes.data || []).forEach((c) => {
    result.push({ type: 'category', label: c.name_uz, slug: c.slug, icon: c.icon })
  })
  ;(venueRes.data || []).forEach((v) => {
    result.push({ type: 'venue', label: v.name })
  })
  return result
}

export function SearchAutocomplete({ value, onChange, onClear }: SearchAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    setOpen(true)

    if (timerRef.current !== null) clearTimeout(timerRef.current)

    if (val.trim().length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(val)
      setSuggestions(results)
      setOpen(results.length > 0)
      setLoading(false)
    }, 250)
  }, [onChange])

  const select = (s: Suggestion) => {
    setOpen(false)
    if (s.type === 'venue') {
      router.push(`/venues/${s.label.toLowerCase().replace(/\s+/g, '-')}`)
    } else if (s.type === 'city') {
      router.push(`/search?city=${encodeURIComponent(s.label)}`)
    } else if (s.type === 'category') {
      router.push(`/search?category=${s.slug}`)
    }
  }

  const handleClear = () => {
    onClear()
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
      <input
        type="text"
        placeholder="Joy nomi yoki shaharni kiriting..."
        value={value}
        onChange={handleInput}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        className="w-full pl-10 pr-8 h-[42px] text-sm bg-surface-bg border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink placeholder:text-ink-muted"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-card border border-border shadow-lg z-50 overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-xs text-ink-muted">Qidirilmoqda...</div>
          )}
          {!loading && suggestions.length === 0 && value.trim().length >= 2 && (
            <div className="px-4 py-3 text-xs text-ink-muted">Hech narsa topilmadi</div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.label}-${i}`}
              onClick={() => select(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-surface-muted transition-colors"
            >
              {s.type === 'venue' && <Building2 className="w-4 h-4 text-ink-muted shrink-0" />}
              {s.type === 'city' && <MapPin className="w-4 h-4 text-ink-muted shrink-0" />}
              {s.type === 'category' && <span className="text-base shrink-0">{s.icon || '🏷️'}</span>}
              <div className="min-w-0">
                <span className="text-ink font-medium truncate block">{s.label}</span>
                <span className="text-[10px] text-ink-muted uppercase tracking-wider">
                  {s.type === 'venue' ? 'Joy' : s.type === 'city' ? 'Shahar' : 'Kategoriya'}
                </span>
              </div>
              {s.type === 'venue' && <TrendingUp className="w-3.5 h-3.5 text-ink-muted ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
