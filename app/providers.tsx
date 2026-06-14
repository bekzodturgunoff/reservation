'use client'

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { useLenis } from '@/lib/lenis'
import i18n from '@/lib/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
})

function LenisProvider({ children }: { children: React.ReactNode }) {
  useLenis()
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LenisProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #059669',
                },
              },
              error: {
                style: {
                  background: '#FEF2F2',
                  color: '#991B1B',
                  border: '1px solid #EF4444',
                },
              },
            }}
          />
          {children}
        </LenisProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
