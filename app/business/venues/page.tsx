import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import BusinessVenuesClient from './page.client'

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialVenues={(venues || []) as any}
    />
  )
}
