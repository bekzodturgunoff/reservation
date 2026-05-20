// Booking reminder — run via cron: supabase functions deploy booking-reminder
// Then: supabase cron create --schedule "0 */2 * * *" --function booking-reminder
// NEVER throws — always returns 200. Failures are logged internally.
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const sendMessage = async (chatId: number, text: string) => {
  if (!BOT_TOKEN) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch {
    // never crash on send
  }
}

serve(async () => {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not set')
      return new Response('ok', { status: 200 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const now = new Date()
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const today = now.toISOString().split('T')[0]
    const timeStr = `${String(in2h.getHours()).padStart(2, '0')}:${String(in2h.getMinutes()).padStart(2, '0')}`

    // Find bookings happening ~2h from now
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, venues!inner(id, name, owner_id), slots(date, start_time), profiles(full_name)')
      .eq('slots.date', today)
      .gte('slots.start_time', timeStr)
      .lt('slots.start_time', `${String(in2h.getHours() + 1).padStart(2, '0')}:00`)

    if (!bookings || bookings.length === 0) return new Response('no bookings', { status: 200 })

    for (const b of bookings) {
      // Notify business owner via Telegram
      const { data: links } = await supabase
        .from('telegram_links')
        .select('chat_id')
        .eq('venue_id', b.venue_id)

      if (links) {
        for (const l of links) {
          await sendMessage(l.chat_id,
            `⏰ <b>Eslatma!</b>\n\n` +
            `2 soatdan keyin bron:\n` +
            `📍 ${b.venues?.name || 'Noma\'lum'}\n` +
            `👤 ${(b as any).profiles?.full_name || 'Mijoz'}\n` +
            `⏰ ${b.slots?.start_time?.slice(0, 5) || '—'}\n\n` +
            `https://bronuz.uz`
          )
        }
      }
    }

    return new Response(`reminded ${bookings.length} bookings`, { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('ok', { status: 200 })
  }
})
