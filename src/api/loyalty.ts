import { supabase } from '../lib/supabase'
import { handleError } from '../lib/handleError'
import type { LoyaltyPoints, LoyaltyHistory } from '../types'

export const getMyPoints = async (): Promise<LoyaltyPoints[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*, venues(name)')
    .eq('user_id', user.id)
  if (error) throw new Error(handleError(error))
  return data
}

export const getPointsHistory = async (): Promise<LoyaltyHistory[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('loyalty_history')
    .select('*, venues(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleError(error))
  return data
}

const POINTS_PER_DOLLAR = 1
const REDEMPTION_RATE = 100

export const checkRedeemable = (points: number): { canRedeem: boolean; value: number } => {
  const value = Math.floor(points / REDEMPTION_RATE)
  return { canRedeem: value > 0, value }
}

export const redeemPoints = async (
  bookingId: string,
  points: number
): Promise<{ discount: number }> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const value = Math.floor(points / REDEMPTION_RATE)

  const { error } = await supabase.rpc('redeem_loyalty_points', {
    p_user_id: user.id,
    p_booking_id: bookingId,
    p_points: points,
  })
  if (error) throw new Error(handleError(error))
  return { discount: value }
}

export const calculateEarnedPoints = (amount: number): number => {
  return Math.floor(amount * POINTS_PER_DOLLAR)
}
