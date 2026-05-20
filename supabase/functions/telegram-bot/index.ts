// Telegram bot webhook — single-connect, auto-link all venues, Gemini AI
// NEVER throws — always returns 200. Failures are logged internally.
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
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
    message?: { chat: { id: number }; message_id?: number; text?: string }
    from?: { id: number }
  }
}

const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemma-4-31b-it',
]

// ---------- helpers ----------

const sendMsg = async (chatId: number, text: string, keyboard?: any) => {
  if (!BOT_TOKEN) return
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
    if (keyboard) body.reply_markup = keyboard
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch { /* never crash */ }
}

const answerCb = async (id: string, text: string) => {
  if (!BOT_TOKEN) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: id, text, show_alert: false }),
    })
  } catch { /* never crash */ }
}

const editMsg = async (chatId: number, msgId: number, text: string, keyboard?: any) => {
  if (!BOT_TOKEN) return
  try {
    const body: any = { chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML' }
    if (keyboard) body.reply_markup = keyboard
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch { /* never crash */ }
}

const getLinkedVenueIds = async (supabase: any, chatId: number): Promise<string[]> => {
  const { data } = await supabase.from('telegram_links').select('venue_id').eq('chat_id', chatId)
  return (data || []).map((l: any) => l.venue_id)
}

// ---------- keyboards ----------

const mainKeyboard = () => ({
  inline_keyboard: [
    [{ text: '📋 Venue larim', callback_data: 'status' }],
    [{ text: '📅 Bugun', callback_data: 'today' }, { text: '📊 Statistika', callback_data: 'stats' }],
    [{ text: '🤖 AI so\'rash', callback_data: 'ai_help' }, { text: '🆘 Yordam', callback_data: 'help' }],
  ],
})

const venueListKeyboard = (links: any[], page: number) => {
  const perPage = 5
  const totalPages = Math.ceil(links.length / perPage)
  const start = page * perPage
  const pageItems = links.slice(start, start + perPage)
  const rows: any[][] = pageItems.map((l: any) => [
    { text: `🔗 ${l.venues?.categories?.icon || '🏢'} ${l.venues?.name || "Noma'lum"}`, callback_data: `info_${l.venue_id}` },
    { text: '❌ Uzish', callback_data: `unlink_${l.venue_id}` },
  ])
  if (totalPages > 1) {
    const nav: any[] = []
    if (page > 0) nav.push({ text: '⬅️', callback_data: `page_${page - 1}` })
    nav.push({ text: `${page + 1}/${totalPages}`, callback_data: 'noop' })
    if (page < totalPages - 1) nav.push({ text: '➡️', callback_data: `page_${page + 1}` })
    rows.push(nav)
  }
  rows.push([{ text: '🏠 Asosiy menyu', callback_data: 'menu' }])
  return { inline_keyboard: rows }
}

// Helper: render a venue list text block
const renderVenueListText = (links: any[]) => {
  if (!links || links.length === 0) return "📭 Hali venue ulanmagan."
  return links.map((l: any, i: number) =>
    `${i + 1}. ${l.venues?.categories?.icon || '🏢'} <b>${l.venues?.name || "Noma'lum"}</b>`
  ).join('\n')
}

// ---------- Gemini ----------

// Try Gemini models in order until one works (handles quota exhaustion)
const askGemini = async (prompt: string, context: string): Promise<string> => {
  if (!GEMINI_API_KEY) return '🤖 AI sozlanmagan.'

  const fullPrompt = `Sen BronUz platformasi uchun yordamchi botsan. Foydalanuvchi haqida ma'lumot:
${context}

Foydalanuvchi savoli: ${prompt}

Qisqa va foydali javob bering (3-4 jumla). Agar venue yoki bron haqida so'rasa, ma'lumotlardan foydalaning.`

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
          }),
        },
      )
      if (res.status === 429) {
        console.warn(`Bot model ${model} quota exhausted, trying next...`)
        continue
      }
      if (!res.ok) {
        console.error(`Bot model ${model} error:`, res.status)
        continue
      }
      const data = await res.json()
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (answer) {
        console.log(`Bot AI succeeded with model: ${model}`)
        return answer
      }
    } catch {
      continue
    }
  }
  return '🤖 AI vaqtincha ishlamayapti. Keyinroq urinib ko\'ring.'
}

