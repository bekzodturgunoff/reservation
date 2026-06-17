'use client'

import { useState } from 'react'
import Link from 'next/link'

const COOKIE_KEY = 'bronuz-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(COOKIE_KEY)
  })

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-border shadow-modal p-4 sm:p-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-ink-secondary flex-1">
          Biz saytimiz ishlashi va foydalanuvchi tajribasini yaxshilash uchun cookie fayllaridan foydalanamiz.{' '}
          <Link href="/privacy" className="text-brand hover:underline">Batafsil</Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="h-10 px-5 text-sm font-medium text-ink-secondary border border-border rounded-xl hover:bg-surface-muted transition-colors"
          >
            Rad etish
          </button>
          <button
            onClick={accept}
            className="h-10 px-5 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand-dark transition-colors"
          >
            Qabul qilish
          </button>
        </div>
      </div>
    </div>
  )
}
