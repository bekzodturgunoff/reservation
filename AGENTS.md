## Goal
- Complete migration from Vite + React 19 to Next.js 15 App Router with award-winning redesign, all bug fixes, new design system, comprehensive UI/UX fixes, and real Supabase data throughout.

## Constraints & Preferences
- Next.js 15 App Router; brand color emerald #059669
- All data from Supabase — no mock/placeholder/fake data anywhere
- i18next for uz/ru/en translations; all UI text in real Uzbek
- Tailwind v3 with custom design tokens; no inline styles
- Every interactive element needs transition; every data view needs skeleton + empty state
- pnpm with `node-linker=hoisted` (`.npmrc`)

## Progress
### Done
- All phases 0.0–0.11: migration foundation, design system, landing, auth, search, venue detail, UI components accessibility overhaul (Button, Input, Badge, Card, Modal, Skeleton, EmptyState), Profile, Booking Success, 404, robots.txt, sitemap.xml
- Business pages (dashboard, venues, venues/add, bookings, revenue, settings) and admin pages (dashboard, users, venues, revenue, settings) — all rewritten to use real Supabase queries; zero hardcoded mock data
- Removed all fake data arrays (`mockBookings`, `mockVenues`, `mockUsers`, fake stats, fake transactions, fake chart data) — every value comes from `useQuery` calls to Supabase
- `.npmrc` created with `node-linker=hoisted` to fix `next: command not found` on pnpm
- Admin revenue page: real booking totals, weekly chart, breakdown with platform fee (8%), month-over-month chart
- Admin venues page: real venues list with owner names (separate profiles query), approve/reject/block buttons, mobile + table views
- Admin users page: block/unblock using `role` field with `'blocked'` type added to Profile union
- Navbar broken ternary fixed (line 152 `Expected '</', got ':'`)
- Navbar + Footer dashboard links fixed: `/business/dashboard` → `/business`, `/admin/dashboard` → `/admin`
- Landing page null crash fixed: `categories` query returns `data || []` instead of `data as Category[]`
- All Supabase query retries reduced from 2 to 0 to stop retry flooding on network errors
- Login/register pages: user-friendly "Tarmoq xatosi" toast instead of raw `Failed to fetch`
- Auth store: zustand `persist` middleware for session survival on refresh
- Navbar: React state for dropdown (no DOM toggling), outside-click listener, added `'en'` locale
- Venue detail: uses `react-hot-toast` properly; Booking success: `useSearchParams` + Suspense
- Business/admin layouts: removed non‑functional bell icon, mobile nav overflow fix, aria-labels, brand colors
- Delete venue / block user confirmation modals; aria-labels on all action buttons
- Business settings + admin settings: form validation + toasts
- Build passes: 22 routes, 0 errors, 0 warnings
- **Production readiness (Sections 1–14):** RLS audit + hardening (migrations 00026/00027), admin role protection via SECURITY DEFINER, double-booking prevention trigger, booking status transition enforcement, 11 database indexes, HTTP security headers (CSP/HSTS/X-Frame-Options) in `next.config.ts`, environment variable audit, storage upload validation (`lib/upload.ts` — 5 MB, JPG/PNG/WebP only)
- **Error handling:** `lib/handleError.ts` maps Supabase/network/DB errors to Uzbek messages; `error.tsx` boundaries at root + every route group with `ErrorView` component; `loading.tsx` at root + every route group with `PageSkeleton`
- **Metadata & SEO:** OpenGraph + Twitter cards in root layout; `useTitle` hook per page; dynamic `sitemap.ts` fetching venue slugs; JSON-LD structured data (LocalBusiness + AggregateRating) on venue detail pages; `/robots.ts` disallows `/admin`, `/business`, `/booking`, `/profile`
- **Legal:** `/privacy`, `/terms` with full content + footer links
- **Monitoring:** Vercel Analytics + Speed Insights in root layout; `/api/health` endpoint returning 503 on DB failure
- **Accessibility:** skip-to-content link in public layout; ScrollReveal GSAP dynamically imported (reduces initial bundle)
- **Form validation:** zod schemas on business settings, venue add, login, register pages
- **Bundle optimization:** removed unused `recharts` from `optimizePackageImports`; GSAP/ScrollTrigger lazy-loaded in ScrollReveal; sizes: max 215 kB/page, 103 kB shared JS
- **i18n cleanup:** removed duplicate `footer` keys from all 3 locale files; confirmed uz/en/ru key structure is identical
- **Build:** 25 routes, 0 errors, 0 warnings (Next.js 15.5.19)

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Fake/mock data removed from all business and admin pages; every number, list item, and chart value now comes from `useQuery` backed by Supabase queries (profiles, venues, bookings, reviews)
- Admin venues uses a separate query for owner profiles (`profiles.in('id', ownerIds)`) instead of a foreign-key join, avoiding constraint-name issues
- `'blocked'` added to Profile.role union type in both `types/index.ts` and `store/auth.ts` so admin block/unblock compiles without type overlap error
- pnpm lockfile regenerated; `.npmrc` with `node-linker=hoisted` to create hoisted `node_modules/.bin/next`
- Query retries dropped to 0 to avoid cascading requests when Supabase is unreachable
- `/business/dashboard` and `/admin/dashboard` links replaced with `/business` and `/admin` (actual Next.js page routes)
- Migration 00027 adds booking status transition enforcement (pending→confirmed→completed/cancelled/no_show) plus RLS for auxiliary tables (waitlist_bookings, promo_codes, staff, loyalty_points, loyalty_history, no_show_bookings)
- GSAP/ScrollTrigger lazy-loaded via dynamic import in ScrollReveal to reduce initial bundle; removed `recharts` from `optimizePackageImports` since charts are inline Tailwind bars
- i18n `t()` is never called in components — UI is hardcoded Uzbek. Locale files (uz/en/ru) are structurally identical and complete; `footer` duplicate removed

