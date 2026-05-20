import { supabase } from '../lib/supabase'
import type { Venue, VenueService, SocialProof } from '../types'
import { UZBEKISTAN_REGIONS } from '../lib/constants'

export interface VenueFilters {
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  date?: string
  search?: string
}

function resolveCityFilter(city?: string): string[] | undefined {
  if (!city) return undefined
  if (city in UZBEKISTAN_REGIONS) {
    return UZBEKISTAN_REGIONS[city]
  }
  return [city]
}

export const getVenues = async (filters: VenueFilters = {}): Promise<Venue[]> => {
  let query = supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon), services:venue_services(*)')
    .eq('status', 'active')

  const cities = resolveCityFilter(filters.city)
  if (cities) query = query.in('city', cities)
  if (filters.minPrice) query = query.gte('price_per_slot', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price_per_slot', filters.maxPrice)
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error

  if (filters.category && data) {
    return data.filter(v => v.categories?.slug === filters.category)
  }

  return data
}

export const getVenueById = async (id: string): Promise<Venue & { avg_rating?: number; review_count?: number }> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon), services:venue_services(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getVenuesByOwner = async (ownerId: string): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon), services:venue_services(*)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getVenueSocialProof = async (venueId: string): Promise<SocialProof> => {
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating, comment, profiles(full_name)')
    .eq('venue_id', venueId)

  if (reviewsError) throw reviewsError

  const totalReviews = reviews?.length ?? 0
  const recommendCount = reviews?.filter(r => r.rating >= 4).length ?? 0
  const recommendationPercent = totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 0

  const recentReviews = (reviews ?? [])
    .filter(r => r.rating === 5 && r.comment)
    .slice(0, 5)
    .map(r => ({
      text: r.comment,
      name: (r.profiles as { full_name?: string } | null)?.full_name ?? 'Anonymous',
    }))

  const { count: bookingCount, error: bookingError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('venue_id', venueId)
    .neq('status', 'cancelled')

  if (bookingError) throw bookingError

  return {
    recommendationPercent,
    recentReviews,
    bookingCount: bookingCount ?? 0,
  }
}

// --- Venue Services CRUD ---
export const getVenueServices = async (venueId: string): Promise<VenueService[]> => {
  const { data, error } = await supabase
    .from('venue_services')
    .select('*')
    .eq('venue_id', venueId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export const createVenueService = async (service: Partial<VenueService>): Promise<VenueService> => {
  const { data, error } = await supabase
    .from('venue_services')
    .insert(service)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateVenueService = async (id: string, updates: Partial<VenueService>): Promise<VenueService> => {
  const { data, error } = await supabase
    .from('venue_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteVenueService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('venue_services')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export const createVenue = async (
  venue: Partial<Venue>
): Promise<Venue> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('venues')
    .insert({
      ...venue,
      owner_id: user.id,
      status: 'pending',
    })
    .select('*, categories(id, slug, name_uz, name_ru, icon), services:venue_services(*)')
    .single()

  if (error) {
    console.error('createVenue error:', error)
    throw new Error(error.message)
  }
  return data
}

export const updateVenue = async (id: string, updates: Partial<Venue>): Promise<Venue> => {
  const { data, error } = await supabase
    .from('venues')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
