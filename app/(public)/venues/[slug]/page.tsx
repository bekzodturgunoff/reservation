'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useTitle } from '@/hooks/useTitle'
import { MapPin, Star, ChevronLeft, CalendarDays, Clock, Wifi, Car, Tv, Fan, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Venue } from '@/types'

const VenueDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(*)')
        .eq('id', slug)
        .single()
      return data as Venue
    },
    enabled: !!slug,
  })

  useTitle(venue ? `${venue.name} — BronUz` : 'Yuklanmoqda...')

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-[400px] bg-gray-200 rounded-2xl" />
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-6xl">🔍</span>
        <h2 className="text-2xl font-bold text-ink mt-4">Joy topilmadi</h2>
        <Link href="/search" className="mt-4 inline-flex items-center gap-2 text-brand font-medium hover:underline">
          <ChevronLeft className="w-4 h-4" /> Qidirishga qaytish
        </Link>
      </div>
    )
  }

  const photos = venue.photos?.length ? venue.photos : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800']
  const features = [
    { icon: <Wifi className="w-4 h-4" />, label: 'Wi-Fi' },
    { icon: <Car className="w-4 h-4" />, label: 'Avto-turargoh' },
    { icon: <Fan className="w-4 h-4" />, label: 'Konditsioner' },
    { icon: <Tv className="w-4 h-4" />, label: 'TV/Proyektor' },
  ]

  const copyAddress = () => {
    navigator.clipboard.writeText(venue.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hours = parseInt(endTime.split(':')[0] || '0') - parseInt(startTime.split(':')[0] || '0')
  const totalPrice = hours > 0 ? hours * venue.price_per_slot : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-tertiary mb-6">
        <Link href="/" className="hover:text-brand">Bosh sahifa</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-brand">{venue.categories?.name_uz || 'Joylar'}</Link>
        <span>/</span>
        <span className="text-ink">{venue.name}</span>
      </div>

      {/* Photo Gallery */}
      <div className="grid lg:grid-cols-3 gap-4 h-[400px] mb-8">
        <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${photos[0]})` }}
          />
        </div>
        <div className="hidden lg:grid grid-rows-2 gap-4 h-full">
          {photos.slice(1, 3).map((photo, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-light text-brand-dark">
                {venue.categories?.icon} {venue.categories?.name_uz}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">{venue.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-ink">{venue.avg_rating?.toFixed(1) || '4.8'}</span>
                <span className="text-ink-tertiary">({venue.review_count || 0} ta sharh)</span>
              </div>
              <span className="text-ink-muted">•</span>
              <div className="flex items-center gap-1 text-ink-tertiary">
                <MapPin className="w-4 h-4" />
                {venue.city}{venue.district ? `, ${venue.district}` : ''}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">Joy haqida</h2>
            <p className="text-base text-ink-secondary leading-relaxed">
              {venue.description || "Mukammal dam olish va ish uchrashuvlari uchun eng yaxshi joy. Bizning venue'miz zamonaviy dizayn, qulay muhit va yuqori sifatli xizmat bilan sizni kutib oladi."}
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-4">Imkoniyatlar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-bg">
                  <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand">
                    {f.icon}
                  </div>
                  <span className="text-sm text-ink-secondary">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">Manzil</h2>
            <div className="h-[300px] rounded-2xl bg-surface-bg overflow-hidden mb-3">
              <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm bg-surface-subtle">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p>{venue.address || `${venue.city}, O'zbekiston`}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm text-ink-secondary">
                <MapPin className="w-4 h-4 text-brand" />
                {venue.address || `${venue.city}, O'zbekiston`}
              </p>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 text-sm text-brand hover:underline"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Nusxalandi" : "Manzilni nusxalash"}
              </button>
            </div>
          </div>
        </div>

        {/* Right - Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-border shadow-modal p-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-ink">
                {new Intl.NumberFormat('uz-UZ').format(venue.price_per_slot)} UZS
              </span>
              <span className="text-sm text-ink-tertiary">/ soat</span>
            </div>
            <div className="flex items-center gap-1 text-sm mb-6">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{venue.avg_rating?.toFixed(1) || '4.8'}</span>
              <span className="text-ink-tertiary">({venue.review_count || 0})</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                  <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
                  Sana
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-[48px] px-4 text-sm bg-white border border-border rounded-xl outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Boshlash
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-[48px] px-4 text-sm bg-white border border-border rounded-xl outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Tugash
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-[48px] px-4 text-sm bg-white border border-border rounded-xl outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]"
                  />
                </div>
              </div>

              {hours > 0 && (
                <div className="p-4 bg-surface-bg rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between text-ink-secondary">
                    <span>{hours} soat × {new Intl.NumberFormat('uz-UZ').format(venue.price_per_slot)} UZS</span>
                    <span>{new Intl.NumberFormat('uz-UZ').format(totalPrice)} UZS</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary">
                    <span>Xizmat haqi (5%)</span>
                    <span>{new Intl.NumberFormat('uz-UZ').format(Math.round(totalPrice * 0.05))} UZS</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-ink">
                    <span>Jami</span>
                    <span>{new Intl.NumberFormat('uz-UZ').format(totalPrice + Math.round(totalPrice * 0.05))} UZS</span>
                  </div>
                </div>
              )}

              <Link
                href={date && startTime && endTime ? `/book?venue=${venue.id}&date=${date}&start=${startTime}&end=${endTime}` : '#'}
                className={`block w-full h-[52px] bg-brand hover:bg-brand-dark text-white font-semibold text-base rounded-xl shadow-button transition-all flex items-center justify-center gap-2 ${
                  (!date || !startTime || !endTime) ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
                onClick={(e) => {
                  if (!date || !startTime || !endTime) {
                    e.preventDefault()
                    toast.error('Iltimos, sana va vaqtni tanlang')
                  }
                }}
              >
                Bron qilish
              </Link>

              <p className="text-center text-xs text-ink-tertiary">
                Kredit karta talab etilmaydi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueDetailPage
