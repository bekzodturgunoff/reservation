import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bronuz.uz'

  const { data: venues } = await supabase
    .from('venues')
    .select('slug, updated_at')
    .eq('status', 'active')

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const venuePages: MetadataRoute.Sitemap = (venues ?? []).map(v => ({
    url: `${baseUrl}/venues/${v.slug}`,
    lastModified: new Date(v.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...venuePages]
}
