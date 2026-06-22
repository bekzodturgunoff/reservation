import { z } from 'zod'

export const bookingCreateSchema = z.object({
  venue_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  booking_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  group_size: z.number().positive().default(1),
  notes: z.string().optional(),
})

export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>
