'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, CalendarCheck, CalendarDays,
  Building2, PlusCircle, Star, TrendingUp, Settings,
  Bell, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { DashboardSidebar, MobileBottomNav } from '@/components/layout/DashboardSidebar'
import type { SidebarLink } from '@/components/layout/DashboardSidebar'

const sidebarLinks: SidebarLink[] = [
  { href: '/business', label: 'Bugun', icon: LayoutDashboard },
  { href: '/business/bookings', label: 'Bronlar', icon: CalendarCheck },
  { href: '/business/calendar', label: 'Kalendar', icon: CalendarDays },
  { href: '/business/venues', label: 'Joylarim', icon: Building2 },
  { href: '/business/venues/add', label: 'Yangi joy', icon: PlusCircle },
  { href: '/business/reviews', label: 'Sharhlar', icon: Star },
  { href: '/business/revenue', label: 'Daromad', icon: TrendingUp },
  { href: '/business/settings', label: 'Sozlamalar', icon: Settings },
]

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (profile?.role !== 'business' && profile?.role !== 'admin') { router.replace('/') }
  }, [user, profile, loading, router])

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['business-pending-count', profile?.id],
    queryFn: async () => {
      const { data: venues } = await supabase
        .from('venues').select('id').eq('owner_id', profile!.id)
      const ids = venues?.map(v => v.id) ?? []
      if (ids.length === 0) return 0
      const { count } = await supabase
        .from('bookings').select('*', { count: 'exact', head: true })
        .in('venue_id', ids).eq('status', 'pending')
      return count || 0
    },
    enabled: !!profile?.id,
    refetchInterval: 30000,
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/')
  }

  if (loading || !user || (profile?.role !== 'business' && profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-bg">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-0.5 no-underline">
              <span className="font-display text-xl font-bold text-brand -tracking-[0.03em]">Bron</span>
              <span className="font-display text-xl font-bold text-ink -tracking-[0.03em]">Uz</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/business/bookings"
              className="relative p-2 rounded-xl hover:bg-surface-muted transition-colors"
              aria-label="Kutilayotgan bronlar"
            >
              <Bell className="w-5 h-5 text-ink-secondary" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <span className="text-sm font-medium text-ink-secondary hidden sm:block">
                {profile?.full_name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-ink-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors hidden sm:block"
              aria-label="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <DashboardSidebar links={sidebarLinks} basePath="/business" badge="Biznes panel" />
        <MobileBottomNav links={sidebarLinks} basePath="/business" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  )
}
