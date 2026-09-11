-- =====================================================================
-- MCITY — Supabase sxemasi
--
-- Nima qiladi:
--   * categories  — texnika yo'nalishlari
--   * products    — texnika modellari (xarakteristika, narx, rasm)
--   * site_stats  — bosh sahifadagi raqamlar (2019 / 40+ / 100%)
--
-- Matnli maydonlar 4 tilda saqlanadi (jsonb):
--   {"uz": "...", "uzc": "...", "ru": "...", "en": "..."}
--
-- Rasmlar:
--   image_url ikki xil bo'lishi mumkin —
--     "asset:veh-fuel-tanker"  -> loyiha ichidagi rasm (src/assets/)
--     "https://..."            -> tashqi havola (masalan Supabase Storage)
--
-- Xavfsizlik:
--   Mehmonlar faqat is_published = true qatorlarni o'qiydi.
--   Faqat tizimga kirgan admin qo'shadi / tahrirlaydi / o'chiradi.
-- =====================================================================


-- ---------------------------------------------------------------------
-- updated_at ni avtomatik yangilash
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- categories — texnika yo'nalishlari
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique,
  name         jsonb       not null default '{}'::jsonb,
  image_url    text,
  sort_order   integer     not null default 0,
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists categories_sort_idx
  on public.categories (sort_order, slug);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- products — texnika modellari
--
-- specs — massiv, chunki har bir texnikada xarakteristikalar soni har xil:
--   [
--     {"label": {"uz":"Sig'imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},
--      "value": "10 000 – 25 000 L"}
--   ]
--
-- price_uzs — so'mda. null = "Narx so'rov bo'yicha".
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id           uuid        primary key default gen_random_uuid(),
  category_id  uuid        references public.categories (id) on delete set null,
  slug         text        not null unique,
  name         jsonb       not null default '{}'::jsonb,
  description  jsonb       not null default '{}'::jsonb,
  image_url    text,
  gallery      jsonb       not null default '[]'::jsonb,
  price_uzs    numeric,
  bestseller   boolean     not null default false,
  specs        jsonb       not null default '[]'::jsonb,
  sort_order   integer     not null default 0,
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint products_specs_is_array   check (jsonb_typeof(specs)   = 'array'),
  constraint products_gallery_is_array check (jsonb_typeof(gallery) = 'array')
);

