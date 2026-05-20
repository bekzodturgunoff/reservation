-- Migration 00025: Remove Authorization header from AI review trigger
-- The edge function is deployed with --no-verify-jwt, so no auth header is needed.
-- current_setting('supabase_anon_key') was never set in the database, causing the trigger to silently fail.

create or replace function invoke_ai_venue_review()
returns trigger
language plpgsql
security definer
as $$
begin
  begin
    perform net.http_post(
      url := 'https://pydsqvslcjnytgebwtpo.functions.supabase.co/ai-venue-review',
      headers := jsonb_build_object('Content-Type', 'application/json'),
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
