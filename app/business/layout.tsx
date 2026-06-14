'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarCheck,
  TrendingUp,
  Settings,
  Bell,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const sidebarLinks = [
  { href: '/business', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/business/venues', label: 'Mening joylarim', icon: Building2 },
  { href: '/business/venues/add', label: 'Yangi joy qo\'shish', icon: PlusCircle },
  { href: '/business/bookings', label: 'Buyurtmalar', icon: CalendarCheck },
  { href: '/business/revenue', label: 'Daromad', icon: TrendingUp },
  { href: '/business/settings', label: 'Sozlamalar', icon: Settings },
]

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (profile?.role !== 'business' && profile?.role !== 'admin') {
      router.replace('/')
    }
  }, [user, profile, loading, router])

  if (loading || !user || (profile?.role !== 'business' && profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-0.5 no-underline">
            <span className="font-display text-xl font-bold text-brand -tracking-[0.03em]">Bron</span>
            <span className="font-display text-xl font-bold text-ink -tracking-[0.03em]">Uz</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink-secondary hidden sm:block">
              {profile?.full_name}
            </span>
            <button className="relative p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-ink-secondary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-surface border-r border-border p-4 gap-1">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === '/business'
                ? pathname === '/business'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-light text-brand'
                    : 'text-ink-secondary hover:bg-surface-subtle'
                }`}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </aside>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex justify-around px-2 py-2">
          {sidebarLinks.slice(0, 5).map((link) => {
            const isActive =
              link.href === '/business'
                ? pathname === '/business'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                  isActive ? 'text-brand' : 'text-ink-tertiary'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="truncate max-w-14">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
