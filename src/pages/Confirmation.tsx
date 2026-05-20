import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDaysIcon, ClockIcon, MapPinIcon, TagIcon, CheckCircleIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline'
import { getBookingById } from '../api/bookings'
import { useAuthStore } from '../store/authStore'
import { useTitle } from '../hooks/useTitle'
import { formatPrice, formatDate } from '../lib/utils'
import Button from '../components/ui/Button'
import ReviewForm from '../components/venue/ReviewForm'
import { useTranslation } from 'react-i18next'

const CHECKIN_SECRET = import.meta.env.VITE_CHECKIN_SECRET || ''

const Confirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  useTitle(t('confirmation.title'))
  const [qrUrl, setQrUrl] = useState('')
  const [reminderSent, setReminderSent] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  })

  useEffect(() => {
    if (!booking) return

    const generateQrUrl = async () => {
      const msg = booking.id
      const enc = new TextEncoder()
      const keyData = enc.encode(CHECKIN_SECRET)
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
      const hash = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
      setQrUrl(`${window.location.origin}/checkin/${booking.id}?sig=${hash}`)
    }

    generateQrUrl()

    if (!reminderSent) {
      setReminderSent(true)
      const slot = booking.slots as { date?: string; start_time?: string } | null
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      const rebookingKey = import.meta.env.VITE_REBOOKING_REMINDER_KEY || ''

      fetch(`${supabaseUrl}/functions/v1/send-rebooking-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rebooking-key': rebookingKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          booking_id: booking.id,
          user_id: booking.user_id,
          venue_id: booking.venue_id,
          venue_name: booking.venues?.name || '',
          date: slot?.date || '',
          start_time: slot?.start_time?.slice(0, 5) || '',
        }),
      }).catch(() => {
        // Silent fail — reminder is non-critical
      })
    }
  }, [booking, reminderSent])

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse space-y-6 py-12">
        <div className="w-20 h-20 rounded-full mx-auto" style={{background: 'var(--color-bg)'}} />
        <div className="h-8 w-1/2 rounded-lg mx-auto" style={{background: 'var(--color-bg)'}} />
        <div className="h-32 rounded-2xl" style={{background: 'var(--color-bg)'}} />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>{t('confirmation.notFound')}</h2>
        <p className="mb-6" style={{color: 'var(--color-text-secondary)'}}>{t('confirmation.notFoundDesc')}</p>
        <Link to="/"><Button>{t('confirmation.backHome')}</Button></Link>
      </div>
    )
  }

  const venue = booking.venues
  const slot = booking.slots
  const earningsTip = `Earn 🪙 ${Math.floor(booking.total_price)} points for this booking!`

  return (
    <div className="max-w-lg mx-auto text-center py-8">

      {/* Success animation */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce" style={{background: 'var(--color-brand-light)'}}>
          <CheckCircleIcon className="w-10 h-10" style={{color: 'var(--color-brand)'}} />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>{t('confirmation.successTitle')}</h1>
      <p className="text-sm mb-2" style={{color: 'var(--color-text-secondary)'}}>
        {t('confirmation.bookingNumber')} <span className="font-mono font-medium" style={{color: 'var(--color-text-primary)'}}>{booking.id.slice(0, 8)}</span>
      </p>
      <p className="text-xs text-amber-600 mb-8">{earningsTip}</p>

      {/* QR Code */}
      {qrUrl && (
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-2xl border p-4 shadow-sm inline-block" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`}
              alt="Check-in QR Code"
              className="w-36 h-36"
            />
          </div>
          <p className="text-xs mt-2" style={{color: 'var(--color-text-tertiary)'}}>Show this at the venue for check-in</p>
        </div>
      )}

      {/* Booking details card */}
      <div className="rounded-2xl border p-6 shadow-sm text-left mb-6" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
        <h3 className="font-semibold mb-4" style={{color: 'var(--color-text-primary)'}}>{t('confirmation.details')}</h3>

        {venue && (
          <div className="flex items-start gap-3 mb-4 pb-4 border-b" style={{borderBottomColor: 'var(--color-border)'}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background: 'var(--color-brand-light)'}}>
              🏢
            </div>
            <div>
              <p className="font-medium" style={{color: 'var(--color-text-primary)'}}>{venue.name}</p>
              <p className="text-sm flex items-center gap-1 mt-0.5" style={{color: 'var(--color-text-secondary)'}}>
                <MapPinIcon className="w-3 h-3" /> {venue.address}
              </p>
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="text-sm hover:underline mt-0.5 block" style={{color: 'var(--color-brand)'}}>
                  {venue.phone}
                </a>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2.5 text-sm">
          {slot && (
            <>
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
                <span style={{color: 'var(--color-text-primary)'}}>{formatDate(slot.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
                <span style={{color: 'var(--color-text-primary)'}}>{slot.start_time?.slice(0, 5)} — {slot.end_time?.slice(0, 5)}</span>
              </div>
            </>
          )}
          {booking.service_name && (
            <div className="flex items-center gap-3">
              <TagIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
              <span style={{color: 'var(--color-text-primary)'}}>{booking.service_name}</span>
            </div>
          )}
          {booking.group_size > 1 && (
            <div className="flex items-center gap-3">
              <span style={{color: 'var(--color-text-tertiary)'}}>👥</span>
              <span style={{color: 'var(--color-text-primary)'}}>Party of {booking.group_size}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <TagIcon className="w-4 h-4" style={{color: 'var(--color-text-tertiary)'}} />
            <span className="font-semibold" style={{color: 'var(--color-brand)'}}>{formatPrice(booking.total_price)}</span>
          </div>
          {booking.note && (
            <div className="mt-3 pt-3 border-t" style={{borderTopColor: 'var(--color-border)'}}>
              <p className="text-xs mb-1" style={{color: 'var(--color-text-tertiary)'}}>{t('confirmation.note')}</p>
              <p style={{color: 'var(--color-text-secondary)'}}>{booking.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Leave a review */}
      {user && venue && (
        <div className="mb-6 text-left">
          <ReviewForm venueId={venue.id} bookingId={booking.id} />
        </div>
      )}

      {/* Telegram reminder */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6 text-left">
        <p className="text-sm text-blue-800">
          {t('confirmation.telegramNote')}
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <Link to="/profile?tab=bookings">
          <Button variant="secondary" className="w-full">
            <UserIcon className="w-4 h-4" /> {t('confirmation.myBookings')}
          </Button>
        </Link>
        <Link to="/">
          <Button className="w-full">
            <HomeIcon className="w-4 h-4" /> {t('confirmation.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Confirmation
