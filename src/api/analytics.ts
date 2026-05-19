import type { Booking, DailyRevenue, BookingStatusBreakdown, VenueBookingStats, AnalyticsData } from '../types'

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#059669',
  completed: '#3b82f6',
  cancelled: '#ef4444',
}

export function computeAnalytics(
  bookings: Booking[],
  venueNames: Record<string, { name: string; icon: string }>
): AnalyticsData {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const thisMonthBookings = bookings.filter(b => {
    if (!b.slots?.date) return false
    const d = new Date(b.slots.date + 'T00:00:00')
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const lastMonthBookings = bookings.filter(b => {
    if (!b.slots?.date) return false
    const d = new Date(b.slots.date + 'T00:00:00')
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  const confirmedThisMonth = thisMonthBookings.filter(b => b.status === 'confirmed')
  const completedThisMonth = thisMonthBookings.filter(b => b.status === 'completed')
  const confirmedLastMonth = lastMonthBookings.filter(b => b.status === 'confirmed')
  const completedLastMonth = lastMonthBookings.filter(b => b.status === 'completed')

  const thisRevenue = [...confirmedThisMonth, ...completedThisMonth].reduce((s, b) => s + (b.total_price || 0), 0)
  const lastRevenue = [...confirmedLastMonth, ...completedLastMonth].reduce((s, b) => s + (b.total_price || 0), 0)
  const totalBookings = thisMonthBookings.length
  const lastTotalBookings = lastMonthBookings.length

  const revenueChange = lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue) * 100 : 0
  const bookingsChange = lastTotalBookings > 0 ? ((totalBookings - lastTotalBookings) / lastTotalBookings) * 100 : 0

  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
  const dailyRevenue: DailyRevenue[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayBookings = thisMonthBookings.filter(b => b.slots?.date === dateStr)
    const confirmed = dayBookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
    dailyRevenue.push({
      date: String(d),
      revenue: confirmed.reduce((s, b) => s + (b.total_price || 0), 0),
      bookings: dayBookings.length,
    })
  }

  const statusBreakdown: BookingStatusBreakdown[] = ['confirmed', 'completed', 'cancelled'].map(status => ({
    name: status,
    value: thisMonthBookings.filter(b => b.status === status).length,
    color: STATUS_COLORS[status],
  }))

  const venueMap = new Map<string, { bookings: number; revenue: number }>()
  thisMonthBookings.forEach(b => {
    const vId = b.venue_id
    if (!venueMap.has(vId)) venueMap.set(vId, { bookings: 0, revenue: 0 })
    const entry = venueMap.get(vId)!
    entry.bookings++
    if (b.status === 'confirmed' || b.status === 'completed') {
      entry.revenue += b.total_price || 0
    }
  })

  const venueStats: VenueBookingStats[] = Array.from(venueMap.entries()).map(([venueId, stats]) => {
    const meta = venueNames[venueId] || { name: 'Unknown', icon: '🏢' }
    return {
      venueId,
      venueName: meta.name,
      icon: meta.icon,
      bookings: stats.bookings,
      revenue: stats.revenue,
    }
  }).sort((a, b) => b.bookings - a.bookings)

  return {
    dailyRevenue,
    statusBreakdown,
    venueStats,
    totalRevenue: thisRevenue,
    totalBookings,
    avgRating: 0,
    revenueChange,
    bookingsChange,
  }
}
