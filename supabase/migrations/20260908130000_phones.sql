-- =====================================================================
-- MCITY — bir nechta telefon raqami
--
-- Avval bitta raqam saqlanardi. Endi ro'yxat (massiv) bo'ladi, ya'ni
-- xohlagancha raqam qo'shish mumkin: bo'lim, mobil, faks va h.k.
--
-- Eski `phone` ustuni saqlanib qoladi (birinchi raqam unga ham yoziladi),
-- shuning uchun eskicha o'qiydigan joylar buzilmaydi.
-- =====================================================================

alter table public.site_settings
  add column if not exists phones jsonb not null default '[]'::jsonb;

-- Mavjud bitta raqamni ro'yxatga ko'chiramiz
update public.site_settings
   set phones = jsonb_build_array(phone)
 where id = 'main'
   and (phones is null or jsonb_array_length(phones) = 0)
   and phone is not null
   and btrim(phone) <> '';

-- Ro'yxat har doim massiv bo'lishini kafolatlaymiz
alter table public.site_settings
  drop constraint if exists site_settings_phones_is_array;
alter table public.site_settings
  add constraint site_settings_phones_is_array
  check (jsonb_typeof(phones) = 'array');
