'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Search, MapPin, CalendarDays, ChevronRight, Star, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTitle } from '@/hooks/useTitle'
import { UZBEKISTAN_REGIONS, VENUE_CATEGORIES } from '@/lib/constants'
import type { Venue, Category } from '@/types'

const HomePage = () => {
  const { t, i18n } = useTranslation()
  useTitle('BronUz — Onlayn Bron')
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCategory] = useState('')

  const heroRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*')
      return data as Category[]
    },
  })

  const { data: venues = [] } = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('*, categories(*)')
        .eq('status', 'active')
        .limit(8)
      return (data || []) as Venue[]
    },
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedRegion) params.set('city', selectedRegion)
    if (selectedCategory) params.set('category', selectedCategory)
    router.push(`/search?${params.toString()}`)
  }

  const getLangName = (uz: string, ru: string) =>
    i18n.language === 'uz' ? uz : ru

  const displayCategories = categories.length > 0 ? categories : VENUE_CATEGORIES

  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 60% 0%, #065F46 0%, #022c22 40%, #0A0A0A 100%)',
        }}
      >
        {/* Background decorative blob */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-brand-light/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-light mb-6">
                <span>🇺🇿</span>
                <span>O'zbekiston №1 bron platformasi</span>
              </div>

              <h1
                ref={headingRef}
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] -tracking-[0.04em]"
              >
                Mukammal joyni
                <br />
                <span className="text-brand-light">soniyalarda bron</span>
                <br />
                qiling.
              </h1>

              <p className="mt-6 text-lg text-white/65 max-w-lg leading-relaxed">
                Toshkentdagi kafeler, restoranlar, futbol maydonlari va boshqa
                joylarni bir joydan topib, tezda bron qiling.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-brand hover:bg-brand-dark text-white font-semibold text-base rounded-xl shadow-button transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Joylarni ko'rish
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 text-white/80 hover:text-white font-medium text-base rounded-xl border border-white/20 hover:border-white/40 transition-all"
                >
                  <PlayIcon />
                  Qanday ishlaydi
                </a>
              </div>

              <div className="mt-12 flex flex-wrap gap-8">
                {[
                  { value: `${venues.length}+`, label: 'Joy' },
                  { value: '12,000+', label: 'Foydalanuvchi' },
                  { value: '4.8', label: 'Reyting' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/50 mt-0.5 flex items-center gap-1">
                      {stat.label === 'Reyting' && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
                      {stat.label === 'Joy' && <Check className="w-3.5 h-3.5 text-brand-light" />}
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Decorative */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-[500px] rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-4 animate-float">
                  <div className="h-40 rounded-2xl bg-brand-light/20 flex items-center justify-center">
                    <span className="text-6xl">🏟️</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded-full bg-white/20" />
                    <div className="h-3 w-1/2 rounded-full bg-white/10" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 rounded-xl bg-brand/30 flex items-center justify-center text-xs text-white/70">📅 Sana</div>
                    <div className="flex-1 h-10 rounded-xl bg-brand/30 flex items-center justify-center text-xs text-white/70">⏰ Vaqt</div>
                  </div>
                  <div className="h-12 rounded-xl bg-brand flex items-center justify-center text-sm font-semibold text-white">
                    Bron qilish
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - overlapping */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20">
          <div className="bg-white rounded-2xl shadow-modal p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-ink-muted shrink-0" />
              <input
                type="text"
                placeholder="Qayerda?"
                aria-label="Qidirish"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-sm outline-none py-2.5 bg-transparent text-ink placeholder:text-ink-muted"
              />
            </div>
            <div className="flex items-center gap-1 px-1 sm:border-l border-border">
              <MapPin className="w-4 h-4 text-ink-muted shrink-0 ml-1" />
              <select
                aria-label="Shaharni tanlang"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-sm outline-none bg-transparent py-2.5 cursor-pointer text-ink-secondary min-h-[44px]"
              >
                <option value="">Shahar</option>
                {Object.keys(UZBEKISTAN_REGIONS).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="h-[52px] px-7 bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              Qidirish
            </button>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Toifalar bo'yicha qidiring
          </h2>
          <p className="mt-3 text-lg text-ink-tertiary">
            Barcha turdagi joylar bir platformada
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {displayCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-border hover:border-brand hover:bg-brand-pale transition-all duration-300 hover:shadow-card-hover hover:scale-[1.03]"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-light group-hover:bg-brand-pale flex items-center justify-center text-2xl transition-colors">
                {cat.icon}
              </div>
              <span className="text-sm font-semibold text-ink text-center">
                {(cat as Record<string, string>).name_uz
                  ? getLangName((cat as Record<string, string>).name_uz, (cat as Record<string, string>).name_ru)
                  : cat.slug}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-surface-bg py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand mb-3">
              Qanday ishlaydi?
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              3 ta oddiy qadam
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                num: '01',
                icon: <Search className="w-5 h-5" />,
                title: 'Joyni tanlang',
                desc: 'Shahar va toifa bo\'yicha qidiring. Filtrlar yordamida eng mos variantni toping.',
              },
              {
                num: '02',
                icon: <CalendarDays className="w-5 h-5" />,
                title: 'Vaqtni belgilang',
                desc: 'Qulay sana va soatni tanlang. Narxlarni oldindan ko\'ring.',
              },
              {
                num: '03',
                icon: <Check className="w-5 h-5" />,
                title: 'Bron tasdiqlandi',
                desc: 'SMS va email orqali tasdiq oling. Kerak bo\'lsa, bekor qiling.',
              },
            ].map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[40%] h-0.5 border-t-2 border-dashed border-brand-light" />
                )}
                <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-brand-light mb-6">
                  <span className="text-brand">{step.icon}</span>
                </div>
                <span className="absolute top-0 right-[20%] font-display text-[80px] font-extrabold text-brand-light/30 select-none pointer-events-none">
                  {step.num}
                </span>
                <h3 className="text-xl font-semibold text-ink mb-3">{step.title}</h3>
                <p className="text-base text-ink-secondary leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED VENUES ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Mashhur joylar
            </h2>
            <p className="text-base text-ink-tertiary mt-2">
              Eng ko'p bron qilinadigan joylar
            </p>
          </div>
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            Hammasini ko'rish
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {venues.slice(0, 8).map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="group bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-[200px] overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url(${venue.photos?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-sm text-white">
                    {venue.categories?.icon || '🏢'} {venue.categories ? getLangName(venue.categories.name_uz, venue.categories.name_ru) : ''}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">
                    {venue.avg_rating?.toFixed(1) || '4.8'}
                  </span>
                  <span className="text-xs text-white/70">
                    ({venue.review_count || 0})
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-semibold text-ink truncate">
                  {venue.name}
                </h3>
                <p className="flex items-center gap-1 text-sm text-ink-tertiary mt-1 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {venue.city}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div>
                    <span className="text-xs text-ink-tertiary">soatiga</span>
                    <p className="text-base font-bold text-ink">
                      {new Intl.NumberFormat('uz-UZ').format(venue.price_per_slot)} UZS
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand group-hover:underline">
                    Bron qilish
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-brand-pale rounded-3xl p-8 sm:p-12">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, title: t('home.featureSecure', 'Xavfsiz to\'lov'), desc: t('home.featureSecureDesc', 'Barcha to\'lovlar xavfsiz va himoyalangan') },
              { icon: <Zap className="w-6 h-6" />, title: t('home.featureFast', 'Tez bron'), desc: t('home.featureFastDesc', 'Bir necha soniyada joy bron qiling') },
              { icon: <Star className="w-6 h-6" />, title: t('home.featureVerified', 'Tasdiqlangan joylar'), desc: t('home.featureVerifiedDesc', 'Barcha joylar admin tomonidan tekshirilgan') },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-card flex items-center justify-center text-brand">
                  {feature.icon}
                </div>
                <p className="font-semibold text-ink">{feature.title}</p>
                <p className="text-sm text-ink-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST STATS ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-border shadow-card p-8">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">{venues.length}+</p>
                <p className="text-xs text-ink-tertiary">Joylar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-info-bg flex items-center justify-center text-info">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">500+</p>
                <p className="text-xs text-ink-tertiary">Muvaffaqiyatli bron</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning-bg flex items-center justify-center text-warning">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">4.8</p>
                <p className="text-xs text-ink-tertiary">O'rtacha reyting</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">10+</p>
                <p className="text-xs text-ink-tertiary">Shaharlar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-brand-darker py-16 px-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Biznesingizni ro'yxatdan o'tkazing
            </h2>
            <p className="text-lg text-white/80 mt-4 max-w-lg mx-auto">
              Joyingizni minglab mijozlarga tanishtiring va bronlarni avtomatik boshqaring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white text-brand font-semibold text-base rounded-xl shadow-button hover:bg-brand-pale transition-colors"
              >
                Hoziroq boshlash
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-white font-medium text-base rounded-xl border-2 border-white/30 hover:border-white/50 transition-colors"
              >
                Batafsil ma'lumot
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default HomePage
