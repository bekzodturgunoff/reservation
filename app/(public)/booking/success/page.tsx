import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants/routes'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bron tasdiqlandi — BronUz',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; date?: string; time?: string; venue?: string }>
}) {
  const params = await searchParams

  const details = {
    date: params.date || '',
    time: params.time || '',
    venue: params.venue || '',
  }

  const hasDetails = details.date || details.time || details.venue

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        <CheckCircle2 className="w-20 h-20 text-success mb-6" strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
          Bron tasdiqlandi!
        </h1>
        <p className="mt-2 text-ink-tertiary">
          Tez orada siz bilan bog'lanamiz
        </p>

        {hasDetails && (
          <div className="mt-8 w-full bg-surface border border-border rounded-2xl shadow-card p-5 space-y-3 text-left">
            <h3 className="text-sm font-semibold text-ink-tertiary uppercase tracking-wider">
              Bron ma'lumotlari
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
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full">
              Bosh sahifaga qaytish
            </Button>
          </Link>
          <Link href={ROUTES.SEARCH} className="flex-1">
            <Button variant="primary" className="w-full">
              Qidirish
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