create index if not exists products_category_idx  on public.products (category_id, sort_order);
create index if not exists products_published_idx on public.products (is_published, sort_order);
create index if not exists products_slug_idx      on public.products (slug);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- site_stats — bosh sahifadagi raqamlar
-- ---------------------------------------------------------------------
create table if not exists public.site_stats (
  id           uuid        primary key default gen_random_uuid(),
  value        text        not null,
  label        jsonb       not null default '{}'::jsonb,
  sort_order   integer     not null default 0,
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists site_stats_sort_idx on public.site_stats (sort_order);

drop trigger if exists site_stats_set_updated_at on public.site_stats;
create trigger site_stats_set_updated_at
  before update on public.site_stats
  for each row execute function public.set_updated_at();


-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.site_stats enable row level security;

-- --- categories ---
drop policy if exists "categories_public_read"  on public.categories;
create policy "categories_public_read"
  on public.categories for select to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

drop policy if exists "categories_admin_write"  on public.categories;
create policy "categories_admin_write"
  on public.categories for all to authenticated
  using (true) with check (true);

-- --- products ---
drop policy if exists "products_public_read"    on public.products;
create policy "products_public_read"
  on public.products for select to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

drop policy if exists "products_admin_write"    on public.products;
create policy "products_admin_write"
  on public.products for all to authenticated
  using (true) with check (true);

-- --- site_stats ---
drop policy if exists "site_stats_public_read"  on public.site_stats;
create policy "site_stats_public_read"
  on public.site_stats for select to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

drop policy if exists "site_stats_admin_write"  on public.site_stats;
create policy "site_stats_admin_write"
  on public.site_stats for all to authenticated
  using (true) with check (true);


-- ---------------------------------------------------------------------
-- Boshlang'ich ma'lumotlar — hozirgi saytdagi barcha texnika va yo'nalishlar
-- Avtomatik generatsiya qilingan src/data/catalog.ts dan.
-- ---------------------------------------------------------------------

-- Yo'nalishlar (kategoriyalar)
insert into public.categories (slug, name, image_url, sort_order) values
  ('fuel', '{"uz":"Yoqilg''i quyish texnikasi","uzc":"Ёқилғи қуйиш техникаси","ru":"Топливозаправочная техника","en":"Fuel Service Vehicles"}'::jsonb, 'asset:veh-fuel-tanker', 1),
  ('municipal', '{"uz":"Kommunal texnika","uzc":"Коммунал техника","ru":"Коммунальная техника","en":"Municipal Vehicles"}'::jsonb, 'asset:veh-sweeper', 2),
  ('airport', '{"uz":"Aeroport xizmat texnikasi","uzc":"Аэропорт хизмат техникаси","ru":"Аэропортовая техника","en":"Airport Service Vehicles"}'::jsonb, 'asset:veh-ambulift', 3),
  ('emergency', '{"uz":"Favqulodda yordam texnikasi","uzc":"Фавқулодда ёрдам техникаси","ru":"Аварийно-спасательная техника","en":"Emergency Response Vehicles"}'::jsonb, 'asset:veh-ambulance', 4),
  ('fire', '{"uz":"Yong''in o''chirish texnikasi","uzc":"Ёнғин ўчириш техникаси","ru":"Пожарная техника","en":"Firefighting Vehicles"}'::jsonb, 'asset:veh-fire', 5),
  ('lifting', '{"uz":"Ko''tarish texnikasi","uzc":"Кўтариш техникаси","ru":"Подъёмная техника","en":"Lifting Equipment"}'::jsonb, 'asset:veh-crane', 6),
  ('utility', '{"uz":"Kommunal-xizmat texnikasi","uzc":"Коммунал-хизмат техникаси","ru":"Сервисная техника","en":"Utility Vehicles"}'::jsonb, 'asset:veh-water-tanker', 7),
  ('special', '{"uz":"Maxsus muhandislik texnikasi","uzc":"Махсус муҳандислик техникаси","ru":"Специальная инженерная техника","en":"Special Engineering Vehicles"}'::jsonb, 'asset:veh-workshop', 8)
on conflict (slug) do nothing;

-- Texnika modellari
insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'fuel-tanker', '{"uz":"Avtotoplivozapravshik","uzc":"Автотопливозаправшик","ru":"Автотопливозаправщик","en":"Fuel Tank Truck"}'::jsonb, '{"uz":"Yoqilg''ini xavfsiz tashish va quyish uchun maxsus avtosisterna, hisoblagich va nasos tizimi bilan jihozlangan.","uzc":"Ёқилғини хавфсиз ташиш ва қуйиш учун махсус автосистерна, ҳисоблагич ва насос тизими билан жиҳозланган.","ru":"Автоцистерна для безопасной перевозки и заправки топливом, оснащённая счётчиком и насосной системой.","en":"Special tanker for safe transport and dispensing of fuel, equipped with metering and pump systems."}'::jsonb, 'asset:veh-fuel-tanker',
       '["asset:veh-fuel-tanker"]'::jsonb, null, true, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"10 000 – 25 000 L"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"MAN / Isuzu / KamAZ"},{"label":{"uz":"To''liq massa","uzc":"Тўлиқ масса","ru":"Полная масса","en":"Gross weight"},"value":"18 – 32 t"}]'::jsonb, 1
from public.categories c where c.slug = 'fuel'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'road-maintenance', '{"uz":"Kombinatsiyalangan yo''l mashinasi","uzc":"Комбинациялаштирилган йўл машинаси","ru":"Комбинированная дорожная машина","en":"Combined Road Maintenance Vehicle"}'::jsonb, '{"uz":"Yil davomida yo''llarni parvarishlash uchun ko''p funksiyali mashina: qor tozalash, reagent sepish va yuvish.","uzc":"Йил давомида йўлларни парваришлаш учун кўп функцияли машина: қор тозалаш, реагент сепиш ва ювиш.","ru":"Многофункциональная машина для круглогодичного содержания дорог: уборка снега, распределение реагентов и мойка.","en":"Multi-function vehicle for year-round road maintenance: snow clearing, de-icer spreading and washing."}'::jsonb, 'asset:veh-roadmaint',
       '["asset:veh-roadmaint"]'::jsonb, null, false, '[{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Yo''l xizmati"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Universal"},{"label":{"uz":"To''liq massa","uzc":"Тўлиқ масса","ru":"Полная масса","en":"Gross weight"},"value":"18 – 26 t"}]'::jsonb, 2
