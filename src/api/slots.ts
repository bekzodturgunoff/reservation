import { supabase } from '../lib/supabase'
import type { Slot } from '../types'

export async function getSlotsByVenueAndDate(
  venueId: string,
  date: string
): Promise<Slot[]> {
  const { data } = await supabase
    .from('slots')
    .select('*')
    .eq('venue_id', venueId)
    .eq('date', date)
    .order('start_time')
  return data || []
}
