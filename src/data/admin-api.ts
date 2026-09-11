import { supabase } from "@/lib/supabase";
import { staticSettings, type Loc, type SiteSettings } from "./catalog";

/**
 * Admin panel bazadagi qatorlar bilan to'g'ridan-to'g'ri ishlaydi
 * (saytdagi ko'rinishga aylantirilgan nusxa bilan emas), shuning uchun
 * bu yerda alohida tiplar bor.
 */

export interface AdminCategory {
  id: string;
  slug: string;
  name: Loc;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface SpecRow {
  label: Loc;
  value: string;
}

export interface AdminProduct {
  id?: string;
  category_id: string | null;
  slug: string;
  name: Loc;
  description: Loc;
  image_url: string | null;
  gallery: string[];
  price_uzs: number | null;
  bestseller: boolean;
  specs: SpecRow[];
  sort_order: number;
  is_published: boolean;
}

export interface AdminStat {
  id?: string;
  value: string;
  label: Loc;
  sort_order: number;
  is_published: boolean;
}

export const EMPTY_LOC: Loc = { uz: "", uzc: "", ru: "", en: "" };

export const emptyProduct = (sortOrder = 0): AdminProduct => ({
  category_id: null,
  slug: "",
  name: { ...EMPTY_LOC },
  description: { ...EMPTY_LOC },
  image_url: "asset:veh-fuel-tanker",
  gallery: [],
  price_uzs: null,
  bestseller: false,
  specs: [],
  sort_order: sortOrder,
  is_published: true,
});

export const emptyStat = (sortOrder = 0): AdminStat => ({
  value: "",
  label: { ...EMPTY_LOC },
  sort_order: sortOrder,
  is_published: true,
});

function client() {
  if (!supabase) throw new Error("Supabase ulanmagan. Lovable'da 'Connect Supabase' tugmasini bosing.");
  return supabase;
}

/**
 * So'rov osilib qolmasligi uchun vaqt chegarasi.
 *
 * Internet uzilsa yoki Supabase javob bermasa, so'rov abadiy kutib turadi
 * va panelda aylanuvchi doira to'xtamaydi. Shuning uchun har bir so'rovga
 * chegara qo'yamiz — chegaradan oshsa aniq xato beriladi.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Bazadan javob kelmadi. Internet aloqasini tekshiring.")),
      ms,
    );
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/* ----------------------------- O'qish ----------------------------- */

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await withTimeout(
    client()
      .from("categories")
      .select("id, slug, name, image_url, sort_order, is_published")
      .order("sort_order", { ascending: true }),
  );
  if (error) throw error;
  return (data ?? []) as AdminCategory[];
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await withTimeout(
    client()
      .from("products")
      .select(
        "id, category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs, sort_order, is_published",
      )
      .order("sort_order", { ascending: true }),
  );
  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as AdminProduct),
    name: { ...EMPTY_LOC, ...((row.name ?? {}) as Partial<Loc>) },
    description: { ...EMPTY_LOC, ...((row.description ?? {}) as Partial<Loc>) },
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    specs: Array.isArray(row.specs)
      ? (row.specs as SpecRow[]).map((s) => ({
          label: { ...EMPTY_LOC, ...((s?.label ?? {}) as Partial<Loc>) },
          value: String(s?.value ?? ""),
        }))
      : [],
    price_uzs: row.price_uzs == null ? null : Number(row.price_uzs),
  }));
}

export async function fetchAdminStats(): Promise<AdminStat[]> {
  const { data, error } = await withTimeout(
    client()
      .from("site_stats")
      .select("id, value, label, sort_order, is_published")
      .order("sort_order", { ascending: true }),
  );
  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as AdminStat),
    label: { ...EMPTY_LOC, ...((row.label ?? {}) as Partial<Loc>) },
  }));
}

/* ----------------------------- Yozish ----------------------------- */

