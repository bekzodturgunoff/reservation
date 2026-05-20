// Telegram notification sender — called after a booking is created
// NEVER throws — always returns 200. Failures are logged internally.
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface NotificationPayload {
  venue_id: string
  venue_name: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  service_name?: string
  date: string
  start_time: string
  end_time: string
  note?: string
  booking_id?: string
}

const sendMessage = async (chatId: number, text: string, bookingId?: string, venueId?: string) => {
  if (!BOT_TOKEN) return
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
    if (bookingId) {
      body.reply_markup = {
        inline_keyboard: [[
          { text: "📋 Bronni ko'rish", url: `https://bronuz.uz/confirmation/${bookingId}` },
          ...(venueId ? [{ text: '🔗 Venue sahifasi', url: `https://bronuz.uz/venues/${venueId}` }] : []),
        ]]
      }
    }
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // Individual message failures never crash the function
  }
}

serve(async (req) => {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not set')
      return new Response('ok', { status: 200 })
    }

    const payload: NotificationPayload = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: links } = await supabase
      .from('telegram_links')
      .select('chat_id')
      .eq('venue_id', payload.venue_id)

    if (!links || links.length === 0) {
      return new Response('no links', { status: 200 })
    }

    const message =
      `🆕 <b>Yangi bron!</b>\n\n` +
      `📍 <b>Joy:</b> ${payload.venue_name}\n` +
      `👤 <b>Mijoz:</b> ${payload.customer_name}\n` +
      (payload.customer_email ? `📧 ${payload.customer_email}\n` : '') +
      (payload.customer_phone ? `📞 ${payload.customer_phone}\n` : '') +
      (payload.service_name ? `🔧 <b>Xizmat:</b> ${payload.service_name}\n` : '') +
      `📅 <b>Sana:</b> ${payload.date}\n` +
      `⏰ <b>Vaqt:</b> ${payload.start_time} — ${payload.end_time}\n` +
      (payload.note ? `📝 <b>Izoh:</b> ${payload.note}\n` : '') +
      `\n🔗 <a href="https://bronuz.uz">BronUz</a>`

    for (const link of links) {
      await sendMessage(link.chat_id, message, payload.booking_id, payload.venue_id)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('ok', { status: 200 })
  }
})
