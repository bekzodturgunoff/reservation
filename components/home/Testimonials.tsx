'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: "BronUz orqali futbol maydonini bron qilish juda oson bo'ldi. Oldin doim qo'ng'iroq qilishga to'g'ri kelar edi, endi 2 daqiqada hal bo'ladi.",
    name: 'Sherzod Nazarov',
    location: 'Toshkent',
  },
  {
    quote: "Kafe ochganimda BronUzga qo'shilish eng to'g'ri qarorim bo'ldi. Birinchi haftada 12 ta bron oldim. Mijozlar juda mamnun.",
    name: 'Nilufar Yusupova',
    location: 'Samarqand',
  },
  {
    quote: "Restoranim uchun bronlarni boshqarish juda qulay. Avtomatik tasdiqlash va eslatmalar vaqtimni tejaydi. Hammaga tavsiya qilaman.",
    name: 'Jahongir Karimov',
    location: 'Namangan',
  },
]

const colors = [
  { bg: 'bg-brand-100', text: 'text-brand-700' },
  { bg: 'bg-status-info-bg', text: 'text-status-info' },
  { bg: 'bg-status-warning-bg', text: 'text-status-warning' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export function Testimonials() {
  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center">
          Ular allaqachon bron qilishdi
        </h2>
        <p className="mt-3 text-base text-ink-tertiary text-center flex items-center justify-center gap-2">
          <span className="text-yellow-400 text-lg">★★★★★</span>
          4.8/5 • 2,400 dan ortiq sharh asosida
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-card border border-line shadow-card p-7"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-ink-secondary leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="mt-5 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${colors[i].bg} flex items-center justify-center text-sm font-semibold ${colors[i].text}`}>
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-tertiary">{t.location}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] text-brand-600 font-medium flex items-center gap-0.5">
                    ✓ Tasdiqlangan bron
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
