import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, CalendarDays, Clock, MapPin, XCircle, Star } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import { updateProfile, uploadAvatar } from '../api/profiles'
import { getBookingsByUser, cancelBookingWithSlot } from '../api/bookings'
import { getReviewsByUser } from '../api/reviews'
import { formatDate, formatTime } from '../lib/utils'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import type { Booking } from '../types'

const schema = z.object({
  full_name: z.string().min(2, 'Ism kamida 2 ta belgi'),
  phone: z.string().min(9, 'Telefon raqam kiriting'),
})

type FormData = z.infer<typeof schema>

type Tab = 'upcoming' | 'past' | 'reviews'

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
}

const statusLabel: Record<string, string> = {
  confirmed: 'Tasdiqlangan',
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
}

const Profile = () => {
  useTitle('Mening profilim')
  const { user, profile, setProfile } = useAuthStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { full_name: profile?.full_name || '', phone: profile?.phone || '' },
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => getBookingsByUser(user!.id),
    enabled: !!user,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', 'user', user?.id],
    queryFn: () => getReviewsByUser(user!.id),
    enabled: !!user,
  })

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

  const profileMutation = useMutation({
    mutationFn: (data: FormData) => updateProfile(user!.id, data),
    onSuccess: (data) => {
      setProfile(data)
      addToast({ type: 'success', message: 'Profil yangilandi' })
    },
    onError: () => addToast({ type: 'error', message: 'Xatolik yuz berdi' }),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, slotId }: { bookingId: string; slotId: string }) =>
      cancelBookingWithSlot(bookingId, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      addToast({ type: 'success', message: 'Bron bekor qilindi' })
    },
    onError: () => addToast({ type: 'error', message: 'Bekor qilishda xatolik' }),
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      const updated = await updateProfile(user.id, { avatar_url: url })
      setProfile(updated)
      addToast({ type: 'success', message: 'Rasm yangilandi' })
    } catch {
      addToast({ type: 'error', message: 'Rasm yuklashda xatolik' })
    }
    setAvatarUploading(false)
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">
            🏢
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm">{booking.venues?.name || 'Venue'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> {formatDate(booking.slots?.date || '')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatTime(booking.slots?.start_time || '')}
              </span>
              {booking.venues?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {booking.venues.address}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={statusVariant[booking.status] || 'default'}>
            {statusLabel[booking.status] || booking.status}
          </Badge>
        </div>
      </div>
      {booking.status === 'confirmed' && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate({ bookingId: booking.id, slotId: booking.slot_id })}
          >
            <XCircle className="w-3.5 h-3.5" /> Bekor qilish
          </Button>
        </div>
      )}
    </div>
  )

  const ReviewCard = ({ review }: { review: any }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{review.venues?.name || 'Venue'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
          ))}
        </div>
      </div>
      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Mening profilim</h1>

      {/* Profile edit card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-700 font-bold text-2xl">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
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
              <Input label="To'liq ism" error={errors.full_name?.message} {...register('full_name')} />
              <Input label="Telefon" error={errors.phone?.message} {...register('phone')} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Email: {user?.email}</p>
              <Button type="submit" size="sm" loading={profileMutation.isPending}>
                Saqlash
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { key: 'upcoming', label: `Kelgusi (${upcomingBookings.length})` },
          { key: 'past', label: `O'tgan (${pastBookings.length})` },
          { key: 'reviews', label: `Izohlar (${reviews.length})` },
        ] as { key: Tab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {activeTab === 'upcoming' && (
          upcomingBookings.length === 0
            ? <EmptyState text="Kelgusi bronlar yo'q" sub="Yangi bron qilish uchun qidirishni boshlang" />
            : upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)
        )}

        {activeTab === 'past' && (
          pastBookings.length === 0
            ? <EmptyState text="O'tgan bronlar yo'q" sub="Bron qilishni boshlang va tarix bu yerda ko'rsatiladi" />
            : pastBookings.map(b => <BookingCard key={b.id} booking={b} />)
        )}

        {activeTab === 'reviews' && (
          reviews.length === 0
            ? <EmptyState text="Izohlar yo'q" sub="Tashrif buyurganingizdan so'ng izoh qoldirishingiz mumkin" />
            : reviews.map(r => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </div>
  )
}

const EmptyState = ({ text, sub }: { text: string; sub: string }) => (
  <div className="text-center py-12 bg-gray-50 rounded-2xl">
    <span className="text-4xl">📋</span>
    <p className="text-gray-500 mt-2">{text}</p>
    <p className="text-sm text-gray-400 mt-1">{sub}</p>
  </div>
)

export default Profile
