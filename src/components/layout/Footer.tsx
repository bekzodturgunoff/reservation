import { Link } from 'react-router-dom'
import { CalendarDays, Phone, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">

          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900">BronUz</span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
              O'zbekistondagi kafe, restoran, futbol maydonlari va boshqa joylarni oson bron qiling.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
              <a href="tel:+998900000000" className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-emerald-600">
                <Phone className="w-3.5 h-3.5" /> +998 90 000 00 00
              </a>
              <a href="mailto:info@bronuz.uz" className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-emerald-600">
                <Mail className="w-3.5 h-3.5" /> info@bronuz.uz
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Kategoriyalar</h4>
            <ul className="space-y-2">
              {[
                { slug: 'cafe', label: 'Kafe' },
                { slug: 'restaurant', label: 'Restoran' },
                { slug: 'football', label: 'Futbol maydoni' },
                { slug: 'gaming', label: 'Gaming klub' },
                { slug: 'gym', label: 'Sport zal' },
              ].map(cat => (
                <li key={cat.slug}>
                  <Link to={`/search?category=${cat.slug}`} className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Sayt</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">Qidirish</Link></li>
              <li><Link to="/register" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">Ro'yxatdan o'tish</Link></li>
              <li><Link to="/login" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">Kirish</Link></li>
              <li><a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">Biznes uchun</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 text-center sm:text-left">© 2025 BronUz. Barcha huquqlar himoyalangan.</p>
          <p className="text-xs text-gray-400">Toshkent, O'zbekiston 🇺🇿</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
