export const QUERY_KEYS = {
  venues: {
    all: ['venues'] as const,
    featured: ['venues', 'featured'] as const,
    search: (params?: Record<string, string>) => ['venues', 'search', params] as const,
    detail: (slug: string) => ['venues', 'detail', slug] as const,
    byOwner: (ownerId: string) => ['venues', 'owner', ownerId] as const,
    byId: (id: string) => ['venues', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    byUser: (userId: string) => ['bookings', 'user', userId] as const,
    byVenue: (venueIds: string[]) => ['bookings', 'venue', ...venueIds] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    today: (venueIds: string[]) => ['bookings', 'today', ...venueIds] as const,
  },
  reviews: {
    byVenue: (venueId: string) => ['reviews', 'venue', venueId] as const,
  },
  favorites: {
    byUser: (userId: string) => ['favorites', 'user', userId] as const,
  },
  profile: {
    current: ['profile', 'current'] as const,
  },
  stats: {
    platform: ['stats', 'platform'] as const,
    admin: {
      users: ['admin', 'users', 'count'] as const,
      venues: ['admin', 'venues', 'count'] as const,
      bookings: ['admin', 'bookings', 'count'] as const,
      pendingVenues: ['admin', 'pending-venues'] as const,
      revenue: ['admin', 'revenue'] as const,
    },
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
} as const
