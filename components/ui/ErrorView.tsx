'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-surface-subtle px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="font-display text-2xl font-bold text-ink mb-3">Nimadir noto'g'ri ketdi</h1>
        <p className="text-ink-tertiary mb-8">Texnik muammo yuz berdi. Biz bu haqda xabardor bo'ldik.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="inline-flex items-center justify-center h-11 px-6 bg-brand text-white font-medium text-sm rounded-xl hover:bg-brand-700 transition-colors">
            Qayta urinish
          </button>
          <Link href="/" className="inline-flex items-center justify-center h-11 px-6 bg-white border border-border text-ink font-medium text-sm rounded-xl hover:bg-surface-muted transition-colors">
            Bosh sahifaga
          </Link>
        </div>
      </div>
    </div>
  )
}