from public.categories c where c.slug = 'municipal'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'water-sprinkler', '{"uz":"Polivomoechnaya mashina","uzc":"Поливомоечная машина","ru":"Поливомоечная машина","en":"Water Sprinkler Truck"}'::jsonb, '{"uz":"Ko''cha va yo''llarni yuvish, sug''orish va changni bostirish uchun suv sepuvchi mashina.","uzc":"Кўча ва йўлларни ювиш, суғориш ва чангни бостириш учун сув сепувчи машина.","ru":"Машина для мойки и полива улиц и дорог, а также для пылеподавления.","en":"Sprinkler truck for washing, watering streets and roads, and dust suppression."}'::jsonb, 'asset:veh-sweeper',
       '["asset:veh-sweeper"]'::jsonb, null, true, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"6 000 – 12 000 L"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu / Howo"},{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Kommunal"}]'::jsonb, 3
from public.categories c where c.slug = 'municipal'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'drinking-water', '{"uz":"Ichimlik suvi sisternasi","uzc":"Ичимлик суви систернаси","ru":"Цистерна для питьевой воды","en":"Drinking Water Tanker"}'::jsonb, '{"uz":"Ichimlik suvini gigiyenik tashish uchun zanglamaydigan po''latdan tayyorlangan izolyatsiyalangan sisterna.","uzc":"Ичимлик сувини гигиеник ташиш учун зангламайдиган пўлатдан тайёрланган изоляцияланган систерна.","ru":"Изолированная цистерна из нержавеющей стали для гигиеничной перевозки питьевой воды.","en":"Insulated stainless-steel tanker for hygienic transport of drinking water."}'::jsonb, 'asset:veh-water-tanker',
       '["asset:veh-water-tanker"]'::jsonb, null, false, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"5 000 – 16 000 L"},{"label":{"uz":"Material","uzc":"Материал","ru":"Материал","en":"Material"},"value":"AISI 304"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Universal"}]'::jsonb, 4
from public.categories c where c.slug = 'utility'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'milk-tanker', '{"uz":"Molokovoz","uzc":"Молоковоз","ru":"Молоковоз","en":"Milk Tanker"}'::jsonb, '{"uz":"Sutni sovuq holatda tashish uchun termoizolyatsiyalangan zanglamaydigan po''lat sisterna.","uzc":"Сутни совуқ ҳолатда ташиш учун термоизоляцияланган зангламайдиган пўлат систерна.","ru":"Термоизолированная цистерна из нержавеющей стали для перевозки молока в охлаждённом виде.","en":"Thermally insulated stainless-steel tanker for chilled milk transport."}'::jsonb, 'asset:veh-water-tanker',
       '["asset:veh-water-tanker"]'::jsonb, null, false, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"4 000 – 18 000 L"},{"label":{"uz":"Sektsiyalar","uzc":"Секциялар","ru":"Секции","en":"Sections"},"value":"1 – 3"},{"label":{"uz":"Material","uzc":"Материал","ru":"Материал","en":"Material"},"value":"AISI 304"}]'::jsonb, 5
from public.categories c where c.slug = 'utility'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'technical-water', '{"uz":"Texnik suv sisternasi","uzc":"Техник сув систернаси","ru":"Цистерна для технической воды","en":"Technical Water Tanker"}'::jsonb, '{"uz":"Texnik suvni qurilish va sanoat maydonlariga yetkazib berish uchun avtosisterna.","uzc":"Техник сувни қурилиш ва саноат майдонларига етказиб бериш учун автосистерна.","ru":"Автоцистерна для доставки технической воды на строительные и промышленные объекты.","en":"Tanker for delivering technical water to construction and industrial sites."}'::jsonb, 'asset:veh-water-tanker',
       '["asset:veh-water-tanker"]'::jsonb, null, false, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"8 000 – 20 000 L"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ / Howo"},{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Sanoat"}]'::jsonb, 6
