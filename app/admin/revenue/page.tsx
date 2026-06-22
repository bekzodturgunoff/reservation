import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminRevenueClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function AdminRevenuePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [bookingDataRes, avgRatingRes, premiumCountRes] = await Promise.all([
    supabase.from('bookings').select('total_price, status, created_at').order('created_at', { ascending: true }),
    supabase.from('venues').select('avg_rating').not('avg_rating', 'is', null),
    supabase.from('venues').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const ratings = (avgRatingRes.data || []).map(v => (v as { avg_rating: number | null }).avg_rating).filter(Boolean) as number[]
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return (
    <AdminRevenueClient
      initialBookings={(bookingDataRes.data || []) as { total_price: number; status: string; created_at: string }[]}
      initialAvgRating={avgRating}
      initialPremiumCount={premiumCountRes.count || 0}
    />
  )
}
