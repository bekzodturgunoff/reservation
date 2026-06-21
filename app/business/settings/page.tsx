import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessSettingsClient from './page.client'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function BusinessSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: venueInfo } = await supabase
    .from('venues')
    .select('address, phone, cancellation_policy, max_group_size, min_notice_hours')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  const venueDefaults = venueInfo as { cancellation_policy: string | null; max_group_size: number | null; min_notice_hours: number | null } | null

  return (
    <BusinessSettingsClient
      userId={user.id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialProfile={(profile as any) as Profile | null}
      initialVenueInfo={(venueInfo as { address: string | null; phone: string | null } | null) ?? null}
      initialVenueDefaults={venueDefaults}
    />
  )
}
