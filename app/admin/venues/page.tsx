import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminVenuesClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function AdminVenuesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: venues } = await supabase
    .from('venues')
    .select('*, categories(name_uz, name_ru, icon)')
    .order('created_at', { ascending: false })

  const venuesList = venues || []

  const ownerIds = [...new Set(venuesList.map((v: { owner_id: string | null }) => v.owner_id).filter(Boolean))]
  let ownersList: { id: string; full_name: string | null }[] = []

  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', ownerIds)

    if (owners) {
      ownersList = owners as { id: string; full_name: string | null }[]
    }
  }

  return <AdminVenuesClient initialVenues={venuesList as never[]} initialOwners={ownersList} />
}
