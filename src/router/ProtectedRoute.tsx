import { Navigate, useLocation } from 'react-router-dom'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center animate-pulse">
            <CalendarDaysIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export default ProtectedRoute
