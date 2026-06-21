import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AddVenueClient from './page.client'
import type { Category } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AddVenuePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_uz, name_ru, icon')
    .order('name_uz')

  return (
    <AddVenueClient
      userId={user.id}
      initialCategories={(categories || []) as Category[]}
    />
  )
}