from public.categories c where c.slug = 'utility'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'vacuum-sewer', '{"uz":"Assenizator","uzc":"Ассенизатор","ru":"Ассенизаторская машина","en":"Vacuum Sewer Truck"}'::jsonb, '{"uz":"Suyuq chiqindilarni vakuum yordamida so''rib olish va tashish uchun assenizatsiya mashinasi.","uzc":"Суюқ чиқиндиларни вакуум ёрдамида сўриб олиш ва ташиш учун ассенизация машинаси.","ru":"Ассенизаторская машина для вакуумного сбора и вывоза жидких отходов.","en":"Vacuum truck for suction collection and transport of liquid waste."}'::jsonb, 'asset:veh-sewer-truck',
       '["asset:veh-sewer-truck"]'::jsonb, null, true, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"5 000 – 15 000 L"},{"label":{"uz":"Vakuum nasosi","uzc":"Вакуум насоси","ru":"Вакуумный насос","en":"Vacuum pump"},"value":"Battioni / Jurop"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu / KamAZ"}]'::jsonb, 7
from public.categories c where c.slug = 'municipal'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'combined-sewer', '{"uz":"Kombinatsiyalangan kanal yuvish mashinasi","uzc":"Комбинациялаштирилган канал ювиш машинаси","ru":"Комбинированная каналопромывочная машина","en":"Combined Sewer Cleaning Vehicle"}'::jsonb, '{"uz":"Kanalizatsiya tarmoqlarini yuqori bosimda yuvish va so''rib tozalash uchun kombinatsiyalangan mashina.","uzc":"Канализация тармоқларини юқори босимда ювиш ва сўриб тозалаш учун комбинациялаштирилган машина.","ru":"Комбинированная машина для промывки канализационных сетей под высоким давлением и вакуумной откачки.","en":"Combined machine for high-pressure jetting and vacuum cleaning of sewer networks."}'::jsonb, 'asset:veh-sewer-truck',
       '["asset:veh-sewer-truck"]'::jsonb, null, false, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"8 000 – 16 000 L"},{"label":{"uz":"Bosim","uzc":"Босим","ru":"Давление","en":"Pressure"},"value":"150 – 200 bar"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Howo / MAN"}]'::jsonb, 8
from public.categories c where c.slug = 'municipal'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'airport-sanitation', '{"uz":"Aeroport assenizatsiya mashinasi","uzc":"Аэропорт ассенизация машинаси","ru":"Аэропортовая ассенизаторская машина","en":"Airport Service Vehicle"}'::jsonb, '{"uz":"Aeroportlarda samolyot hojatxonalarini xizmat ko''rsatish uchun maxsus assenizatsiya mashinasi.","uzc":"Аэропортларда самолёт ҳожатхоналарини хизмат кўрсатиш учун махсус ассенизация машинаси.","ru":"Специальная машина для обслуживания туалетных систем самолётов в аэропортах.","en":"Special vehicle for servicing aircraft lavatory systems at airports."}'::jsonb, 'asset:veh-sewer-truck',
       '["asset:veh-sewer-truck"]'::jsonb, null, false, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"1 000 – 3 000 L"},{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Aeroport"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu"}]'::jsonb, 9
from public.categories c where c.slug = 'airport'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'ambulift', '{"uz":"Ambulift","uzc":"Амбулифт","ru":"Амбулифт","en":"Ambulift"}'::jsonb, '{"uz":"Harakatlanishi cheklangan yo''lovchilarni samolyotga chiqarish va tushirish uchun ko''taruvchi mashina.","uzc":"Ҳаракатланиши чекланган йўловчиларни самолётга чиқариш ва тушириш учун кўтарувчи машина.","ru":"Подъёмная машина для посадки и высадки пассажиров с ограниченной подвижностью в самолёт.","en":"Lift vehicle for boarding and deboarding passengers with reduced mobility to aircraft."}'::jsonb, 'asset:veh-ambulift',
       '["asset:veh-ambulift"]'::jsonb, null, true, '[{"label":{"uz":"Ko''tarish balandligi","uzc":"Кўтариш баландлиги","ru":"Высота подъёма","en":"Lift height"},"value":"2.5 – 5.8 m"},{"label":{"uz":"Yuk ko''tarish","uzc":"Юк кўтариш","ru":"Грузоподъёмность","en":"Capacity"},"value":"1 500 kg"},{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Aeroport"}]'::jsonb, 10
