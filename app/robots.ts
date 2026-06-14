import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/business', '/booking', '/profile'],
      },
    ],
    sitemap: 'https://bronuz.uz/sitemap.xml',
  }
}
