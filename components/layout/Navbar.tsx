'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Menu, X, ChevronDown, LogOut, User, Building2, Shield } from 'lucide-react'

export const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, profile, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const [mobileOpen, setMobileOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: t('nav.home', 'Bosh sahifa') },
    { href: '/search', label: t('nav.search', 'Joylar') },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-white/90 backdrop-blur-xl shadow-nav transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 shrink-0 no-underline">
            <span className="font-display text-[22px] font-bold text-brand -tracking-[0.03em]">Bron</span>
            <span className="font-display text-[22px] font-bold text-ink -tracking-[0.03em]">Uz</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-[15px] font-body font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-brand font-semibold'
                    : 'text-ink-secondary hover:text-brand'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center bg-surface-subtle rounded-lg p-0.5 gap-0.5">
              {[
                { code: 'uz', label: "O'Z" },
                { code: 'ru', label: 'RU' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); localStorage.setItem('lang', l.code) }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    i18n.language === l.code
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-muted hover:text-ink-secondary'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {user && profile ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={(e) => {
                    const el = document.getElementById('user-menu')
                    const isHidden = el?.classList.contains('hidden')
                    el?.classList.toggle('hidden')
                    e.currentTarget.setAttribute('aria-expanded', String(!!isHidden))
                  }}
                  aria-haspopup="true"
                  aria-expanded="false"
                  className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-1.5 hover:border-border-strong transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-ink max-w-[120px] truncate hidden sm:block">
                    {profile.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                </button>

                <div
                  id="user-menu"
                  className="hidden absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-border overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-ink">{profile.full_name}</p>
                    <p className="text-xs text-ink-tertiary capitalize mt-0.5">{profile.role}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-subtle transition-colors">
                      <User className="w-4 h-4" />
                      {t('nav.profile', 'Profil')}
                    </Link>
                    {(profile.role === 'business' || profile.role === 'admin') && (
                      <Link href="/business/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-subtle transition-colors">
                        <Building2 className="w-4 h-4" />
                        {t('nav.business', 'Biznes panel')}
                      </Link>
                    )}
                    {profile.role === 'admin' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-subtle transition-colors">
                        <Shield className="w-4 h-4" />
                        {t('nav.admin', 'Admin panel')}
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-bg w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout', 'Chiqish')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-ink-secondary px-4 py-2 rounded-xl hover:bg-surface-subtle transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-white bg-brand hover:bg-brand-dark px-5 py-2 rounded-xl transition-colors shadow-button"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl border border-border text-ink-secondary"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute top-[72px] left-0 right-0 bg-white border-b border-border p-6 max-h-[calc(100vh-72px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center bg-surface-subtle rounded-lg p-0.5 gap-0.5">
                {[
                  { code: 'uz', label: "O'Z" },
                  { code: 'ru', label: 'RU' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { i18n.changeLanguage(l.code); localStorage.setItem('lang', l.code) }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      i18n.language === l.code ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary hover:bg-surface-subtle transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              {!user ? (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-3 rounded-xl border border-border text-sm font-medium text-ink-secondary hover:bg-surface-subtle transition-colors"
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
                  >
                    {t('common.register')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary bg-surface-subtle hover:bg-surface-bg transition-colors"
                  >
                    {t('nav.profile', 'Profil')}
                  </Link>
                  {(profile?.role === 'business' || profile?.role === 'admin') && (
                    <Link
                      href="/business/dashboard"
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary bg-surface-subtle hover:bg-surface-bg transition-colors"
                    >
                      {t('nav.business', 'Biznes panel')}
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary bg-surface-subtle hover:bg-surface-bg transition-colors"
                    >
                      {t('nav.admin', 'Admin panel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-error bg-error-bg hover:bg-red-100 transition-colors"
                  >
                    {t('common.logout', 'Chiqish')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
