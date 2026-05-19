import { supabase } from '../lib/supabase'
import type { Venue } from '../types'

export interface AdminStats {
  totalVenues: number
  totalUsers: number
  totalBookings: number
  pendingVenues: number
}

export interface PendingVenue extends Venue {
  profiles?: { full_name: string; email?: string; phone?: string }
}

export const getPendingVenues = async (): Promise<PendingVenue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon), profiles!owner_id(full_name, phone)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const approveVenue = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('venues')
    .update({ status: 'active' })
    .eq('id', id)
  if (error) throw error
}

export const rejectVenue = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('venues')
    .update({ status: 'rejected' })
    .eq('id', id)
  if (error) throw error
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const [venuesRes, usersRes, bookingsRes, pendingRes] = await Promise.all([
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalVenues: venuesRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
    totalBookings: bookingsRes.count ?? 0,
    pendingVenues: pendingRes.count ?? 0,
  }
}
