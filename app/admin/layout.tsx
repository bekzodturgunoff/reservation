'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Settings,
  CalendarCheck,
  ClipboardCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/auth'
import { DashboardSidebar, MobileBottomNav } from '@/components/layout/DashboardSidebar'
import type { SidebarLink } from '@/components/layout/DashboardSidebar'

const sidebarLinks: SidebarLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/venues/review', label: 'Tekshiruv', icon: ClipboardCheck },
  { href: '/admin/venues', label: 'Joylar', icon: Building2 },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/bookings', label: 'Bronlar', icon: CalendarCheck },
  { href: '/admin/revenue', label: 'Daromad', icon: TrendingUp },
  { href: '/admin/settings', label: 'Sozlamalar', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (profile?.role !== 'admin') {
      router.replace('/')
    }
  }, [user, profile, loading, router])

  if (loading || !user || profile?.role !== 'admin') {
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
            <Badge variant="error" size="sm" className="ml-2">Admin</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-ink-secondary hidden sm:block">
                {profile?.full_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <DashboardSidebar links={sidebarLinks} basePath="/admin" badge="Admin panel" />
        <MobileBottomNav links={sidebarLinks} basePath="/admin" />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  )
}
