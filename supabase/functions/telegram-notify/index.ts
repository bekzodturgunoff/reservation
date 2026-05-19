// Telegram notification sender — called after a booking is created
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface NotificationPayload {
  venue_id: string
  venue_name: string
  customer_name: string
  customer_phone?: string
  date: string
  start_time: string
  end_time: string
  note?: string
}

const sendMessage = async (chatId: number, text: string) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get all chat_ids linked to this venue
    const { data: links } = await supabase
      .from('telegram_links')
      .select('chat_id')
      .eq('venue_id', payload.venue_id)

    if (!links || links.length === 0) {
      return new Response('no links', { status: 200 })
    }

    const message =
      `🆕 <b>Yangi bron!</b>\n\n` +
      `📍 <b>Venue:</b> ${payload.venue_name}\n` +
      `👤 <b>Mijoz:</b> ${payload.customer_name}${payload.customer_phone ? ` (${payload.customer_phone})` : ''}\n` +
      `📅 <b>Sana:</b> ${payload.date}\n` +
      `⏰ <b>Vaqt:</b> ${payload.start_time} — ${payload.end_time}\n` +
      (payload.note ? `📝 <b>Izoh:</b> ${payload.note}\n` : '') +
      `\n🔗 BronUz da ko'rish: https://bronuz.uz`

    for (const link of links) {
      await sendMessage(link.chat_id, message)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
