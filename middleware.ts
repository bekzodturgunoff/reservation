import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.svg|favicon.ico|sitemap.xml|robots.txt).*)'],
}
