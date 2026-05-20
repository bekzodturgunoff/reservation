import { supabase } from '../lib/supabase'
import { handleError } from '../lib/handleError'
import type { WaitlistBooking } from '../types'

export const joinWaitlist = async (params: {
  venue_id: string
  slot_time: string
  party_size?: number
}): Promise<WaitlistBooking> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('waitlist_bookings')
    .insert({
      venue_id: params.venue_id,
      user_id: user.id,
      slot_time: params.slot_time,
      party_size: params.party_size ?? 1,
    })
    .select()
    .single()
  if (error) throw new Error(handleError(error))
  return data
}

export const leaveWaitlist = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('waitlist_bookings')
    .delete()
    .eq('id', id)
  if (error) throw new Error(handleError(error))
}

export const getMyWaitlist = async (): Promise<WaitlistBooking[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('waitlist_bookings')
    .select('*, venues(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleError(error))
  return data
}

export const getVenueWaitlist = async (venueId: string, date?: string): Promise<WaitlistBooking[]> => {
  let query = supabase
    .from('waitlist_bookings')
    .select('*')
    .eq('venue_id', venueId)

  if (date) {
    const start = `${date}T00:00:00`
    const end = `${date}T23:59:59`
    query = query.gte('slot_time', start).lte('slot_time', end)
  }

  const { data, error } = await query.order('slot_time', { ascending: true })
  if (error) throw new Error(handleError(error))
  return data
}
