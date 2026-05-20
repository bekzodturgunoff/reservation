-- Migration 00018: Add human_action_needed status, ai_review_data, and AI review trigger
-- Run: supabase db push

-- Step 1: Add 'human_action_needed' to the status check constraint
alter table venues
  drop constraint if exists venues_status_check;

alter table venues
  add constraint venues_status_check
  check (status in ('pending', 'active', 'rejected', 'human_action_needed'));

-- Step 2: Add column for AI review results
alter table venues
  add column if not exists ai_review_data jsonb default null;

-- Step 3: Create the AI review trigger function
create or replace function invoke_ai_venue_review()
returns trigger
language plpgsql
security definer
as $$
begin
  begin
    perform net.http_post(
      url := current_setting('supabase_functions_url') || '/ai-venue-review',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase_anon_key')
      ),
      body := jsonb_build_object(
        'venue_id', NEW.id,
        'name', NEW.name,
        'description', NEW.description,
        'address', NEW.address,
        'city', NEW.city,
        'phone', NEW.phone,
        'category_id', NEW.category_id,
        'has_photos', case when NEW.photos is not null and array_length(NEW.photos, 1) > 0 then true else false end
      )::text
    );
  exception when others then
    null;
  end;
  return NEW;
end;
$$;

-- Step 4: Create trigger on venues
drop trigger if exists ai_venue_review_trigger on venues;
create trigger ai_venue_review_trigger
  after insert or update of status
  on venues
  for each row
  when (NEW.status = 'pending')
  execute function invoke_ai_venue_review();

-- Step 5: Update approve_venue function
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
  update venues set status = 'active', ai_review_data = null where id = venue_id;
end;
$$;

-- Step 6: Update reject_venue function
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
  update venues set status = 'rejected', ai_review_data = null where id = venue_id;
end;
$$;
