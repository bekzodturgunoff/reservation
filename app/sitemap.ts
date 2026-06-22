import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bronuz.uz'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/book`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'monthly', priority: 0.1 },
    { url: `${baseUrl}/terms`, changeFrequency: 'monthly', priority: 0.1 },
  ]

  let venueIds: { id: string; updated_at: string }[]
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars')
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('venues')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
    venueIds = (data || []) as { id: string; updated_at: string }[]
  } catch {
    venueIds = []
  }

  const venuePages: MetadataRoute.Sitemap = venueIds.map(v => ({
    url: `${baseUrl}/venues/${v.id}`,
    lastModified: new Date(v.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...venuePages, { url: `${baseUrl}/opengraph-image`, changeFrequency: 'monthly', priority: 0.1 }]
}
