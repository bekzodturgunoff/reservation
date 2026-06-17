import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [venuesResult, usersResult, ratingsResult] = await Promise.all([
      supabase.from('venues').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('rating'),
    ])

    const venueCount = venuesResult.count ?? 0
    const userCount = usersResult.count ?? 0
    const avgRating = ratingsResult.data?.length
      ? (ratingsResult.data.reduce((sum, r) => sum + r.rating, 0) / ratingsResult.data.length).toFixed(1)
      : null

    return Response.json({ venueCount, userCount, avgRating })
  } catch {
    return Response.json({ venueCount: 0, userCount: 0, avgRating: null })
  }
}
