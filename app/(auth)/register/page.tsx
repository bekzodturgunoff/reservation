import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { RegisterClient } from './register.client'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(ROUTES.HOME)
  }

  return <RegisterClient />
}
