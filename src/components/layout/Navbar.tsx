import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, User, LogOut, Calendar } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Button from '../ui/Button'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, profile, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleLang = () => {
    const next = i18n.language === 'uz' ? 'ru' : 'uz'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
        <Link to="/" className="text-xl font-bold text-blue-600">BronUz</Link>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleLang}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
          >
            {i18n.language === 'uz' ? 'RU' : 'UZ'}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {profile?.full_name?.[0] || 'U'}
                </div>
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" /> {t('common.profile') || 'Profile'}
                    </Link>
                    <Link
                      to="/profile?tab=bookings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Calendar className="w-4 h-4" /> {t('common.my_bookings') || 'My Bookings'}
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { logout(); setDropdownOpen(false) }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" /> {t('common.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">{t('common.login')}</Button></Link>
              <Link to="/register"><Button>{t('common.register')}</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-3">
          <button onClick={toggleLang} className="block text-sm font-medium text-gray-600">
            {i18n.language === 'uz' ? 'RU' : 'UZ'}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="block text-sm text-gray-700" onClick={() => setMenuOpen(false)}>{t('common.profile') || 'Profile'}</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block text-sm text-red-600">{t('common.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block"><Button variant="ghost" className="w-full">{t('common.login')}</Button></Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block"><Button className="w-full">{t('common.register')}</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
