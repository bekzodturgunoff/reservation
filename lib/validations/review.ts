import { z } from 'zod'

export const reviewCreateSchema = z.object({
  venue_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Sharh kamida 10 ta belgi').max(500, 'Sharh 500 belgidan oshmasligi kerak'),
  cleanliness_rating: z.number().min(1).max(5).optional(),
  service_rating: z.number().min(1).max(5).optional(),
  comfort_rating: z.number().min(1).max(5).optional(),
  value_rating: z.number().min(1).max(5).optional(),
  location_rating: z.number().min(1).max(5).optional(),
  photos: z.array(z.string()).max(3).optional(),
})

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
