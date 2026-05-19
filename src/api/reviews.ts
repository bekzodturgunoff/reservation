import { supabase } from '../lib/supabase'
import type { Review } from '../types'

export async function getVenueReviews(venueId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(*)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
  return data || []
}
