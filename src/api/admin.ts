import { supabase } from '../lib/supabase'
import type { Venue, AiReviewData, AiReviewStatus } from '../types'

export interface AdminStats {
  totalVenues: number
  totalUsers: number
  totalBookings: number
  pendingVenues: number
  humanReviewVenues: number
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

export const getHumanReviewVenues = async (): Promise<PendingVenue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon), profiles!owner_id(full_name, phone)')
    .eq('status', 'human_action_needed')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const approveVenue = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('approve_venue', { venue_id: id })
  if (error) throw error
}

export const rejectVenue = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('reject_venue', { venue_id: id })
  if (error) throw error
}

export const retryAiReview = async (venueId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('ai-venue-review', {
    body: { venue_id: venueId, retry: true },
  })
  if (error) throw error
}

export function isRetryableAiStatus(data: AiReviewData | null): boolean {
  if (!data) return true
  const retryable: AiReviewStatus[] = ['ai_quota_ended', 'ai_error']
  return retryable.includes(data.review_status)
}

export function getAiReviewStatusLabel(status: AiReviewStatus): string {
  const labels: Record<AiReviewStatus, string> = {
    ai_approved: 'AI Approved',
    ai_rejected: 'AI Rejected',
    ai_suspicious: 'Suspicious',
    ai_quota_ended: 'AI Quota Ended',
    ai_error: 'AI Error',
    heuristic_approved: 'Heuristic Approved',
    heuristic_suspicious: 'Heuristic Flagged',
  }
  return labels[status] || status
}

export function getAiReviewStatusVariant(status: AiReviewStatus): 'success' | 'danger' | 'warning' | 'info' | 'default' {
  const map: Record<AiReviewStatus, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
    ai_approved: 'success',
    ai_rejected: 'danger',
    ai_suspicious: 'warning',
    ai_quota_ended: 'info',
    ai_error: 'warning',
    heuristic_approved: 'success',
    heuristic_suspicious: 'info',
  }
  return map[status] || 'info'
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const [venuesRes, usersRes, bookingsRes, pendingRes, humanRes] = await Promise.all([
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'human_action_needed'),
  ])

  return {
    totalVenues: venuesRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
    totalBookings: bookingsRes.count ?? 0,
    pendingVenues: pendingRes.count ?? 0,
    humanReviewVenues: humanRes.count ?? 0,
  }
}
