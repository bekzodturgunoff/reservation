import { supabase } from '../lib/supabase'
import type { Slot } from '../types'

export const getSlotsByVenueAndDate = async (venueId: string, date: string): Promise<Slot[]> => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('venue_id', venueId)
    .eq('date', date)
    .order('start_time')
  if (error) throw error
  return data
}

export const getSlotById = async (slotId: string): Promise<Slot> => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('id', slotId)
    .single()
  if (error) throw error
  return data
}

export const createSlots = async (slots: Partial<Slot>[]): Promise<Slot[]> => {
  const { data, error } = await supabase
    .from('slots')
    .insert(slots)
    .select()
  if (error) throw error
  return data
}

export const updateSlotAvailability = async (slotId: string, isAvailable: boolean): Promise<void> => {
  const { error } = await supabase
    .from('slots')
    .update({ is_available: isAvailable })
    .eq('id', slotId)
  if (error) throw error
}

export const blockDateSlots = async (venueId: string, date: string): Promise<void> => {
  const { error } = await supabase
    .from('slots')
    .update({ is_available: false })
    .eq('venue_id', venueId)
    .eq('date', date)
  if (error) throw error
}

export const unblockDateSlots = async (venueId: string, date: string): Promise<void> => {
  const { error } = await supabase
    .from('slots')
    .update({ is_available: true })
    .eq('venue_id', venueId)
    .eq('date', date)
  if (error) throw error
}
