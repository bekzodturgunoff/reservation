'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarCheck,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { DashboardSidebar, MobileBottomNav } from '@/components/layout/DashboardSidebar'
import type { SidebarLink } from '@/components/layout/DashboardSidebar'

const sidebarLinks: SidebarLink[] = [
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-0.5 no-underline">
            <span className="font-display text-xl font-bold text-brand -tracking-[0.03em]">Bron</span>
            <span className="font-display text-xl font-bold text-ink -tracking-[0.03em]">Uz</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <span className="text-sm font-medium text-ink-secondary hidden sm:block">
                {profile?.full_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <DashboardSidebar links={sidebarLinks} basePath="/business" badge="Biznes panel" />
        <MobileBottomNav links={sidebarLinks} basePath="/business" />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  )
}
