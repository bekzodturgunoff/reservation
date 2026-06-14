export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'Fayl hajmi 5MB dan oshmasligi kerak'
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Faqat JPG, PNG yoki WebP ruxsat etiladi'
  return null
}
