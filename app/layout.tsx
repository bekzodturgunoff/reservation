import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { createServerT } from '@/lib/i18n/server'
import { AppLoader } from '@/components/layout/AppLoader'
import { MobileNav } from '@/components/layout/MobileNav'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const body = Inter({
  subsets: ['latin', 'cyrillic'],
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bronuz.uz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BronUz — Onlayn bron qilish | O\'zbekistondagi №1 bron platformasi',
    template: '%s — BronUz',
  },
  description:
    'Kafe, restoran, futbol maydonlari, sport zallari va boshqa joylarni onlayn bron qiling. O\'zbekistondagi eng katta bron platformasi. 30+ toifadagi 1000+ joy.',
  keywords: [
    'bron', 'onlayn bron', 'bron qilish', 'Toshkent', 'kafe bron', 'restoran bron',
    'futbol maydoni', 'sport zal', 'kovorking', 'beauty salon', 'bilyard',
    'O\'zbekiston', 'booking', 'Uzbekistan',
  ],
  authors: [{ name: 'BronUz' }],
  creator: 'BronUz',
  publisher: 'BronUz',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU', 'en_US'],
    siteName: 'BronUz',
    title: 'BronUz — Onlayn bron qilish',
    description:
      'Kafe, restoran, futbol maydonlari va boshqa joylarni onlayn bron qiling. O\'zbekistondagi №1 bron platformasi.',
    url: siteUrl,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'BronUz — Onlayn bron qilish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BronUz — Onlayn bron qilish',
    description:
      'O\'zbekistondagi eng yaxshi joylarni bir joydan topib, tezda bron qiling.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'booking',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: true,
    address: true,
  },
  appleWebApp: {
    capable: true,
    title: 'BronUz',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BronUz',
    url: siteUrl,
    description:
      'Kafe, restoran, futbol maydonlari va boshqa joylarni onlayn bron qiling.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['uz', 'ru', 'en'],
    copyrightYear: new Date().getFullYear(),
    isFamilyFriendly: true,
    thumbnailUrl: `${siteUrl}/og-image.png`,
  }

  return (
    <html
      lang="uz"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="canonical" href={siteUrl} />
        <meta name="geo.region" content="UZ" />
        <meta name="geo.placename" content="Toshkent" />
        <meta name="theme-color" content="#059669" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BronUz" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-xl focus:outline-none"
        >
          {t('common.skipToContent')}
        </a>
        <Providers>
          <AppLoader>
            <div id="main-content">{children}</div>
            <MobileNav />
          </AppLoader>
        </Providers>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
