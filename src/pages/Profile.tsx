import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { CameraIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, XCircleIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import { updateProfile, uploadAvatar } from '../api/profiles'
import { getBookingsByUser, cancelBookingWithSlot } from '../api/bookings'
import { getReviewsByUser } from '../api/reviews'
import { getFavorites, removeFavorite } from '../api/favorites'
import { getMyPoints, getPointsHistory } from '../api/loyalty'
import { getMyWaitlist, leaveWaitlist } from '../api/waitlist'
import { formatDate, formatTime } from '../lib/utils'
import { queryKeys } from '../lib/queryKeys'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import type { Booking, Review } from '../types'

type Tab = 'upcoming' | 'past' | 'reviews' | 'calendar' | 'favorites' | 'loyalty' | 'waitlist'

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
}

const waitlistStatusVariant: Record<string, 'warning' | 'success' | 'default' | 'danger'> = {
  waiting: 'warning',
  notified: 'success',
  expired: 'default',
  cancelled: 'danger',
}

const Profile = () => {
  const { t } = useTranslation()
  useTitle(t('profile.title'))
  const { user, profile, setProfile } = useAuthStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const schema = useMemo(() => z.object({
    full_name: z.string().min(2, t('profile.fullName')),
    phone: z.string().min(9, t('profile.phoneRequired')),
  }), [t])

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { full_name: profile?.full_name || '', phone: profile?.phone || '' },
  })

  const { data: bookings = [] } = useQuery({
    queryKey: queryKeys.bookings.byUser(user?.id ?? ''),
    queryFn: () => getBookingsByUser(user!.id),
    enabled: !!user,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', 'user', user?.id],
    queryFn: () => getReviewsByUser(user!.id),
    enabled: !!user,
  })

  const { data: favorites = [] } = useQuery({
    queryKey: queryKeys.favorites.byUser(user?.id ?? ''),
    queryFn: () => getFavorites(user!.id),
    enabled: !!user,
  })

  const { data: loyaltyPoints } = useQuery({
    queryKey: queryKeys.loyalty.points(user?.id ?? ''),
    queryFn: () => getMyPoints(),
    enabled: !!user,
  })

  const { data: loyaltyHistory = [] } = useQuery({
    queryKey: queryKeys.loyalty.history(user?.id ?? ''),
    queryFn: () => getPointsHistory(),
    enabled: !!user,
  })

  const { data: waitlist = [] } = useQuery({
    queryKey: queryKeys.waitlist.byUser(user?.id ?? ''),
    queryFn: () => getMyWaitlist(),
    enabled: !!user,
  })

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const days: { date: string; day: number; bookings: typeof upcomingBookings }[] = []
    for (let i = 0; i < firstDay; i++) days.push({ date: '', day: 0, bookings: [] })
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const bks = upcomingBookings.filter(b => b.slots?.date === dateStr)
      days.push({ date: dateStr, day: d, bookings: bks })
    }
    return days
  }, [calMonth, calYear, upcomingBookings])

  const removeFavMutation = useMutation({
    mutationFn: (venueId: string) => removeFavorite(user!.id, venueId),
    onMutate: async (venueId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.byUser(user!.id) })
      const previous = queryClient.getQueryData(queryKeys.favorites.byUser(user!.id))
      queryClient.setQueryData(queryKeys.favorites.byUser(user!.id), (old: any[] = []) =>
        old.filter((f: any) => f.venue_id !== venueId)
      )
      return { previous }
    },
    onError: (_err, _venueId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.favorites.byUser(user!.id), context.previous)
      addToast({ type: 'error', message: t('common.error') })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.byUser(user!.id) }),
  })

  const profileMutation = useMutation({
    mutationFn: (data: FormData) => updateProfile(user!.id, data),
    onSuccess: (data) => {
      setProfile(data)
      addToast({ type: 'success', message: t('profile.updated') })
    },
    onError: () => addToast({ type: 'error', message: t('common.error') }),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, slotId }: { bookingId: string; slotId: string }) =>
      cancelBookingWithSlot(bookingId, slotId),
    onMutate: async ({ bookingId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.byUser(user!.id) })
      const previous = queryClient.getQueryData(queryKeys.bookings.byUser(user!.id))
      queryClient.setQueryData(queryKeys.bookings.byUser(user!.id), (old: Booking[] = []) =>
        old.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.bookings.byUser(user!.id), context.previous)
      addToast({ type: 'error', message: t('profile.bookingCancelError') })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byUser(user!.id) })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })

  const leaveWaitlistMutation = useMutation({
    mutationFn: (id: string) => leaveWaitlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.waitlist.byUser(user!.id) })
      addToast({ type: 'success', message: 'Left waitlist' })
    },
    onError: () => addToast({ type: 'error', message: t('common.error') }),
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      const updated = await updateProfile(user.id, { avatar_url: url })
      setProfile(updated)
      addToast({ type: 'success', message: t('profile.avatarUpdated') })
    } catch {
      addToast({ type: 'error', message: t('profile.avatarError') })
    }
    setAvatarUploading(false)
  }

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: t('common.confirmed'),
      completed: t('common.completed'),
      cancelled: t('common.cancelled'),
    }
    return labels[status] || status
  }

  const totalPoints = (loyaltyPoints ?? []).reduce((sum, p) => sum + p.balance, 0)
  const totalEarned = (loyaltyPoints ?? []).reduce((sum, p) => sum + p.lifetime_earned, 0)

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="rounded-2xl border p-4 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{background: 'var(--color-brand-light)'}}>
            🏢
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm" style={{color: 'var(--color-text-primary)'}}>{booking.venues?.name || t('profile.venue')}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs" style={{color: 'var(--color-text-secondary)'}}>
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="w-3 h-3" /> {formatDate(booking.slots?.date || '')}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" /> {formatTime(booking.slots?.start_time || '')}
              </span>
              {booking.venues?.address && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> {booking.venues.address}
                </span>
              )}
              {booking.group_size > 1 && (
                <span className="flex items-center gap-1">
                  👥 ×{booking.group_size}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={statusVariant[booking.status] || 'default'}>
            {statusLabel(booking.status)}
          </Badge>
        </div>
      </div>
      {booking.status === 'confirmed' && (
        <div className="mt-3 pt-3 border-t flex justify-end" style={{borderTopColor: 'var(--color-border)'}}>
          <Button
            variant="danger"
            size="sm"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate({ bookingId: booking.id, slotId: booking.slot_id })}
          >
            <XCircleIcon className="w-3.5 h-3.5" /> {t('profile.cancel')}
          </Button>
        </div>
      )}
    </div>
  )

  const ReviewCard = ({ review }: { review: Review }) => (
    <div className="rounded-2xl border p-4 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm" style={{color: 'var(--color-text-primary)'}}>{review.venues?.name || t('profile.venue')}</p>
          <p className="text-xs mt-0.5" style={{color: 'var(--color-text-tertiary)'}}>{formatDate(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
          {review.booking_id && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium border" style={{color: 'var(--color-brand)', background: 'var(--color-brand-light)', borderColor: 'var(--color-brand)'}}>
              ✔ Verified
            </span>
          )}
        </div>
      </div>
      {review.comment && <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>{review.comment}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>{t('profile.title')}</h1>

      {/* Profile edit card */}
      <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl overflow-hidden" style={{background: 'var(--color-brand-light)'}}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-2xl" style={{color: 'var(--color-brand)'}}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow disabled:opacity-50" style={{background: 'var(--color-brand)'}}
            >
              <CameraIcon className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <form
            onSubmit={handleSubmit(data => profileMutation.mutate(data))}
            className="flex-1 space-y-4 w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t('common.fullName')} error={errors.full_name?.message} {...register('full_name')} />
              <Input label={t('common.phone')} error={errors.phone?.message} {...register('phone')} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{color: 'var(--color-text-tertiary)'}}>{t('profile.email')} {user?.email}</p>
              <Button type="submit" size="sm" loading={profileMutation.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 overflow-x-auto scrollbar-hide" style={{background: 'var(--color-bg)'}}>
        {([
          { key: 'upcoming', label: `${t('profile.tabs.upcoming')} (${upcomingBookings.length})` },
          { key: 'calendar', label: '📅' },
          { key: 'past', label: `${t('profile.tabs.past')} (${pastBookings.length})` },
          { key: 'reviews', label: `${t('profile.tabs.reviews')} (${reviews.length})` },
          { key: 'favorites', label: `❤️ (${favorites.length})` },
          { key: 'loyalty', label: `🪙 (${totalPoints})` },
          { key: 'waitlist', label: `⏳ (${waitlist.length})` },
        ] as { key: Tab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap px-3 flex-shrink-0${activeTab === tab.key ? ' shadow-sm' : ''}`}
            style={activeTab === tab.key
              ? {background: 'var(--color-surface)', color: 'var(--color-text-primary)'}
              : {color: 'var(--color-text-secondary)'}
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {activeTab === 'upcoming' && (
          upcomingBookings.length === 0
            ? <EmptyState text={t('profile.emptyUpcoming')} sub={t('profile.emptyUpcomingDesc')} />
            : upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)
        )}

        {activeTab === 'past' && (
          pastBookings.length === 0
            ? <EmptyState text={t('profile.emptyPast')} sub={t('profile.emptyPastDesc')} />
            : pastBookings.map(b => <BookingCard key={b.id} booking={b} />)
        )}

        {activeTab === 'calendar' && (
          <div className="rounded-2xl border p-4 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }} className="text-sm font-medium hover:underline" style={{color: 'var(--color-brand)'}}>←</button>
              <span className="text-sm font-semibold" style={{color: 'var(--color-text-primary)'}}>{new Date(calYear, calMonth).toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }} className="text-sm font-medium hover:underline" style={{color: 'var(--color-brand)'}}>→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2" style={{color: 'var(--color-text-tertiary)'}}>
              {['Ya','Du','Se','Ch','Pa','Ju','Sh'].map(d => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, i) => (
                <div key={i} className={`aspect-square rounded-lg p-1 text-center text-xs ${d.day === 0 ? 'invisible' : d.bookings.length > 0 ? 'font-semibold' : ''}`}
                  style={d.day === 0 ? undefined : d.bookings.length > 0
                    ? {background: 'var(--color-brand-light)', color: 'var(--color-brand)'}
                    : {color: 'var(--color-text-primary)'}
                  }>
                  <span>{d.day}</span>
                  {d.bookings.length > 0 && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{background: 'var(--color-brand)'}} />}
                </div>
              ))}
            </div>
            {upcomingBookings.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4" style={{borderTopColor: 'var(--color-border)'}}>
                <p className="text-xs font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>{t('profile.tabs.upcoming')}</p>
                {upcomingBookings.map(b => (
                  <div key={b.id} className="flex items-center gap-2 text-xs">
                    <span className="font-medium" style={{color: 'var(--color-brand)'}}>{b.slots?.date || '—'}</span>
                    <span style={{color: 'var(--color-text-primary)'}}>{b.slots?.start_time?.slice(0,5) || '—'}</span>
                    <span style={{color: 'var(--color-text-tertiary)'}}>—</span>
                    <span className="font-medium" style={{color: 'var(--color-text-primary)'}}>{b.venues?.name || t('profile.venue')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          favorites.length === 0
            ? <EmptyState text="Sevimli joylar yo'q" sub="Yoqtirgan venue laringizni saqlang" />
            : <div className="space-y-3">{(favorites as any[]).map((f: any) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl border p-4 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
                <Link to={`/venues/${f.venue_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{f.venues?.categories?.icon || '🏢'}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm transition-colors" style={{color: 'var(--color-text-primary)'}}>{f.venues?.name}</p>
                    <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>{f.venues?.city}</p>
                  </div>
                </Link>
                <button onClick={() => removeFavMutation.mutate(f.venue_id)} className="transition-colors shrink-0 ml-3 hover:text-red-500" style={{color: 'var(--color-text-tertiary)'}}>
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}</div>
        )}

        {activeTab === 'reviews' && (
          reviews.length === 0
            ? <EmptyState text={t('profile.emptyReviews')} sub={t('profile.emptyReviewsDesc')} />
            : reviews.map(r => <ReviewCard key={r.id} review={r} />)
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🪙</span>
                <div>
                  <p className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>{totalPoints}</p>
                  <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Total points</p>
                </div>
              </div>
              <div className="text-sm" style={{color: 'var(--color-text-secondary)'}}>
                Lifetime earned: <span className="font-medium" style={{color: 'var(--color-text-primary)'}}>{totalEarned} points</span>
              </div>
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-800">
                  Earn 1 point for every 1 UZS spent. Redeem 100 points for 1 UZS off.
                </p>
              </div>
            </div>

            <h3 className="font-semibold" style={{color: 'var(--color-text-primary)'}}>History</h3>
            {loyaltyHistory.length === 0 ? (
              <EmptyState text="No points history yet" sub="Complete bookings to earn points" />
            ) : (
              loyaltyHistory.map(h => (
                <div key={h.id} className="rounded-2xl border p-4 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{color: 'var(--color-text-primary)'}}>{h.description || h.type}</p>
                      <p className="text-xs mt-0.5" style={{color: 'var(--color-text-tertiary)'}}>{formatDate(h.created_at)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${h.type === 'earned' ? '' : 'text-red-500'}`}
                      style={h.type === 'earned' ? {color: 'var(--color-brand)'} : undefined}>
                      {h.type === 'earned' ? '+' : '-'}{h.points}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'waitlist' && (
          waitlist.length === 0
            ? <EmptyState text="No waitlist entries" sub="Join a waitlist when a slot is full" />
            : waitlist.map(w => (
                <div key={w.id} className="rounded-2xl border p-4 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm" style={{color: 'var(--color-text-primary)'}}>{(w as any).venues?.name || 'Venue'}</p>
                      <p className="text-xs mt-1" style={{color: 'var(--color-text-secondary)'}}>
                        {w.slot_time ? formatDate(w.slot_time) : '—'} at {w.slot_time?.slice(11, 16) || '—'}
                        {w.party_size > 1 && ` · Party of ${w.party_size}`}
                      </p>
                      <Badge variant={waitlistStatusVariant[w.status] || 'default'}>{w.status}</Badge>
                    </div>
                    {w.status === 'waiting' && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={leaveWaitlistMutation.isPending}
                        onClick={() => leaveWaitlistMutation.mutate(w.id)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </div>
              ))
        )}
      </div>
    </div>
  )
}

const EmptyState = ({ text, sub }: { text: string; sub: string }) => (
  <div className="text-center py-12 rounded-2xl" style={{background: 'var(--color-bg)'}}>
    <span className="text-4xl">📋</span>
    <p className="mt-2" style={{color: 'var(--color-text-secondary)'}}>{text}</p>
    <p className="text-sm mt-1" style={{color: 'var(--color-text-tertiary)'}}>{sub}</p>
  </div>
)

export default Profile
