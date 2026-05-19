import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSlotsByVenueAndDate } from '../../api/slots'
import type { Slot } from '../../types'

interface SlotPickerProps {
  venueId: string
  selectedSlot: string | null
  onSelect: (slot: Slot) => void
}

const SlotPicker = ({ venueId, selectedSlot, onSelect }: SlotPickerProps) => {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0])

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

  const dayNames = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan']

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const dayName = dayNames[d.getDay()]
    const dayNum = d.getDate()
    const isToday = dateStr === today.toISOString().split('T')[0]
    return { dayName, dayNum, isToday }
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {dates.map(dateStr => {
          const { dayName, dayNum, isToday } = formatDisplay(dateStr)
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
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
          Bu sana uchun vaqtlar mavjud emas
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map(slot => (
            <button
              key={slot.id}
              onClick={() => slot.is_available && onSelect(slot)}
              disabled={!slot.is_available}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                selectedSlot === slot.id
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                  : slot.is_available
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50'
                  : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
              }`}
            >
              {slot.start_time.slice(0, 5)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SlotPicker
