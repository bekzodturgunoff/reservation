-- =====================================================
-- Migration 00027: Booking status machine + RLS audit
-- =====================================================

-- 1. Booking status transition enforcement
create or replace function check_booking_status_transition()
returns trigger
language plpgsql
as $$
begin
  if old.id is not null and old.status = new.status then
    return new;
  end if;

  if old.id is not null then
    if not (
      (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
      or (old.status = 'confirmed' and new.status in ('cancelled', 'completed', 'no_show'))
      or (old.status = 'cancelled' and new.status = old.status)
      or (old.status = 'completed' and new.status = old.status)
      or (old.status = 'no_show' and new.status = old.status)
    ) then
      raise exception 'Bron holatini "%" dan "%" ga o''zgartirish mumkin emas', old.status, new.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_booking_status_transition on bookings;
create trigger enforce_booking_status_transition
  before update on bookings
  for each row
  execute function check_booking_status_transition();

-- 2. RLS audit fix: waitlist_bookings, promo_codes, staff, loyalty_points, loyalty_history, no_show_bookings
-- These tables were created after 00012 and may lack RLS

alter table if exists public.waitlist_bookings enable row level security;
alter table if exists public.promo_codes enable row level security;
alter table if exists public.staff enable row level security;
alter table if exists public.loyalty_points enable row level security;
alter table if exists public.loyalty_history enable row level security;
alter table if exists public.no_show_bookings enable row level security;

-- waitlist_bookings: user manages own
drop policy if exists "Users can manage own waitlist" on waitlist_bookings;
create policy "Users can manage own waitlist"
  on waitlist_bookings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- promo_codes: anyone can select active, admin manages all
drop policy if exists "Anyone can view active promo codes" on promo_codes;
create policy "Anyone can view active promo codes"
  on promo_codes for select
  using (is_active = true);

drop policy if exists "Admin can manage promo codes" on promo_codes;
create policy "Admin can manage promo codes"
  on promo_codes for all
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- staff: business owner manages own venue's staff
drop policy if exists "Venue owner manages staff" on staff;
create policy "Venue owner manages staff"
  on staff for all
  using ((select owner_id from venues where id = staff.venue_id) = auth.uid())
  with check ((select owner_id from venues where id = staff.venue_id) = auth.uid());

-- loyalty_points: user can view own
drop policy if exists "Users can view own loyalty points" on loyalty_points;
create policy "Users can view own loyalty points"
  on loyalty_points for select
  using (auth.uid() = user_id);

-- loyalty_history: user can view own
drop policy if exists "Users can view own loyalty history" on loyalty_history;
create policy "Users can view own loyalty history"
  on loyalty_history for select
  using (auth.uid() = user_id);

-- no_show_bookings: admin only
drop policy if exists "Admin can manage no_show_bookings" on no_show_bookings;
create policy "Admin can manage no_show_bookings"
  on no_show_bookings for all
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');
