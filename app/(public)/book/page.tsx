import Link from 'next/link'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { createServerT } from '@/lib/i18n/server'
import { BookClient } from './book.client'
import type { Venue } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)
  return { title: `${t('booking.title')} — BronUz` }
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

  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'uz'
  const t = createServerT(locale)

  if (!venueId || !dateStr || !startTime || !endTime) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-secondary">{t('booking.notFound')}</p>
        <Link href={ROUTES.SEARCH} className="mt-4 text-brand hover:underline inline-block">{t('common.backToSearch')}</Link>
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
        <p className="text-ink-secondary">{t('venue.notFound')}</p>
        <Link href={ROUTES.SEARCH} className="mt-4 text-brand hover:underline inline-block">{t('common.backToSearch')}</Link>
      </div>
    )
  }

  return <BookClient venue={venue as Venue} date={dateStr} start={startTime} end={endTime} />
}
