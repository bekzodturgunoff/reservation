'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export function HeroSection() {
  const statsRef = useRef<HTMLDivElement>(null)

  const stats = [
    { value: '500+', label: "Ro'yxatdagi joylar" },
    { value: '12,000+', label: 'Faol foydalanuvchilar' },
    { value: '4.8', label: "O'rtacha reyting", star: true },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 65% 20%, #065F46 0%, #022c22 55%, #0A0A0A 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 lg:py-0">
        <div className="grid lg:grid-cols-[55%_45%] gap-12 items-center min-h-screen">
          {/* LEFT COLUMN */}
          <div className="max-w-2xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-white tracking-[0.05em] mb-8">
              <span>🇺🇿</span>
              <span>O'zbekiston №1 bron platformasi</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[68px] sm:text-[68px] leading-[1.05] -tracking-[0.04em] font-extrabold text-white">
              Mukammal joy —
              <br />
              <span className="text-[#34D399]">bir daqiqada</span>
              <br />
              bron qiling.
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-[17px] text-white/65 max-w-[460px] leading-relaxed">
              Toshkentdagi kafeler, restoranlar, futbol maydonlari va ko'plab joylarni
              WhatsApp va qo'ng'iroqlarsiz — onlayn toping va bron qiling.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 h-[52px] px-7 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base rounded-xl shadow-btn transition-all hover:-translate-y-[1px] active:translate-y-0"
              >
                Joyni qidirish
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 h-[52px] px-7 bg-white/12 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-medium text-base rounded-xl transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
                Qanday ishlaydi
              </a>
            </div>

            {/* Social proof */}
            <div ref={statsRef} className="mt-12 flex gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                      {stat.star && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                      {stat.label}
                    </p>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-7 bg-white/15" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Booking preview card */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-[360px] animate-float">
              <div
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-[0_32px_80px_rgba(0,0,0,0.4)]"
              >
                {/* Venue photo */}
                <div
                  className="w-full h-[160px] rounded-xl bg-cover bg-center relative"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80)',
                  }}
                >
                  <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-sm text-white">
                    ☕ Kafe
                  </span>
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm">
                    ♡
                  </button>
                </div>

                {/* Venue info */}
                <h4 className="mt-3 font-display text-base font-bold text-white">Eski Juva Cafe</h4>
                <p className="mt-1 text-xs text-white/55">📍 Yunusobod, Toshkent</p>

                {/* Divider */}
                <div className="my-3.5 h-px bg-white/10" />

                {/* Date/time pills */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs text-white text-center">
                    📅 14-iyun, shanba
                  </div>
                  <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs text-white text-center">
                    ⏰ 14:00 – 16:00
                  </div>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">100,000 UZS</span>
                  <span className="text-xs text-white/50">/ 2 soat</span>
                </div>

                {/* Book button */}
                <button className="mt-3 w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-colors">
                  Bron qilish
                </button>

                {/* Availability indicator */}
                <div className="mt-2.5 flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  <span className="text-[11px] text-white/50">Real vaqt mavjudligi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
