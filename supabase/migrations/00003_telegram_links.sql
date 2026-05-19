-- Telegram links table
create table if not exists telegram_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  venue_id uuid references venues(id) on delete cascade not null,
  chat_id bigint not null,
  created_at timestamptz default now(),
  unique(venue_id, chat_id)
);

-- RLS
alter table telegram_links enable row level security;

drop policy if exists "Users can view their own links" on telegram_links;
create policy "Users can view their own links"
  on telegram_links for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own links" on telegram_links;
create policy "Users can insert their own links"
  on telegram_links for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own links" on telegram_links;
create policy "Users can delete their own links"
  on telegram_links for delete
  using (auth.uid() = user_id);

-- Expanded categories (insert if not exists)
insert into categories (slug, name_uz, name_ru, icon) values
  ('cafe', 'Kafe', 'Кафе', '☕'),
  ('restaurant', 'Restoran', 'Ресторан', '🍽️'),
  ('football', 'Futbol maydoni', 'Футбольное поле', '⚽'),
  ('gaming', 'Gaming klub', 'Gaming-клуб', '🎮'),
  ('gym', 'Sport zal', 'Спортзал', '🏋️'),
  ('coworking', 'Cо-working', 'Коворкинг', '💻'),
  ('hookah', 'Kalyan', 'Кальянная', '💨'),
  ('barbershop', 'Sartaroshxona', 'Барбершоп', '💈'),
  ('beauty', 'Go''zallik saloni', 'Салон красоты', '💅'),
  ('photostudio', 'Foto studiya', 'Фотостудия', '📸'),
  ('bathhouse', 'Hammom', 'Баня', '🧖'),
  ('pool', 'Havuz', 'Бассейн', '🏊'),
  ('tennis', 'Tennis korti', 'Теннисный корт', '🎾'),
  ('bowling', 'Bouling', 'Боулинг', '🎳'),
  ('billiard', 'Bilyard', 'Бильярд', '🎱'),
  ('karaoke', 'Karaoke', 'Караоке', '🎤'),
  ('cinema', 'Kino', 'Кинотеатр', '🎬'),
  ('hotel', 'Mehmonxona', 'Отель', '🏨'),
  ('cottage', 'Dam olish uyi', 'Коттедж', '🏡'),
  ('event', 'Banket zali', 'Банкетный зал', '🎉'),
  ('children', 'Bolalar klubi', 'Детский клуб', '🧸'),
  ('bath', 'Sauna', 'Сауна', '🧖‍♂️'),
  ('massage', 'Massaj', 'Массаж', '💆'),
  ('dance', 'Raqs studiyasi', 'Танцевальная студия', '💃'),
  ('art', 'San''at studiyasi', 'Арт-студия', '🎨'),
  ('library', 'Kutubxona', 'Библиотека', '📚'),
  ('parking', 'Avtoturargoh', 'Парковка', '🅿️'),
  ('studio', 'Ovoz yozish studiyasi', 'Студия звукозаписи', '🎙️'),
  ('workshop', 'Ishxonasi', 'Мастерская', '🔧'),
  ('tent', 'Palatka / Yurt', 'Палатка / Юрта', '⛺')
on conflict (slug) do nothing;
