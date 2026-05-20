-- Migration 00020: Auto-link new venues to existing Telegram connections
-- When a user adds a new venue, it's automatically linked to all their Telegram chats

create or replace function auto_link_new_venue()
returns trigger
language plpgsql
security definer
as $$
declare
  rec record;
begin
  -- Find all telegram links for this venue owner and link the new venue
  for rec in
    select distinct chat_id
    from telegram_links
    where user_id = NEW.owner_id
      and venue_id != NEW.id
  loop
    -- Insert link for the new venue if not already linked
    insert into telegram_links (user_id, venue_id, chat_id)
    values (NEW.owner_id, NEW.id, rec.chat_id)
    on conflict do nothing;
  end loop;
  return NEW;
end;
$$;

drop trigger if exists auto_link_new_venue_trigger on venues;
create trigger auto_link_new_venue_trigger
  after insert
  on venues
  for each row
  execute function auto_link_new_venue();