## Next Steps
1. Apply migrations 00026 + 00027 to Supabase via `supabase migration up` (or SQL editor)
2. Deploy to Vercel — commit and push
3. End-to-end testing with real Supabase data and authenticated user
4. Optional: wire `@sentry/nextjs` for error tracking
5. Optional: retrofit `useTranslation` / `t()` calls across all components for multi-language support

## Critical Context
- Build: 22 routes, 0 errors, 0 warnings (`pnpm build`)
- Dev server: all pages return 200 (`/`, `/login`, `/register`, `/search`, `/business`, `/admin`, `/business/venues`, `/admin/users`)
- Node v24.14.0, pnpm v10.33.0
- Supabase URL: `pydsqvslcjnytgebwtpo.supabase.co`
- Environment: macOS, project at `/Users/macintosh/Documents/code/reservation`

## Relevant Files
- `app/business/page.tsx` — real venue count, today's bookings, monthly revenue, review count from Supabase
- `app/business/bookings/page.tsx` — real bookings joined with venues + profiles
- `app/business/venues/page.tsx` — real venues owned by current user; delete modal
- `app/business/revenue/page.tsx` — real bookings aggregated into revenue cards, weekly chart, transaction list
- `app/admin/page.tsx` — real user/venue/booking counts, role distribution, recent users
- `app/admin/users/page.tsx` — real profiles table; block/unblock mutation using `role='blocked'`
- `app/admin/venues/page.tsx` — real venues list with owner names, approve/reject/block action buttons
- `app/admin/revenue/page.tsx` — real booking totals + breakdown + monthly chart + platform fee
- `.npmrc` — `node-linker=hoisted`, `shamefully-hoist=true`
- `app/providers.tsx` — `retry: 0` in QueryClient config
- `types/index.ts` — `role: 'user' | 'business' | 'admin' | 'blocked'`
- `store/auth.ts` — same role union + persist middleware
- `components/layout/Navbar.tsx` — React state dropdown, fixed dashboard links, fixed ternary
- `components/layout/Footer.tsx` — fixed `/business/dashboard` → `/business`
- `app/(public)/page.tsx` — safe `data || []` in categories query
