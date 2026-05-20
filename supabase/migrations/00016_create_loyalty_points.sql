-- Migration 00016: Create loyalty_points and loyalty_history tables

-- =====================
-- LOYALTY POINTS
-- =====================
create table if not exists public.loyalty_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  balance int default 0 not null check (balance >= 0),
  lifetime_earned int default 0 not null check (lifetime_earned >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, venue_id)
);

alter table public.loyalty_points enable row level security;

drop policy if exists "Users can view own loyalty points" on loyalty_points;
create policy "Users can view own loyalty points"
  on loyalty_points for select
  using (auth.uid() = user_id);

-- =====================
-- LOYALTY HISTORY
-- =====================
create table if not exists public.loyalty_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  points int not null,
  type text not null check (type in ('earned', 'redeemed', 'expired', 'adjusted')),
  description text default '',
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.loyalty_history enable row level security;

drop policy if exists "Users can view own loyalty history" on loyalty_history;
create policy "Users can view own loyalty history"
  on loyalty_history for select
  using (auth.uid() = user_id);
