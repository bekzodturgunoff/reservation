import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminVenueReviewClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function AdminVenueReviewPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: pendingVenues } = await supabase
    .from('venues')
    .select('*, profiles!owner_id(full_name, phone, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return <AdminVenueReviewClient initialPendingVenues={pendingVenues || []} />
}
