/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AppLoader } from '@/components/layout/AppLoader'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'BronUz — Onlayn Bron',
    template: '%s — BronUz',
  },
  description: 'Kafe, restoran, futbol maydonlari va boshqa joylarni onlayn bron qiling. O\'zbekistondagi №1 bron platformasi.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'BronUz — Onlayn Bron',
    description: 'O\'zbekistondagi eng yaxshi joylarni bir joydan topib, tezda bron qiling.',
    url: 'https://bronuz.uz',
    siteName: 'BronUz',
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BronUz — Onlayn Bron',
    description: 'O\'zbekistondagi eng yaxshi joylarni bir joydan topib, tezda bron qiling.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <Providers>
          <AppLoader>
            {children}
          </AppLoader>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
