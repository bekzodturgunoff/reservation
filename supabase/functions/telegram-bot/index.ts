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
  callback_query?: {
    id: string
    data?: string
    message?: { chat: { id: number }; message_id?: number }
    from?: { id: number }
  }
}

const sendMessage = async (chatId: number, text: string, keyboard?: any) => {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
  if (keyboard) body.reply_markup = keyboard
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const answerCallback = async (callbackId: string, text: string) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: false }),
  })
}

const mainMenuKeyboard = () => ({
  inline_keyboard: [
    [{ text: '📋 Mening venue larim', callback_data: 'status' }],
    [{ text: '📅 Bugungi bronlar', callback_data: 'today' }],
    [{ text: '📊 Statistika', callback_data: 'stats' }],
    [{ text: '❌ Barcha venue larni uzish', callback_data: 'unlink_all' }],
  ],
})

const tryDecodeLinkCode = (text: string): { venueId: string; userId: string } | null => {
  try {
    const decoded = atob(text.trim())
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Handle callback queries (inline button clicks)
    if (update.callback_query) {
      const cb = update.callback_query
      const chatId = cb.message?.chat.id
      const data = cb.data
      if (!chatId || !data) return new Response('ok', { status: 200 })

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      if (data === 'status') {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('*, venues(name)')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await answerCallback(cb.id, 'Hali venue ulanmagan')
          await sendMessage(chatId, '📭 Hali hech qanday venue ulanmagan.')
        } else {
          const list = links.map((l: any, i: number) => `${i + 1}. ${l.venues?.name || 'Noma\'lum'}`).join('\n')
          await answerCallback(cb.id, `${links.length} ta venue`)
          await sendMessage(chatId, `✅ <b>Ulangan venue lar (${links.length}):</b>\n\n${list}`, mainMenuKeyboard())
        }
        return new Response('ok', { status: 200 })
      }

      if (data === 'today') {
        const today = new Date().toISOString().split('T')[0]
        const { data: links } = await supabase
          .from('telegram_links')
          .select('venue_id')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await sendMessage(chatId, '📭 Avval venue laringizni ulang.')
          await answerCallback(cb.id, 'Venue ulanmagan')
          return new Response('ok', { status: 200 })
        }
        const venueIds = links.map((l: any) => l.venue_id)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, venues!inner(name), slots(date, start_time, end_time)')
          .in('venue_id', venueIds)
          .eq('slots.date', today)
          .order('created_at', { ascending: false })
        if (!bookings || bookings.length === 0) {
          await sendMessage(chatId, `📅 <b>${today}</b> uchun bronlar yo'q.`, mainMenuKeyboard())
        } else {
          const list = bookings.map((b: any) =>
            `⏰ ${b.slots?.start_time?.slice(0, 5) || '—'} — <b>${b.venues?.name || 'Noma\'lum'}</b>\n` +
            `   👤 ${b.profiles?.full_name || 'Noma\'lum'} | ${b.status === 'confirmed' ? '✅' : '❌'}`
          ).join('\n\n')
          await sendMessage(chatId, `📅 <b>${today} uchun bronlar:</b>\n\n${list}`, mainMenuKeyboard())
        }
        await answerCallback(cb.id, 'Ok')
        return new Response('ok', { status: 200 })
      }

      if (data === 'stats') {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('venue_id')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await sendMessage(chatId, '📭 Avval venue laringizni ulang.')
          await answerCallback(cb.id, 'Venue ulanmagan')
          return new Response('ok', { status: 200 })
        }
        const venueIds = links.map((l: any) => l.venue_id)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('status, total_price')
          .in('venue_id', venueIds)
        const total = bookings?.length || 0
        const confirmed = bookings?.filter((b: any) => b.status === 'confirmed').length || 0
        const revenue = bookings?.filter((b: any) => b.status === 'confirmed')
          .reduce((s: number, b: any) => s + (b.total_price || 0), 0) || 0
        await answerCallback(cb.id, 'Statistika')
        await sendMessage(chatId,
          `📊 <b>Statistika</b>\n\n` +
          `📋 Jami bronlar: <b>${total}</b>\n` +
          `✅ Tasdiqlangan: <b>${confirmed}</b>\n` +
          `💰 Daromad: <b>${revenue.toLocaleString()} so'm</b>`,
          mainMenuKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      if (data === 'unlink_all') {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('id')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await answerCallback(cb.id, 'Venue yo\'q')
          return new Response('ok', { status: 200 })
        }
        const ids = links.map((l: any) => l.id)
        await supabase.from('telegram_links').delete().in('id', ids)
        await answerCallback(cb.id, `${ids.length} ta venue uzildi`)
        await sendMessage(chatId, `✅ ${ids.length} ta venue uzildi.`, mainMenuKeyboard())
        return new Response('ok', { status: 200 })
      }

      return new Response('ok', { status: 200 })
    }

    // Handle messages
    const msg = update.message
    if (!msg?.text) return new Response('ok', { status: 200 })

    const chatId = msg.chat.id
    const text = msg.text.trim()
    const firstName = msg.chat.first_name || 'Foydalanuvchi'

    // /start — welcome or process deep link code
    if (text.startsWith('/start')) {
      const code = text.slice(6).trim() // everything after "/start "
      if (code) {
        const decoded = tryDecodeLinkCode(code)
        if (!decoded) {
          await sendMessage(chatId, '❌ Kod noto\'g\'ri. Qaytadan urinib ko\'ring.')
          return new Response('ok', { status: 200 })
        }
        const { venueId, userId } = decoded
        const { data: venue } = await supabase
          .from('venues')
          .select('id, name')
          .eq('id', venueId)
          .single()
        if (!venue) {
          await sendMessage(chatId, '❌ Venue topilmadi.')
          return new Response('ok', { status: 200 })
        }
        const { data: existing } = await supabase
          .from('telegram_links')
          .select('id')
          .eq('venue_id', venueId)
          .eq('chat_id', chatId)
          .maybeSingle()
        if (existing) {
          await sendMessage(chatId, `ℹ️ "${venue.name}" allaqachon ulangan.`, mainMenuKeyboard())
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
          `Endi bu venue ga kelgan bronlar haqida tezkor xabar olasiz.`,
          mainMenuKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      // Plain /start
      await sendMessage(chatId,
        `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
        `Bu bot BronUz platformasidagi venue laringizga kelgan bronlar haqida xabar beradi.\n\n` +
        `🔹 <b>Ulanish uchun:</b>\n` +
        `BronUz web saytidagi biznes panelda "Link venue" tugmasini bosing.\n` +
        `Telegram avtomatik ochiladi va venue ulanadi.\n\n` +
        `🔹 <b>Yoki quyidagi tugmalardan foydalaning:</b>`,
        mainMenuKeyboard()
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
        `/today — Bugungi bronlar\n` +
        `/stats — Qisqa statistika\n` +
        `/unlink_all — Barcha venue larni uzish\n\n` +
        `<b>Ulanish:</b>\n` +
        `Web saytdagi "Link venue" tugmasini bosing yoki kodni yuboring.`,
        mainMenuKeyboard()
      )
      return new Response('ok', { status: 200 })
    }

    // /status
    if (text === '/status') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('*, venues(name)')
        .eq('chat_id', chatId)
      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Hali hech qanday venue ulanmagan.', mainMenuKeyboard())
        return new Response('ok', { status: 200 })
      }
      const list = links.map((l: any, i: number) => `${i + 1}. ${l.venues?.name || 'Noma\'lum'}`).join('\n')
      await sendMessage(chatId, `✅ <b>Ulangan venue lar (${links.length}):</b>\n\n${list}`, mainMenuKeyboard())
      return new Response('ok', { status: 200 })
    }

    // /today
    if (text === '/today') {
      const today = new Date().toISOString().split('T')[0]
      const { data: links } = await supabase
        .from('telegram_links')
        .select('venue_id')
        .eq('chat_id', chatId)
      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Avval venue laringizni ulang.', mainMenuKeyboard())
        return new Response('ok', { status: 200 })
      }
      const venueIds = links.map((l: any) => l.venue_id)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, venues!inner(name), slots(date, start_time, end_time), profiles(full_name)')
        .in('venue_id', venueIds)
        .eq('slots.date', today)
        .order('created_at', { ascending: false })
      if (!bookings || bookings.length === 0) {
        await sendMessage(chatId, `📅 <b>${today}</b> uchun bronlar yo'q.`, mainMenuKeyboard())
      } else {
        const list = bookings.map((b: any) =>
          `⏰ ${b.slots?.start_time?.slice(0, 5) || '—'} — <b>${b.venues?.name || 'Noma\'lum'}</b>\n` +
          `   👤 ${b.profiles?.full_name || 'Noma\'lum'} | ${b.status === 'confirmed' ? '✅' : '❌'}`
        ).join('\n\n')
        await sendMessage(chatId, `📅 <b>${today} uchun bronlar:</b>\n\n${list}`, mainMenuKeyboard())
      }
      return new Response('ok', { status: 200 })
    }

    // /stats
    if (text === '/stats') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('venue_id')
        .eq('chat_id', chatId)
      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Avval venue laringizni ulang.', mainMenuKeyboard())
        return new Response('ok', { status: 200 })
      }
      const venueIds = links.map((l: any) => l.venue_id)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status, total_price')
        .in('venue_id', venueIds)
      const total = bookings?.length || 0
      const confirmed = bookings?.filter((b: any) => b.status === 'confirmed').length || 0
      const revenue = bookings?.filter((b: any) => b.status === 'confirmed')
        .reduce((s: number, b: any) => s + (b.total_price || 0), 0) || 0
      await sendMessage(chatId,
        `📊 <b>Statistika</b>\n\n` +
        `📋 Jami bronlar: <b>${total}</b>\n` +
        `✅ Tasdiqlangan: <b>${confirmed}</b>\n` +
        `💰 Daromad: <b>${revenue.toLocaleString()} so'm</b>`,
        mainMenuKeyboard()
      )
      return new Response('ok', { status: 200 })
    }

    // /bookings
    if (text === '/bookings') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('venue_id')
        .eq('chat_id', chatId)
      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Avval venue laringizni ulang.', mainMenuKeyboard())
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
        await sendMessage(chatId, '📭 Hali bronlar yo\'q.', mainMenuKeyboard())
        return new Response('ok', { status: 200 })
      }
      const list = bookings.map((b: any, i: number) =>
        `${i + 1}. <b>${b.venues?.name || 'Noma\'lum'}</b>\n` +
        `   📅 ${b.slots?.date || '—'} ⏰ ${b.slots?.start_time?.slice(0, 5) || '—'}\n` +
        `   📊 ${b.status === 'confirmed' ? '✅ Tasdiqlangan' : b.status === 'cancelled' ? '❌ Bekor qilingan' : b.status}`
      ).join('\n\n')
      await sendMessage(chatId, `📋 <b>So'nggi bronlar:</b>\n\n${list}`, mainMenuKeyboard())
      return new Response('ok', { status: 200 })
    }

    // /unlink_all
    if (text === '/unlink_all') {
      const { data: links } = await supabase
        .from('telegram_links')
        .select('id')
        .eq('chat_id', chatId)
      if (!links || links.length === 0) {
        await sendMessage(chatId, '📭 Ulanadigan venue yo\'q.', mainMenuKeyboard())
        return new Response('ok', { status: 200 })
      }
      const ids = links.map((l: any) => l.id)
      await supabase.from('telegram_links').delete().in('id', ids)
      await sendMessage(chatId, `✅ ${ids.length} ta venue uzildi.`, mainMenuKeyboard())
      return new Response('ok', { status: 200 })
    }

    // Try to decode as venue link code
    const decoded = tryDecodeLinkCode(text)
    if (decoded) {
      const { venueId, userId } = decoded
      const { data: venue } = await supabase
        .from('venues')
        .select('id, name')
        .eq('id', venueId)
        .single()
      if (!venue) {
        await sendMessage(chatId, '❌ Venue topilmadi.')
        return new Response('ok', { status: 200 })
      }
      const { data: existing } = await supabase
        .from('telegram_links')
        .select('id')
        .eq('venue_id', venueId)
        .eq('chat_id', chatId)
        .maybeSingle()
      if (existing) {
        await sendMessage(chatId, `ℹ️ "${venue.name}" allaqachon ulangan.`, mainMenuKeyboard())
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
        `Endi bu venue ga kelgan bronlar haqida tezkor xabar olasiz.`,
        mainMenuKeyboard()
      )
      return new Response('ok', { status: 200 })
    }

    // Unknown
    await sendMessage(chatId,
      `❓ Noma'lum buyruq. /help ni bosing.`,
      mainMenuKeyboard()
    )
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
