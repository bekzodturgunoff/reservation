import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}
