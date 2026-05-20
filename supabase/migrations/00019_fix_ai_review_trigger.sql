-- Migration 00019: Enable pg_net and fix AI review trigger to use actual project URL

-- Step 1: Enable pg_net extension (allows HTTP calls from triggers)
create extension if not exists pg_net;

-- Step 2: Replace trigger function with working version using actual project URL
create or replace function invoke_ai_venue_review()
returns trigger
language plpgsql
security definer
as $$
begin
  begin
    perform net.http_post(
      url := 'https://pydsqvslcjnytgebwtpo.functions.supabase.co/ai-venue-review',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer sb_publishable_NY4gf7qGxZC_hiDA_g5LTA_p2cbqBc-'
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
