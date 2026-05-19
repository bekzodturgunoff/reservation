import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

import Home from '../pages/Home'
import Search from '../pages/Search'
import VenueDetail from '../pages/VenueDetail'
import Booking from '../pages/Booking'
import Confirmation from '../pages/Confirmation'
import Profile from '../pages/Profile'
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'

import BusinessDashboard from '../pages/business/Dashboard'
import VenueSetup from '../pages/business/VenueSetup'
import Availability from '../pages/business/Availability'

import AdminDashboard from '../pages/admin/AdminDashboard'
import VenueApprovals from '../pages/admin/VenueApprovals'

import PageWrapper from '../components/layout/PageWrapper'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="text-gray-400">Loading...</span></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const BusinessRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="text-gray-400">Loading...</span></div>
  if (!profile || (profile.role !== 'business' && profile.role !== 'admin')) return <Navigate to="/" replace />
  return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="text-gray-400">Loading...</span></div>
  if (!profile || profile.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <Search /> },
      { path: 'venues/:id', element: <VenueDetail /> },
      {
        path: 'booking/:venueId/:slotId',
        element: <ProtectedRoute><Booking /></ProtectedRoute>,
      },
      {
        path: 'confirmation/:bookingId',
        element: <ProtectedRoute><Confirmation /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      {
        path: 'business/dashboard',
        element: <ProtectedRoute><BusinessRoute><BusinessDashboard /></BusinessRoute></ProtectedRoute>,
      },
      {
        path: 'business/venue/new',
        element: <ProtectedRoute><BusinessRoute><VenueSetup /></BusinessRoute></ProtectedRoute>,
      },
      {
        path: 'business/venue/:id/edit',
        element: <ProtectedRoute><BusinessRoute><VenueSetup /></BusinessRoute></ProtectedRoute>,
      },
      {
        path: 'business/venue/:id/availability',
        element: <ProtectedRoute><BusinessRoute><Availability /></BusinessRoute></ProtectedRoute>,
      },

      {
        path: 'admin',
        element: <ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>,
      },
      {
        path: 'admin/approvals',
        element: <ProtectedRoute><AdminRoute><VenueApprovals /></AdminRoute></ProtectedRoute>,
      },

      { path: '*', element: <NotFound /> },
    ],
  },
])
