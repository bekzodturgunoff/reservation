import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, MapPinIcon, CalendarDaysIcon, ChevronRightIcon, StarIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline'
import { getVenues } from '../api/venues'
import { getCategories } from '../api/categories'
import VenueGrid from '../components/venue/VenueGrid'
import { useTitle } from '../hooks/useTitle'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { t, i18n } = useTranslation()
  useTitle(t('common.home'))
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('Tashkent')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: featuredVenues = [], isLoading } = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => getVenues({ city: selectedCity }),
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCity) params.set('city', selectedCity)
    if (selectedCategory) params.set('category', selectedCategory)
    navigate(`/search?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const cities = ['Tashkent', 'Samarkand', 'Buxoro', 'Namangan', 'Andijon']

  const getLangName = (uz: string, ru: string) =>
    i18n.language === 'uz' ? uz : ru

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-16 sm:pb-20 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-4 sm:mb-6">
            <span>🇺🇿</span>
            <span className="truncate">{t('home.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight px-1">
            {t('home.hero1')}<br />
            <span className="text-emerald-200">{t('home.hero2')}</span>
          </h1>
          <p className="text-emerald-100 text-sm sm:text-lg mb-6 sm:mb-10 max-w-xl mx-auto px-2">
            {t('home.subtitle')}
          </p>

          <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-gray-900 placeholder-gray-400 text-sm outline-none py-2 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3 sm:border-l border-gray-200">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="text-sm text-gray-700 outline-none bg-transparent py-2 pr-2 cursor-pointer"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 sm:flex-shrink-0"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              {t('common.search')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="-mt-6 mb-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedCategory('')
                  navigate('/search')
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                    : 'text-gray-500 hover:bg-gray-50 border-2 border-transparent'
                }`}
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
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                      : 'text-gray-500 hover:bg-gray-50 border-2 border-transparent'
                  }`}
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
              <h2 className="text-xl font-bold text-gray-900">{t('home.popularTitle')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selectedCity} {t('home.popularSub')}</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline"
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
            <h2 className="text-xl font-bold text-gray-900">{t('home.howItWorks')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('home.howItWorksSub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <MagnifyingGlassIcon className="w-6 h-6 text-emerald-600" />,
                step: '01',
                title: t('home.step1Title'),
                desc: t('home.step1Desc'),
              },
              {
                icon: <CalendarDaysIcon className="w-6 h-6 text-emerald-600" />,
                step: '02',
                title: t('home.step2Title'),
                desc: t('home.step2Desc'),
              },
              {
                icon: <StarIcon className="w-6 h-6 text-emerald-600" />,
                step: '03',
                title: t('home.step3Title'),
                desc: t('home.step3Desc'),
              },
            ].map(item => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <div className="absolute top-4 right-4 text-xs font-bold text-gray-200 text-2xl">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />, label: t('home.featureSecure'), desc: t('home.featureSecureDesc') },
                { icon: <BoltIcon className="w-6 h-6 text-emerald-600" />, label: t('home.featureFast'), desc: t('home.featureFastDesc') },
                { icon: <StarIcon className="w-6 h-6 text-emerald-600" />, label: t('home.featureVerified'), desc: t('home.featureVerifiedDesc') },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="bg-gray-900 rounded-2xl p-8 sm:p-10 text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('home.ctaTitle')}</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              {t('home.ctaDesc')}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition-colors inline-flex items-center gap-2"
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
