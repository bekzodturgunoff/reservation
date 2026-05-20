import { StarIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import ReviewForm from '../../components/venue/ReviewForm'
import { formatDate } from '../../lib/utils'
import { getVenueSocialProof } from '../../api/venues'
import type { Review } from '../../types'

interface Props {
  reviews: Review[]
  venueId: string
  hasUser: boolean
}

const VenueDetailReviews = ({ reviews, venueId, hasUser }: Props) => {
  const { t } = useTranslation()

  const { data: socialProof } = useQuery({
    queryKey: ['venues', venueId, 'socialProof'],
    queryFn: () => getVenueSocialProof(venueId),
    staleTime: 120_000,
  })

  const showCarousel = socialProof && socialProof.recentReviews.length > 0

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('venue.reviewsTitle')} ({reviews.length})
        </h2>
      </div>

      {socialProof && (
        <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-2xl">
          {socialProof.recommendationPercent > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg">👍</span>
              <span className="text-sm font-semibold text-gray-900">{socialProof.recommendationPercent}%</span>
              <span className="text-xs text-gray-500">recommend</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">📅</span>
            <span className="text-sm font-medium text-gray-900">{socialProof.bookingCount}</span>
            <span className="text-xs text-gray-500">bookings this week</span>
          </div>
        </div>
      )}

      {showCarousel && (
        <div className="mb-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗣️</span>
            <div>
              <p className="text-sm text-emerald-900 italic">
                "{socialProof!.recentReviews[0].text}"
              </p>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                — {socialProof!.recentReviews[0].name}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasUser && (
        <div className="mb-6">
          <ReviewForm venueId={venueId} />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl">
          <span className="text-4xl">💬</span>
          <p className="text-gray-500 mt-2">{t('venue.noReviews')}</p>
          <p className="text-sm text-gray-400">{t('venue.beFirst')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.profiles?.avatar_url ? (
                    <img src={review.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                      {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {review.profiles?.full_name || t('venue.user')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  {review.booking_id && (
                    <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium border border-emerald-200">
                      ✔ Verified Booking
                    </span>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VenueDetailReviews
