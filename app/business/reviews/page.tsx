import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessReviewsClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function BusinessReviewsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: myVenues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('owner_id', user.id)
  const venueIds = (myVenues || []).map(v => v.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialReviews: any[] = []

  if (venueIds.length > 0) {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles!user_id(full_name, avatar_url), venues!venue_id(name)')
      .in('venue_id', venueIds)
      .order('created_at', { ascending: false })
    initialReviews = data ?? []
  }

  return (
    <BusinessReviewsClient
      userId={user.id}
      initialVenues={myVenues || []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialReviews={initialReviews as any}
    />
  )
}
