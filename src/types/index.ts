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
  status: 'pending' | 'active' | 'rejected'
  created_at: string
  categories?: Category
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
  created_at: string
  profiles?: Profile
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}