from public.categories c where c.slug = 'airport'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'vacuum-sweeper', '{"uz":"Vakuumli yo''l supurish mashinasi","uzc":"Вакуумли йўл супуриш машинаси","ru":"Вакуумная подметально-уборочная машина","en":"Vacuum Road Sweeper"}'::jsonb, '{"uz":"Ko''cha va yo''llarni cho''tka va vakuum tizimi bilan tozalovchi supurish mashinasi.","uzc":"Кўча ва йўлларни чўтка ва вакуум тизими билан тозаловчи супуриш машинаси.","ru":"Подметально-уборочная машина для очистки улиц и дорог щётками и вакуумной системой.","en":"Sweeper that cleans streets and roads with brushes and a vacuum system."}'::jsonb, 'asset:veh-sweeper',
       '["asset:veh-sweeper"]'::jsonb, null, false, '[{"label":{"uz":"Bunker","uzc":"Бункер","ru":"Бункер","en":"Hopper"},"value":"4 – 7 m³"},{"label":{"uz":"Suv baki","uzc":"Сув баки","ru":"Бак воды","en":"Water tank"},"value":"1 000 – 2 000 L"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu"}]'::jsonb, 11
from public.categories c where c.slug = 'municipal'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'chemical-tanker', '{"uz":"Kimyoviy moddalar tashuvchi sisterna","uzc":"Кимёвий моддалар ташувчи систерна","ru":"Цистерна для перевозки химических веществ","en":"Chemical Tank Truck"}'::jsonb, '{"uz":"Agressiv kimyoviy suyuqliklarni xavfsiz tashish uchun maxsus qoplamali avtosisterna (ADR).","uzc":"Агрессив кимёвий суюқликларни хавфсиз ташиш учун махсус қопламали автосистерна (ADR).","ru":"Автоцистерна со специальным покрытием для безопасной перевозки агрессивных химических жидкостей (ADR).","en":"Tanker with special lining for safe transport of aggressive chemical liquids (ADR)."}'::jsonb, 'asset:veh-fuel-tanker',
       '["asset:veh-fuel-tanker"]'::jsonb, null, false, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"10 000 – 24 000 L"},{"label":{"uz":"Standart","uzc":"Стандарт","ru":"Стандарт","en":"Standard"},"value":"ADR"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"MAN / KamAZ"}]'::jsonb, 12
from public.categories c where c.slug = 'fuel'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'aerial-platform', '{"uz":"Teleskopik avtovishka","uzc":"Телескопик автовишка","ru":"Телескопический автовышка","en":"Aerial Platform Truck"}'::jsonb, '{"uz":"Balandlikdagi ishlar uchun teleskopik strelali ko''taruvchi platforma (avtovishka).","uzc":"Баландликдаги ишлар учун телескопик стрелали кўтарувчи платформа (автовишка).","ru":"Подъёмная платформа с телескопической стрелой для работ на высоте.","en":"Telescopic boom aerial work platform for elevated tasks."}'::jsonb, 'asset:veh-aerial',
       '["asset:veh-aerial"]'::jsonb, null, true, '[{"label":{"uz":"Ish balandligi","uzc":"Иш баландлиги","ru":"Высота работы","en":"Working height"},"value":"18 – 32 m"},{"label":{"uz":"Korzina yuki","uzc":"Корзина юки","ru":"Нагрузка люльки","en":"Basket load"},"value":"250 kg"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu / KamAZ"}]'::jsonb, 13
from public.categories c where c.slug = 'lifting'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'mobile-crane', '{"uz":"Avtokran","uzc":"Автокран","ru":"Автокран","en":"Mobile Crane"}'::jsonb, '{"uz":"Og''ir yuklarni ko''tarish va o''rnatish uchun teleskopik strelali avtomobil kran.","uzc":"Оғир юкларни кўтариш ва ўрнатиш учун телескопик стрелали автомобил кран.","ru":"Автомобильный кран с телескопической стрелой для подъёма и монтажа тяжёлых грузов.","en":"Truck-mounted telescopic crane for lifting and installing heavy loads."}'::jsonb, 'asset:veh-crane',
       '["asset:veh-crane"]'::jsonb, null, true, '[{"label":{"uz":"Yuk ko''tarish","uzc":"Юк кўтариш","ru":"Грузоподъёмность","en":"Lifting capacity"},"value":"16 – 50 t"},{"label":{"uz":"Strela","uzc":"Стрела","ru":"Стрела","en":"Boom"},"value":"21 – 40 m"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ / Howo"}]'::jsonb, 14
