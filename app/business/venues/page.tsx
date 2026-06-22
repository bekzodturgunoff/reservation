import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessVenuesClient from './page.client'
import type { Venue } from '@/types'

type VenueWithCategory = Venue & { categories: { name_uz: string; name_ru: string; icon: string } | null }

export const dynamic = 'force-dynamic'

export default async function BusinessVenuesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: venues } = await supabase
    .from('venues')
    .select('*, categories(name_uz, name_ru, icon)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <BusinessVenuesClient
      userId={user.id}
      initialVenues={(venues || []) as VenueWithCategory[]}
    />
  )
}
