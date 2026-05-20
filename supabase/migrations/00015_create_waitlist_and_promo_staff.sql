-- Migration 00015: Create waitlist_bookings, promo_codes, and staff tables

-- =====================
-- WAITLIST BOOKINGS
-- =====================
create table if not exists public.waitlist_bookings (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  slot_time timestamptz not null,
  party_size int default 1,
  status text default 'waiting' check (status in ('waiting', 'notified', 'expired', 'cancelled')),
  created_at timestamptz default now() not null
);

alter table public.waitlist_bookings enable row level security;

drop policy if exists "Users can view own waitlist entries" on waitlist_bookings;
create policy "Users can view own waitlist entries"
  on waitlist_bookings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can join waitlist" on waitlist_bookings;
create policy "Users can join waitlist"
  on waitlist_bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own waitlist entries" on waitlist_bookings;
create policy "Users can delete own waitlist entries"
  on waitlist_bookings for delete
  using (auth.uid() = user_id);

drop policy if exists "Venue owners can view waitlist for their venues" on waitlist_bookings;
create policy "Venue owners can view waitlist for their venues"
  on waitlist_bookings for select
  using (
    auth.uid() = (select owner_id from venues where id = venue_id)
  );

-- =====================
-- PROMO CODES
-- =====================
create table if not exists public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid not null references public.venues(id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  max_uses int default null,
  used_count int default 0,
  min_amount numeric(10,2) default null,
  max_discount numeric(10,2) default null,
  starts_at timestamptz default now(),
  expires_at timestamptz default null,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  unique(venue_id, code)
);

alter table public.promo_codes enable row level security;

drop policy if exists "Anyone can view active promo codes" on promo_codes;
create policy "Anyone can view active promo codes"
  on promo_codes for select
  using (is_active = true and (expires_at is null or expires_at > now()));

drop policy if exists "Venue owners can manage promo codes" on promo_codes;
create policy "Venue owners can manage promo codes"
  on promo_codes for all
  using (
    auth.uid() = (select owner_id from venues where id = venue_id)
  );

-- =====================
-- STAFF
-- =====================
create table if not exists public.staff (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  title text default '',
  services uuid[] default '{}',
  photo text default null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now() not null
);

alter table public.staff enable row level security;

drop policy if exists "Anyone can view active staff" on staff;
create policy "Anyone can view active staff"
  on staff for select
  using (is_active = true);

drop policy if exists "Venue owners can manage staff" on staff;
create policy "Venue owners can manage staff"
  on staff for all
  using (
    auth.uid() = (select owner_id from venues where id = venue_id)
  );
