export function formatPrice(amount: number, locale = 'uz-UZ'): string {
  return `${new Intl.NumberFormat(locale).format(amount)} UZS`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  return time.substring(0, 5)
}

export function formatDuration(startTime: string, endTime: string): string {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const totalMinutes = ((endH ?? 0) * 60 + (endM ?? 0)) - ((startH ?? 0) * 60 + (startM ?? 0))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours} soat`
  return `${hours} soat ${minutes} daqiqa`
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Hozir'
  if (diffMins < 60) return `${diffMins} daqiqa oldin`
  if (diffHours < 24) return `${diffHours} soat oldin`
  if (diffDays < 7) return `${diffDays} kun oldin`
  return formatDate(date)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim()
}

export function generateTimeSlots(
  startHour: number,
  endHour: number,
  durationMinutes: number
): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = []
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
