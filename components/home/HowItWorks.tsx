'use client'

import { Search, CalendarDays, Check } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: <Search className="w-6 h-6" />,
    title: 'Joyni toping',
    desc: "Shahar, toifa yoki narx bo'yicha qidiring",
  },
  {
    num: '02',
    icon: <CalendarDays className="w-6 h-6" />,
    title: 'Vaqtni tanlang',
    desc: "Mavjud soatlardan o'zingizga mos birini belgilang",
  },
  {
    num: '03',
    icon: <Check className="w-6 h-6" />,
    title: 'Tasdiqlash oling',
    desc: "SMS va email orqali bron tasdiqnomasi kelib tushadi",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-subtle py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center">
          3 ta qadam — bron tayyor
        </h2>
        <p className="mt-3 text-base text-ink-tertiary text-center">
          WhatsApp va qo'ng'iroqlarsiz
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              {/* Connecting line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[40%] h-0 border-t-2 border-dashed border-brand-200" />
              )}

              {/* Circle indicator */}
              <div className="relative w-20 h-20 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center">
                <span className="font-display text-xl font-bold text-brand-600">{step.num}</span>
              </div>

              {/* Icon below */}
              <div className="mt-4 text-brand-600">{step.icon}</div>

              <h3 className="mt-4 font-display text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed max-w-[220px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
