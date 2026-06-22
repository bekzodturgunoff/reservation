import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import type { Booking } from '@/types'
import BusinessRevenueClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function RevenuePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: myVenues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('owner_id', user.id)

  let initialBookings: (Booking & { venues: { name: string } | null })[] = []

  if (myVenues && myVenues.length > 0) {
    const venueIds = myVenues.map(v => v.id)
    const { data } = await supabase
      .from('bookings')
      .select('*, venues(name)')
      .in('venue_id', venueIds)
      .order('created_at', { ascending: false })
      .limit(100)
    initialBookings = (data || []) as (Booking & { venues: { name: string } | null })[]
  }

  return (
    <BusinessRevenueClient
      userId={user.id}
      initialBookings={initialBookings}
    />
  )
}
