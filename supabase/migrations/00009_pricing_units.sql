-- Pricing units for flexible venue pricing
alter table venues add column if not exists pricing_unit text not null default 'per_hour'
  check (pricing_unit in ('per_hour', 'per_session', 'per_day', 'per_month', 'per_person', 'fixed'));

-- Venue services / pricing options table
create table if not exists venue_services (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid references venues(id) on delete cascade not null,
  name text not null,
  price integer not null check (price >= 0),
  unit text not null default 'per_session'
    check (unit in ('per_hour', 'per_session', 'per_day', 'per_month', 'per_person', 'fixed')),
  description text default '',
  duration_minutes integer default null,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table venue_services enable row level security;

drop policy if exists "Public can view venue services" on venue_services;
create policy "Public can view venue services"
  on venue_services for select
  using (true);

drop policy if exists "Venue owners can insert services" on venue_services;
create policy "Venue owners can insert services"
  on venue_services for insert
  with check (auth.uid() in (select owner_id from venues where id = venue_services.venue_id));

drop policy if exists "Venue owners can update services" on venue_services;
create policy "Venue owners can update services"
  on venue_services for update
  using (auth.uid() in (select owner_id from venues where id = venue_services.venue_id));

drop policy if exists "Venue owners can delete services" on venue_services;
create policy "Venue owners can delete services"
  on venue_services for delete
  using (auth.uid() in (select owner_id from venues where id = venue_services.venue_id));

-- Add optional service_id to bookings
alter table bookings add column if not exists service_id uuid references venue_services(id) on delete set null;
alter table bookings add column if not exists service_name text default '';
alter table bookings add column if not exists service_price integer default 0;
