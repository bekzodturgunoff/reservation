import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, CalendarDays, ChevronRight, Star, Shield, Zap } from 'lucide-react'
import { getVenues } from '../api/venues'
import { getCategories } from '../api/categories'
import VenueGrid from '../components/venue/VenueGrid'
import { useTitle } from '../hooks/useTitle'
import { useTranslation } from 'react-i18next'

const Home = () => {
  useTitle('Bosh sahifa')
  const { i18n } = useTranslation()
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
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <span>🇺🇿</span>
            <span>O'zbekistondagi eng yaxshi bron platformasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Xohlagan joyingizni<br />
            <span className="text-emerald-200">osongina bron qiling</span>
          </h1>
          <p className="text-emerald-100 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            Kafe, restoran, futbol maydonlari, gaming klublar va boshqa joylarni bir necha soniyada bron qiling
          </p>

          <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Kafe, futbol, gaming..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-gray-900 placeholder-gray-400 text-sm outline-none py-2 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3 sm:border-l border-gray-200">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
              <Search className="w-4 h-4" />
              Qidirish
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
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">🏠</span>
                <span>Hammasi</span>
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
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'text-gray-500 hover:bg-gray-50'
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
              <h2 className="text-xl font-bold text-gray-900">Mashhur joylar</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selectedCity} bo'yicha</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline"
            >
              Barchasini ko'rish <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <VenueGrid
            venues={featuredVenues.slice(0, 6)}
            loading={isLoading}
            emptyMessage="Hali joylar qo'shilmagan"
          />
        </section>

        <section className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Qanday ishlaydi?</h2>
            <p className="text-sm text-gray-500 mt-1">3 ta oddiy qadam</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search className="w-6 h-6 text-emerald-600" />,
                step: '01',
                title: 'Qidiring',
                desc: "Shahar va kategoriya bo'yicha o'zingizga mos joyni toping",
              },
              {
                icon: <CalendarDays className="w-6 h-6 text-emerald-600" />,
                step: '02',
                title: 'Bron qiling',
                desc: 'Qulay vaqtni tanlang va bir necha soniyada bron qiling',
              },
              {
                icon: <Star className="w-6 h-6 text-emerald-600" />,
                step: '03',
                title: 'Bahoning bering',
                desc: "Tashrif buyurgandan so'ng boshqalar uchun izoh qoldiring",
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
                { icon: <Shield className="w-6 h-6 text-emerald-600" />, label: "Xavfsiz to'lov", desc: 'Payme va Click orqali' },
                { icon: <Zap className="w-6 h-6 text-emerald-600" />, label: 'Tezkor bron', desc: '30 soniyadan kam vaqtda' },
                { icon: <Star className="w-6 h-6 text-emerald-600" />, label: 'Tekshirilgan joylar', desc: 'Faqat sifatli venues' },
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
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Biznesingizni BronUz ga qo'shing</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Kafe, restoran, sport maydoni yoki boshqa joyingizni platformaga qo'shing va mijozlar soni oshirish
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              Bepul ro'yxatdan o'ting <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
