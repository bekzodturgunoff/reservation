// Telegram bot webhook — handles /start to link chat to user venues
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface Update {
  message?: {
    chat: { id: number; first_name?: string }
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

const tryDecodeLinkCode = (text: string): { venueId: string; userId: string } | null => {
  try {
    const decoded = atob(text)
    const parts = decoded.split(':')
    if (parts.length === 2 && parts[0].length === 36 && parts[1].length === 36) {
      return { venueId: parts[0], userId: parts[1] }
    }
  } catch {
    // not base64
  }
  return null
}

serve(async (req) => {
  try {
    const update: Update = await req.json()
    const msg = update.message
    if (!msg?.text) return new Response('ok', { status: 200 })

    const chatId = msg.chat.id
    const text = msg.text.trim()
    const firstName = msg.chat.first_name || 'Foydalanuvchi'
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // /start command
    if (text === '/start') {
      await sendMessage(chatId,
        `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
        `Bu bot BronUz platformasidagi venue laringizga kelgan bronlar haqida xabar beradi.\n\n` +
        `🔹 <b>Ulanish uchun:</b>\n` +
        `1. BronUz web saytiga kiring\n` +
        `2. Biznes panel → Telegram ga ulash\n` +
        `3. "Link venue" tugmasini bosing\n` +
        `4. Kodni nusxalab shu yerga yuboring\n\n` +
        `🔹 <b>Buyruqlar:</b>\n` +
        `/help — Yordam\n` +
        `/status — Ulangan venue lar ro'yxati\n` +
        `/bookings — So'nggi 5 ta bron\n` +
        `/unlink_all — Barcha venue larni uzish`
      )
      return new Response('ok', { status: 200 })
    }

    // /help
    if (text === '/help') {
      await sendMessage(chatId,
        `🔹 <b>Yordam</b>\n\n` +
        `<b>BronUz boti</b> — venue egalari uchun.\n\n` +
        `<b>Buyruqlar:</b>\n` +
        `/start — Bot haqida ma'lumot\n` +
        `/help — Yordam\n` +
        `/status — Ulangan venue lar ro'yxati\n` +
        `/bookings — So'nggi 5 ta bron\n` +
        `/unlink_all — Barcha venue larni uzish\n\n` +
        `<b>Kod ulash:</b>\n` +
        `Web saytdagi "Link venue" tugmasidan olingan kodni yuboring.`
      )
      return new Response('ok', { status: 200 })
    }

    // /status — list linked venues
    if (text === '/status') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('*, venues(name)')
        .eq('chat_id', chatId)

      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Hali hech qanday venue ulanmagan. Web saytdan kod oling va yuboring.')
        return new Response('ok', { status: 200 })
      }

      const list = links.map((l: any, i: number) =>
        `${i + 1}. ${l.venues?.name || 'Noma\'lum'}`
      ).join('\n')

      await sendMessage(chatId,
        `✅ <b>Ulangan venue lar (${links.length}):</b>\n\n${list}`
      )
      return new Response('ok', { status: 200 })
    }

    // /bookings — last 5 bookings for all linked venues
    if (text === '/bookings') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('venue_id')
        .eq('chat_id', chatId)

      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Avval venue laringizni ulang.')
        return new Response('ok', { status: 200 })
      }

      const venueIds = links.map((l: any) => l.venue_id)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, venues!inner(name), slots(date, start_time, end_time)')
        .in('venue_id', venueIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!bookings || bookings.length === 0) {
        await sendMessage(chatId, '📭 Hali bronlar yo\'q.')
        return new Response('ok', { status: 200 })
      }

      const list = bookings.map((b: any, i: number) =>
        `${i + 1}. <b>${b.venues?.name || 'Noma\'lum'}</b>\n` +
        `   📅 ${b.slots?.date || '—'} ⏰ ${b.slots?.start_time?.slice(0, 5) || '—'}\n` +
        `   📊 ${b.status === 'confirmed' ? '✅ Tasdiqlangan' : b.status === 'cancelled' ? '❌ Bekor qilingan' : b.status}`
      ).join('\n\n')

      await sendMessage(chatId, `📋 <b>So'nggi bronlar:</b>\n\n${list}`)
      return new Response('ok', { status: 200 })
    }

    // /unlink_all — disconnect all venues
    if (text === '/unlink_all') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('id')
        .eq('chat_id', chatId)

      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Ulanadigan venue yo\'q.')
        return new Response('ok', { status: 200 })
      }

      const ids = links.map((l: any) => l.id)
      await supabase.from('telegram_links').delete().in('id', ids)
      await sendMessage(chatId, `✅ ${ids.length} ta venue uzildi.`)
      return new Response('ok', { status: 200 })
    }

    // Try to decode as venue link code (base64)
    const decoded = tryDecodeLinkCode(text)
    if (decoded) {
      const { venueId, userId } = decoded

      const { data: venue } = await supabase
        .from('venues')
         .select('id, name')
          .eq('id', venueId)
           .single()

      if (!venue) {
        await sendMessage(chatId, '❌ Venue topilmadi. Kod noto\'g\'ri bo\'lishi mumkin.')
        return new Response('ok', { status: 200 })
      }

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

      const { error } = await supabase
        .from('telegram_links')
        .insert({ user_id: userId, venue_id: venueId, chat_id: chatId })

      if (error) {
        await sendMessage(chatId, '❌ Xatolik: ' + error.message)
        return new Response('ok', { status: 200 })
      }

      await sendMessage(chatId,
        `✅ <b>"${venue.name}"</b> muvaffaqiyatli ulandi!\n\n` +
        `Endi bu venue ga kelgan bronlar haqida tezkor xabar olasiz.`
      )
      return new Response('ok', { status: 200 })
    }

    // Unknown command
    await sendMessage(chatId,
      `❓ Noma'lum buyruq.\n\n` +
      `Agar sizga BronUz dan kod berilgan bo'lsa, uni shu yerga yuboring.\n` +
      `Aks holda /help ni bosing.`
    )
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
