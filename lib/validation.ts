import type { Venue } from '@/types'

export function isVenuePublishable(venue: Venue): boolean {
  if (!venue || typeof venue !== 'object') return false
  if (venue.name.length < 3) return false
  if (venue.name.match(/^[A-Za-z]+\s[A-Za-z]+$/)) return false
  if (venue.price_per_slot <= 0) return false
  if (!venue.photos || venue.photos.length < 1) return false
  if (!venue.address || venue.address.length < 5) return false
  if (venue.category_id === undefined || venue.category_id === null) return false
  return true
}

export function showRating(rating: number | undefined | null, reviewCount: number | undefined | null) {
  if (!reviewCount || reviewCount < 1) {
    return { showStars: false, showAverage: false, label: 'Hali sharh yo\'q' }
  }
  if (reviewCount < 3) {
    return { showStars: true, showAverage: false, label: `${reviewCount} ta sharh` }
  }
  return {
    showStars: true,
    showAverage: true,
    label: `${rating?.toFixed(1) || '—'} (${reviewCount} ta sharh)`,
  }
}
