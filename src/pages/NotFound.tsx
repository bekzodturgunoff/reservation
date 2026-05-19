import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTitle } from '../hooks/useTitle'

const NotFound = () => {
  const { t } = useTranslation()
  useTitle(t('notFound.title'))
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-7xl font-bold text-emerald-600 mb-4">{t('notFound.title')}</p>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('notFound.heading')}</h1>
      <p className="text-gray-500 mb-8">{t('notFound.message')}</p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
      >
        <Home className="w-4 h-4" /> {t('notFound.backHome')}
      </Link>
    </div>
  )
}

export default NotFound
