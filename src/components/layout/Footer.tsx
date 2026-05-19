import { Link } from 'react-router-dom'
import { CalendarDays, Phone, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">BronUz</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              O'zbekistondagi kafe, restoran, futbol maydonlari va boshqa joylarni oson bron qiling.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="tel:+998900000000" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600">
                <Phone className="w-4 h-4" /> +998 90 000 00 00
              </a>
              <a href="mailto:info@bronuz.uz" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600">
                <Mail className="w-4 h-4" /> info@bronuz.uz
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Kategoriyalar</h4>
            <ul className="space-y-2">
              {[
                { slug: 'cafe', label: 'Kafe' },
                { slug: 'restaurant', label: 'Restoran' },
                { slug: 'football', label: 'Futbol maydoni' },
                { slug: 'gaming', label: 'Gaming klub' },
                { slug: 'gym', label: 'Sport zal' },
              ].map(cat => (
                <li key={cat.slug}>
                  <Link to={`/search?category=${cat.slug}`} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Sayt</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-sm text-gray-500 hover:text-emerald-600">Qidirish</Link></li>
              <li><Link to="/register" className="text-sm text-gray-500 hover:text-emerald-600">Ro'yxatdan o'tish</Link></li>
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-emerald-600">Kirish</Link></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-emerald-600">Biznes uchun</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2025 BronUz. Barcha huquqlar himoyalangan.</p>
          <p className="text-xs text-gray-400">Toshkent, O'zbekiston 🇺🇿</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
