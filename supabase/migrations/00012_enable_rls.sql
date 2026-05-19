-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.venues enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table if exists public.favorites enable row level security;
alter table if exists public.venue_services enable row level security;
alter table if exists public.telegram_links enable row level security;

-- =====================
-- PROFILES
-- =====================
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Public profiles are viewable" on profiles;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

-- =====================
-- CATEGORIES
-- =====================
drop policy if exists "Categories are public" on categories;
drop policy if exists "Anyone can view categories" on categories;

create policy "Anyone can view categories"
  on categories for select
  using (true);

-- =====================
-- VENUES
-- =====================
drop policy if exists "Active venues viewable by everyone" on venues;
drop policy if exists "Owners can view own venues" on venues;
drop policy if exists "Owners can insert venues" on venues;
drop policy if exists "Owners can update own venues" on venues;
drop policy if exists "Public venues are viewable by everyone" on venues;

create policy "Active venues viewable by everyone"
  on venues for select
  using (status = 'active');

create policy "Owners can view own venues regardless of status"
  on venues for select
  using (auth.uid() = owner_id);

create policy "Owners can insert venues"
  on venues for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own venues"
  on venues for update
  using (auth.uid() = owner_id);

-- =====================
-- SLOTS
-- =====================
drop policy if exists "Slots are viewable by everyone" on slots;
drop policy if exists "Owners can manage slots" on slots;

create policy "Slots are viewable by everyone"
  on slots for select
  using (true);

create policy "Owners can insert slots"
  on slots for insert
  with check (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

create policy "Owners can update slots"
  on slots for update
  using (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

create policy "Owners can delete slots"
  on slots for delete
  using (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

create policy "Authenticated users can update slot availability"
  on slots for update
  using (auth.role() = 'authenticated');

-- =====================
-- BOOKINGS
-- =====================
drop policy if exists "Users can view own bookings" on bookings;
drop policy if exists "Users can insert own bookings" on bookings;
drop policy if exists "Users can update own bookings" on bookings;
drop policy if exists "Venue owners can view their venue bookings" on bookings;

create policy "Users can view own bookings"
  on bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on bookings for update
  using (auth.uid() = user_id);

create policy "Venue owners can view bookings for their venues"
  on bookings for select
  using (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

-- =====================
-- REVIEWS
-- =====================
drop policy if exists "Reviews are viewable by everyone" on reviews;
drop policy if exists "Users can insert own reviews" on reviews;
drop policy if exists "Users can update own reviews" on reviews;
drop policy if exists "Users can delete own reviews" on reviews;

create policy "Reviews are viewable by everyone"
  on reviews for select
  using (true);

create policy "Authenticated users can insert reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

-- =====================
-- FAVORITES (if table exists)
-- =====================
drop policy if exists "Users can manage own favorites" on favorites;
drop policy if exists "Users can view own favorites" on favorites;
drop policy if exists "Users can insert own favorites" on favorites;
drop policy if exists "Users can delete own favorites" on favorites;

create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

-- =====================
-- VENUE_SERVICES (if table exists)
-- =====================
drop policy if exists "Venue services are viewable by everyone" on venue_services;
drop policy if exists "Owners can manage venue services" on venue_services;

create policy "Venue services are viewable by everyone"
  on venue_services for select
  using (true);

create policy "Owners can insert venue services"
  on venue_services for insert
  with check (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

create policy "Owners can update venue services"
  on venue_services for update
  using (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

create policy "Owners can delete venue services"
  on venue_services for delete
  using (
    auth.uid() = (
      select owner_id from venues where id = venue_id
    )
  );

-- =====================
-- TELEGRAM_LINKS (if table exists)
-- =====================
drop policy if exists "Users can manage own telegram links" on telegram_links;

create policy "Users can view own telegram link"
  on telegram_links for select
  using (auth.uid() = user_id);

create policy "Users can insert own telegram link"
  on telegram_links for insert
  with check (auth.uid() = user_id);

create policy "Users can update own telegram link"
  on telegram_links for update
  using (auth.uid() = user_id);

create policy "Users can delete own telegram link"
  on telegram_links for delete
  using (auth.uid() = user_id);
