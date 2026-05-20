import { supabase } from '../lib/supabase'
import { handleError } from '../lib/handleError'
import type { PromoCode } from '../types'

export const getVenuePromoCodes = async (venueId: string): Promise<PromoCode[]> => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(handleError(error))
  return data
}

export const validatePromoCode = async (
  code: string,
  venueId: string,
  amount: number
): Promise<{ valid: boolean; discount: number; promoCode: PromoCode }> => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return { valid: false, discount: 0, promoCode: null as unknown as PromoCode }
  }

  const promo = data as PromoCode

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, discount: 0, promoCode: promo }
  }

  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return { valid: false, discount: 0, promoCode: promo }
  }

  if (promo.min_amount && amount < promo.min_amount) {
    return { valid: false, discount: 0, promoCode: promo }
  }

  let discount: number
  if (promo.discount_type === 'percentage') {
    discount = (amount * promo.discount_value) / 100
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount
    }
  } else {
    discount = promo.discount_value
  }

  return { valid: true, discount, promoCode: promo }
}

export const createPromoCode = async (params: {
  venue_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses?: number | null
  min_amount?: number | null
  max_discount?: number | null
  expires_at?: string | null
}): Promise<PromoCode> => {
  const { data, error } = await supabase
    .from('promo_codes')
    .insert(params)
    .select()
    .single()
  if (error) throw new Error(handleError(error))
  return data
}

export const updatePromoCode = async (
  id: string,
  params: Partial<{
    code: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    max_uses: number | null
    min_amount: number | null
    max_discount: number | null
    expires_at: string | null
    is_active: boolean
  }>
): Promise<PromoCode> => {
  const { data, error } = await supabase
    .from('promo_codes')
    .update(params)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(handleError(error))
  return data
}

export const deletePromoCode = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id)
  if (error) throw new Error(handleError(error))
}

export const incrementPromoUsage = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_promo_usage', { promo_id: id })
  if (error) throw new Error(handleError(error))
}
