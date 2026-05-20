export const queryKeys = {
  venues: {
    all: ['venues'] as const,
    filtered: (filters: Record<string, unknown>) => ['venues', filters] as const,
    detail: (id: string) => ['venues', id] as const,
    byOwner: (ownerId: string) => ['venues', 'owner', ownerId] as const,
    services: (venueId: string) => ['venues', venueId, 'services'] as const,
    socialProof: (venueId: string) => ['venues', venueId, 'socialProof'] as const,
    districts: ['venues', 'districts'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  slots: {
    byVenueAndDate: (venueId: string, date: string) =>
      ['slots', venueId, date] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    byUser: (userId: string) => ['bookings', 'user', userId] as const,
    byVenue: (venueId: string) => ['bookings', 'venue', venueId] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  reviews: {
    byVenue: (venueId: string) => ['reviews', venueId] as const,
  },
  favorites: {
    byUser: (userId: string) => ['favorites', userId] as const,
  },
  profiles: {
    detail: (userId: string) => ['profiles', userId] as const,
  },
  loyalty: {
    points: (userId: string) => ['loyalty', 'points', userId] as const,
    history: (userId: string) => ['loyalty', 'history', userId] as const,
  },
  waitlist: {
    byUser: (userId: string) => ['waitlist', 'user', userId] as const,
    byVenue: (venueId: string) => ['waitlist', 'venue', venueId] as const,
  },
  promo: {
    byVenue: (venueId: string) => ['promo', venueId] as const,
  },
  staff: {
    byVenue: (venueId: string) => ['staff', venueId] as const,
  },
  admin: {
    pendingVenues: ['admin', 'venues', 'pending'] as const,
    stats: ['admin', 'stats'] as const,
  },
} as const
