-- Public read access for active venues (needed for unauthenticated users)
drop policy if exists "Public can view active venues" on venues;
create policy "Public can view active venues"
  on venues for select
  using (status = 'active');

-- Owners can view their own venues (regardless of status)
drop policy if exists "Owners can view own venues" on venues;
create policy "Owners can view own venues"
  on venues for select
  using (auth.uid() = owner_id);

-- Owners can insert venues
drop policy if exists "Owners can insert venues" on venues;
create policy "Owners can insert venues"
  on venues for insert
  with check (auth.uid() = owner_id);

-- Owners can update their own venues
drop policy if exists "Owners can update venues" on venues;
create policy "Owners can update venues"
  on venues for update
  using (auth.uid() = owner_id);

-- Reviews: allow public read
drop policy if exists "Public can view reviews" on reviews;
create policy "Public can view reviews"
  on reviews for select
  using (true);

-- Allow authenticated users to insert reviews
drop policy if exists "Users can insert reviews" on reviews;
create policy "Users can insert reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

-- Categories: public read
drop policy if exists "Public can view categories" on categories;
create policy "Public can view categories"
  on categories for select
  using (true);
