// Telegram bot webhook — handles /start to link chat to user venues
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface Update {
  message?: {
    chat: { id: number }
    text?: string
    from?: { id: number; username?: string }
  }
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
    const update: Update = await req.json()
    const msg = update.message
    if (!msg?.text) return new Response('ok', { status: 200 })

    const chatId = msg.chat.id
    const text = msg.text.trim()

    // /start command — guide user
    if (text === '/start') {
      await sendMessage(chatId,
        `👋 <b>BronUz botiga xush kelibsiz!</b>\n\n` +
        `Bu bot orqali venue laringizga kelgan bronlar haqida xabar olasiz.\n\n` +
        `Ulanish uchun:\n` +
        `1. BronUz web saytiga kiring\n` +
        `2. Biznes panel → Telegram ga ulash bo'limiga o'ting\n` +
        `3. Venue ni tanlang va ko'rsatilgan kodni yuboring\n\n` +
        `Yoki /help ni bosing.`
      )
      return new Response('ok', { status: 200 })
    }

    // /help
    if (text === '/help') {
      await sendMessage(chatId,
        `🔹 <b>Yordam</b>\n\n` +
        `/start — Bot haqida ma'lumot\n` +
        `/help - Yordam\n` +
        `/status — Ulangan venue lar\n\n` +
        `Agar sizga kod berilgan bo'lsa, uni shu yerga yozing.`
      )
      return new Response('ok', { status: 200 })
    }

    // Check if text is a venue link code (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(text)) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      // Decode the link code: base64(venue_id:user_id)
      let venueId: string, userId: string
      try {
        const decoded = atob(text)
        const parts = decoded.split(':')
        if (parts.length !== 2) throw new Error('invalid')
        venueId = parts[0]
        userId = parts[1]
      } catch {
        await sendMessage(chatId, '❌ Noto\'g\'ri kod. Iltimos boshqattan urinib ko\'ring.')
        return new Response('ok', { status: 200 })
      }

      // Check venue exists
      const { data: venue } = await supabase
        .from('venues')
        .select('id, name')
        .eq('id', venueId)
        .single()

      if (!venue) {
        await sendMessage(chatId, '❌ Venue topilmadi.')
        return new Response('ok', { status: 200 })
      }

      // Check if already linked
      const { data: existing } = await supabase
        .from('telegram_links')
        .select('id')
        .eq('venue_id', venueId)
        .eq('chat_id', chatId)
        .maybeSingle()

      if (existing) {
        await sendMessage(chatId, `ℹ️ "${venue.name}" allaqachon ulangan.`)
        return new Response('ok', { status: 200 })
      }

      // Create link
      const { error } = await supabase
        .from('telegram_links')
        .insert({ user_id: userId, venue_id: venueId, chat_id: chatId })

      if (error) {
        await sendMessage(chatId, '❌ Xatolik yuz berdi: ' + error.message)
        return new Response('ok', { status: 200 })
      }

      await sendMessage(chatId,
        `✅ <b>"${venue.name}"</b> muvaffaqiyatli ulandi!\n\n` +
        `Endi bu venue ga kelgan bronlar haqida xabar olasiz.`
      )
      return new Response('ok', { status: 200 })
    }

    // Unknown command
    await sendMessage(chatId, '❓ Noma\'lum buyruq. /help ni bosing.')
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