export async function saveProduct(p: AdminProduct): Promise<void> {
  const payload = {
    category_id: p.category_id,
    slug: p.slug.trim(),
    name: p.name,
    description: p.description,
    image_url: p.image_url,
    gallery: p.gallery.length ? p.gallery : p.image_url ? [p.image_url] : [],
    price_uzs: p.price_uzs,
    bestseller: p.bestseller,
    specs: p.specs,
    sort_order: p.sort_order,
    is_published: p.is_published,
  };

  const { error } = p.id
    ? await client().from("products").update(payload).eq("id", p.id)
    : await client().from("products").insert(payload);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await client().from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function saveStat(s: AdminStat): Promise<void> {
  const payload = {
    value: s.value,
    label: s.label,
    sort_order: s.sort_order,
    is_published: s.is_published,
  };

  const { error } = s.id
    ? await client().from("site_stats").update(payload).eq("id", s.id)
    : await client().from("site_stats").insert(payload);

  if (error) throw error;
}

export async function deleteStat(id: string): Promise<void> {
  const { error } = await client().from("site_stats").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------- Sayt ma'lumotlari (footer) ------------------- */

/** Bazada bitta qator bo'ladi: id = 'main' */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await withTimeout(
    client()
      .from("site_settings")
      .select(
        "about, address, tagline, phone, phones, email, facebook, instagram, linkedin, telegram, catalog_pdf_url, catalog_pdf_name, catalog_pdf_updated_at, map_lat, map_lng, map_zoom",
      )
      .eq("id", "main")
      .maybeSingle(),
  );
  if (error) throw error;
  if (!data) return { ...staticSettings };

  const row = data as Record<string, unknown>;
  const loc = (v: unknown) => ({ ...EMPTY_LOC, ...((v ?? {}) as Partial<Loc>) });
  return {
    about: loc(row.about),
    address: loc(row.address),
    tagline: loc(row.tagline),
    phones: (() => {
      const list = Array.isArray(row.phones)
        ? (row.phones as unknown[]).map((v) => String(v ?? "").trim()).filter(Boolean)
        : [];
      if (list.length) return list;
      const single = String(row.phone ?? "").trim();
      return single ? [single] : [];
    })(),
    email: String(row.email ?? ""),
    facebook: String(row.facebook ?? ""),
    instagram: String(row.instagram ?? ""),
    linkedin: String(row.linkedin ?? ""),
    telegram: String(row.telegram ?? ""),
    catalogPdfUrl: String(row.catalog_pdf_url ?? ""),
    catalogPdfName: String(row.catalog_pdf_name ?? ""),
    catalogPdfUpdatedAt: String(row.catalog_pdf_updated_at ?? ""),
    mapLat: Number(row.map_lat ?? staticSettings.mapLat),
    mapLng: Number(row.map_lng ?? staticSettings.mapLng),
    mapZoom: Number(row.map_zoom ?? staticSettings.mapZoom),
  };
}

export async function saveSiteSettings(s: SiteSettings): Promise<void> {
  // Baza ustun nomlari snake_case, shuning uchun aniq moslashtiramiz
  const payload = {
    id: "main",
    about: s.about,
    address: s.address,
    tagline: s.tagline,
    // Birinchi raqam eski `phone` ustuniga ham yoziladi — moslik uchun
    phone: s.phones[0] ?? null,
    phones: s.phones.map((x) => x.trim()).filter(Boolean),
    email: s.email,
    facebook: s.facebook,
    instagram: s.instagram,
    linkedin: s.linkedin,
    telegram: s.telegram,
    catalog_pdf_url: s.catalogPdfUrl || null,
    catalog_pdf_name: s.catalogPdfName || null,
    catalog_pdf_updated_at: s.catalogPdfUpdatedAt || null,
    map_lat: Number.isFinite(s.mapLat) ? s.mapLat : null,
    map_lng: Number.isFinite(s.mapLng) ? s.mapLng : null,
    map_zoom: Number.isFinite(s.mapZoom) ? s.mapZoom : null,
  };

  const { error } = await client().from("site_settings").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

/* --------------------- PDF katalogni yuklash ---------------------- */

/** Supabase Storage'dagi papka nomi */
export const CATALOG_BUCKET = "catalog";

/** Ruxsat etilgan maksimal hajm — 50 MB (Supabase Free tarifidagi eng katta qiymat) */
export const CATALOG_MAX_BYTES = 50 * 1024 * 1024;

/**
 * PDF katalogni Supabase Storage'ga yuklaydi va havolasini
 * site_settings jadvaliga yozadi.
 *
 * Fayl har safar bir xil nom bilan saqlanadi (`catalog.pdf`) va
 * `upsert: true` bilan ustiga yoziladi — eski fayllar to'planib qolmaydi
 * va havola o'zgarmaydi.
 */
export async function uploadCatalogPdf(file: File): Promise<SiteSettings> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Faqat PDF fayl yuklash mumkin.");
  }
  if (file.size > CATALOG_MAX_BYTES) {
    throw new Error(
      `Fayl juda katta (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal hajm ${Math.round(
        CATALOG_MAX_BYTES / 1024 / 1024,
      )} MB.`,
    );
  }

  const supa = client();

  const { error: uploadError } = await supa.storage
    .from(CATALOG_BUCKET)
    .upload("catalog.pdf", file, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "3600",
    });
  if (uploadError) throw uploadError;

  const { data } = supa.storage.from(CATALOG_BUCKET).getPublicUrl("catalog.pdf");

  // Keshni chetlab o'tish uchun havolaga vaqt belgisini qo'shamiz —
  // aks holda brauzer eski PDF'ni ko'rsatib turaveradi
  const now = new Date().toISOString();
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const current = await fetchSiteSettings();
  const next: SiteSettings = {
    ...current,
    catalogPdfUrl: url,
    catalogPdfName: file.name,
    catalogPdfUpdatedAt: now,
  };
  await saveSiteSettings(next);
  return next;
}

/** PDF katalogni o'chiradi */
export async function removeCatalogPdf(): Promise<SiteSettings> {
  const supa = client();
  const { error } = await supa.storage.from(CATALOG_BUCKET).remove(["catalog.pdf"]);
  // Fayl allaqachon yo'q bo'lsa ham davom etamiz — asosiysi havolani tozalash
  if (error && !/not found/i.test(error.message)) throw error;

  const current = await fetchSiteSettings();
  const next: SiteSettings = {
    ...current,
    catalogPdfUrl: "",
    catalogPdfName: "",
    catalogPdfUpdatedAt: "",
  };
  await saveSiteSettings(next);
  return next;
}

/* ------------------------ Kelgan xabarlar ------------------------- */

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: string;
  lang: string | null;
  is_read: boolean;
  created_at: string;
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  const { data, error } = await withTimeout(
    client()
      .from("contact_messages")
      .select("id, name, phone, email, message, source, lang, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  );
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function markMessageRead(id: string, isRead: boolean): Promise<void> {
  const { error } = await client()
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await client().from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}
