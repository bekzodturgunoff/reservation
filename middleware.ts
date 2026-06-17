import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/auth/login': { max: 5, windowMs: 15 * 60 * 1000 },
  '/api/auth/register': { max: 3, windowMs: 60 * 60 * 1000 },
  '/api/bookings': { max: 10, windowMs: 60 * 1000 },
}

function getRateLimitKey(request: NextRequest): string | null {
  for (const [path, _config] of Object.entries(RATE_LIMITS)) {
    if (request.nextUrl.pathname.startsWith(path)) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown'
      return `${path}:${ip}`
    }
  }
  return null
}

export function middleware(request: NextRequest) {
  const key = getRateLimitKey(request)
  if (!key) return NextResponse.next()

  const config = RATE_LIMITS[Object.keys(RATE_LIMITS).find(p => key.startsWith(p))!]!

  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs })
    return NextResponse.next()
  }

  entry.count++
  if (entry.count > config.max) {
    return new NextResponse(
      JSON.stringify({ error: 'Juda ko\'p urinish. Keyinroq qayta urinib ko\'ring' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
