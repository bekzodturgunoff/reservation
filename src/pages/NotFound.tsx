import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useTitle } from '../hooks/useTitle'

const NotFound = () => {
  useTitle('404 — Page not found')
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-7xl font-bold text-emerald-600 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sahifa topilmadi</h1>
      <p className="text-gray-500 mb-8">Bu sahifa mavjud emas yoki o'chirilgan.</p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
      >
        <Home className="w-4 h-4" /> Bosh sahifaga qaytish
      </Link>
    </div>
  )
}

export default NotFound
