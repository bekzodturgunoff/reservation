-- Fix delete_old_slots trigger: was comparing time with now() which
-- incorrectly deleted slots based on time-of-day instead of date.
-- Now properly deletes slots from past dates only.
create or replace function delete_old_slots()
returns trigger
language plpgsql
as $$
begin
  delete from slots where date < current_date;
  return NEW;
end;
$$;
