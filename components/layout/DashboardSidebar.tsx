'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export interface SidebarLink {
  href: string
  label: string
  icon: LucideIcon
}

interface DashboardSidebarProps {
  links: SidebarLink[]
  basePath: string
  badge?: string
}

export function DashboardSidebar({ links, basePath, badge }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside aria-label="Yon navigatsiya" className="hidden lg:flex flex-col w-60 xl:w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-border p-4 gap-1">
      <div className="px-3 py-2 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
          {badge || 'Navigatsiya'}
        </p>
      </div>
      {links.map((link) => {
        const isActive =
          link.href === basePath
            ? pathname === basePath
            : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink-secondary hover:bg-surface-bg hover:text-ink'
            }`}
          >
            <link.icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-ink-muted'}`} />
            {link.label}
          </Link>
        )
      })}
    </aside>
  )
}

export function MobileBottomNav({ links, basePath }: { links: SidebarLink[]; basePath: string }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Mobil navigatsiya" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex justify-around px-1 py-1.5 safe-area-bottom">
      {links.map((link) => {
        const isActive =
          link.href === basePath
            ? pathname === basePath
            : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-colors shrink-0 ${
              isActive ? 'text-brand' : 'text-ink-tertiary'
            }`}
          >
            <link.icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
            <span className="truncate max-w-14 leading-tight">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
