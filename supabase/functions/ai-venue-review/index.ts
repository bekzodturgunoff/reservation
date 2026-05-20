// AI Venue Review — auto-approves or flags venues for human review
// Uses Gemini with automatic model fallback on quota exhaustion
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemma-4-31b-it',
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

interface ReviewResult {
  action: 'approve' | 'human_needed' | 'reject'
  confidence: number
  reasons: string[]
}

function heuristicReview(payload: ReviewPayload): ReviewResult {
  const reasons: string[] = []
  const name = payload.name?.trim() || ''
  if (name.length < 2) return { action: 'reject', confidence: 0.9, reasons: ['Name too short or empty'] }
  if (/^(test|asd|qwe|xxx|123|venue|joy|новый|тест|salon|barber)\d*$/i.test(name)) return { action: 'human_needed', confidence: 0.6, reasons: ['Name looks like placeholder'] }
  reasons.push('Name looks valid')
  const desc = payload.description?.trim() || ''
  if (desc.length < 10) { reasons.push('Description is short or missing') } else { reasons.push('Description present') }
  const address = payload.address?.trim() || ''
  if (address.length < 5) return { action: 'human_needed', confidence: 0.7, reasons: ['Address too short or invalid'] }
  reasons.push('Address looks valid')
  const phone = payload.phone?.trim() || ''
  if (phone && phone.replace(/\D/g, '').length >= 7) { reasons.push('Phone number provided') } else { reasons.push('No valid phone number') }
  if (payload.has_photos) { reasons.push('Has photos') } else { reasons.push('No photos uploaded') }
  const score = reasons.filter(r => r.includes('valid') || r.includes('present') || r.includes('photos') || r.includes('Phone')).length
  if (score >= 4 && name.length >= 3) return { action: 'approve', confidence: 0.8, reasons }
  if (score >= 2) return { action: 'human_needed', confidence: 0.6, reasons }
  return { action: 'human_needed', confidence: 0.5, reasons }
}

// Try Gemini models in order until one works
async function askGeminiWithFallback(prompt: string, expectedJson = true): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  for (const model of GEMINI_MODELS) {
    try {
      const body: any = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      }
      if (expectedJson) body.generationConfig.responseMimeType = 'application/json'

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
      )
      if (res.status === 429) {
        console.warn(`Model ${model} quota exhausted, trying next...`)
        continue
      }
      if (!res.ok) {
        console.error(`Model ${model} error:`, res.status, await res.text())
        continue
      }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        console.log(`AI review succeeded with model: ${model}`)
        return text
      }
    } catch (err) {
      console.warn(`Model ${model} failed:`, err)
      continue
    }
  }
  return null
}

async function aiReview(payload: ReviewPayload): Promise<ReviewResult> {
  const prompt = `You are a venue moderation AI for BronUz, an Uzbekistani booking platform. Your job is to review venue submissions.
Review the following venue for RED FLAGS:
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

  const resultText = await askGeminiWithFallback(prompt, true)
  if (!resultText) return heuristicReview(payload)

  try {
    const result: ReviewResult = JSON.parse(resultText)
    if (result.action && ['approve', 'human_needed', 'reject'].includes(result.action)) return result
  } catch { /* parse failed */ }
  return heuristicReview(payload)
}

serve(async (req) => {
  try {
    const payload: ReviewPayload = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const result = GEMINI_API_KEY ? await aiReview(payload) : heuristicReview(payload)

    if (result.action === 'approve' && result.confidence >= 0.7) {
      await supabase.from('venues').update({
        status: 'active',
        ai_review_data: { reviewed_by: 'ai', action: 'approved', confidence: result.confidence, reasons: result.reasons },
      }).eq('id', payload.venue_id)
      console.log(`AI auto-approved venue ${payload.venue_id} (confidence: ${result.confidence})`)
    } else if (result.action === 'reject' && result.confidence >= 0.8) {
      await supabase.from('venues').update({
        status: 'rejected',
        ai_review_data: { reviewed_by: 'ai', action: 'rejected', confidence: result.confidence, reasons: result.reasons },
      }).eq('id', payload.venue_id)
      console.log(`AI rejected venue ${payload.venue_id} (confidence: ${result.confidence})`)
    } else {
      await supabase.from('venues').update({
        status: 'human_action_needed',
        ai_review_data: { reviewed_by: 'ai', action: 'human_needed', confidence: result.confidence, reasons: result.reasons },
      }).eq('id', payload.venue_id)
      console.log(`AI flagged venue ${payload.venue_id} for human review (confidence: ${result.confidence})`)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('ai-venue-review error:', err)
    return new Response('ok', { status: 200 })
  }
})
