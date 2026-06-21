/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Maxfiylik siyosati',
  description: 'BronUz platformasida shaxsiy ma\'lumotlarni qayta ishlash va himoya qilish siyosati bilan tanishing.',
  openGraph: {
    title: 'Maxfiylik siyosati — BronUz',
    description: 'BronUz platformasida shaxsiy ma\'lumotlarni qayta ishlash va himoya qilish siyosati.',
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="text-sm text-brand hover:underline mb-8 inline-block">&larr; Bosh sahifaga</Link>
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Maxfiylik siyosati</h1>

      <div className="prose prose-sm max-w-none text-ink-secondary space-y-6">
        <p><strong>Oxirgi yangilanish:</strong> 14-iyun, 2025</p>

        <h2 className="text-xl font-semibold text-ink mt-8">1. Biz qanday ma'lumotlarni yig'amiz</h2>
        <p>BronUz platformasidan foydalanish jarayonida quyidagi ma'lumotlarni yig'amiz:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ism va familiya</li>
          <li>Email manzil</li>
          <li>Telefon raqam</li>
          <li>Bron qilish tarixi</li>
          <li>Joy haqidagi sharhlar va baholar</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">2. Ma'lumotlardan foydalanish</h2>
        <p>Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Bron qilish xizmatini taqdim etish</li>
          <li>Hisobingizni boshqarish</li>
          <li>Xizmat sifatini yaxshilash</li>
          <li>Yangi funksiyalar haqida xabardor qilish</li>
          <li>To'lovlarni amalga oshirish</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">3. Ma'lumotlarni saqlash</h2>
        <p>Ma'lumotlaringiz AWS serverlarida joylashgan Supabase platformasida shifrlangan holda saqlanadi. Ma'lumotlaringiz uchinchi shaxslarga sotilmaydi yoki berilmaydi.</p>

        <h2 className="text-xl font-semibold text-ink mt-8">4. Huquqlaringiz</h2>
        <p>Siz istalgan vaqtda:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ma'lumotlaringizni ko'rish va tahrirlash</li>
          <li>Hisobingizni o'chirish</li>
          <li>Ma'lumotlaringizni eksport qilish</li>
          <li>Xabarnomalarni boshqarish</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-8">5. Cookie fayllari</h2>
        <p>Platformamiz faqat autentifikatsiya va xavfsizlik uchun zarur bo'lgan cookie fayllaridan foydalanadi. Analytics cookie fayllari sizning roziligingiz bilan o'rnatiladi.</p>

        <h2 className="text-xl font-semibold text-ink mt-8">6. Bog'lanish</h2>
        <p>Maxfiylik haqidagi savollar uchun: <span className="text-ink">info@bronuz.uz</span></p>
      </div>
    </div>
  )
}
