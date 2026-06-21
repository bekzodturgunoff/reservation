import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminSettingsClient from './page.client'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [profileRes, profilesRes, venuesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('role'),
    supabase.from('venues').select('status'),
  ])

  const stats = {
    totalUsers: profilesRes.data?.length || 0,
    businessUsers: (profilesRes.data || []).filter((p: { role: string | null }) => p.role === 'business').length || 0,
    pendingVenues: (venuesRes.data || []).filter((v: { status: string | null }) => v.status === 'pending').length || 0,
  }

  return (
    <AdminSettingsClient
      initialProfile={profileRes.data as Profile | null}
      initialStats={stats}
    />
  )
}
