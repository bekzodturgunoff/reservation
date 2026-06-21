'use client'

const DAYS = [
  { key: 'monday', label: 'Dushanba' },
  { key: 'tuesday', label: 'Seshanba' },
  { key: 'wednesday', label: 'Chorshanba' },
  { key: 'thursday', label: 'Payshanba' },
  { key: 'friday', label: 'Juma' },
  { key: 'saturday', label: 'Shanba' },
  { key: 'sunday', label: 'Yakshanba' },
] as const

export type WorkingHoursDay = {
  open: string
  close: string
  closed: boolean
}

export type WorkingHours = Record<string, WorkingHoursDay>

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '22:00', closed: false },
  saturday: { open: '09:00', close: '22:00', closed: false },
  sunday: { open: '09:00', close: '22:00', closed: false },
}

interface WorkingHoursEditorProps {
  value: WorkingHours
  onChange: (value: WorkingHours) => void
}

function WorkingHoursEditor({ value, onChange }: WorkingHoursEditorProps) {
  const updateDay = (key: string, field: keyof WorkingHoursDay, fieldValue: string | boolean) => {
    const current: WorkingHoursDay = value[key] || { open: '09:00', close: '22:00', closed: false }
    const updated: WorkingHoursDay = { ...current, [field]: fieldValue }
    onChange({ ...value, [key]: updated })
  }

  return (
    <div className="space-y-1">
      {DAYS.map((day) => {
        const dayData = value[day.key] || { open: '09:00', close: '22:00', closed: false }
        return (
          <div key={day.key} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
            <span className="w-28 text-sm font-medium text-ink shrink-0">{day.label}</span>
            <div className="flex items-center gap-2 flex-1">
              {dayData.closed ? (
                <span className="text-sm text-ink-tertiary italic">Yopiq</span>
              ) : (
                <>
                  <input
                    type="time"
                    value={dayData.open}
                    onChange={(e) => updateDay(day.key, 'open', e.target.value)}
                    className="w-28 px-2 py-1.5 text-sm bg-white border border-border rounded-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-shadow"
                  />
                  <span className="text-ink-tertiary text-xs">—</span>
                  <input
                    type="time"
                    value={dayData.close}
                    onChange={(e) => updateDay(day.key, 'close', e.target.value)}
                    className="w-28 px-2 py-1.5 text-sm bg-white border border-border rounded-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-shadow"
                  />
                </>
              )}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={dayData.closed}
                onChange={(e) => updateDay(day.key, 'closed', e.target.checked)}
                className="w-4 h-4 rounded border-border text-brand focus:ring-brand/40 transition-colors"
              />
              <span className="text-xs text-ink-tertiary">Yopiq</span>
            </label>
          </div>
        )
      })}
    </div>
  )
}

export { WorkingHoursEditor }
