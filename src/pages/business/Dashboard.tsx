import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDaysIcon, CurrencyDollarIcon, StarIcon, Cog6ToothIcon, PlusCircleIcon, PaperAirplaneIcon, TrashIcon, ChartBarSquareIcon, TagIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useTitle } from '../../hooks/useTitle'
import { useToastStore } from '../../store/toastStore'
import { getVenuesByOwner, deleteVenue } from '../../api/venues'
import { getBookingsForVenueIds } from '../../api/bookings'
import { getTelegramLinks, deleteTelegramLink, generateUserLinkCode } from '../../api/telegram'
import { getVenuePromoCodes, createPromoCode, deletePromoCode } from '../../api/promoCodes'
import { computeAnalytics } from '../../api/analytics'
import { formatPrice, formatDate, formatTime } from '../../lib/utils'
import Badge, { type BadgeVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import RevenueChart from '../../components/business/RevenueChart'
import BookingChart from '../../components/business/BookingChart'
import StatusPieChart from '../../components/business/StatusPieChart'
import VenueBarChart from '../../components/business/VenueBarChart'
import BusinessTips from '../../components/business/BusinessTips'
import type { Booking } from '../../types'
import { useTranslation } from 'react-i18next'

const statusVariant: Record<string, BadgeVariant> = {
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
}

const venueStatusConfig: Record<string, { label: string; description: string; color: string; icon: string }> = {
  pending: {
    label: 'Tekshirilmoqda',
    description: 'Admin ko\'rib chiqmoqda. Odatda 24 soat ichida.',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '⏳',
  },
  active: {
    label: 'Faol',
    description: 'Saytda ko\'rinmoqda. Mijozlar bron qila oladi.',
    color: 'bg-emerald-100 text-emerald-700',
    icon: '✅',
  },
  rejected: {
    label: 'Rad etildi',
    description: 'Admin tomonidan rad etildi. Tahrirlang va qayta yuboring.',
    color: 'bg-red-100 text-red-700',
    icon: '❌',
  },
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

  const deleteVenueMutation = useMutation({
    mutationFn: deleteVenue,
    onMutate: async (venueId) => {
      await queryClient.cancelQueries({ queryKey: ['venues', 'owner', profile?.id] })
      const previous = queryClient.getQueryData(['venues', 'owner', profile?.id])
      queryClient.setQueryData(['venues', 'owner', profile?.id], (old: any[]) =>
        old?.filter(v => v.id !== venueId) ?? []
      )
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['venues', 'owner', profile?.id], context.previous)
      }
      addToast({ type: 'error', message: t('common.error') })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['venues', 'owner', profile?.id] })
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

  const venueNameMap = useMemo(() => {
    const map: Record<string, { name: string; icon: string }> = {}
    venues.forEach(v => {
      map[v.id] = { name: v.name, icon: v.categories?.icon || '🏢' }
    })
    return map
  }, [venues])

  const analytics = useMemo(() =>
    computeAnalytics(bookings, venueNameMap),
    [bookings, venueNameMap]
  )

  const linkedVenueIds = useMemo(() => new Set(telegramLinks.map(l => l.venue_id)), [telegramLinks])

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

      {venues.length > 0 && venueIds.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ChartBarSquareIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('business.analytics.title')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueChart data={analytics.dailyRevenue} totalRevenue={analytics.totalRevenue} change={analytics.revenueChange} />
            <BookingChart data={analytics.dailyRevenue} totalBookings={analytics.totalBookings} change={analytics.bookingsChange} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <StatusPieChart data={analytics.statusBreakdown} />
            <VenueBarChart data={analytics.venueStats} />
          </div>
        </div>
      )}

      {venues.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-lg font-bold mb-1">Xush kelibsiz, biznes egasi! 👋</h2>
          <p className="text-emerald-100 text-sm mb-4">
            Birinchi joyingizni qo'shing va mijozlar bron qila boshlashsin.
            Qo'shilgan joy admin tomonidan tekshirilgach, saytda ko'rinadi.
          </p>
          <div className="flex gap-3">
            <Link
              to="/business/venue/new"
              className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              + Joy qo'shish
            </Link>
          </div>
          <div className="mt-4">
            <BusinessTips />
          </div>
        </div>
      )}

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
              {t('telegram.connected')} ({telegramLinks.length} {t('telegram.venues')})
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">{t('telegram.connectDesc')}</p>

        {venues.length === 0 ? (
          <p className="text-sm text-gray-400">{t('business.emptyVenues')}</p>
        ) : telegramLinks.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">{t('telegram.linkedVenues')}:</span>
              <Button
                variant="danger"
                size="sm"
                loading={deleteLinkMutation.isPending}
                onClick={() => {
                  if (window.confirm(t('telegram.disconnectAllConfirm'))) {
                    telegramLinks.forEach(l => deleteLinkMutation.mutate(l.id))
                  }
                }}
              >
                <TrashIcon className="w-3.5 h-3.5" /> {t('telegram.disconnectAll')}
              </Button>
            </div>
            <div className="space-y-2">
              {venues.filter(v => linkedVenueIds.has(v.id)).map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{v.categories?.icon || '🏢'}</span>
                    <p className="text-sm font-medium text-gray-900">{v.name}</p>
                  </div>
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
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">{t('telegram.autoLinkHint')}</p>
          </div>
        ) : (
          <div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
              <p className="text-sm text-blue-800">{t('telegram.instructions')}</p>
            </div>
            <a
              href={`https://t.me/bron_uzb_bot?start=${generateUserLinkCode(user?.id || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" /> {t('telegram.connectBot')}
            </a>
          </div>
        )}
      </div>

      {/* Promo Codes Manager */}
      {venues.length > 0 && (
        <PromoCodeManager venues={venues} />
      )}

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
              <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <Link to={`/business/venue/${v.id}/availability`} className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg shrink-0">{v.categories?.icon || '🏢'}</div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{v.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {v.city} · {v.categories?.name_uz || t('common.other')}
                        {v.services && v.services.length > 0
                          ? ` · ${v.services.slice(0, 2).map(s => formatPrice(s.price) + '/' + t('common.pricing_units.' + s.unit)).join(', ')}${v.services.length > 2 ? ' +' + (v.services.length - 2) : ''}`
                          : ` · ${formatPrice(v.price_per_slot)} ${t('common.pricing_units.' + (v.pricing_unit || 'per_hour'))}`}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${venueStatusConfig[v.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {venueStatusConfig[v.status]?.icon || '•'} {venueStatusConfig[v.status]?.label || v.status}
                    </span>
                    <Link
                      to={`/business/venue/${v.id}/edit`}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title={t('business.editVenue')}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(v.name + ' ' + t('business.deleteConfirm'))) {
                          deleteVenueMutation.mutate(v.id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title={t('business.deleteVenue')}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{venueStatusConfig[v.status]?.description}</p>
              </div>
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
            <div className="overflow-x-auto scrollbar-hide">
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

const PromoCodeManager = ({ venues }: { venues: { id: string; name: string; categories?: { icon?: string } }[] }) => {
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || '')
  const [newCode, setNewCode] = useState('')
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [newDiscountValue, setNewDiscountValue] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [showForm, setShowForm] = useState(false)

  const venueId = selectedVenueId

  const { data: promoCodes = [] } = useQuery({
    queryKey: ['promo', venueId],
    queryFn: () => getVenuePromoCodes(venueId),
    enabled: !!venueId,
  })

  const createMutation = useMutation({
    mutationFn: () => createPromoCode({
      venue_id: venueId,
      code: newCode.toUpperCase(),
      discount_type: newDiscountType,
      discount_value: Number(newDiscountValue),
      expires_at: newExpiry || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo', venueId] })
      setNewCode('')
      setNewDiscountValue('')
      setNewExpiry('')
      setShowForm(false)
      addToast({ type: 'success', message: 'Promo code created' })
    },
    onError: () => addToast({ type: 'error', message: 'Failed to create promo code' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo', venueId] })
      addToast({ type: 'success', message: 'Promo code deleted' })
    },
    onError: () => addToast({ type: 'error', message: 'Failed to delete' }),
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Promo Codes</h2>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <PlusCircleIcon className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add'}
        </Button>
      </div>

      {venues.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedVenueId}
            onChange={e => setSelectedVenueId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.categories?.icon || '🏢'} {v.name}</option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <div className="p-4 bg-gray-50 rounded-xl mb-4 space-y-3">
          <input
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            placeholder="Code (e.g. SUMMER20)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <select
              value={newDiscountType}
              onChange={e => setNewDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (UZS)</option>
            </select>
            <input
              type="number"
              value={newDiscountValue}
              onChange={e => setNewDiscountValue(e.target.value)}
              placeholder="Value"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input
            type="date"
            value={newExpiry}
            onChange={e => setNewExpiry(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
            disabled={!newCode || !newDiscountValue}
          >
            Create Promo Code
          </Button>
        </div>
      )}

      {promoCodes.length === 0 ? (
        <p className="text-sm text-gray-400">No promo codes yet</p>
      ) : (
        <div className="space-y-2">
          {promoCodes.map(pc => (
            <div key={pc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">{pc.code}</p>
                <p className="text-xs text-gray-500">
                  {pc.discount_type === 'percentage' ? `${pc.discount_value}% off` : `${formatPrice(pc.discount_value)} off`}
                  {pc.max_uses && ` · ${pc.used_count}/${pc.max_uses} used`}
                  {pc.expires_at && ` · Expires ${pc.expires_at.slice(0, 10)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${pc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {pc.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => deleteMutation.mutate(pc.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessDashboard
