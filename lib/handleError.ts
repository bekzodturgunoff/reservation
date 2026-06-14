export const handleError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') return error.message
    if ('error' in error && typeof error.error === 'string') return error.error
  }
  return 'Nimadir xato ketdi. Iltimos qayta urinib ko\'ring.'
}