// ---------- serve ----------

serve(async (req) => {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not set')
      return new Response('ok', { status: 200 })
    }

    const update: Update = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // ============== CALLBACK QUERIES ==============
    if (update.callback_query) {
      const cb = update.callback_query
      const chatId = cb.message?.chat.id
      const msgId = cb.message?.message_id
      const data = cb.data
      if (!chatId || !data) return new Response('ok', { status: 200 })

      // ---- menu: back to main ----
      if (data === 'menu') {
        await editMsg(chatId, msgId!,
          '🏠 <b>Asosiy menyu</b>\nQuyidagi tugmalardan foydalaning:',
          mainKeyboard())
        await answerCb(cb.id, 'Ok')
        return new Response('ok', { status: 200 })
      }

      // ---- status: venue list ----
      if (data === 'status') {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('*, venues(name, categories(icon))')
          .eq('chat_id', chatId)
        const text = links && links.length > 0
          ? `✅ <b>Ulangan venue lar (${links.length}):</b>\n\n` + renderVenueListText(links) + '\n\n🔹 Venue ni uzish uchun "❌ Uzish" tugmasini bosing.'
          : '📭 Hali hech qanday venue ulanmagan.'
        await sendMsg(chatId, text, venueListKeyboard(links || [], 0))
        await answerCb(cb.id, `${links?.length || 0} ta venue`)
        return new Response('ok', { status: 200 })
      }

      // ---- venue info ----
      if (data?.startsWith('info_')) {
        const venueId = data.replace('info_', '')
        const { data: venue } = await supabase
          .from('venues')
          .select('name, city, address, phone, description, categories(icon, name_uz)')
          .eq('id', venueId)
          .single()
        if (venue) {
          const info =
            `🏢 <b>${venue.name}</b>\n` +
            `${venue.categories?.icon || ''} ${venue.categories?.name_uz || ''}\n` +
            `📍 ${venue.city}, ${venue.address || '—'}\n` +
            `📞 ${venue.phone || '—'}\n` +
            `📝 ${venue.description || '—'}`
          await sendMsg(chatId, info, mainKeyboard())
        } else {
          await sendMsg(chatId, '❌ Venue topilmadi.', mainKeyboard())
        }
        await answerCb(cb.id, 'Ok')
        return new Response('ok', { status: 200 })
      }

      // ---- unlink a venue ----
      if (data?.startsWith('unlink_')) {
        const venueId = data.replace('unlink_', '')
        await supabase.from('telegram_links').delete().match({ venue_id: venueId, chat_id: chatId })

        // Refresh the list
        const { data: links } = await supabase
          .from('telegram_links')
          .select('*, venues(name, categories(icon))')
          .eq('chat_id', chatId)

        if (!links || links.length === 0) {
          await editMsg(chatId, msgId!, '✅ Barcha venue lar uzildi.', mainKeyboard())
        } else {
          const text = `✅ <b>Venue uzildi. Qolganlari (${links.length}):</b>\n\n` + renderVenueListText(links)
          await editMsg(chatId, msgId!, text, venueListKeyboard(links, 0))
        }
        await answerCb(cb.id, 'Venue uzildi')
        return new Response('ok', { status: 200 })
      }

      // ---- pagination ----
      if (data?.startsWith('page_')) {
        const page = parseInt(data.replace('page_', ''), 10)
        const { data: links } = await supabase
          .from('telegram_links')
          .select('*, venues(name, categories(icon))')
          .eq('chat_id', chatId)

        const text = links && links.length > 0
          ? `✅ <b>Ulangan venue lar (${links.length}):</b>\n\n` + renderVenueListText(links)
          : '📭 Hali venue yo\'q.'
        await editMsg(chatId, msgId!, text, venueListKeyboard(links || [], page))
        await answerCb(cb.id, `Sahifa ${page + 1}`)
        return new Response('ok', { status: 200 })
      }

      // ---- today ----
      if (data === 'today') {
        const today = new Date().toISOString().split('T')[0]
        const venueIds = await getLinkedVenueIds(supabase, chatId)
        if (venueIds.length === 0) {
          await sendMsg(chatId, '📭 Avval venue laringizni ulang.')
          await answerCb(cb.id, 'Venue ulanmagan')
          return new Response('ok', { status: 200 })
        }
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, venues!inner(name), slots(date, start_time, end_time)')
          .in('venue_id', venueIds)
          .eq('slots.date', today)
          .order('created_at', { ascending: false })
        if (!bookings || bookings.length === 0) {
          await sendMsg(chatId, `📅 <b>${today}</b> uchun bronlar yo'q.`, mainKeyboard())
        } else {
          const list = bookings.map((b: any) =>
            `⏰ ${b.slots?.start_time?.slice(0, 5) || '—'} — <b>${b.venues?.name || "Noma'lum"}</b>\n` +
            `   👤 ${b.profiles?.full_name || "Noma'lum"} | ${b.status === 'confirmed' ? '✅' : '❌'}`
          ).join('\n\n')
          await sendMsg(chatId, `📅 <b>${today} uchun bronlar:</b>\n\n${list}`, mainKeyboard())
        }
        await answerCb(cb.id, 'Ok')
        return new Response('ok', { status: 200 })
      }

      // ---- stats ----
      if (data === 'stats') {
        const venueIds = await getLinkedVenueIds(supabase, chatId)
        if (venueIds.length === 0) {
          await sendMsg(chatId, '📭 Avval venue laringizni ulang.')
          await answerCb(cb.id, 'Venue ulanmagan')
          return new Response('ok', { status: 200 })
        }
        const { data: venues } = await supabase
          .from('venues')
          .select('id, name')
          .in('id', venueIds)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('status, total_price, venue_id')
          .in('venue_id', venueIds)
        const total = bookings?.length || 0
        const confirmed = bookings?.filter((b: any) => b.status === 'confirmed').length || 0
        const revenue = bookings?.filter((b: any) => b.status === 'confirmed')
          .reduce((s: number, b: any) => s + (b.total_price || 0), 0) || 0

        // Per-venue breakdown
        let breakdown = ''
        if (venues) {
          for (const v of venues) {
            const vBookings = (bookings || []).filter((b: any) => b.venue_id === v.id)
            const vConfirmed = vBookings.filter((b: any) => b.status === 'confirmed')
            breakdown += `\n🏢 ${v.name}: ${vBookings.length} bron, ${vConfirmed.length}✅`
          }
        }

        await answerCb(cb.id, 'Statistika')
        await sendMsg(chatId,
          `📊 <b>Statistika</b>\n\n` +
          `📋 Jami bronlar: <b>${total}</b>\n` +
          `✅ Tasdiqlangan: <b>${confirmed}</b>\n` +
          `💰 Daromad: <b>${revenue.toLocaleString()} so'm</b>\n` +
          `${breakdown}`,
          mainKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      // ---- ai help ----
      if (data === 'ai_help') {
        await answerCb(cb.id, 'AI yordam')
        await sendMsg(chatId,
          `🤖 <b>AI Yordam</b>\n\n` +
          `Mendan venue laringiz, bronlar va statistika haqida so'rashingiz mumkin.\n\n` +
          `<b>Misol savollar:</b>\n` +
          `• "Eng ko'p bron qaysi venue da?"\n` +
          `• "Bu oyda qancha daromad?"\n` +
          `• "Qaysi kategoriya eng yaxshi?"\n` +
          `• "Haftada nechta bron bo'ladi?"\n\n` +
          `<code>/ask Savolingizni yozing</code>`,
          mainKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      // ---- help ----
      if (data === 'help') {
        await answerCb(cb.id, 'Yordam')
        await sendMsg(chatId,
          `🔹 <b>Yordam</b>\n\n` +
          `<b>BronUz boti</b> — venue egalari uchun.\n\n` +
          `<b>Buyruqlar:</b>\n` +
          `/start — Bot haqida ma'lumot\n` +
          `/status — Ulangan venue lar\n` +
          `/today — Bugungi bronlar\n` +
          `/stats — Statistika\n` +
          `/ask <savol> — AI dan so'rang\n` +
          `/unlink_all — Barcha venue larni uzish\n\n` +
          `<b>Ulanish:</b>\n` +
          `Web saytdagi "Botga ulanish" tugmasini bosing. Barcha venue laringiz avtomatik ulanadi.\n\n` +
          `Yangi venue qo'shsangiz, avtomatik ulanadi.`,
          mainKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      // ---- unlink all ----
      if (data === 'unlink_all') {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('id')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await answerCb(cb.id, "Venue yo'q")
          return new Response('ok', { status: 200 })
        }
        const ids = links.map((l: any) => l.id)
        await supabase.from('telegram_links').delete().in('id', ids)
        await editMsg(chatId, msgId!, `✅ ${ids.length} ta venue uzildi.`, mainKeyboard())
        await answerCb(cb.id, `${ids.length} ta venue uzildi`)
        return new Response('ok', { status: 200 })
      }

      // ---- unhandled callback ----
      await answerCb(cb.id, 'Ok')
      return new Response('ok', { status: 200 })
    }

    // ============== MESSAGES ==============
    const msg = update.message
    if (!msg?.text) return new Response('ok', { status: 200 })

    const chatId = msg.chat.id
    const text = msg.text.trim()
    const firstName = msg.chat.first_name || 'Foydalanuvchi'

    // /start
    if (text.startsWith('/start')) {
      const code = text.slice(6).trim()
      if (code) {
        // Decode user-level code: base64("user:<userId>")
        let userId: string | null = null
        try {
          const decoded = atob(code)
          const parts = decoded.split(':')
          if (parts[0] === 'user' && parts[1]?.length === 36) userId = parts[1]
        } catch { /* not base64 */ }

        if (!userId) {
          await sendMsg(chatId, "❌ Kod noto'g'ri. Web saytdagi 'Botga ulanish' tugmasini bosing.")
          return new Response('ok', { status: 200 })
        }

        // Find ALL venues owned by this user
        const { data: venues } = await supabase
          .from('venues')
          .select('id, name')
          .eq('owner_id', userId)

        if (!venues || venues.length === 0) {
          await sendMsg(chatId, "❌ Venue laringiz topilmadi. Avval web saytda venue qo'shing.")
          return new Response('ok', { status: 200 })
        }

        // Link all venues
        let linked = 0
        for (const v of venues) {
          const { data: existing } = await supabase
            .from('telegram_links')
            .select('id')
            .eq('venue_id', v.id)
            .eq('chat_id', chatId)
            .maybeSingle()
          if (!existing) {
            const { error } = await supabase
              .from('telegram_links')
              .insert({ user_id: userId, venue_id: v.id, chat_id: chatId })
            if (!error) linked++
          }
        }

        await sendMsg(chatId,
          `✅ <b>${linked} ta venue muvaffaqiyatli ulandi!</b>\n\n` +
          `Endi barcha venue laringizga kelgan bronlar haqida xabar olasiz.\n\n` +
          `📌 Yangi venue qo'shsangiz, avtomatik ulanadi.\n` +
          `🔹 Biror venue ni uzmoqchi bo'lsangiz "Venue larim" tugmasini bosing.`,
          mainKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      await sendMsg(chatId,
        `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
        `Bu bot BronUz platformasidagi venue laringizga kelgan bronlar haqida xabar beradi.\n\n` +
        `🔹 <b>Ulanish uchun:</b>\nWeb saytdagi biznes panelda "Botga ulanish" tugmasini bosing.\n\n` +
        `🔹 <b>Yangi venue qo'shsangiz</b> ham avtomatik ulanadi.\n\n` +
        `🔹 <b>AI yordam:</b> /ask bilan savol bering!`,
        mainKeyboard()
      )
      return new Response('ok', { status: 200 })
    }

    // /ask
    if (text.startsWith('/ask')) {
      const question = text.slice(4).trim()
      if (!question) {
        await sendMsg(chatId,
          `🤖 <b>AI yordam</b>\n\nSavolingizni /ask dan keyin yozing.\n\n` +
          `<b>Misol:</b> <code>/ask Eng ko'p bron qaysi venue da?</code>`,
          mainKeyboard()
        )
        return new Response('ok', { status: 200 })
      }

      // Build context
      const venueIds = await getLinkedVenueIds(supabase, chatId)
      let context = ''
      if (venueIds.length > 0) {
        const { data: venues } = await supabase
          .from('venues')
          .select('name, city')
          .in('id', venueIds)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('status, total_price')
          .in('venue_id', venueIds)
        context =
          `Foydalanuvchining ${venueIds.length} ta venuelari bor.\n` +
          `Venuelar: ${(venues || []).map((v: any) => `${v.name} (${v.city})`).join(', ')}\n` +
          `Jami bronlar: ${(bookings || []).length}\n` +
          `Tasdiqlangan: ${(bookings || []).filter((b: any) => b.status === 'confirmed').length}\n` +
          `Daromad: ${(bookings || []).filter((b: any) => b.status === 'confirmed').reduce((s: number, b: any) => s + (b.total_price || 0), 0).toLocaleString()} so'm`
      } else {
        context = 'Foydalanuvchi hali venue ulamagan.'
      }

      await sendMsg(chatId, '🤔 AI o\'ylayapti...')
      const answer = await askGemini(question, context)
      await sendMsg(chatId, answer, mainKeyboard())
      return new Response('ok', { status: 200 })
    }

    // Text commands
    const cmdHandlers: Record<string, () => Promise<void>> = {
      '/help': async () => {
        await sendMsg(chatId,
          `🔹 <b>Yordam</b>\n\n<b>Buyruqlar:</b>\n` +
          `/status — Ulangan venue lar\n/today — Bugungi bronlar\n/stats — Statistika\n` +
          `/ask <savol> — AI dan so'rang\n/unlink_all — Barcha venue larni uzish`,
          mainKeyboard())
      },
      '/status': async () => {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('*, venues(name)')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await sendMsg(chatId, '📭 Hali venue ulanmagan.', mainKeyboard())
          return
        }
        const list = renderVenueListText(links)
        await sendMsg(chatId, `✅ <b>Ulangan venue lar (${links.length}):</b>\n\n${list}`, mainKeyboard())
      },
      '/today': async () => {
        const today = new Date().toISOString().split('T')[0]
        const venueIds = await getLinkedVenueIds(supabase, chatId)
        if (venueIds.length === 0) {
          await sendMsg(chatId, '📭 Avval venue laringizni ulang.', mainKeyboard())
          return
        }
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, venues!inner(name), slots(date, start_time, end_time), profiles(full_name)')
          .in('venue_id', venueIds)
          .eq('slots.date', today)
          .order('created_at', { ascending: false })
        if (!bookings || bookings.length === 0) {
          await sendMsg(chatId, `📅 <b>${today}</b> uchun bronlar yo'q.`, mainKeyboard())
        } else {
          const list = bookings.map((b: any) =>
            `⏰ ${b.slots?.start_time?.slice(0, 5) || '—'} — <b>${b.venues?.name || "Noma'lum"}</b>\n` +
            `   👤 ${b.profiles?.full_name || "Noma'lum"} | ${b.status === 'confirmed' ? '✅' : '❌'}`
          ).join('\n\n')
          await sendMsg(chatId, `📅 <b>${today} uchun bronlar:</b>\n\n${list}`, mainKeyboard())
        }
      },
      '/stats': async () => {
        const venueIds = await getLinkedVenueIds(supabase, chatId)
        if (venueIds.length === 0) {
          await sendMsg(chatId, '📭 Avval venue laringizni ulang.', mainKeyboard())
          return
        }
        const { data: bookings } = await supabase
          .from('bookings')
          .select('status, total_price')
          .in('venue_id', venueIds)
        const total = bookings?.length || 0
        const confirmed = bookings?.filter((b: any) => b.status === 'confirmed').length || 0
        const revenue = bookings?.filter((b: any) => b.status === 'confirmed')
          .reduce((s: number, b: any) => s + (b.total_price || 0), 0) || 0
        await sendMsg(chatId,
          `📊 <b>Statistika</b>\n\n` +
          `📋 Jami bronlar: <b>${total}</b>\n✅ Tasdiqlangan: <b>${confirmed}</b>\n💰 Daromad: <b>${revenue.toLocaleString()} so'm</b>`,
          mainKeyboard())
      },
      '/bookings': async () => {
        const venueIds = await getLinkedVenueIds(supabase, chatId)
        if (venueIds.length === 0) {
          await sendMsg(chatId, '📭 Avval venue laringizni ulang.', mainKeyboard())
          return
        }
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, venues!inner(name), slots(date, start_time, end_time)')
          .in('venue_id', venueIds)
          .order('created_at', { ascending: false })
          .limit(5)
        if (!bookings || bookings.length === 0) {
          await sendMsg(chatId, "📭 Hali bronlar yo'q.", mainKeyboard())
          return
        }
        const list = bookings.map((b: any, i: number) =>
          `${i + 1}. <b>${b.venues?.name || "Noma'lum"}</b>\n` +
          `   📅 ${b.slots?.date || '—'} ⏰ ${b.slots?.start_time?.slice(0, 5) || '—'}\n` +
          `   📊 ${b.status === 'confirmed' ? '✅' : b.status === 'cancelled' ? '❌' : b.status}`
        ).join('\n\n')
        await sendMsg(chatId, `📋 <b>So'nggi bronlar:</b>\n\n${list}`, mainKeyboard())
      },
      '/unlink_all': async () => {
        const { data: links } = await supabase
          .from('telegram_links')
          .select('id')
          .eq('chat_id', chatId)
        if (!links || links.length === 0) {
          await sendMsg(chatId, "📭 Ulanadigan venue yo'q.", mainKeyboard())
          return
        }
        const ids = links.map((l: any) => l.id)
        await supabase.from('telegram_links').delete().in('id', ids)
        await sendMsg(chatId, `✅ ${ids.length} ta venue uzildi.`, mainKeyboard())
      },
    }

    const handler = cmdHandlers[text]
    if (handler) {
      await handler()
      return new Response('ok', { status: 200 })
    }

    // If user pastes a code directly
    try {
      const decoded = atob(text)
      const parts = decoded.split(':')
      if (parts[0] === 'user' && parts[1]?.length === 36) {
        const { data: venues } = await supabase
          .from('venues')
          .select('id, name')
          .eq('owner_id', parts[1])
        if (venues && venues.length > 0) {
          let linked = 0
          for (const v of venues) {
            const { data: existing } = await supabase
              .from('telegram_links')
              .select('id')
              .eq('venue_id', v.id)
              .eq('chat_id', chatId)
              .maybeSingle()
            if (!existing) {
              const { error } = await supabase
                .from('telegram_links')
                .insert({ user_id: parts[1], venue_id: v.id, chat_id: chatId })
              if (!error) linked++
            }
          }
          await sendMsg(chatId,
            `✅ <b>${linked} ta venue ulandi!</b>\nYangi venue qo'shsangiz avtomatik ulanadi.`,
            mainKeyboard())
          return new Response('ok', { status: 200 })
        }
      }
    } catch { /* ignore non-base64 */ }

    // Unknown command
    const { data: links } = await supabase
      .from('telegram_links')
      .select('id')
      .eq('chat_id', chatId)
    if (links && links.length > 0) {
      // Ask Gemini if user has venues linked
      if (GEMINI_API_KEY) {
        const answer = await askGemini(text, 'Foydalanuvchi venue larini ulagan.')
        await sendMsg(chatId, answer, mainKeyboard())
        return new Response('ok', { status: 200 })
      }
    }

    await sendMsg(chatId,
      "❓ Noma'lum buyruq. Quyidagi tugmalardan foydalaning:",
      mainKeyboard()
    )
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('ok', { status: 200 })
  }
})
