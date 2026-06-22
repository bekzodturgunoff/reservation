import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessDashboardClient, { type TodayBooking } from './dashboard.client'

export const dynamic = 'force-dynamic'

export default async function BusinessDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: myVenues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('owner_id', user.id)
  const venueIds = (myVenues || []).map(v => v.id)

  const today = new Date().toISOString().split('T')[0] ?? ''

  let initialStats = {
    todayCount: 0,
    pendingCount: 0,
    todayRevenue: 0,
    avgRating: null as string | null,
    reviewCount: 0,
  }
  let initialTodayBookings: TodayBooking[] = []

  if (venueIds.length > 0) {
    const [todayBk, pendingBk, reviewsRes, todayBookingsRes] = await Promise.all([
      supabase.from('bookings').select('id, total_price').in('venue_id', venueIds).eq('booking_date', today),
      supabase.from('bookings').select('id').in('venue_id', venueIds).eq('booking_date', today).eq('status', 'pending'),
      supabase.from('reviews').select('rating').in('venue_id', venueIds),
      supabase
        .from('bookings')
        .select('id, start_time, end_time, status, total_price, booking_date, profiles!user_id(full_name, phone), venues!venue_id(name)')
        .in('venue_id', venueIds)
        .eq('booking_date', today)
        .order('start_time'),
    ])

    const todayTotal = (todayBk.data || []).reduce((s, b) => s + (b.total_price || 0), 0)
    const avgRating = reviewsRes.data?.length
      ? (reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length).toFixed(1)
      : null

    initialStats = {
      todayCount: todayBk.data?.length || 0,
      pendingCount: pendingBk.data?.length || 0,
      todayRevenue: todayTotal,
      avgRating,
      reviewCount: reviewsRes.data?.length || 0,
    }
    initialTodayBookings = (todayBookingsRes.data || []) as unknown as TodayBooking[]
  }

  return (
    <BusinessDashboardClient
      userId={user.id}
      initialVenues={myVenues || []}
      initialStats={initialStats}
      initialTodayBookings={initialTodayBookings}
    />
  )
}
