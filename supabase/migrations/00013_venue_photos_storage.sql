-- Create venue-photos bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', true)
on conflict (id) do nothing;

-- Allow public to view venue photos
create policy "Venue photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'venue-photos');

-- Allow authenticated users to upload venue photos
create policy "Authenticated users can upload venue photos"
  on storage.objects for insert
  with check (
    bucket_id = 'venue-photos'
    and auth.role() = 'authenticated'
  );

-- Allow users to update their own venue photos
create policy "Users can update venue photos"
  on storage.objects for update
  using (
    bucket_id = 'venue-photos'
    and auth.role() = 'authenticated'
  );

-- Allow users to delete their own venue photos
create policy "Users can delete venue photos"
  on storage.objects for delete
  using (
    bucket_id = 'venue-photos'
    and auth.role() = 'authenticated'
  );

-- Add opening_hours column to venues
alter table venues add column if not exists opening_hours jsonb default '{
  "monday": {"open": "09:00", "close": "22:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "22:00", "closed": false},
  "thursday": {"open": "09:00", "close": "22:00", "closed": false},
  "friday": {"open": "09:00", "close": "22:00", "closed": false},
  "saturday": {"open": "10:00", "close": "23:00", "closed": false},
  "sunday": {"open": "10:00", "close": "21:00", "closed": false}
}'::jsonb;

-- Add min_notice_hours and max_advance_days to venues
alter table venues add column if not exists min_notice_hours int default 0;
alter table venues add column if not exists max_advance_days int default 30;
