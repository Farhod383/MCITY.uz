-- =====================================================================
-- MCITY — PDF katalogni yuklash imkoniyati
--
-- Nima qiladi:
--   1. site_settings jadvaliga PDF havolasi uchun 3 ta ustun qo'shadi
--   2. Supabase Storage'da "catalog" nomli ochiq papka (bucket) yaratadi
--   3. Ruxsatlarni sozlaydi:
--        - hamma o'qiy oladi (mehmonlar PDF'ni yuklab olishi uchun)
--        - faqat admin yuklaydi, almashtiradi va o'chiradi
--
-- Bu faylni birinchi ikkita migratsiyadan KEYIN ishga tushiring.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Yangi ustunlar
-- ---------------------------------------------------------------------
alter table public.site_settings
  add column if not exists catalog_pdf_url        text,
  add column if not exists catalog_pdf_name       text,
  add column if not exists catalog_pdf_updated_at timestamptz;


-- ---------------------------------------------------------------------
-- 2. Storage papkasi
--    public = true -> fayl to'g'ridan-to'g'ri havola orqali ochiladi
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog',
  'catalog',
  true,
  52428800,                      -- 50 MB
  array['application/pdf']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = 52428800,
      allowed_mime_types = array['application/pdf'];


-- ---------------------------------------------------------------------
-- 3. Storage ruxsatlari
-- ---------------------------------------------------------------------

-- Hamma o'qiy oladi (PDF'ni yuklab olish uchun)
drop policy if exists "catalog_public_read" on storage.objects;
create policy "catalog_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'catalog');

-- Faqat tizimga kirgan admin yuklaydi
drop policy if exists "catalog_admin_insert" on storage.objects;
create policy "catalog_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalog');

-- Faqat admin almashtiradi (upsert uchun kerak)
drop policy if exists "catalog_admin_update" on storage.objects;
create policy "catalog_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalog')
  with check (bucket_id = 'catalog');

-- Faqat admin o'chiradi
drop policy if exists "catalog_admin_delete" on storage.objects;
create policy "catalog_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalog');
