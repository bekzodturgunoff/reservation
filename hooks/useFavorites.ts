'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

export function useFavorites() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', user.id)
      return (data || []).map(f => f.venue_id)
    },
    enabled: !!user,
  })

  const { mutate: toggle } = useMutation({
    mutationFn: async (venueId: string) => {
      if (!user) throw new Error('Kirish kerak')

      const isFav = favoriteIds.includes(venueId)
      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('venue_id', venueId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, venue_id: venueId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    },
    onError: () => {
      toast.error('Xatolik yuz berdi')
    },
  })

  const isFavorite = (venueId: string) => favoriteIds.includes(venueId)

  return { favoriteIds, toggle, isFavorite }
}
