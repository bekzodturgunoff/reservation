'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, Calendar, Settings, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Navbar } from '@/components/layout/Navbar'
import { ROUTES } from '@/lib/constants/routes'

const sidebarLinks = [
  { href: ROUTES.PROFILE, label: 'Shaxsiy ma\'lumotlar', icon: User },
  { href: ROUTES.PROFILE_FAVORITES, label: 'Sevimlilar', icon: Heart },
  { href: ROUTES.PROFILE_BOOKINGS, label: 'Buyurtmalarim', icon: Calendar },
  { href: ROUTES.PROFILE_SETTINGS, label: 'Sozlamalar', icon: Settings },
]

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading || !initialized) return
    if (!user) {
      router.replace(`${ROUTES.LOGIN}?returnTo=${pathname}`)
    }
  }, [user, loading, initialized, router, pathname])

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-surface-bg">
      <Navbar />
      <div className="pt-[72px] flex">
        <aside className="hidden md:flex flex-col w-64 min-h-[calc(100vh-72px)] bg-surface border-r border-border p-4 gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  )
}
