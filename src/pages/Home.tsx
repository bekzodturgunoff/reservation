import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, MapPinIcon, CalendarDaysIcon, ChevronRightIcon, StarIcon, ShieldCheckIcon, BoltIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import { getVenues } from '../api/venues'
import { getCategories } from '../api/categories'
import VenueGrid from '../components/venue/VenueGrid'
import { useTitle } from '../hooks/useTitle'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '../lib/queryKeys'
import { UZBEKISTAN_REGIONS } from '../lib/constants'

const Home = () => {
  const { t, i18n } = useTranslation()
  useTitle(t('common.home'))
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const citiesInRegion = selectedRegion ? UZBEKISTAN_REGIONS[selectedRegion] : []

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const { data: featuredVenues = [], isLoading } = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => getVenues({ city: selectedCity }),
  })

  const { data: allVenues } = useQuery({
    queryKey: queryKeys.venues.all,
    queryFn: () => getVenues({}),
  })

  useEffect(() => {
    const jsonLd = document.createElement('script')
    jsonLd.type = 'application/ld+json'
    jsonLd.id = 'organization-schema'
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'BronUz',
      url: 'https://bronuz.uz',
      description: "O'zbekistondagi eng yaxshi bron qilish platformasi",
      areaServed: 'Uzbekistan',
      knowsLanguage: ['uz', 'ru', 'en'],
    })
    document.head.appendChild(jsonLd)
    return () => { const el = document.getElementById('organization-schema'); if (el) el.remove() }
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    const cityFilter = selectedCity || selectedRegion || ''
    if (cityFilter) params.set('city', cityFilter)
    if (selectedCategory) params.set('category', selectedCategory)
    navigate(`/search?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const getLangName = (uz: string, ru: string) =>
    i18n.language === 'uz' ? uz : ru

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-10 sm:pb-20 text-white" style={{ background: '#0A0A0A' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-4 sm:mb-6" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <span>🇺🇿</span>
            <span className="truncate" style={{ color: '#A8A8A8' }}>{t('home.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight px-1">
            {t('home.hero1')}<br />
            <span style={{ color: '#00A86B' }}>{t('home.hero2')}</span>
          </h1>
          <p className="text-sm sm:text-lg mb-6 sm:mb-10 max-w-xl mx-auto px-2" style={{ color: '#6B6B6B' }}>
            {t('home.subtitle')}
          </p>

          <div
            className="rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            style={{ background: 'var(--color-surface)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <MagnifyingGlassIcon className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-sm outline-none py-2 bg-transparent"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="flex items-center gap-1 px-1 sm:border-l" style={{ borderColor: 'var(--color-border)' }}>
              <MapPinIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
              <select
                value={selectedRegion}
                onChange={e => {
                  const region = e.target.value
                  setSelectedRegion(region)
                  setSelectedCity(region)
                }}
                className="text-base sm:text-sm outline-none bg-transparent py-2 cursor-pointer max-w-[110px] min-h-[44px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <option value="">{t('common.all')}</option>
                {Object.keys(UZBEKISTAN_REGIONS).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {selectedRegion && (
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="text-base sm:text-sm outline-none bg-transparent py-2 cursor-pointer max-w-[110px] min-h-[44px]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <option value={selectedRegion}>All cities</option>
                  {citiesInRegion.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 sm:shrink-0 text-white"
              style={{ background: 'var(--color-brand)' }}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              {t('common.search')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="-mt-6 mb-10 relative z-10">
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedCategory('')
                  navigate('/search')
                }}
                className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: selectedCategory === '' ? 'var(--color-brand-light)' : 'transparent',
                  color: selectedCategory === '' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  border: `2px solid ${selectedCategory === '' ? 'var(--color-brand-light)' : 'transparent'}`,
                }}
              >
                <span className="text-2xl">🏠</span>
                <span>{t('home.allCategories')}</span>
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug)
                    navigate(`/search?category=${cat.slug}`)
                  }}
                  className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: selectedCategory === cat.slug ? 'var(--color-brand-light)' : 'transparent',
                    color: selectedCategory === cat.slug ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    border: `2px solid ${selectedCategory === cat.slug ? 'var(--color-brand-light)' : 'transparent'}`,
                  }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span>{getLangName(cat.name_uz, cat.name_ru)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('home.popularTitle')}</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{selectedCity || t('common.all')} {t('home.popularSub')}</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              {t('common.viewAll')} <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          <VenueGrid
            venues={featuredVenues.slice(0, 6)}
            loading={isLoading}
            emptyMessage={t('home.empty')}
          />
        </section>

        <section className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('home.howItWorks')}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{t('home.howItWorksSub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <MagnifyingGlassIcon className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />,
                step: '01',
                title: t('home.step1Title'),
                desc: t('home.step1Desc'),
              },
              {
                icon: <CalendarDaysIcon className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />,
                step: '02',
                title: t('home.step2Title'),
                desc: t('home.step2Desc'),
              },
              {
                icon: <StarIcon className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />,
                step: '03',
                title: t('home.step3Title'),
                desc: t('home.step3Desc'),
              },
            ].map(item => (
              <div
                key={item.step}
                className="relative p-6 text-center"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                }}
              >
                <div className="text-2xl font-bold" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--color-text-tertiary)', opacity: 0.15 }}>
                  {item.step}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--color-brand-light)' }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'var(--color-brand-light)',
              border: '1px solid var(--color-brand-light)',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: <ShieldCheckIcon className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />, label: t('home.featureSecure'), desc: t('home.featureSecureDesc') },
                { icon: <BoltIcon className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />, label: t('home.featureFast'), desc: t('home.featureFastDesc') },
                { icon: <StarIcon className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />, label: t('home.featureVerified'), desc: t('home.featureVerifiedDesc') },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  >
                    {item.icon}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div
            className="rounded-2xl p-7"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}>
                  <BuildingStorefrontIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{allVenues?.length || '…'}+</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Venue lar</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                  <CalendarDaysIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>500+</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Muvaffaqiyatli bron</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                  <StarIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>4.8</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>O'rtacha reyting</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}>
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>10+</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Shaharlar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="rounded-2xl p-8 sm:p-10 text-center text-white" style={{ background: '#0A0A0A' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('home.ctaTitle')}</h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#6B6B6B' }}>
              {t('home.ctaDesc')}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="text-white px-8 py-3 rounded-xl font-medium text-sm transition-colors inline-flex items-center gap-2"
              style={{ background: 'var(--color-brand)' }}
            >
              {t('home.ctaButton')} <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
