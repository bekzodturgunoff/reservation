-- Replace direct admin update policy with SECURITY DEFINER functions
drop policy if exists "Admins can update any venue" on venues;

create or replace function approve_venue(venue_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can approve venues';
  end if;
  update venues set status = 'active' where id = venue_id;
end;
$$;

create or replace function reject_venue(venue_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can reject venues';
  end if;
  update venues set status = 'rejected' where id = venue_id;
end;
$$;
