import { supabase } from '../lib/supabase'
import type { TelegramLink } from '../types'

const TELEGRAM_NOTIFY_FUNCTION = 'telegram-notify'

const invokeSafe = async (fn: string, body: Record<string, unknown>, ms = 3000): Promise<boolean> => {
  const timeout = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  )
  const call = (async () => {
    const { error } = await supabase.functions.invoke(fn, { body })
    if (error) throw error
  })()
  try {
    await Promise.race([call, timeout])
    return true
  } catch (err) {
    console.warn(`[telegram] ${fn} failed:`, err instanceof Error ? err.message : err)
    return false
  }
}

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

// Generate a code that links ALL of the user's venues (no specific venue)
export const generateUserLinkCode = (userId: string): string => {
  return btoa(`user:${userId}`)
}

export const sendTelegramNotification = async (payload: Record<string, unknown>): Promise<boolean> => {
  return invokeSafe(TELEGRAM_NOTIFY_FUNCTION, payload)
}
