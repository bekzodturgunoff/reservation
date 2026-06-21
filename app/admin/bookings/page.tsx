import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminBookingsClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, profiles!user_id(full_name, phone), venues!venue_id(id, name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AdminBookingsClient initialBookings={bookings || []} />
}
