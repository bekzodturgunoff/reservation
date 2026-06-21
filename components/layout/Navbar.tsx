'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/lib/constants/routes'
import { useAuthStore } from '@/store/auth'
import { Menu, X, ChevronDown, LogOut, User, Building2, Shield, Heart } from 'lucide-react'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

export const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, profile, loading, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    logout()
    router.push(ROUTES.HOME)
  }, [logout, router, queryClient])

  const navLinks = [
    { href: '/', label: t('common.home') },
    { href: '/search', label: t('nav.venues') },
    { href: '/#how-it-works', label: t('home.howItWorks') },
  ]

  const isHome = pathname === '/'

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-line'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0 no-underline">
            <span className="font-display text-[22px] font-extrabold text-brand-600 -tracking-[0.03em]">
              Bron
            </span>
            <span
              className={`font-display text-[22px] font-extrabold -tracking-[0.03em] transition-colors duration-300 ${
                scrolled || !isHome ? 'text-ink' : 'text-white'
              }`}
            >
              Uz
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-[15px] font-body font-medium transition-colors ${
                  pathname === link.href
                    ? scrolled || !isHome
                      ? 'text-brand-600 font-semibold'
                      : 'text-white font-semibold'
                    : scrolled || !isHome
                      ? 'text-ink-secondary hover:text-brand-600'
                      : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Language Switcher - pill group */}
            <div className="hidden md:flex items-center">
              {[
                { code: 'uz', label: "O'Z" },
                { code: 'ru', label: 'RU' },
                { code: 'en', label: 'EN' },
              ].map((l, i) => (
                <button
                  key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); localStorage.setItem('lang', l.code) }}
                  className={`px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    i === 0 ? 'rounded-l-lg' : i === 2 ? 'rounded-r-lg' : ''
                  } ${
                    i18n.language === l.code
                      ? scrolled || !isHome
                        ? 'bg-brand-600 text-white'
                        : 'bg-white/20 text-white'
                      : scrolled || !isHome
                        ? 'text-ink-muted hover:text-ink-secondary'
                        : 'text-white/50 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse hidden md:block" />
            ) : user && profile ? (
              <><NotificationBell /><div ref={userRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors ${
                    scrolled || !isHome
                      ? 'bg-white border border-line hover:border-line-strong'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span
                    className={`text-sm font-medium max-w-[120px] truncate hidden sm:block ${
                      scrolled || !isHome ? 'text-ink' : 'text-white'
                    }`}
                  >
                    {profile.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 ${scrolled || !isHome ? 'text-ink-muted' : 'text-white/60'}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-line overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-line">
                      <p className="text-sm font-semibold text-ink">{profile.full_name}</p>
                      <p className="text-xs text-ink-tertiary capitalize mt-0.5">{profile.role}</p>
                    </div>
                    <div className="py-1">
                      <Link href={ROUTES.PROFILE} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-muted transition-colors">
                        <User className="w-4 h-4" />
                        {t('nav.profile')}
                      </Link>
                      <Link href={ROUTES.PROFILE_FAVORITES} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-muted transition-colors">
                        <Heart className="w-4 h-4" />
                        {t('nav.favorites')}
                      </Link>
                      {(profile.role === 'business' || profile.role === 'admin') && (
                        <Link href={ROUTES.BUSINESS} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-muted transition-colors">
                          <Building2 className="w-4 h-4" />
                          {t('nav.businessPanel')}
                        </Link>
                      )}
                      {profile.role === 'admin' && (
                        <Link href={ROUTES.ADMIN} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-muted transition-colors">
                          <Shield className="w-4 h-4" />
                          {t('nav.adminPanel')}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-line py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-status-error-bg w-full text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('common.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div></>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href={ROUTES.LOGIN}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    scrolled || !isHome
                      ? 'text-ink-secondary hover:bg-surface-muted'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {t('common.login')}
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-5 py-2 rounded-xl transition-colors shadow-btn"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-colors ${
                scrolled || !isHome
                  ? 'border border-line text-ink-secondary'
                  : 'text-white'
              }`}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute top-[68px] left-0 right-0 bg-white min-h-[calc(100vh-68px)] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lang switcher */}
            <div className="flex items-center rounded-lg p-0.5 gap-0.5 bg-surface-muted w-fit mb-6">
              {[
                { code: 'uz', label: "O'Z" },
                { code: 'ru', label: 'RU' },
                { code: 'en', label: 'EN' },
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

            {/* Nav links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth section */}
            <div className="mt-8 pt-6 border-t border-line">
              {loading ? null : !user ? (
                <div className="flex gap-3">
                  <Link
                    href={ROUTES.LOGIN}
                    className="flex-1 text-center py-3 rounded-xl border border-line text-sm font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="flex-1 text-center py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-btn"
                  >
                    {t('common.register')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href={ROUTES.PROFILE}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {t('nav.profile')}
                  </Link>
                  <Link
                    href={ROUTES.PROFILE_FAVORITES}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {t('nav.favorites')}
                  </Link>
                  {(profile?.role === 'business' || profile?.role === 'admin') && (
                    <Link
                      href={ROUTES.BUSINESS}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      {t('nav.businessPanel')}
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link
                      href={ROUTES.ADMIN}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      {t('nav.adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-status-error hover:bg-status-error-bg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('common.logout')}
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
