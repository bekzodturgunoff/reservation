import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { FavoritesClient } from './favorites.client'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, venues!venue_id(id, name, photos, city, price_per_slot, avg_rating)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <FavoritesClient favorites={favorites || []} />
}
