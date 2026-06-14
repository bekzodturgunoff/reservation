'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

interface BookingDetails {
  date: string
  time: string
  venue: string
}

export default function BookingSuccessPage() {
  const [details, setDetails] = useState<BookingDetails>({
    date: '',
    time: '',
    venue: '',
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetails({
      date: params.get('date') || '',
      time: params.get('time') || '',
      venue: params.get('venue') || '',
    })
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        <CheckCircle2 className="w-20 h-20 text-success mb-6" strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
          Buyurtmangiz qabul qilindi!
        </h1>
        <p className="mt-2 text-ink-tertiary">
          Tez orada siz bilan bog&apos;lanamiz
        </p>

        {details.date && (
          <div className="mt-8 w-full bg-surface border border-border rounded-2xl shadow-card p-5 space-y-3 text-left">
            <h3 className="text-sm font-semibold text-ink-tertiary uppercase tracking-wider">
              Buyurtma tafsilotlari
            </h3>
            <div className="space-y-2">
              {details.venue && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Joy</span>
                  <span className="text-ink font-medium">{details.venue}</span>
                </div>
              )}
              {details.date && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Sana</span>
                  <span className="text-ink font-medium">{details.date}</span>
                </div>
              )}
              {details.time && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-tertiary">Vaqt</span>
                  <span className="text-ink font-medium">{details.time}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 text-center py-3 rounded-xl border border-border text-sm font-medium text-ink-secondary hover:bg-surface-subtle transition-colors"
          >
            Bosh sahifaga qaytish
          </Link>
          <Link
            href="/bookings"
            className="flex-1 text-center py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors shadow-button"
          >
            Mening buyurtmalarim
          </Link>
        </div>
      </div>
    </div>
  )
}
