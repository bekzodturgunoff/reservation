import uz from '@/locales/uz.json'
import ru from '@/locales/ru.json'
import en from '@/locales/en.json'

type TranslationParams = Record<string, string | number>

const localeMap: Record<string, typeof uz> = { uz, ru, en }
const defaultLocale = uz

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return key in params ? String(params[key]) : `{{${key}}}`
  })
}

export function createServerT(locale: string) {
  const translations = localeMap[locale] ?? defaultLocale

  return function t(key: string, params?: TranslationParams): string {
    const value = getNestedValue(translations as Record<string, unknown>, key)
    if (value === undefined) {
      const fallback = getNestedValue(defaultLocale as Record<string, unknown>, key)
      if (fallback === undefined) {
        return key
      }
      return params ? interpolate(fallback, params) : fallback
    }
    return params ? interpolate(value, params) : value
  }
}
