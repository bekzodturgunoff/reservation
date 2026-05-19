import { supabase } from '../lib/supabase'
import type { Booking } from '../types'

export const getBookingsByUser = async (userId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venues(id, name, address, photos), slots(date, start_time, end_time)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getBookingById = async (id: string): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venues(id, name, address, photos, phone), slots(date, start_time, end_time)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getBookingsByVenue = async (venueId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, slots(date, start_time, end_time), profiles(full_name, phone)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createBooking = async (booking: Partial<Booking>): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()
  if (error) throw error
  return data
}

export const cancelBooking = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
  if (error) throw error
}
