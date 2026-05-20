import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getSlotsByVenueAndDate } from '../../api/slots'
import { joinWaitlist } from '../../api/waitlist'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import type { Slot } from '../../types'

interface SlotPickerProps {
  venueId: string
  selectedSlot: string | null
  onSelect: (slot: Slot) => void
}

const SlotPicker = ({ venueId, selectedSlot, onSelect }: SlotPickerProps) => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { addToast } = useToastStore()
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0])
  const [waitlistLoading, setWaitlistLoading] = useState<string | null>(null)

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', venueId, selectedDate],
    queryFn: () => getSlotsByVenueAndDate(venueId, selectedDate),
    enabled: !!venueId && !!selectedDate,
  })

  const dates: string[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }

  const dayNames = t('common.days.short', { returnObjects: true }) as string[]

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const dayName = dayNames[d.getDay()]
    const dayNum = d.getDate()
    const isToday = dateStr === today.toISOString().split('T')[0]
    return { dayName, dayNum, isToday }
  }

  const handleJoinWaitlist = async (slot: Slot) => {
    if (!user) {
      addToast({ type: 'info', message: 'Please log in to join waitlist' })
      return
    }
    setWaitlistLoading(slot.id)
    try {
      await joinWaitlist({
        venue_id: venueId,
        slot_time: `${slot.date}T${slot.start_time}`,
      })
      addToast({ type: 'success', message: 'Joined waitlist! We\'ll notify you if a slot opens.' })
    } catch {
      addToast({ type: 'error', message: 'Failed to join waitlist' })
    }
    setWaitlistLoading(null)
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {dates.map(dateStr => {
          const { dayName, dayNum, isToday } = formatDisplay(dateStr)
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isToday
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-xs opacity-75">{dayName}</span>
              <span className="text-lg font-bold">{dayNum}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          {t('venue.noSlotsForDate')}
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map(slot => (
            <div key={slot.id} className="relative">
              <button
                onClick={() => slot.is_available && onSelect(slot)}
                disabled={!slot.is_available}
                className={`w-full rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                  selectedSlot === slot.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                    : slot.is_available
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50'
                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                }`}
              >
                {slot.start_time.slice(0, 5)}
              </button>
              {!slot.is_available && (
                <button
                  onClick={() => handleJoinWaitlist(slot)}
                  disabled={waitlistLoading === slot.id}
                  className="mt-1 w-full text-[10px] text-emerald-600 hover:text-emerald-700 font-medium py-0.5 rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-50"
                >
                  {waitlistLoading === slot.id ? '...' : 'Join Waitlist'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SlotPicker
