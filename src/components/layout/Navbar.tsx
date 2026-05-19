import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Globe, ChevronDown, User, CalendarDays, LogOut, LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { supabase } from '../../lib/supabase'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, profile, logout } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const toggleLang = () => {
    const next = i18n.language === 'uz' ? 'ru' : 'uz'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    setUserMenuOpen(false)
    addToast({ type: 'success', message: 'Logged out successfully' })
    navigate('/')
  }

  const categories = [
    { slug: 'cafe', label: '☕ Kafe' },
    { slug: 'restaurant', label: '🍽️ Restoran' },
    { slug: 'football', label: '⚽ Futbol' },
    { slug: 'gaming', label: '🎮 Gaming' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BronUz</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/search?category=${cat.slug}`}
                className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{i18n.language}</span>
            </button>

            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">{profile.full_name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    {(profile.role === 'business' || profile.role === 'admin') && (
                      <Link
                        to="/business/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Business Panel
                      </Link>
                    )}
                    {profile.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/search?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
