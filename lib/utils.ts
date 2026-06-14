import { clsx, type ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]) => clsx(inputs.filter(Boolean))

export const formatPrice = (price: number, currency = 'UZS'): string => {
  if (currency === 'UZS') {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
  }
  return new Intl.NumberFormat().format(price) + ' ' + currency
}

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatTime = (timeStr: string): string => {
  return timeStr.slice(0, 5)
}

export const generateTimeSlots = (
  startHour: number,
  endHour: number,
  durationMinutes: number
): { start: string; end: string }[] => {
  const slots = []
  let current = startHour * 60
  const end = endHour * 60
  while (current + durationMinutes <= end) {
    const startH = Math.floor(current / 60).toString().padStart(2, '0')
    const startM = (current % 60).toString().padStart(2, '0')
    const endMin = current + durationMinutes
    const endH = Math.floor(endMin / 60).toString().padStart(2, '0')
    const endM = (endMin % 60).toString().padStart(2, '0')
    slots.push({ start: `${startH}:${startM}`, end: `${endH}:${endM}` })
    current += durationMinutes
  }
  return slots
}
