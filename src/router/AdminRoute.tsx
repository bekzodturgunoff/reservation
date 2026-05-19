import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="text-gray-400">Loading...</span></div>
  if (!profile || profile.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default AdminRoute