from public.categories c where c.slug = 'lifting'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'crane-manipulator', '{"uz":"Kran-manipulyator","uzc":"Кран-манипулятор","ru":"Кран-манипулятор","en":"Crane Manipulator"}'::jsonb, '{"uz":"Yuk platformasi va bukiluvchi gidravlik kran bilan jihozlangan ko''p maqsadli mashina.","uzc":"Юк платформаси ва букилувчи гидравлик кран билан жиҳозланган кўп мақсадли машина.","ru":"Многоцелевая машина с грузовой платформой и складной гидравлической крановой установкой.","en":"Versatile truck with cargo bed and folding hydraulic loader crane."}'::jsonb, 'asset:veh-manipulator',
       '["asset:veh-manipulator"]'::jsonb, null, false, '[{"label":{"uz":"Kran momenti","uzc":"Кран моменти","ru":"Момент крана","en":"Crane moment"},"value":"7 – 15 t·m"},{"label":{"uz":"Platforma","uzc":"Платформа","ru":"Платформа","en":"Platform"},"value":"5 – 7 m"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu"}]'::jsonb, 15
from public.categories c where c.slug = 'lifting'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'tow-truck', '{"uz":"Evakuator","uzc":"Эвакуатор","ru":"Эвакуатор","en":"Tow Truck"}'::jsonb, '{"uz":"Avtomobillarni ko''tarib tashish uchun gidravlik qiyaluvchi platformali evakuator.","uzc":"Автомобилларни кўтариб ташиш учун гидравлик қиялувчи платформали эвакуатор.","ru":"Эвакуатор с гидравлической наклонной платформой для перевозки автомобилей.","en":"Tow truck with hydraulic tilting platform for transporting vehicles."}'::jsonb, 'asset:veh-tow',
       '["asset:veh-tow"]'::jsonb, null, false, '[{"label":{"uz":"Platforma uzunligi","uzc":"Платформа узунлиги","ru":"Длина платформы","en":"Platform length"},"value":"5 – 6.5 m"},{"label":{"uz":"Lebyodka","uzc":"Лебёдка","ru":"Лебёдка","en":"Winch"},"value":"5 t"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Isuzu / KamAZ"}]'::jsonb, 16
from public.categories c where c.slug = 'lifting'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'garbage-truck', '{"uz":"Musorovoz","uzc":"Мусоровоз","ru":"Мусоровоз","en":"Garbage Truck"}'::jsonb, '{"uz":"Maishiy chiqindilarni yig''ish va presslab tashish uchun musor tashuvchi mashina.","uzc":"Маиший чиқиндиларни йиғиш ва прессдаб ташиш учун мусор ташувчи машина.","ru":"Мусоровоз для сбора, прессования и вывоза бытовых отходов.","en":"Refuse truck for collecting, compacting and transporting household waste."}'::jsonb, 'asset:veh-garbage',
       '["asset:veh-garbage"]'::jsonb, null, true, '[{"label":{"uz":"Bunker","uzc":"Бункер","ru":"Бункер","en":"Body"},"value":"10 – 18 m³"},{"label":{"uz":"Presslash","uzc":"Прессдаш","ru":"Прессование","en":"Compaction"},"value":"1:5"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Howo / Isuzu"}]'::jsonb, 17
from public.categories c where c.slug = 'municipal'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'mobile-lab', '{"uz":"Mobil laboratoriya","uzc":"Мобил лаборатория","ru":"Мобильная лаборатория","en":"Mobile Laboratory"}'::jsonb, '{"uz":"Dala sharoitida tahlil va sinovlar o''tkazish uchun jihozlangan mobil laboratoriya.","uzc":"Дала шароитида таҳлил ва синовлар ўтказиш учун жиҳозланган мобил лаборатория.","ru":"Мобильная лаборатория, оборудованная для проведения анализов и испытаний в полевых условиях.","en":"Mobile laboratory equipped for field analysis and testing."}'::jsonb, 'asset:veh-workshop',
       '["asset:veh-workshop"]'::jsonb, null, false, '[{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Laboratoriya"},{"label":{"uz":"Quvvat manbai","uzc":"Қувват манбаи","ru":"Электропитание","en":"Power supply"},"value":"Generator"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Universal"}]'::jsonb, 18
