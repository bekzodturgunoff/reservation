import { supabase } from '../lib/supabase'
import { handleError } from '../lib/handleError'
import type { Review } from '../types'

export const getReviewsByVenue = async (venueId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleError(error))
  return data
}

export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, venues(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleError(error))
  return data
}

export const createReview = async (review: {
  user_id: string
  venue_id: string
  booking_id?: string
  rating: number
  comment: string
  photos?: string[]
}): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select('*, profiles(full_name, avatar_url)')
    .single()
  if (error) throw new Error(handleError(error))
  return data
}
