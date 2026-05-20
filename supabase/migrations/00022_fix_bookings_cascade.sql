-- Fix bookings foreign key to cascade on venue delete
alter table bookings
  drop constraint if exists bookings_venue_id_fkey,
  add constraint bookings_venue_id_fkey
    foreign key (venue_id)
    references venues(id)
    on delete cascade;
