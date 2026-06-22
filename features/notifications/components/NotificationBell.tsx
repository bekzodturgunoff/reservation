'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
        aria-label={t('nav.notifications')}
      >
        <Bell className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-modal border border-line overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-line">
            <p className="text-sm font-semibold text-ink">{t('nav.notifications')}</p>
          </div>
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 mx-auto text-ink-muted mb-2" />
            <p className="text-sm text-ink-tertiary">{t('nav.noNotifications')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
