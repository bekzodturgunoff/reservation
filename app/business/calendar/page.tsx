import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessCalendarClient from './page.client'

interface CalendarBooking {
  id: string
  booking_date: string
  start_time: string | null
  end_time: string | null
  status: string
  profiles: { full_name: string | null } | null
  venues: { name: string | null } | null
}

export const dynamic = 'force-dynamic'

export default async function BusinessCalendarPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: myVenues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('owner_id', user.id)

  const venueIds = (myVenues || []).map(v => v.id)

  let initialBookings: CalendarBooking[] = []
  const initialBlockedDates: string[] = []

  if (venueIds.length > 0) {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const fromDate = firstDay.toISOString().split('T')[0] ?? ''
    const toDate = lastDay.toISOString().split('T')[0] ?? ''

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, status, profiles!user_id(full_name), venues!venue_id(name)')
      .in('venue_id', venueIds)
      .gte('booking_date', fromDate)
      .lte('booking_date', toDate)
      .not('status', 'in', '("cancelled","no_show")')
    initialBookings = (bookings || []) as unknown as CalendarBooking[]

    const { data: blocked } = await supabase
      .from('blocked_dates')
      .select('date')
      .in('venue_id', venueIds)
      .gte('date', fromDate)
      .lte('date', toDate)
    if (blocked) {
      initialBlockedDates.push(...blocked.map(d => d.date))
    }
  }

  return (
    <BusinessCalendarClient
      userId={user.id}
      initialBookings={initialBookings}
      initialBlockedDates={initialBlockedDates}
      initialVenues={myVenues || []}
    />
  )
}