from public.categories c where c.slug = 'special'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'fire-truck', '{"uz":"Yong''in o''chirish avtomobili","uzc":"Ёнғин ўчириш автомобили","ru":"Пожарный автомобиль","en":"Fire Truck"}'::jsonb, '{"uz":"Yong''inni o''chirish uchun suv-ko''pik tizimi va nasos bilan jihozlangan yong''in mashinasi.","uzc":"Ёнғинни ўчириш учун сув-кўпик тизими ва насос билан жиҳозланган ёнғин машинаси.","ru":"Пожарный автомобиль с водопенной системой и насосом для тушения пожаров.","en":"Fire engine equipped with water-foam system and pump for firefighting."}'::jsonb, 'asset:veh-fire',
       '["asset:veh-fire"]'::jsonb, null, true, '[{"label":{"uz":"Sig''imi","uzc":"Сиғими","ru":"Объём","en":"Capacity"},"value":"3 000 – 8 000 L"},{"label":{"uz":"Nasos","uzc":"Насос","ru":"Насос","en":"Pump"},"value":"40 L/s"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ / MAN"}]'::jsonb, 19
from public.categories c where c.slug = 'fire'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'ambulance', '{"uz":"Tez yordam mashinasi","uzc":"Тез ёрдам машинаси","ru":"Автомобиль скорой помощи","en":"Ambulance"}'::jsonb, '{"uz":"Bemorlarni tashish va birinchi tibbiy yordam ko''rsatish uchun jihozlangan tez yordam avtomobili.","uzc":"Беморларни ташиш ва биринчи тиббий ёрдам кўрсатиш учун жиҳозланган тез ёрдам автомобили.","ru":"Автомобиль скорой помощи, оснащённый для перевозки пациентов и оказания первой медицинской помощи.","en":"Ambulance equipped for patient transport and first medical aid."}'::jsonb, 'asset:veh-ambulance',
       '["asset:veh-ambulance"]'::jsonb, null, false, '[{"label":{"uz":"Klass","uzc":"Класс","ru":"Класс","en":"Class"},"value":"A / B / C"},{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Tibbiyot"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Transit / Sprinter"}]'::jsonb, 20
from public.categories c where c.slug = 'emergency'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'parm-workshop', '{"uz":"Mobil ta''mirlash ustaxonasi (PARM)","uzc":"Мобил таъмирлаш устахонаси (ПАРМ)","ru":"Мобильная ремонтная мастерская (ПАРМ)","en":"Mobile Workshop (PARM)"}'::jsonb, '{"uz":"Texnikani dala sharoitida ta''mirlash uchun asbob-uskuna va jihozlar bilan to''liq jihozlangan ustaxona.","uzc":"Техникани дала шароитида таъмирлаш учун асбоб-ускуна ва жиҳозлар билан тўлиқ жиҳозланган устахона.","ru":"Полностью оснащённая мастерская с инструментом и оборудованием для ремонта техники в полевых условиях.","en":"Fully equipped workshop with tools and machinery for field repair of equipment."}'::jsonb, 'asset:veh-workshop',
       '["asset:veh-workshop"]'::jsonb, null, false, '[{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Ta''mirlash"},{"label":{"uz":"Jihoz","uzc":"Жиҳоз","ru":"Оснащение","en":"Equipment"},"value":"Welder, compressor, crane"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ"}]'::jsonb, 21
from public.categories c where c.slug = 'special'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'engineering-transport', '{"uz":"Muhandislik uskunalarini tashish avtomobili","uzc":"Муҳандислик ускуналарини ташиш автомобили","ru":"Автомобиль для перевозки инженерного оборудования","en":"Engineering Equipment Transporter"}'::jsonb, '{"uz":"Muhandislik va maxsus uskunalarni xavfsiz tashish uchun jihozlangan transport mashinasi.","uzc":"Муҳандислик ва махсус ускуналарни хавфсиз ташиш учун жиҳозланган транспорт машинаси.","ru":"Транспортная машина для безопасной перевозки инженерного и специального оборудования.","en":"Transport vehicle equipped for the safe carriage of engineering and special equipment."}'::jsonb, 'asset:veh-workshop',
       '["asset:veh-workshop"]'::jsonb, null, false, '[{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Transport"},{"label":{"uz":"To''liq massa","uzc":"Тўлиқ масса","ru":"Полная масса","en":"Gross weight"},"value":"12 – 26 t"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"Universal"}]'::jsonb, 22
