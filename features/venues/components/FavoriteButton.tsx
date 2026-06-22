'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/features/venues/hooks/useFavorites'
import { ROUTES } from '@/lib/constants/routes'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  venueId: string
  className?: string
}

export function FavoriteButton({ venueId, className = '' }: FavoriteButtonProps) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(venueId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Sevimlilarga qo\'shish uchun tizimga kiring')
      router.push(ROUTES.LOGIN)
      return
    }
    toggle(venueId)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${className}`}
      aria-label={fav ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
    >
      <Heart
        className={`w-[18px] h-[18px] transition-all duration-200 ${
          fav ? 'fill-red-500 text-red-500' : 'text-white/80 hover:text-white'
        }`}
      />
    </button>
  )
}
