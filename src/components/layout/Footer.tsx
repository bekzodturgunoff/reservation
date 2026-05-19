import { Link } from 'react-router-dom'
import { CalendarDaysIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../../api/categories'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 300_000,
  })

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">

          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900">BronUz</span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
              <a href="tel:+998900000000" className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-emerald-600">
                <PhoneIcon className="w-3.5 h-3.5" /> +998 90 000 00 00
              </a>
              <a href="mailto:info@bronuz.uz" className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-emerald-600">
                <EnvelopeIcon className="w-3.5 h-3.5" /> info@bronuz.uz
              </a>
            </div>
          </div>

          <div className="hidden sm:block">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">{t('footer.categories')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                  {t('common.all')}
                </Link>
              </li>
              {categories.slice(0, 10).map(cat => (
                <li key={cat.slug}>
                  <Link to={`/search?category=${cat.slug}`} className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                    {cat.icon} {cat.name_uz}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">{t('footer.site')}</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">{t('footer.search')}</Link></li>
              <li><Link to="/register" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">{t('footer.register')}</Link></li>
              <li><Link to="/login" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">{t('footer.login')}</Link></li>
              <li><Link to="/register" className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600">{t('footer.forBusiness')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 text-center sm:text-left">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="hidden sm:block text-xs text-gray-400">{t('footer.location')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
