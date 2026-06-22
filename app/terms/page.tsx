import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerT } from '@/lib/i18n/server'

export async function generateMetadata() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)
  return {
    title: t('footer.terms'),
    description: t('footer.description'),
    openGraph: {
      title: `${t('footer.terms')} — BronUz`,
      description: t('footer.description'),
    },
    robots: { index: true, follow: true },
  }
}

export default async function TermsPage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="text-sm text-brand hover:underline mb-8 inline-block">&larr; {t('common.home')}</Link>
      <h1 className="font-display text-3xl font-bold text-ink mb-8">{t('footer.terms')}</h1>

      <div className="prose prose-sm max-w-none text-ink-secondary space-y-6">
        <p><strong>Oxirgi yangilanish:</strong> 14-iyun, 2025</p>

        <h2 className="text-xl font-semibold text-ink mt-8">1. Platforma haqida</h2>
        <p>BronUz — joylarni onlayn bron qilish platformasi. Platforma orqali foydalanuvchilar kafe, restoran, sport maydonchalari va boshqa joylarni bron qilishlari mumkin.</p>

        <h2 className="text-xl font-semibold text-ink mt-8">2. Foydalanuvchi majburiyatlari</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ro'yxatdan o'tishda to'g'ri ma'lumotlarni taqdim etish</li>
          <li>Hisob ma'lumotlarini maxfiy saqlash</li>
          <li>Bron qilish vaqtiga rioya qilish</li>
          <li>Platformadan noqonuniy maqsadlarda foydalanmaslik</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">3. Bron qilish va bekor qilish</h2>
        <p>Bron qilish quyidagi shartlar asosida amalga oshiriladi:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Bron qilish tasdiqlangandan so'ng, mijoz va joy egasi o'rtasida shartnoma tuzilgan hisoblanadi</li>
          <li>Bronni bekor qilish muddati joy egasi tomonidan belgilanadi</li>
          <li>Bekor qilish siyosati har bir joy uchun alohida ko'rsatilgan</li>
          <li>Platforma bron qilish jarayonida vositachi hisoblanadi</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">4. Joy egalari uchun</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Joy egasi o'z joyi haqidagi ma'lumotlarning to'g'riligiga javobgardir</li>
          <li>Joy egasi bron qilishni tasdiqlash yoki rad etish huquqiga ega</li>
          <li>Joy egasi platforma komissiyasini (8%) to'laydi</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">5. Hisobni bloklash</h2>
        <p>Platforma quyidagi hollarda hisobni bloklash huquqiga ega:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Soxta ma'lumotlarni taqdim etish</li>
          <li>Platforma qoidalarini buzish</li>
          <li>Boshqa foydalanuvchilarga zarar yetkazish</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">6. Kafolatlar</h2>
        <p>Platforma xizmatlarni &ldquo;mavjud holatda&rdquo; taqdim etadi. Platforma ishlamay qolgan holatlar uchun javobgar emas.</p>

        <h2 className="text-xl font-semibold text-ink mt-8">7. Nizolarni hal qilish</h2>
        <p>Yuzaga kelgan nizolar O'zbekiston Respublikasi qonunchiligi asosida hal qilinadi.</p>
      </div>
    </div>
  )
}
