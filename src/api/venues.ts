import { supabase } from '../lib/supabase'
import type { Venue } from '../types'

export async function getActiveVenues(limit = 6): Promise<Venue[]> {
  const { data } = await supabase
    .from('venues')
    .select('*, categories(*)')
    .eq('status', 'active')
    .limit(limit)
  return data || []
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const { data } = await supabase
    .from('venues')
    .select('*, categories(*)')
    .eq('id', id)
    .single()
  return data
}
