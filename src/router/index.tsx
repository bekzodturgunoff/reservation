import { createBrowserRouter } from 'react-router-dom'

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
import ProtectedRoute from './ProtectedRoute'
import BusinessRoute from './BusinessRoute'
import AdminRoute from './AdminRoute'

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
