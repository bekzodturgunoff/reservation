import { z } from 'zod'

export const venueCreateSchema = z.object({
  name: z.string().min(3, 'Nomi kamida 3 ta belgi'),
  category_id: z.number(),
  description: z.string().min(20, 'Tavsif kamida 20 ta belgi'),
  city: z.string().min(2, 'Shaharni tanlang'),
  district: z.string().optional(),
  address: z.string().min(5, 'Manzil kamida 5 ta belgi'),
  phone: z.string().regex(/^998\d{9}$/, 'Telefon formati: 998XXXXXXXXX'),
  price_per_hour: z.number().positive('Narx musbat bo\'lishi kerak'),
  pricing_unit: z.enum(['per_hour', 'per_session', 'per_day', 'per_month', 'per_person', 'fixed']).default('per_hour'),
  max_group_size: z.number().positive().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  cancellation_policy: z.enum(['flexible', 'standard', 'strict']).default('standard'),
  min_notice_hours: z.number().min(0).default(2),
})

export const venueUpdateSchema = venueCreateSchema.partial()

export type VenueCreateInput = z.infer<typeof venueCreateSchema>
export type VenueUpdateInput = z.infer<typeof venueUpdateSchema>
