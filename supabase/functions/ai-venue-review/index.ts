import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]

interface ReviewPayload {
  venue_id: string
  name: string
  description?: string
  address: string
  city: string
  phone?: string
  category_id: number
  has_photos: boolean
}

interface AiReviewFlag {
  type: 'quota_ended' | 'ai_error' | 'suspicious' | 'approved' | 'rejected' | 'heuristic_fallback'
  message: string
}

interface ReviewResult {
  action: 'approve' | 'human_needed' | 'reject'
  confidence: number
  reasons: string[]
  flags: AiReviewFlag[]
}

type ReviewStatus = 'ai_approved' | 'ai_rejected' | 'ai_suspicious' | 'ai_quota_ended' | 'ai_error' | 'heuristic_approved' | 'heuristic_suspicious'

let currentModel: string | null = null

function buildReviewData(status: ReviewStatus, result: ReviewResult): Record<string, unknown> {
  return {
    review_status: status,
    confidence: result.confidence,
    reasons: result.reasons,
    flags: result.flags,
    model_used: currentModel,
    reviewed_at: new Date().toISOString(),
  }
}

function heuristicReview(payload: ReviewPayload): ReviewResult {
  const reasons: string[] = []
  const flags: AiReviewFlag[] = []
  const name = payload.name?.trim() || ''
  if (name.length < 2) {
    flags.push({ type: 'suspicious', message: 'Name too short or empty' })
    return { action: 'reject', confidence: 0.9, reasons: ['Name too short or empty'], flags }
  }
  if (/^(test|asd|qwe|xxx|123|venue|joy|новый|тест|salon|barber)\d*$/i.test(name)) {
    flags.push({ type: 'suspicious', message: 'Name looks like placeholder' })
    reasons.push('Name looks like placeholder')
  } else {
    reasons.push('Name looks valid')
  }
  const desc = payload.description?.trim() || ''
  if (desc.length < 10) { reasons.push('Description is short or missing') } else { reasons.push('Description present') }
  const address = payload.address?.trim() || ''
  if (address.length < 5) {
    flags.push({ type: 'suspicious', message: 'Address too short or invalid' })
    return { action: 'human_needed', confidence: 0.7, reasons: ['Address too short or invalid'], flags }
  }
  reasons.push('Address looks valid')
  const phone = payload.phone?.trim() || ''
  if (phone && phone.replace(/\D/g, '').length >= 7) { reasons.push('Phone number provided') } else { reasons.push('No valid phone number') }
  if (payload.has_photos) { reasons.push('Has photos') } else { reasons.push('No photos uploaded') }
  const score = reasons.filter(r => r.includes('valid') || r.includes('present') || r.includes('photos') || r.includes('Phone')).length
  flags.push({ type: 'heuristic_fallback', message: 'Used heuristic rule-based review (AI unavailable)' })
  if (score >= 4 && name.length >= 3) return { action: 'approve', confidence: 0.8, reasons, flags }
  if (score >= 2) return { action: 'human_needed', confidence: 0.6, reasons, flags }
  return { action: 'human_needed', confidence: 0.5, reasons, flags }
}

async function askGeminiWithFallback(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  currentModel = null
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 500, responseMimeType: 'application/json' },
          }),
        },
      )
      if (res.status === 429) { console.warn(`Model ${model} quota exhausted, trying next...`); continue }
      if (!res.ok) { console.error(`Model ${model} error:`, res.status, await res.text()); continue }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) { currentModel = model; return text }
    } catch (err) { console.warn(`Model ${model} failed:`, err); continue }
  }
  return null
}

async function aiReview(payload: ReviewPayload): Promise<ReviewResult> {
  const prompt = `You are a venue moderation AI for BronUz, an Uzbekistani booking platform. Review the venue for RED FLAGS:
- Name: "${payload.name}"
- Description: "${payload.description || '(not provided)'}"
- Address: "${payload.address}", City: "${payload.city}"
- Phone: "${payload.phone || '(not provided)'}"
- Category ID: ${payload.category_id}
- Has photos: ${payload.has_photos ? 'Yes' : 'No'}

Check: fake/gibberish names, spam descriptions, invalid address, fake phone, no photos, suspicious combinations.

Rules:
- APPROVE (confidence >= 0.7): Real venue with valid details
- FLAG FOR HUMAN: Uncertain, missing info but not clearly spam
- REJECT (confidence >= 0.7): Clearly fake, spam, or scam

Respond JSON: {"action": "approve"|"human_needed"|"reject", "confidence": 0.0-1.0, "reasons": ["reason1", ...]}`

  const resultText = await askGeminiWithFallback(prompt)

  if (!resultText && currentModel === null) {
    return {
      action: 'human_needed',
      confidence: 0,
      reasons: ['All AI models quota exhausted, flagging for human review'],
      flags: [{ type: 'quota_ended', message: 'All Gemini models quota exhausted' }],
    }
  }

  if (!resultText) {
    const h = heuristicReview(payload)
    h.flags.unshift({ type: 'ai_error', message: 'All AI models failed to respond' })
    return h
  }

  try {
    const result: ReviewResult = JSON.parse(resultText)
    if (result.action && ['approve', 'human_needed', 'reject'].includes(result.action)) {
      result.flags = result.flags || []
      return result
    }
  } catch {}
  const h = heuristicReview(payload)
  h.flags.unshift({ type: 'ai_error', message: 'AI returned invalid response' })
  return h
}

