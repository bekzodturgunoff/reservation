import type { Slot } from '../../types'

interface SlotPickerProps {
  slots: Slot[]
  selectedSlot: string | null
  onSelect: (slotId: string) => void
}

const SlotPicker = ({ slots, selectedSlot, onSelect }: SlotPickerProps) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          onClick={() => slot.is_available && onSelect(slot.id)}
          disabled={!slot.is_available}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            selectedSlot === slot.id
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : slot.is_available
              ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-400'
              : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
        >
          {slot.start_time.slice(0, 5)}
        </button>
      ))}
    </div>
  )
}

export default SlotPicker
