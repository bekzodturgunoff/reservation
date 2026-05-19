import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">BronUz</h3>
            <p className="text-sm text-gray-500">Book venues in Uzbekistan</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">For Users</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/search" className="hover:text-gray-900">Search</Link></li>
              <li><Link to="/profile" className="hover:text-gray-900">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">For Business</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/business/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
              <li><Link to="/business/venues/new" className="hover:text-gray-900">List Your Venue</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="mailto:support@bronuz.uz" className="hover:text-gray-900">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} BronUz. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
