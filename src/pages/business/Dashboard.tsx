import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Currency, Star, Settings, PlusCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTitle } from '../../hooks/useTitle'
import { getVenuesByOwner } from '../../api/venues'
import { getBookingsForVenueIds } from '../../api/bookings'
import { formatPrice, formatDate, formatTime } from '../../lib/utils'
import Badge, { type BadgeVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import type { Booking } from '../../types'

const statusVariant: Record<string, BadgeVariant> = {
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
}

const statusLabel: Record<string, string> = {
  confirmed: 'Tasdiqlangan',
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
}

interface BookingWithProfile extends Booking {
  profiles?: { full_name: string; phone?: string }
}

const BusinessDashboard = () => {
  useTitle('Biznes panel')
  const profile = useAuthStore(state => state.profile)

  const { data: venues = [] } = useQuery({
    queryKey: ['venues', 'owner', profile?.id],
    queryFn: () => getVenuesByOwner(profile!.id),
    enabled: !!profile,
  })

  const venueIds = useMemo(() => venues.map(v => v.id), [venues])

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', 'owner', ...venueIds],
    queryFn: () => getBookingsForVenueIds(venueIds),
    enabled: venueIds.length > 0,
  }) as { data: BookingWithProfile[] | undefined }

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const stats = useMemo(() => {
    const monthBookings = (bookings || []).filter(b => {
      if (!b.slots?.date) return false
      const d = new Date(b.slots.date + 'T00:00:00')
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    const confirmed = monthBookings.filter(b => b.status === 'confirmed')
    const revenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0)
    return { monthBookingsCount: monthBookings.length, revenue, avgRating: 0 }
  }, [bookings, thisMonth, thisYear])

  const upcomingBookings = useMemo(() =>
    (bookings || [])
      .filter(b => b.status === 'confirmed' && b.slots?.date)
      .sort((a, b) => (a.slots?.date || '').localeCompare(b.slots?.date || '')),
    [bookings]
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biznes panel</h1>
          <p className="text-sm text-gray-500 mt-1">{profile?.full_name} uchun xush kelibsiz</p>
        </div>
        <Link to="/business/venue/new">
          <Button><PlusCircle className="w-4 h-4" /> Yangi venue</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <CalendarDays className="w-5 h-5 text-emerald-600" />, label: 'Bu oy bronlar', value: stats.monthBookingsCount.toString(), bg: 'bg-emerald-50' },
          { icon: <Currency className="w-5 h-5 text-blue-600" />, label: 'Daromad (bu oy)', value: formatPrice(stats.revenue), bg: 'bg-blue-50' },
          { icon: <Star className="w-5 h-5 text-yellow-500" />, label: "O'rtacha reyting", value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', bg: 'bg-yellow-50' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-gray-100`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">{card.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/business/venue/new" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-emerald-300 transition-colors">
          <PlusCircle className="w-4 h-4 text-emerald-600" /> Yangi venue qo'shish
        </Link>
        {venues.length > 0 && (
          <Link to={`/business/venue/${venues[0].id}/availability`} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-emerald-300 transition-colors">
            <Settings className="w-4 h-4 text-emerald-600" /> Vaqtlarni boshqarish
          </Link>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue larim ({venues.length})</h2>
        {venues.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <span className="text-4xl">🏢</span>
            <p className="text-gray-500 mt-2">Hali venue qo'shilmagan</p>
            <Link to="/business/venue/new" className="text-sm text-emerald-600 hover:underline mt-1 inline-block">Birinchi venue ni qo'shish</Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {venues.map(v => (
              <Link key={v.id} to={`/business/venue/${v.id}/availability`} className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">{v.categories?.icon || '🏢'}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.city} · {v.categories?.name_uz || 'Boshqa'} · {formatPrice(v.price_per_slot)}/soat</p>
                  </div>
                </div>
                <Badge variant={v.status === 'active' ? 'success' : v.status === 'pending' ? 'warning' : 'danger'}>
                  {v.status === 'active' ? 'Faol' : v.status === 'pending' ? 'Kutilmoqda' : 'Rad etilgan'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kelgusi bronlar ({upcomingBookings.length})</h2>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <span className="text-4xl">📅</span>
            <p className="text-gray-500 mt-2">Hali bronlar yo'q</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs">
                    <th className="text-left py-3 px-4 font-medium">Foydalanuvchi</th>
                    <th className="text-left py-3 px-4 font-medium">Venue</th>
                    <th className="text-left py-3 px-4 font-medium">Sana</th>
                    <th className="text-left py-3 px-4 font-medium">Vaqt</th>
                    <th className="text-left py-3 px-4 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map(b => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">{(b as BookingWithProfile).profiles?.full_name || '—'}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{b.venues?.name || '—'}</td>
                      <td className="py-3 px-4">{formatDate(b.slots?.date || '')}</td>
                      <td className="py-3 px-4">{formatTime(b.slots?.start_time || '')}</td>
                      <td className="py-3 px-4"><Badge variant={statusVariant[b.status] || 'default'}>{statusLabel[b.status] || b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessDashboard
