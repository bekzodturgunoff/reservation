export interface Profile {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
  role: 'user' | 'business' | 'admin'
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
  lat: number | null
  lng: number | null
  phone: string
  photos: string[]
  price_per_slot: number
  currency: string
  pricing_unit: PricingUnit
  status: 'pending' | 'active' | 'rejected'
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
  created_at: string
  venues?: Venue
  slots?: Slot
}

export interface Review {
  id: string
  user_id: string
  venue_id: string
  booking_id: string
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

export interface TelegramLink {
  id: string
  user_id: string
  venue_id: string
  chat_id: number
  created_at: string
  venues?: Venue
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

export interface DailyRevenue {
  date: string
  revenue: number
  bookings: number
}

export interface BookingStatusBreakdown {
  name: string
  value: number
  color: string
}

export interface VenueBookingStats {
  venueId: string
  venueName: string
  icon: string
  bookings: number
  revenue: number
}

export interface AnalyticsData {
  dailyRevenue: DailyRevenue[]
  statusBreakdown: BookingStatusBreakdown[]
  venueStats: VenueBookingStats[]
  totalRevenue: number
  totalBookings: number
  avgRating: number
  revenueChange: number
  bookingsChange: number
}
