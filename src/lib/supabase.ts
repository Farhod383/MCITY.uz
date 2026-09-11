import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase mijozi.
 *
 * Kalitlar `.env` faylidan olinadi (Lovable "Connect Supabase" bosilganda
 * ularni o'zi qo'shadi):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY   (yoki VITE_SUPABASE_PUBLISHABLE_KEY)
 *
 * MUHIM: agar kalitlar bo'lmasa, `supabase` = null bo'ladi va sayt
 * eski statik ma'lumot bilan xuddi avvalgidek ishlayveradi. Ya'ni bu kod
 * Supabase ulanmagan holatda ham hech narsani buzmaydi.
 */

const env = import.meta.env as Record<string, string | undefined>;

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        // SSR paytida localStorage yo'q — shuning uchun faqat brauzerda saqlaymiz
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
        detectSessionInUrl: false,
        storageKey: "mcity-auth",
      },
    })
  : null;
