export function getErrorMessage(error: unknown): string {
  if (!error) return 'Noma\'lum xato yuz berdi'

  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('Invalid login credentials')) return 'Email yoki parol noto\'g\'ri'
  if (message.includes('Email not confirmed')) return 'Email manzilingizni tasdiqlang'
  if (message.includes('User already registered')) return 'Bu email allaqachon ro\'yxatdan o\'tgan'
  if (message.includes('Password should be at least')) return 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'
  if (message.includes('rate limit')) return 'Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring'
  if (message.includes('otp token expired')) return 'Tasdiqlash kodi muddati tugagan. Qayta yuboring'

  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Network request failed')) {
    return 'Internet aloqasi yo\'q. Ulanishingizni tekshiring'
  }

  if (message.includes('duplicate key') || message.includes('already exists')) return 'Bu ma\'lumot allaqachon mavjud'
  if (message.includes('violates foreign key')) return 'Bog\'liq ma\'lumot topilmadi'
  if (message.includes('row-level security') || message.includes('permission denied')) return 'Ruxsat yo\'q'
  if (message.includes('could not find')) return 'Ma\'lumot topilmadi'
  if (message.includes('null value in column')) return 'Majburiy maydon to\'ldirilmagan'
  if (message.includes('violates check constraint')) return 'Ma\'lumot noto\'g\'ri formatda'

  if (message.includes('Bu vaqt allaqachon band')) return message
  if (message.includes('o\'tish mumkin emas')) return message
  if (message.includes('bekor qilish mumkin')) return message

  return 'Xato yuz berdi. Qayta urinib ko\'ring'
}
