import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import AdminDashboardClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [userCountRes, venueCountRes, bookingCountRes, bookingDataRes, allProfilesRes, recentProfilesRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('venues').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('total_price').eq('status', 'confirmed'),
    supabase.from('profiles').select('role'),
    supabase.from('profiles').select('full_name, phone, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = (bookingDataRes.data || []).reduce((sum: number, b: { total_price: number | null }) => sum + (b.total_price || 0), 0)

  const profilesData = allProfilesRes.data || []
  const roleCounts: Record<string, number> = {}
  profilesData.forEach((p: { role: string | null }) => { if (p.role) roleCounts[p.role] = (roleCounts[p.role] || 0) + 1 })
  const total = profilesData.length
  const roleDistribution = Object.entries(roleCounts).map(([role, value]) => ({
    key: role,
    value,
    percent: total > 0 ? Math.round((value / total) * 100) : 0,
  }))

  const recentUsers = (recentProfilesRes.data || []).map((p: { full_name: string | null; phone: string | null; role: string | null; created_at: string | null }) => ({
    name: p.full_name || '',
    email: p.phone || '',
    role: p.role || '',
    date: p.created_at ? String(new Date(p.created_at).toISOString().split('T')[0] ?? '') : '',
  }))

  return (
    <AdminDashboardClient
      userCount={userCountRes.count || 0}
      venueCount={venueCountRes.count || 0}
      bookingCount={bookingCountRes.count || 0}
      totalRevenue={totalRevenue}
      roleDistribution={roleDistribution}
      recentUsers={recentUsers}
    />
  )
}
