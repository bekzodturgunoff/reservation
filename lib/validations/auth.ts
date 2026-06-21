import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email noto\'g\'ri'),
  password: z.string().min(8, 'Parol kamida 8 ta belgi'),
})

export const registerSchema = z.object({
  email: z.string().email('Email noto\'g\'ri'),
  password: z.string().min(8, 'Parol kamida 8 ta belgi'),
  fullName: z.string().min(2, 'Ism kamida 2 ta belgi'),
  phone: z.string().regex(/^998\d{9}$/, 'Telefon formati: 998XXXXXXXXX'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
