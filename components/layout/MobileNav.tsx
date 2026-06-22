'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

const navItems = [
  { href: ROUTES.HOME, label: 'Home', Icon: Home },
  { href: ROUTES.SEARCH, label: 'Search', Icon: Search },
  { href: ROUTES.PROFILE_FAVORITES, label: 'Favorites', Icon: Heart },
  { href: ROUTES.PROFILE, label: 'Profile', Icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-line md:hidden shadow-modal pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full px-3 rounded-xl transition-colors duration-fast ${
                isActive
                  ? 'text-brand'
                  : 'text-ink-tertiary hover:text-ink-secondary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-brand/15' : ''}`} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
