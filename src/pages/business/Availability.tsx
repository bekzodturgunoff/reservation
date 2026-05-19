import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import { getVenuesByOwner } from '../../api/venues'
import { getSlotsByVenueAndDate, createSlots, updateSlotAvailability } from '../../api/slots'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { useTitle } from '../../hooks/useTitle'
import { formatDate } from '../../lib/utils'
import { generateTimeSlots } from '../../lib/utils'
import Button from '../../components/ui/Button'
import type { Slot } from '../../types'

const WEEKDAYS = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan']
const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

const Availability = () => {
  const { id } = useParams<{ id: string }>()
  const profile = useAuthStore(state => state.profile)
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  useTitle('Vaqtlarni boshqarish')

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return d.getMonth()
  })
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(22)
  const [duration, setDuration] = useState(60)
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  const { data: venues = [] } = useQuery({
    queryKey: ['venues', 'owner', profile?.id],
    queryFn: () => getVenuesByOwner(profile!.id),
    enabled: !!profile,
  })

  const venue = useMemo(() => {
    if (id) return venues.find(v => v.id === id)
    return venues[0]
  }, [venues, id])

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', venue?.id, selectedDate],
    queryFn: () => getSlotsByVenueAndDate(venue!.id, selectedDate!),
    enabled: !!venue && !!selectedDate,
  })

  const createSlotsMutation = useMutation({
    mutationFn: () => {
      if (!venue) throw new Error('No venue')
      const timeSlots = generateTimeSlots(startHour, endHour, duration)
      const slotInserts = timeSlots.map(ts => ({
        venue_id: venue.id,
        date: selectedDate!,
        start_time: ts.start,
        end_time: ts.end,
        is_available: true,
      }))
      return createSlots(slotInserts)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      addToast({ type: 'success', message: 'Vaqtlar yaratildi' })
    },
    onError: () => addToast({ type: 'error', message: 'Xatolik yuz berdi' }),
  })

  const toggleSlotMutation = useMutation({
    mutationFn: ({ slotId, current }: { slotId: string; current: boolean }) =>
      updateSlotAvailability(slotId, !current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })

  const generateRangeMutation = useMutation({
    mutationFn: async () => {
      if (!venue || !rangeStart || !rangeEnd) throw new Error('Missing dates')
      const timeSlots = generateTimeSlots(startHour, endHour, duration)
      const start = new Date(rangeStart + 'T00:00:00')
      const end = new Date(rangeEnd + 'T00:00:00')
      const slotInserts: Partial<Slot>[] = []

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        timeSlots.forEach(ts => {
          slotInserts.push({
            venue_id: venue.id,
            date: dateStr,
            start_time: ts.start,
            end_time: ts.end,
            is_available: true,
          })
        })
      }
      return createSlots(slotInserts)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      addToast({ type: 'success', message: 'Barcha vaqtlar yaratildi' })
    },
    onError: () => addToast({ type: 'error', message: 'Xatolik yuz berdi' }),
  })

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [currentMonth, currentYear, daysInMonth, firstDayOfWeek])

  const isToday = (day: number) => {
    const d = new Date()
    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }

  const isSelected = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === selectedDate
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
  }

  if (!venue) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl">🏢</span>
        <p className="text-gray-500 mt-3 mb-4">Venue topilmadi</p>
        <Link to="/business/dashboard"><Button>Panelga qaytish</Button></Link>
      </div>
    )
  }

  const hasSlots = slots.length > 0
  const availableSlots = slots.filter(s => s.is_available)
  const takenSlots = slots.filter(s => !s.is_available)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vaqtlarni boshqarish</h1>
        <p className="text-sm text-gray-500 mt-1">{venue.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</span>
            <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
            {WEEKDAYS.map(d => <div key={d} className="py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div key={i} className="aspect-square">
                {day && (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${
                      isSelected(day) ? 'bg-emerald-600 text-white' :
                      isToday(day) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                {formatDate(selectedDate)} uchun vaqtlar
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-12">Boshlash:</label>
                  <select value={startHour} onChange={e => setStartHour(Number(e.target.value))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                    {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-12">Tugash:</label>
                  <select value={endHour} onChange={e => setEndHour(Number(e.target.value))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                    {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-12">Davom:</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                    <option value={30}>30 daqiqa</option>
                    <option value={60}>1 soat</option>
                    <option value={90}>1.5 soat</option>
                    <option value={120}>2 soat</option>
                  </select>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={() => createSlotsMutation.mutate()}
                loading={createSlotsMutation.isPending}
                disabled={hasSlots}
              >
                <Plus className="w-4 h-4" /> {hasSlots ? 'Vaqtlar mavjud' : 'Vaqtlarni yaratish'}
              </Button>
            </div>
          )}
        </div>

        {/* Slots for selected date */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedDate ? formatDate(selectedDate) : 'Sana tanlang'}
          </h3>

          {!selectedDate ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Kalendardan sanani tanlang
            </p>
          ) : slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Vaqtlar yaratilmagan</p>
              <p className="text-xs text-gray-300 mt-1">Yuqoridagi forma orqali yarating</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-green-600 mb-2">Bo'sh ({availableSlots.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSlotMutation.mutate({ slotId: s.id, current: true })}
                      className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      {s.start_time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
              {takenSlots.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-2">Band ({takenSlots.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {takenSlots.map(s => (
                      <button
                        key={s.id}
                        disabled
                        className="border border-gray-200 bg-gray-50 text-gray-300 rounded-lg px-3 py-2 text-sm line-through cursor-not-allowed"
                      >
                        {s.start_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk creation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Ommaviy yaratish</h3>
        <p className="text-xs text-gray-500 mb-4">
          Bir necha kun uchun bir xil vaqtlarni yaratish
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Boshlanish</label>
            <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tugash</label>
            <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <Button
            size="sm"
            onClick={() => generateRangeMutation.mutate()}
            loading={generateRangeMutation.isPending}
            disabled={!rangeStart || !rangeEnd}
          >
            <Plus className="w-4 h-4" /> Yarating
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Availability
