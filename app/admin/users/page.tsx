import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminUsersClient from './page.client'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, phone, avatar_url, role, created_at')
    .order('created_at', { ascending: false })

  return <AdminUsersClient initialUsers={(users || []) as Profile[]} />
}
