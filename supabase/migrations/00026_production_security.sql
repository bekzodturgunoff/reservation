-- =====================================================
-- Migration 00026: Production security hardening
-- =====================================================

-- 1. Admin role protection: users cannot update own role
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can update own profile except role"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- 2. SECURITY DEFINER function for admin role changes
create or replace function admin_set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select role from profiles where id = auth.uid()) != 'admin' then
    raise exception 'Ruxsat yo''q';
  end if;
  if new_role not in ('user', 'business', 'admin', 'blocked') then
    raise exception 'Noto''g''ri rol';
  end if;
  update profiles set role = new_role where id = target_user_id;
end;
$$;

-- 3. Double-booking prevention at database level
create or replace function check_booking_conflict()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from bookings
    where venue_id = new.venue_id
      and booking_date = new.booking_date
      and status not in ('cancelled', 'no_show')
      and (new.id is null or id != new.id)
      and (
        (new.start_time < end_time and new.end_time > start_time)
      )
  ) then
    raise exception 'Bu vaqt allaqachon band';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_double_booking on bookings;
create trigger prevent_double_booking
  before insert or update on bookings
  for each row
  execute function check_booking_conflict();

-- 4. Database indexes for performance
create index if not exists idx_venues_status on venues(status);
create index if not exists idx_venues_category on venues(category_id);
create index if not exists idx_venues_owner on venues(owner_id);
create index if not exists idx_bookings_user on bookings(user_id);
create index if not exists idx_bookings_venue on bookings(venue_id);
create index if not exists idx_bookings_date on bookings(booking_date);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_reviews_venue on reviews(venue_id);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_slots_venue_date on slots(venue_id, date);
create index if not exists idx_slots_available on slots(venue_id, date, is_available);
