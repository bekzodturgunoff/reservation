import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { createReview } from '../../api/reviews'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import Button from '../ui/Button'
import { useTranslation } from 'react-i18next'

interface Props {
  venueId: string
  bookingId?: string
}

const ReviewForm = ({ venueId, bookingId }: Props) => {
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')

  const reviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        user_id: user!.id,
        venue_id: venueId,
        booking_id: bookingId,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', venueId] })
      addToast({ type: 'success', message: t('venue.reviewSubmitted') })
      setRating(0)
      setComment('')
    },
    onError: () => addToast({ type: 'error', message: t('common.error') }),
  })

  if (!user) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">{t('venue.writeReview')}</h3>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-colors"
          >
            {star <= (hover || rating) ? (
              <StarIconSolid className="w-6 h-6 text-yellow-400" />
            ) : (
              <StarIcon className="w-6 h-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={t('venue.reviewPlaceholder')}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none mb-3"
      />

      <Button
        size="sm"
        onClick={() => reviewMutation.mutate()}
        disabled={rating === 0}
        loading={reviewMutation.isPending}
      >
        {t('venue.submitReview')}
      </Button>
    </div>
  )
}

export default ReviewForm
