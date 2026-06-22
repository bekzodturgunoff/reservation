import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessBookingsClient, { type BusinessBooking } from './page.client'

export const dynamic = 'force-dynamic'

export default async function BusinessBookingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: myVenues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('owner_id', user.id)

  const venueIds = (myVenues || []).map(v => v.id)

  let initialBookings: BusinessBooking[] = []

  if (venueIds.length > 0) {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles!user_id(full_name, phone), venues!venue_id(id, name)')
      .in('venue_id', venueIds)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })
    initialBookings = (data || []) as BusinessBooking[]
  }

  return (
    <BusinessBookingsClient
      userId={user.id}
      initialBookings={initialBookings}
      initialVenues={myVenues || []}
    />
  )
}
