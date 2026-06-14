export const queryKeys = {
  venues: {
    all: ['venues'] as const,
    detail: (id: string) => ['venues', id] as const,
    owner: (id: string) => ['venues', 'owner', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    byVenue: (ids: string[]) => ['bookings', 'venue', ...ids] as const,
    byUser: (id: string) => ['bookings', 'user', id] as const,
  },
  reviews: {
    byVenue: (id: string) => ['reviews', 'venue', id] as const,
  },
  favorites: {
    byUser: (id: string) => ['favorites', 'user', id] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    pendingVenues: ['admin', 'pending-venues'] as const,
  },
}
