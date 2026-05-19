import { useQuery } from '@tanstack/react-query'
import { getActiveVenues, getVenueById } from '../api/venues'

export function useVenues(limit = 6) {
  return useQuery({
    queryKey: ['venues', 'active', limit],
    queryFn: () => getActiveVenues(limit),
  })
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id),
    enabled: !!id,
  })
}
