import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { BookClient } from './book.client'
import type { Venue } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bron qilish — BronUz',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string; date?: string; start?: string; end?: string }>
}) {
  const params = await searchParams
  const venueId = params.venue
  const dateStr = params.date
  const startTime = params.start
  const endTime = params.end

  if (!venueId || !dateStr || !startTime || !endTime) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-secondary">Ma&apos;lumot topilmadi</p>
        <Link href={ROUTES.SEARCH} className="mt-4 text-brand hover:underline inline-block">Qidiruvga qaytish</Link>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const { data: venue } = await supabase
    .from('venues')
    .select('*, categories(*)')
    .eq('id', venueId)
    .single()

  if (!venue) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-secondary">Joy topilmadi</p>
        <Link href={ROUTES.SEARCH} className="mt-4 text-brand hover:underline inline-block">Qidiruvga qaytish</Link>
      </div>
    )
  }

  return <BookClient venue={venue as Venue} date={dateStr} start={startTime} end={endTime} />
}