from public.categories c where c.slug = 'special'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'logging-station', '{"uz":"Karotaj stansiyasi","uzc":"Каротаж станцияси","ru":"Каротажная станция","en":"Mobile Logging Station"}'::jsonb, '{"uz":"Quduqlarda geofizik karotaj ishlarini bajarish uchun maxsus jihozlangan mobil stansiya.","uzc":"Қудуқларда геофизик каротаж ишларини бажариш учун махсус жиҳозланган мобил станция.","ru":"Мобильная станция, оснащённая для проведения геофизических каротажных работ в скважинах.","en":"Mobile station equipped for geophysical well-logging operations."}'::jsonb, 'asset:veh-workshop',
       '["asset:veh-workshop"]'::jsonb, null, false, '[{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Geofizika"},{"label":{"uz":"Lebyodka","uzc":"Лебёдка","ru":"Лебёдка","en":"Winch"},"value":"5 000 m"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ / Ural"}]'::jsonb, 23
from public.categories c where c.slug = 'special'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'rescue-vehicle', '{"uz":"Avariya-qutqaruv avtomobili","uzc":"Авария-қутқарув автомобили","ru":"Аварийно-спасательный автомобиль","en":"Emergency Rescue Vehicle"}'::jsonb, '{"uz":"Favqulodda vaziyatlarda qutqaruv ishlari uchun maxsus asbob-uskunalar bilan jihozlangan avtomobil.","uzc":"Фавқулодда вазиятларда қутқарув ишлари учун махсус асбоб-ускуналар билан жиҳозланган автомобил.","ru":"Автомобиль, оснащённый специальным оборудованием для проведения аварийно-спасательных работ.","en":"Vehicle equipped with special tools for rescue operations in emergencies."}'::jsonb, 'asset:veh-workshop',
       '["asset:veh-workshop"]'::jsonb, null, false, '[{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Qutqaruv"},{"label":{"uz":"Jihoz","uzc":"Жиҳоз","ru":"Оснащение","en":"Equipment"},"value":"Hydraulic tools, generator"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ"}]'::jsonb, 24
from public.categories c where c.slug = 'emergency'
on conflict (slug) do nothing;

insert into public.products (category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order)
select c.id, 'explosives-transport', '{"uz":"Portlovchi moddalarni tashish avtomobili","uzc":"Портловчи моддаларни ташиш автомобили","ru":"Автомобиль для перевозки взрывчатых веществ","en":"Explosives Transport Vehicle"}'::jsonb, '{"uz":"Portlovchi moddalarni xavfsizlik talablariga to''liq mos holda tashish uchun maxsus avtomobil (ADR).","uzc":"Портловчи моддаларни хавфсизлик талабларига тўлиқ мос ҳолда ташиш учун махсус автомобил (ADR).","ru":"Специальный автомобиль для перевозки взрывчатых веществ в полном соответствии с требованиями безопасности (ADR).","en":"Special vehicle for transporting explosives in full compliance with safety requirements (ADR)."}'::jsonb, 'asset:veh-workshop',
       '["asset:veh-workshop"]'::jsonb, null, false, '[{"label":{"uz":"Standart","uzc":"Стандарт","ru":"Стандарт","en":"Standard"},"value":"ADR Class 1"},{"label":{"uz":"Qo''llanilishi","uzc":"Қўлланилиши","ru":"Применение","en":"Application"},"value":"Maxsus yuk"},{"label":{"uz":"Shassi","uzc":"Шасси","ru":"Шасси","en":"Chassis"},"value":"KamAZ"}]'::jsonb, 25
from public.categories c where c.slug = 'special'
on conflict (slug) do nothing;

-- Bosh sahifadagi raqamlar
-- DIQQAT: "25+" -> "40+" ga o'zgartirildi, "8 / Texnika yo'nalishlari" olib tashlandi.
insert into public.site_stats (value, label, sort_order) values
  ('2019', '{"uz":"Tashkil topgan","uzc":"Ташкил топган","ru":"Год основания","en":"Established"}'::jsonb, 1),
  ('40+', '{"uz":"Texnika modellari","uzc":"Техника моделлари","ru":"Моделей техники","en":"Vehicle models"}'::jsonb, 2),
  ('100%', '{"uz":"Sifat nazorati","uzc":"Сифат назорати","ru":"Контроль качества","en":"Quality control"}'::jsonb, 3)
on conflict do nothing;
