import { supabase } from '../lib/supabase'
import type { Venue } from '../types'

export interface VenueFilters {
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  date?: string
  search?: string
}

export const getVenues = async (filters: VenueFilters = {}): Promise<Venue[]> => {
  let query = supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon)')
    .eq('status', 'active')

  if (filters.city) query = query.eq('city', filters.city)
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
    .select('*, categories(id, slug, name_uz, name_ru, icon)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getVenuesByOwner = async (ownerId: string): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*, categories(id, slug, name_uz, name_ru, icon)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createVenue = async (venue: Partial<Venue>): Promise<Venue> => {
  const { data, error } = await supabase
    .from('venues')
    .insert(venue)
    .select()
    .single()
  if (error) throw error
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
