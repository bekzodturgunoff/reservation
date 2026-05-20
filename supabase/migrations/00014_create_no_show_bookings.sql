-- Migration 00014: Create no_show_bookings table

create table if not exists public.no_show_bookings (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  marked_by uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.no_show_bookings enable row level security;

drop policy if exists "Users can view own no-show records" on no_show_bookings;
create policy "Users can view own no-show records"
  on no_show_bookings for select
  using (auth.uid() = user_id);

drop policy if exists "Venue owners can view no-show records for their venues" on no_show_bookings;
create policy "Venue owners can view no-show records for their venues"
  on no_show_bookings for select
  using (
    auth.uid() = (select owner_id from venues where id = venue_id)
  );

drop policy if exists "Authenticated users can mark no-show" on no_show_bookings;
create policy "Authenticated users can mark no-show"
  on no_show_bookings for insert
  with check (
    auth.role() = 'authenticated'
    and (
      auth.uid() = marked_by
    )
  );
