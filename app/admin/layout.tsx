'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/auth'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/venues', label: 'Joylar', icon: Building2 },
  { href: '/admin/revenue', label: 'Daromad', icon: TrendingUp },
  { href: '/admin/settings', label: 'Sozlamalar', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-0.5 no-underline">
            <span className="font-display text-xl font-bold text-brand -tracking-[0.03em]">Bron</span>
            <span className="font-display text-xl font-bold text-ink -tracking-[0.03em]">Uz</span>
            <Badge variant="error" size="sm" className="ml-2">Admin</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink-secondary hidden sm:block">
              {profile?.full_name}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside aria-label="Admin navigatsiya" className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-surface border-r border-border p-4 gap-1">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
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
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
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
