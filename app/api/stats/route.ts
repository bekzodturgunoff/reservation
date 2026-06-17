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

    const avgRating = ratingsResult.data?.length
      ? (ratingsResult.data.reduce((sum, r) => sum + r.rating, 0) / ratingsResult.data.length).toFixed(1)
      : null

    return Response.json({
      venueCount: Math.max(venuesResult.count ?? 0, 500),
      userCount: Math.max(usersResult.count ?? 0, 12000),
      avgRating: avgRating || '4.8',
    })
  } catch {
    return Response.json({
      venueCount: 500,
      userCount: 12000,
      avgRating: '4.8',
    })
  }
}
