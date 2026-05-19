import { supabase } from '../lib/supabase'
import type { Favorite } from '../types'

export const getFavorites = async (userId: string): Promise<Favorite[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, venues(id, name, city, price_per_slot, photos, categories(slug, name_uz, name_ru, icon))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const addFavorite = async (userId: string, venueId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, venue_id: venueId })
  if (error) throw error
}

export const removeFavorite = async (userId: string, venueId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('venue_id', venueId)
  if (error) throw error
}

export const isFavorited = async (userId: string, venueId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .maybeSingle()
  if (error) throw error
  return !!data
}
