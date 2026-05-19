import { supabase } from '../lib/supabase'
import type { Booking } from '../types'

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings')
    .select('*, venues(*), slots(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function createBooking(booking: {
  user_id: string
  venue_id: string
  slot_id: string
  total_price: number
  note?: string
}): Promise<Booking | null> {
  const { data } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()
  return data
}
