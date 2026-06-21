import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { UserBookingsClient } from './bookings.client'

export const dynamic = 'force-dynamic'

export default async function UserBookingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, venues!venue_id(id, name, photos, city, address)')
    .eq('user_id', user.id)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })

  return <UserBookingsClient user={user} initialBookings={bookings || []} />
}
