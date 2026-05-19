-- Features: reviews photos + favorites

-- Add photo to reviews
alter table reviews add column if not exists photos text[] default '{}';

-- Favorites / wishlist table
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  venue_id uuid references venues(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, venue_id)
);

alter table favorites enable row level security;

drop policy if exists "Users can view own favorites" on favorites;
create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add favorites" on favorites;
create policy "Users can add favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove favorites" on favorites;
create policy "Users can remove favorites"
  on favorites for delete
  using (auth.uid() = user_id);
