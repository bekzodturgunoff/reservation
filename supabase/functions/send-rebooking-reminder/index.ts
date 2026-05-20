// Rebooking reminder — called from booking confirmation page after success
// Future: can be migrated to cron via pgmq topic `rebooking_reminders`
// NEVER throws — always returns 200. Failures are logged internally.
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const REBOOKING_KEY = Deno.env.get('REBOOKING_REMINDER_KEY') || ''

interface Payload {
  booking_id: string
  user_id: string
  venue_id: string
  venue_name: string
  date: string
  start_time: string
}

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

serve(async (req) => {
  try {
    const authHeader = req.headers.get('x-rebooking-key')
    if (authHeader !== REBOOKING_KEY) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not set')
      return new Response('ok', { status: 200 })
    }

    const payload: Payload = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get Telegram links for this venue
    const { data: links } = await supabase
      .from('telegram_links')
      .select('chat_id')
      .eq('venue_id', payload.venue_id)

    if (!links || links.length === 0) {
      return new Response('no links', { status: 200 })
    }

    const message =
      `🔄 <b>Qayta bron qilish eslatmasi!</b>\n\n` +
      `📍 <b>Venue:</b> ${payload.venue_name}\n` +
      `📅 <b>Oxirgi tashrif:</b> ${payload.date}\n` +
      `⏰ <b>Vaqt:</b> ${payload.start_time}\n\n` +
      `Mijozga qayta bron qilishni taklif qiling!\n` +
      `<a href="https://bronuz.uz/venues/${payload.venue_id}">BronUz da ko'rish</a>`

    for (const link of links) {
      await sendMessage(link.chat_id, message)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('ok', { status: 200 })
  }
})
