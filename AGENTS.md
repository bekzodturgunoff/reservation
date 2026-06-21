## Goal
Complete migration from Vite + React 19 to Next.js 15 App Router — award-winning redesign, all bug fixes, new design system, comprehensive UI/UX fixes, and real Supabase data throughout.

## Constraints & Preferences
- Next.js 15 App Router; brand color emerald #059669
- All data from Supabase — no mock/placeholder/fake data anywhere
- i18next for uz/ru/en translations; all UI text in real Uzbek
- Tailwind v3 with custom design tokens; no inline styles
- Every interactive element needs transition; every data view needs skeleton + empty state
- pnpm with `node-linker=hoisted` (`.npmrc`)
- `'use client'` must NOT be on any `page.tsx` — SSR mandatory (except search)
- Use Drawer for detail views, ConfirmModal for destructive actions
- No new npm packages unless explicitly called for
- Named exports only (except Next.js special files)
- One component per file
- Props interfaces at top of every component file
- Explicit return types on all functions
- Early returns over nested if/else
- `cn()` utility for ALL className merging
- `ROUTES` constants for all paths
- `QUERY_KEYS` constants for React Query
- Constants for all magic values
- No `any` types
- No console.log (except error boundaries)
- No SELECT * in Supabase queries
- Server Actions for mutations where practical

## Progress
### Done
- **Session 1 (foundation):** All phases 0.0–0.11 — migration, design system, landing, auth, search, venue detail, UI components, Profile, Booking, 404, robots, sitemap
- **Session 1 (business/admin):** All pages rewritten with real Supabase queries; zero mock/fake data removed; admin revenue/venues/users pages; auth persist; navbar dropdown; business calendar/bookings/reviews/revenue/edit-venue; admin bookings/venue-review; vercel build fix
- **Session 1 (production):** RLS audit + hardening (migrations 00026/00027), booking status enforcement, 11 indexes, security headers, env audit, storage upload validation, error handling, metadata/SEO, legal pages, monitoring/analytics, accessibility, bundle optimization, i18n cleanup
- **Session 1 (shared components):** BookingStatusBadge, Drawer, ConfirmModal
- **Session 2 (Batch 1):** 3 `<img>` → `<Image>`, console.log removed, 7 SELECT * fixed, dev-dist deleted
- **Session 2 (Batch 2):** `lib/constants/*`, `lib/utils/*`, `lib/validations/*` created
- **Session 2 (Batch 2.5):** Strict ESLint + tsconfig (`noUncheckedIndexedAccess`, `noImplicitReturns`), Prettier, `types/database.ts` (1106 lines), Vite eslint-comments removed
- **Session 2 (Batch 2b):** All strict mode build errors fixed (SearchMap, Modal, BookingWidget, supabase exclusion, database.ts corruption)
- **Session 2 (Batch 3):** Feature restructure — `features/venues/`, `features/search/`, `features/home/`, `features/auth/` with barrel exports; 13 components + 1 hook moved
- **Session 2 (Batch 4):** Clean code — 52 hardcoded paths → `ROUTES.*`, magic numbers → config (`SERVICE_FEE_PERCENTAGE`), console.log final sweep
- **Session 2 (Batch 5):** 20 non-null assertion warnings eliminated
- **Session 2 (Batch 6):** Full SSR conversion — `@supabase/ssr@0.12.0` integrated; 24 `'use client'` page.tsx converted to server components with client islands; only search remains client (intentionally)
- **Session 2 (Batch 7a-d):** Venue working hours editor, review stats/badges/verified/sentiment, notification bell UI
- **SQL migrations:** 00026 + 00027 + 00028 + 00029 executed in Supabase

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Feature restructure uses `features/<domain>/` with components/, hooks/, actions/, types/ subdirs
- Venue detail uses hybrid SSR: server fetches data + JSON-LD + metadata, client handles interactivity via VenueDetailClient
- Homepage + all business/admin/user pages converted to pure server components (biggest SEO gain)
- Search page kept as client component — inherently interactive (filters, sort, map)
- Sentry guarded by env var — completely no-op without NEXT_PUBLIC_SENTRY_DSN
- OG image uses edge runtime (disables static generation for that page — acceptable)
- `@supabase/ssr` for cookie-based auth in middleware + server components
- PhotoGallery `<img>` tags kept as-is (lightbox dynamic sizing incompatible with next/image)
- `noUncheckedIndexedAccess` enabled — forces proper null handling

## Next Steps
1. Run `supabase/migrations/00029_batch7_features.sql` in Supabase SQL Editor
2. End-to-end testing with real Supabase data and authenticated user
3. Wire `NEXT_PUBLIC_SENTRY_DSN` env var for error tracking
4. Retrofit `useTranslation` / `t()` calls for multi-language support

## Critical Context
- **Build:** 32 routes, 0 errors, 0 warnings (except intentional `<img>` in PhotoGallery)
- **SSR pages:** All pages except search — 31 dynamic, 5 static
- **Client pages:** Only search
- Supabase URL: `pydsqvslcjnytgebwtpo.supabase.co`
- Node v24.14.0, pnpm v10.33.0, macOS
- `lib/supabase.ts` = browser client; `lib/supabase/server.ts` = SSR client (cookie-based via @supabase/ssr)
- `lib/supabase/middleware.ts` = middleware session refresh
- `@sentry/nextjs@10.59.0` installed, gated by env var
- `@supabase/ssr@0.12.0` installed for SSR auth
- All feature-specific code in `features/` dirs; shared UI in `components/ui/` + `components/shared/`
- `types/database.ts` = auto-generated Supabase types

## Relevant Files
- `lib/constants/routes.ts`: ROUTES object — all app paths centralized
- `lib/constants/query-keys.ts`: QUERY_KEYS object — React Query cache keys
- `lib/constants/config.ts`: Platform config constants
- `lib/utils/format.ts`: formatPrice, formatDate, formatTime, etc.
- `lib/utils/cn.ts`: cn utility (clsx + tailwind-merge)
- `lib/utils/errors.ts`: getErrorMessage with Uzbek error messages
- `lib/validations/*.ts`: zod schemas for auth, venue, booking, review
- `features/venues/components/WorkingHoursEditor.tsx`: 7-day working hours editor
- `features/notifications/components/NotificationBell.tsx`: Bell icon + dropdown
- `lib/supabase/server.ts`: SSR client (cookie-based, fallback to anonymous)
- `lib/supabase/middleware.ts`: Session refresh in middleware
- `middleware.ts`: App middleware with auth refresh
- `supabase/migrations/00029_batch7_features.sql`: Promo codes, waitlist, notifications, site settings