async function processReview(payload: ReviewPayload, supabase: ReturnType<typeof createClient>, isRetry: boolean): Promise<Response> {
  try {
    const { data: current } = await supabase
      .from('venues')
      .select('status, ai_review_data')
      .eq('id', payload.venue_id)
      .single()

    if (!current) return new Response('venue not found', { status: 404 })

    if (!isRetry && !['pending', 'human_action_needed'].includes(current.status)) {
      console.log(`Skipping venue ${payload.venue_id}: status is ${current.status}`)
      return new Response('ok', { status: 200 })
    }
    if (isRetry && current.status === 'active') {
      return new Response('already active', { status: 200 })
    }

    const result = GEMINI_API_KEY ? await aiReview(payload) : heuristicReview(payload)

    if (result.flags.some(f => f.type === 'quota_ended')) {
      await supabase.from('venues').update({
        status: 'human_action_needed',
        ai_review_data: buildReviewData('ai_quota_ended', result),
      }).eq('id', payload.venue_id)
      console.log(`Venue ${payload.venue_id}: quota ended → human review`)
    } else if (result.flags.some(f => f.type === 'ai_error')) {
      await supabase.from('venues').update({
        status: 'human_action_needed',
        ai_review_data: buildReviewData('ai_error', result),
      }).eq('id', payload.venue_id)
      console.log(`Venue ${payload.venue_id}: AI error → human review`)
    } else if (result.action === 'approve' && result.confidence >= 0.7) {
      const s = currentModel ? 'ai_approved' as const : 'heuristic_approved' as const
      await supabase.from('venues').update({
        status: 'active',
        ai_review_data: buildReviewData(s, result),
      }).eq('id', payload.venue_id)
      console.log(`Venue ${payload.venue_id}: approved (${s}, confidence: ${result.confidence})`)
    } else if (result.action === 'reject' && result.confidence >= 0.8) {
      await supabase.from('venues').update({
        status: 'rejected',
        ai_review_data: buildReviewData('ai_rejected', result),
      }).eq('id', payload.venue_id)
      console.log(`Venue ${payload.venue_id}: rejected (confidence: ${result.confidence})`)
    } else if (result.flags.some(f => f.type === 'heuristic_fallback')) {
      const s = result.action === 'approve' ? 'heuristic_approved' as const : 'heuristic_suspicious' as const
      await supabase.from('venues').update({
        status: s === 'heuristic_approved' ? 'active' : 'human_action_needed',
        ai_review_data: buildReviewData(s, result),
      }).eq('id', payload.venue_id)
      console.log(`Venue ${payload.venue_id}: heuristic ${s}`)
    } else {
      result.flags.push({ type: 'suspicious', message: 'AI detected potential issues with this venue' })
      await supabase.from('venues').update({
        status: 'human_action_needed',
        ai_review_data: buildReviewData('ai_suspicious', result),
      }).eq('id', payload.venue_id)
      console.log(`Venue ${payload.venue_id}: AI suspicious → human review (confidence: ${result.confidence})`)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('processReview error:', err)
    try {
      await supabase.from('venues').update({
        ai_review_data: {
          review_status: 'ai_error',
          confidence: 0,
          reasons: ['Internal error during review process'],
          flags: [{ type: 'ai_error', message: 'Internal error during review process' }],
          model_used: null,
          reviewed_at: new Date().toISOString(),
        },
      }).eq('id', payload.venue_id)
    } catch {}
    return new Response('ok', { status: 200 })
  }
}

serve(async (req) => {
  try {
    const body: Record<string, unknown> = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const isRetry = body.retry === true

    if (isRetry) {
      const { data: venue } = await supabase
        .from('venues')
        .select('*')
        .eq('id', body.venue_id as string)
        .single()

      if (!venue) return new Response('venue not found', { status: 404 })

      const retryable = ['pending', 'human_action_needed']
      if (!retryable.includes(venue.status)) return new Response('already reviewed', { status: 200 })

      const payload: ReviewPayload = {
        venue_id: venue.id,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        city: venue.city,
        phone: venue.phone,
        category_id: venue.category_id,
        has_photos: venue.photos?.length > 0,
      }
      return await processReview(payload, supabase, true)
    }

    const payload = body as unknown as ReviewPayload
    return await processReview(payload, supabase, false)
  } catch (err) {
    console.error('handler error:', err)
    return new Response('ok', { status: 200 })
  }
})
