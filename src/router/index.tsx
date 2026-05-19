import { createBrowserRouter } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
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

const Layout = ({ children }: { children: React.ReactNode }) => (
  <PageWrapper>{children}</PageWrapper>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/search',
    element: <Layout><Search /></Layout>,
  },
  {
    path: '/venues/:id',
    element: <Layout><VenueDetail /></Layout>,
  },
  {
    path: '/booking',
    element: <Layout><Booking /></Layout>,
  },
  {
    path: '/confirmation/:bookingId',
    element: <Layout><Confirmation /></Layout>,
  },
  {
    path: '/profile',
    element: <Layout><Profile /></Layout>,
  },
  {
    path: '/login',
    element: <Layout><Login /></Layout>,
  },
  {
    path: '/register',
    element: <Layout><Register /></Layout>,
  },
  {
    path: '/business',
    children: [
      {
        path: 'dashboard',
        element: <Layout><BusinessDashboard /></Layout>,
      },
      {
        path: 'venues/new',
        element: <Layout><VenueSetup /></Layout>,
      },
      {
        path: 'venues/:id/edit',
        element: <Layout><VenueSetup /></Layout>,
      },
      {
        path: 'availability',
        element: <Layout><Availability /></Layout>,
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        path: 'dashboard',
        element: <Layout><AdminDashboard /></Layout>,
      },
      {
        path: 'approvals',
        element: <Layout><VenueApprovals /></Layout>,
      },
    ],
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
])
