-- =====================================================================
-- MCITY — Bog'lanish: xarita va kelgan xabarlar
--
-- 1. site_settings ga xarita koordinatalari qo'shiladi (adminda tahrirlanadi)
-- 2. contact_messages jadvali — saytdan yuborilgan xabarlar shu yerga tushadi
--
-- Xavfsizlik: mehmon faqat XABAR YOZA oladi, o'qiy olmaydi.
-- Boshqalarning xabarlarini faqat tizimga kirgan admin ko'radi.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Xarita koordinatalari
-- ---------------------------------------------------------------------
alter table public.site_settings
  add column if not exists map_lat  double precision,
  add column if not exists map_lng  double precision,
  add column if not exists map_zoom integer;

-- Boshlang'ich qiymat — Toshkent markazi.
-- ANIQ joyni admin panelida o'zingiz qo'yasiz.
update public.site_settings
   set map_lat  = coalesce(map_lat, 41.2995),
       map_lng  = coalesce(map_lng, 69.2401),
       map_zoom = coalesce(map_zoom, 15)
 where id = 'main';


-- ---------------------------------------------------------------------
-- 2. Kelgan xabarlar
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  phone      text        not null,
  email      text,
  message    text        not null,
  -- qaysi sahifadan yuborilgani: "contact" | "quote"
  source     text        not null default 'contact',
  -- foydalanuvchi qaysi tilda yozgani
  lang       text,
  is_read    boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_new_idx
  on public.contact_messages (is_read, created_at desc);

alter table public.contact_messages enable row level security;

-- Mehmon faqat YOZADI. O'qish siyosati berilmagan — ya'ni
-- begona odam boshqalarning xabarlarini ko'ra olmaydi.
drop policy if exists "contact_messages_anon_insert" on public.contact_messages;
create policy "contact_messages_anon_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- Admin hammasini ko'radi va boshqaradi
drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
  on public.contact_messages for select
  to authenticated
  using (true);

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update"
  on public.contact_messages for update
  to authenticated
  using (true) with check (true);

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete"
  on public.contact_messages for delete
  to authenticated
  using (true);
