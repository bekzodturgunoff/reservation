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
        <h2 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>
          {t('venue.reviewsTitle')} ({reviews.length})
        </h2>
      </div>

      {socialProof && (
        <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl" style={{background: 'var(--color-bg)'}}>
          {socialProof.recommendationPercent > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg">👍</span>
              <span className="text-sm font-semibold" style={{color: 'var(--color-text-primary)'}}>{socialProof.recommendationPercent}%</span>
              <span className="text-xs" style={{color: 'var(--color-text-secondary)'}}>recommend</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>📅</span>
            <span className="text-sm font-medium" style={{color: 'var(--color-text-primary)'}}>{socialProof.bookingCount}</span>
            <span className="text-xs" style={{color: 'var(--color-text-secondary)'}}>bookings this week</span>
          </div>
        </div>
      )}

      {showCarousel && (
        <div className="mb-5 p-4 rounded-2xl border" style={{background: 'var(--color-brand-light)', borderColor: 'var(--color-brand)'}}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗣️</span>
            <div>
              <p className="text-sm italic" style={{color: 'var(--color-brand)'}}>
                "{socialProof!.recentReviews[0].text}"
              </p>
              <p className="text-xs mt-1 font-medium" style={{color: 'var(--color-brand)'}}>
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
        <div className="text-center py-10 rounded-2xl" style={{background: 'var(--color-bg)'}}>
          <span className="text-4xl">💬</span>
          <p className="mt-2" style={{color: 'var(--color-text-secondary)'}}>{t('venue.noReviews')}</p>
          <p className="text-sm" style={{color: 'var(--color-text-tertiary)'}}>{t('venue.beFirst')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="rounded-2xl border p-5 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.profiles?.avatar_url ? (
                    <img src={review.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border" style={{borderColor: 'var(--color-border)'}} />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm" style={{background: 'var(--color-brand-light)', color: 'var(--color-brand)'}}>
                      {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm" style={{color: 'var(--color-text-primary)'}}>
                      {review.profiles?.full_name || t('venue.user')}
                    </p>
                    <p className="text-xs" style={{color: 'var(--color-text-tertiary)'}}>
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : ''}`}
                        style={i < review.rating ? {} : {color: 'var(--color-text-tertiary)'}}
                      />
                    ))}
                  </div>
                  {review.booking_id && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium border" style={{background: 'var(--color-brand-light)', color: 'var(--color-brand)', borderColor: 'var(--color-brand)'}}>
                      ✔ Verified Booking
                    </span>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed" style={{color: 'var(--color-text-secondary)'}}>{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VenueDetailReviews
