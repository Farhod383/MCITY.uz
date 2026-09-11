// Migratsiya faylining o'zini o'qiymiz — nusxa saqlamaymiz, shunda
// SQL o'zgarsa panel ham avtomatik yangilanadi.
import SETUP_SQL_RAW from "../../supabase/migrations/HAMMASI-BIRGA.sql?raw";

export const SETUP_SQL: string = SETUP_SQL_RAW;

/**
 * Supabase SQL Editor'ining to'g'ridan-to'g'ri havolasi.
 *
 * VITE_SUPABASE_URL dan loyiha kodini ajratib olamiz:
 *   https://zmagamwoupmmufxwgbcp.supabase.co  ->  zmagamwoupmmufxwgbcp
 */
export function supabaseSqlEditorUrl(): string | null {
  const url = (import.meta.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  if (!url) return null;
  const ref = url.match(/^https?:\/\/([a-z0-9]+)\.supabase\.(co|in)/i)?.[1];
  if (!ref) return null;
  return `https://supabase.com/dashboard/project/${ref}/sql/new`;
}

/** Xato matni "jadval yo'q" degani bo'lsa — true */
export function isMissingTableError(err: unknown): boolean {
  const msg = (err as Error | null)?.message ?? "";
  return /schema cache|does not exist|could not find the table|relation .* does not exist/i.test(msg);
}

/**
 * Bazadan kelgan xatoni tushunarli xabarga aylantiradi.
 * Saqlash tugmalarida ishlatiladi.
 */
export function friendlyDbError(err: unknown): string {
  const msg = (err as Error | null)?.message ?? "Noma'lum xatolik";
  if (isMissingTableError(err)) {
    return "Baza hali sozlanmagan — saqlab bo'lmadi. «Sozlash» bo'limiga o'ting va SQL'ni bir marta bajaring.";
  }
  if (/row-level security|permission denied/i.test(msg)) {
    return "Ruxsat yo'q. Tizimdan chiqib, qaytadan kiring.";
  }
  if (/bucket not found/i.test(msg)) {
    return "Storage papkasi topilmadi. «Sozlash» bo'limidagi SQL'ni bajaring.";
  }
  if (/exceeded the maximum allowed size|payload too large/i.test(msg)) {
    return "Fayl juda katta. Supabase 50 MB gacha qabul qiladi.";
  }
  if (/duplicate key|unique constraint/i.test(msg)) {
    return "Bunday manzil nomi (slug) allaqachon band. Boshqa nom tanlang.";
  }
  return msg;
}
