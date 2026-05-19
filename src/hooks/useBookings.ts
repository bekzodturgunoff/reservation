import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookingsByUser, createBooking } from '../api/bookings'

export function useUserBookings(userId: string) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => getBookingsByUser(userId),
    enabled: !!userId,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
