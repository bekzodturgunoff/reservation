export interface Profile {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
  role: 'user' | 'business' | 'admin'
  total_points?: number
  created_at: string
}

export interface Category {
  id: number
  slug: string
  name_uz: string
  name_ru: string
  icon: string
}

export type PricingUnit = 'per_hour' | 'per_session' | 'per_day' | 'per_month' | 'per_person' | 'fixed'

export type CancellationPolicy = 'flexible' | 'standard' | 'strict'

export interface VenueService {
  id: string
  venue_id: string
  name: string
  price: number
  unit: PricingUnit
  description: string
  duration_minutes: number | null
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface Venue {
  id: string
  owner_id: string
  category_id: number
  name: string
  description: string
  address: string
  city: string
  district: string | null
  lat: number | null
  lng: number | null
  phone: string
  photos: string[]
  price_per_slot: number
  currency: string
  pricing_unit: PricingUnit
  status: 'pending' | 'active' | 'rejected' | 'human_action_needed'
  ai_review_data: AiReviewData | null
  opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null
  min_notice_hours: number
  max_advance_days: number
  max_group_size: number | null
  cancellation_policy: CancellationPolicy
  created_at: string
  categories?: Category
  services?: VenueService[]
  avg_rating?: number
  review_count?: number
}

export interface Slot {
  id: string
  venue_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  staff_capacity: number | null
}

export interface Booking {
  id: string
  user_id: string
  venue_id: string
  slot_id: string
  service_id: string | null
  service_name: string
  service_price: number
  status: 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  note: string | null
  recurring_pattern: RecurringPattern | null
  group_size: number
  promo_code_id: string | null
  staff_id: string | null
  checked_in: boolean
  checked_in_at: string | null
  no_show: boolean
  created_at: string
  venues?: Venue
  slots?: Slot
}

export interface RecurringPattern {
  frequency: 'weekly' | 'bi-weekly' | 'monthly'
  occurrences: number
}

export interface Review {
  id: string
  user_id: string
  venue_id: string
  booking_id: string | null
  rating: number
  comment: string
  photos: string[]
  created_at: string
  profiles?: Profile
  venues?: Venue
}

export interface Favorite {
  id: string
  user_id: string
  venue_id: string
  created_at: string
  venues?: Venue
}

export interface PromoCode {
  id: string
  venue_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  min_amount: number | null
  max_discount: number | null
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface StaffMember {
  id: string
  venue_id: string
  name: string
  title: string
  services: string[]
  photo: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface AiReviewData {
  review_status: string
  confidence: number
  reasons: string[]
  flags: { type: string; message: string }[]
  model_used: string | null
  reviewed_at: string
}

export interface AnalyticsData {
  dailyRevenue: { date: string; revenue: number; bookings: number }[]
  statusBreakdown: { name: string; value: number; color: string }[]
  venueStats: { venueId: string; venueName: string; icon: string; bookings: number; revenue: number }[]
  totalRevenue: number
  totalBookings: number
  avgRating: number
  revenueChange: number
  bookingsChange: number
}
