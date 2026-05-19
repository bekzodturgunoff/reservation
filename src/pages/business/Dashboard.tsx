import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDaysIcon, CurrencyDollarIcon, StarIcon, Cog6ToothIcon, PlusCircleIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useTitle } from '../../hooks/useTitle'
import { useToastStore } from '../../store/toastStore'
import { getVenuesByOwner } from '../../api/venues'
import { getBookingsForVenueIds } from '../../api/bookings'
import { getTelegramLinks, deleteTelegramLink, generateLinkCode } from '../../api/telegram'
import { formatPrice, formatDate, formatTime } from '../../lib/utils'
import Badge, { type BadgeVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import type { Booking } from '../../types'
import { useTranslation } from 'react-i18next'

const statusVariant: Record<string, BadgeVariant> = {
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
}

interface BookingWithProfile extends Booking {
  profiles?: { full_name: string; phone?: string }
}

const BusinessDashboard = () => {
  const { t } = useTranslation()
  useTitle(t('business.dashboard'))
  const profile = useAuthStore(state => state.profile)
  const user = useAuthStore(state => state.user)
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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

  const { data: telegramLinks = [] } = useQuery({
    queryKey: ['telegram-links', profile?.id],
    queryFn: () => getTelegramLinks(profile!.id),
    enabled: !!profile,
  })

  const deleteLinkMutation = useMutation({
    mutationFn: deleteTelegramLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-links'] })
      addToast({ type: 'success', message: t('common.success') })
    },
  })

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const statusLabel: Record<string, string> = {
    confirmed: t('common.confirmed'),
    completed: t('common.completed'),
    cancelled: t('common.cancelled'),
  }

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

  const linkedVenueIds = useMemo(() => new Set(telegramLinks.map(l => l.venue_id)), [telegramLinks])

  const handleCopyCode = (venueId: string) => {
    if (!user) return
    const code = generateLinkCode(venueId, user.id)
    navigator.clipboard.writeText(code)
    setCopiedCode(venueId)
    setTimeout(() => setCopiedCode(null), 3000)
    addToast({ type: 'info', message: t('common.success') })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('business.dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1">{profile?.full_name} {t('business.welcome')}</p>
        </div>
        <Link to="/business/venue/new">
          <Button><PlusCircleIcon className="w-4 h-4" /> {t('business.addVenue')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />, label: t('business.statsBookings'), value: stats.monthBookingsCount.toString(), bg: 'bg-emerald-50' },
          { icon: <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />, label: t('business.statsRevenue'), value: formatPrice(stats.revenue), bg: 'bg-blue-50' },
          { icon: <StarIcon className="w-5 h-5 text-yellow-500" />, label: t('business.statsRating'), value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', bg: 'bg-yellow-50' },
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
          <PlusCircleIcon className="w-4 h-4 text-emerald-600" /> {t('business.addVenueLink')}
        </Link>
        {venues.length > 0 && (
          <Link to={`/business/venue/${venues[0].id}/availability`} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-emerald-300 transition-colors">
            <Cog6ToothIcon className="w-4 h-4 text-emerald-600" /> {t('business.manageSlots')}
          </Link>
        )}
      </div>

      {/* Telegram Connect */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PaperAirplaneIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">{t('telegram.connect')}</h2>
          {telegramLinks.length > 0 && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {t('telegram.connected')}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">{t('telegram.connectDesc')}</p>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
          <p className="text-sm text-blue-800">
            {t('telegram.instructions')}
          </p>
        </div>

        {venues.length === 0 ? (
          <p className="text-sm text-gray-400">{t('business.emptyVenues')}</p>
        ) : (
          <div className="space-y-3">
            {venues.map(v => {
              const isLinked = linkedVenueIds.has(v.id)
              const code = generateLinkCode(v.id, user?.id || '')
              return (
                <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{v.categories?.icon || '🏢'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-500">
                        {isLinked
                          ? t('telegram.notificationsOn')
                          : t('telegram.noVenuesLinked')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLinked ? (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteLinkMutation.isPending}
                        onClick={() => {
                          const link = telegramLinks.find(l => l.venue_id === v.id)
                          if (link) deleteLinkMutation.mutate(link.id)
                        }}
                      >
                        <TrashIcon className="w-3.5 h-3.5" /> {t('telegram.disconnect')}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleCopyCode(v.id)}>
                          {copiedCode === v.id ? '✅' : t('telegram.linkVenue')}
                        </Button>
                        {copiedCode === v.id && (
                          <span className="text-xs text-emerald-600 font-medium">
                            {code}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('business.myVenues')} ({venues.length})</h2>
        {venues.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <span className="text-4xl">🏢</span>
            <p className="text-gray-500 mt-2">{t('business.emptyVenues')}</p>
            <Link to="/business/venue/new" className="text-sm text-emerald-600 hover:underline mt-1 inline-block">{t('business.addFirstVenue')}</Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {venues.map(v => (
              <Link key={v.id} to={`/business/venue/${v.id}/availability`} className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">{v.categories?.icon || '🏢'}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.city} · {v.categories?.name_uz || t('common.other')} · {formatPrice(v.price_per_slot)}{t('common.perHour')}</p>
                  </div>
                </div>
                <Badge variant={v.status === 'active' ? 'success' : v.status === 'pending' ? 'warning' : 'danger'}>
                  {v.status === 'active' ? t('common.active') : v.status === 'pending' ? t('common.pending') : t('common.rejected')}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('business.upcomingBookings')} ({upcomingBookings.length})</h2>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <span className="text-4xl">📅</span>
            <p className="text-gray-500 mt-2">{t('business.emptyBookings')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs">
                    <th className="text-left py-3 px-4 font-medium">{t('business.user')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('business.venue')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('common.date')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('common.time')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('common.status')}</th>
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
