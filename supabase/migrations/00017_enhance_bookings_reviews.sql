-- Migration 00017: Enhance bookings, reviews, venues, and slots

-- =====================
-- ADD COLUMNS TO BOOKINGS
-- =====================
alter table bookings add column if not exists recurring_pattern jsonb default null;
alter table bookings add column if not exists group_size int default 1;
alter table bookings add column if not exists promo_code_id uuid references public.promo_codes(id) on delete set null;
alter table bookings add column if not exists staff_id uuid references public.staff(id) on delete set null;
alter table bookings add column if not exists checked_in boolean default false;
alter table bookings add column if not exists checked_in_at timestamptz default null;
alter table bookings add column if not exists no_show boolean default false;

-- =====================
-- ADD COLUMNS TO VENUES
-- =====================
alter table venues add column if not exists max_group_size int default null;
alter table venues add column if not exists cancellation_policy text default 'flexible' check (cancellation_policy in ('flexible', 'standard', 'strict'));

-- =====================
-- ADD STAFF_CAPACITY TO SLOTS
-- =====================
alter table slots add column if not exists staff_capacity int default null;

-- =====================
-- BOOKING_ID ON REVIEWS (already in schema, ensure column exists)
-- =====================
alter table reviews add column if not exists booking_id uuid references public.bookings(id) on delete set null;

-- =====================
-- TRIGGER: delete old slots
-- =====================
create or replace function delete_old_slots()
returns trigger as $$
begin
  delete from slots where start_time < now();
  return null;
end;
$$ language plpgsql;

drop trigger if exists trigger_delete_old_slots on slots;
create trigger trigger_delete_old_slots
  after insert on slots
  execute function delete_old_slots();

-- =====================
-- TRIGGER: check slot availability before booking
-- =====================
create or replace function check_slot_availability()
returns trigger as $$
declare
  v_capacity int;
  v_booked int;
begin
  select coalesce(staff_capacity, 1) into v_capacity
  from slots where id = new.slot_id;

  select count(*) into v_booked
  from bookings
  where slot_id = new.slot_id
    and status != 'cancelled';

  if v_booked >= v_capacity then
    raise exception 'Slot is fully booked';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_check_slot_availability on bookings;
create trigger trigger_check_slot_availability
  before insert on bookings
  for each row
  execute function check_slot_availability();

-- =====================
-- INDEXES
-- =====================
create index if not exists idx_no_show_bookings_user_id on no_show_bookings(user_id);
create index if not exists idx_no_show_bookings_venue_id on no_show_bookings(venue_id);
create index if not exists idx_waitlist_bookings_user_id on waitlist_bookings(user_id);
create index if not exists idx_waitlist_bookings_venue_id on waitlist_bookings(venue_id);
create index if not exists idx_waitlist_bookings_slot_time on waitlist_bookings(slot_time);
create index if not exists idx_promo_codes_venue_id on promo_codes(venue_id);
create index if not exists idx_promo_codes_code on promo_codes(code);
create index if not exists idx_staff_venue_id on staff(venue_id);
create index if not exists idx_loyalty_points_user_id on loyalty_points(user_id);
create index if not exists idx_loyalty_history_user_id on loyalty_history(user_id);
create index if not exists idx_loyalty_history_booking_id on loyalty_history(booking_id);
create index if not exists idx_bookings_checked_in on bookings(checked_in) where checked_in = true;
create index if not exists idx_bookings_promo_code_id on bookings(promo_code_id);
create index if not exists idx_bookings_staff_id on bookings(staff_id);

-- =====================
-- FUNCTION: increment promo code usage counter
-- =====================
create or replace function increment_promo_usage(promo_id uuid)
returns void as $$
begin
  update promo_codes
  set used_count = used_count + 1
  where id = promo_id;
end;
$$ language plpgsql;

-- =====================
-- FUNCTION: redeem loyalty points
-- =====================
create or replace function redeem_loyalty_points(
  p_user_id uuid,
  p_booking_id uuid,
  p_points int
)
returns int as $$
declare
  v_venue_id uuid;
  v_discount int;
  v_balance int;
begin
  -- Get venue_id from booking
  select venue_id into v_venue_id
  from bookings where id = p_booking_id;

  if v_venue_id is null then
    raise exception 'Booking not found';
  end if;

  -- Check current balance
  select balance into v_balance
  from loyalty_points
  where user_id = p_user_id and venue_id = v_venue_id;

  if v_balance is null or v_balance < p_points then
    raise exception 'Insufficient points';
  end if;

  -- 100 points = 1 unit discount
  v_discount := floor(p_points / 100);

  -- Deduct points
  update loyalty_points
  set balance = balance - p_points,
      updated_at = now()
  where user_id = p_user_id and venue_id = v_venue_id;

  -- Record history
  insert into loyalty_history (user_id, venue_id, points, type, description, booking_id)
  values (p_user_id, v_venue_id, p_points, 'redeemed', 'Redeemed for booking discount', p_booking_id);

  return v_discount;
end;
$$ language plpgsql;
