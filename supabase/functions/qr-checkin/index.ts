// QR Check-in — validates HMAC-signed QR payload and marks booking as checked_in
// URL format: /checkin/{booking_id}?sig={hmac_hex}
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const CHECKIN_SECRET = Deno.env.get('CHECKIN_SECRET') || ''

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const bookingId = url.pathname.split('/').pop() || ''
    const sig = url.searchParams.get('sig') || ''

    if (!bookingId || !sig) {
      return new Response(JSON.stringify({ error: 'Missing booking_id or signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate HMAC signature
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(CHECKIN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(bookingId),
    )

    const expectedSig = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (sig !== expectedSig) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get booking and check time window (±15 minutes)
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status, slots(start_time, date)')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (booking.status === 'cancelled') {
      return new Response(JSON.stringify({ error: 'Booking is cancelled' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (booking.checked_in) {
      return new Response(JSON.stringify({ error: 'Already checked in' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check 15-minute time window
    const slot = booking.slots as { date: string; start_time: string } | null
    if (slot) {
      const slotStart = new Date(`${slot.date}T${slot.start_time}`)
      const now = new Date()
      const diffMinutes = (now.getTime() - slotStart.getTime()) / 60000

      if (Math.abs(diffMinutes) > 15) {
        return new Response(JSON.stringify({
          error: 'Outside check-in window',
          window: '±15 minutes from booking start time',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Mark as checked in
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, message: 'Checked in successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
