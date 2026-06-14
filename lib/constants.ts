export const UZBEKISTAN_REGIONS: Record<string, string[]> = {
  'Toshkent shahri': ['Toshkent'],
  'Toshkent viloyati': ['Nurafshon', 'Olmaliq', 'Angren', 'Bekobod', 'Bo\'ka', 'G\'azalkent', 'Guliston', 'Quyichirchiq', 'Parkent', 'Piskent', 'O\'rtachirchiq', 'Chinoz', 'Yangiyo\'l'],
  'Samarqand': ['Samarqand', 'Kattaqo\'rg\'on', 'Guliston', 'Urgut', 'Ishtixon', 'Nurobod', 'Oqdaryo', 'Paxtakor', 'Jomboy', 'Narpay'],
  'Buxoro': ['Buxoro', 'Kogon', 'G\'ijduvon', 'Karakul', 'Vobkent', 'Romitan', 'Peshku', 'Jondor'],
  'Farg\'ona': ['Farg\'ona', 'Qo\'qon', 'Marg\'ilon', 'Beshariq', 'Quvasoy', 'Rishton', 'Oltiariq', 'Dangara', 'Furqat', 'So\'x'],
  'Namangan': ['Namangan', 'Chust', 'Pop', 'Mingbuloq', 'To\'raqo\'rg\'on', 'Uchqo\'rg\'on', 'Chortoq', 'Kosonsoy'],
  'Andijon': ['Andijon', 'Xonobod', 'Asaka', 'Xo\'jaobod', 'Baliqchi', 'Bo\'z', 'Jalaquduq', 'Izboskan', 'Qo\'rg\'ontepa', 'Marhamat', 'Oltinko\'l'],
  'Qashqadaryo': ['Qarshi', 'Shahrisabz', 'Kitob', 'Chiroqchi', 'Kasbi', 'Yakkabog\'', 'Mirishkor', 'Nishon', 'G\'uzor', 'Qamashi', 'Dehqonobod'],
  'Surxondaryo': ['Termiz', 'Denov', 'Boysun', 'Sherobod', 'Muzrabot', 'Angor', 'Oltinsoy', 'Sariosiyo', 'Qumqo\'rg\'on', 'Sho\'rchi', 'Jarqo\'rg\'on'],
  'Navoiy': ['Navoiy', 'Zarafshon', 'Nurota', 'Karmana', 'Qiziltepa', 'Xatirchi', 'Uchquduq'],
  'Jizzax': ['Jizzax', 'Do\'stlik', 'Gagarin', 'Zomin', 'Mirzacho\'l', 'Paxtakor', 'Baxmal', 'Arnasoy', 'Forish', 'Sharof Rashidov'],
  'Xorazm': ['Urganch', 'Xiva', 'Bog\'ot', 'Gurlan', 'Qo\'shko\'pir', 'Shovot', 'Yangibozor', 'Hazorasp', 'Tuproqqal\'a'],
  'Qoraqalpog\'iston': ['Nukus', 'Mo\'ynoq', 'Bo\'ston', 'To\'rtko\'l', 'Beruniy', 'Chimboy', 'Qo\'ng\'irot', 'Taxiatosh', 'Shumanay', 'Qonliko\'l'],
}

export const VENUE_CATEGORIES = [
  { slug: 'cafe', icon: '☕', name_uz: 'Kafe', name_ru: 'Кафе' },
  { slug: 'restaurant', icon: '🍽️', name_uz: 'Restoran', name_ru: 'Ресторан' },
  { slug: 'football', icon: '⚽', name_uz: 'Futbol', name_ru: 'Футбол' },
  { slug: 'sport', icon: '🏋️', name_uz: 'Sport', name_ru: 'Спорт' },
  { slug: 'karaoke', icon: '🎤', name_uz: 'Karaoke', name_ru: 'Караоке' },
  { slug: 'coworking', icon: '💻', name_uz: 'Coworking', name_ru: 'Коворкинг' },
  { slug: 'banquet', icon: '🎂', name_uz: 'Ziyofat', name_ru: 'Банкет' },
  { slug: 'swimming', icon: '🏊', name_uz: 'Basseyn', name_ru: 'Бассейн' },
  { slug: 'gaming', icon: '🎮', name_uz: "O'yin Klubi", name_ru: 'Игровой клуб' },
]

export const BOOKING_STATUS: Record<string, { label_uz: string; label_ru: string; color: string }> = {
  confirmed: { label_uz: 'Tasdiqlangan', label_ru: 'Подтверждено', color: 'bg-success-bg text-[#065F46]' },
  pending: { label_uz: 'Kutilmoqda', label_ru: 'В ожидании', color: 'bg-warning-bg text-[#92400E]' },
  cancelled: { label_uz: 'Bekor qilingan', label_ru: 'Отменено', color: 'bg-error-bg text-[#991B1B]' },
  completed: { label_uz: 'Yakunlangan', label_ru: 'Завершено', color: 'bg-info-bg text-[#1E40AF]' },
}
