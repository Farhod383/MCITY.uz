-- =====================================================================
-- MCITY — sayt ma'lumotlari (footer va "Bog'lanish" sahifasi)
--
-- Bu jadvalda faqat BITTA qator bo'ladi: id = 'main'.
-- Manzil, telefon, email, kompaniya haqidagi matn va ijtimoiy tarmoq
-- havolalari admin panelidan shu yerga yoziladi.
-- =====================================================================

create table if not exists public.site_settings (
  id         text        primary key default 'main',
  about      jsonb       not null default '{}'::jsonb,  -- 4 tilda
  address    jsonb       not null default '{}'::jsonb,  -- 4 tilda
  tagline    jsonb       not null default '{}'::jsonb,  -- 4 tilda
  phone      text,
  email      text,
  facebook   text,
  instagram  text,
  linkedin   text,
  telegram   text,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all to authenticated
  using (true) with check (true);


-- Hozirgi saytdagi ma'lumotlar
insert into public.site_settings (id, about, address, tagline, phone, email, facebook, instagram, linkedin, telegram)
values (
  'main',
  '{"uz":"MCITY — 2019-yildan buyon O''zbekistonda maxsus va kommunal avtomobillar ishlab chiqaruvchi zavod.","uzc":"MCITY — 2019-йилдан буён Ўзбекистонда махсус ва коммунал автомобиллар ишлаб чиқарувчи завод.","ru":"MCITY — завод по производству специальной и коммунальной техники в Узбекистане с 2019 года.","en":"MCITY — a special-purpose and municipal vehicle manufacturer in Uzbekistan, operating since 2019."}'::jsonb,
  '{"uz":"Toshkent sh., Sanoat ko''chasi 24, O''zbekiston","uzc":"Тошкент ш., Саноат кўчаси 24, Ўзбекистон","ru":"г. Ташкент, ул. Саноат 24, Узбекистан","en":"Tashkent, Sanoat street 24, Uzbekistan"}'::jsonb,
  '{"uz":"Maxsus texnika ishlab chiqarish","uzc":"Махсус техника ишлаб чиқариш","ru":"Производство специальной техники","en":"Special vehicle manufacturing"}'::jsonb,
  '+998 71 200 00 00',
  'info@mcity.uz',
  '', '', '', ''
)
on conflict (id) do nothing;
