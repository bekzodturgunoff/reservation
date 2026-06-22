import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { SettingsClient } from './settings.client'

export const dynamic = 'force-dynamic'

export default async function UserSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, avatar_url, role, created_at')
    .eq('id', user.id)
    .single()

  return <SettingsClient profile={profile} />
}
