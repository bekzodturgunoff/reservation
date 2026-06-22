'use client'

import { useAuthStore } from '@/store/auth'

export function AppLoader({ children }: { children: React.ReactNode }) {
  const loading = useAuthStore((s) => s.loading)
  const initialized = useAuthStore((s) => s.initialized)

  if (loading && !initialized) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="flex items-center gap-1">
          <span className="font-display text-[28px] font-extrabold text-brand -tracking-[0.03em]">Bron</span>
          <span className="font-display text-[28px] font-extrabold text-[#0A0A0A] -tracking-[0.03em]">Uz</span>
        </div>
        <div className="mt-4 flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
