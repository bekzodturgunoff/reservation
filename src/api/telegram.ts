import { supabase } from '../lib/supabase'
import type { TelegramLink } from '../types'

const TELEGRAM_NOTIFY_FUNCTION = 'telegram-notify'

export const getTelegramLinks = async (userId: string): Promise<TelegramLink[]> => {
  const { data, error } = await supabase
    .from('telegram_links')
    .select('*, venues(id, name)')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export const deleteTelegramLink = async (linkId: string): Promise<void> => {
  const { error } = await supabase
    .from('telegram_links')
    .delete()
    .eq('id', linkId)
  if (error) throw error
}

export const generateLinkCode = (venueId: string, userId: string): string => {
  const data = `${venueId}:${userId}`
  return btoa(data)
}

interface NotifyPayload {
  venue_id: string
  venue_name: string
  customer_name: string
  customer_phone?: string
  date: string
  start_time: string
  end_time: string
  note?: string
}

export const sendTelegramNotification = async (payload: NotifyPayload): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke(TELEGRAM_NOTIFY_FUNCTION, {
      body: payload,
    })
    if (error) console.error('Telegram notify error:', error)
  } catch (err) {
    console.error('Telegram notify failed:', err)
  }
}
