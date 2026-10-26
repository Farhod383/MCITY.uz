import { supabase } from "@/lib/supabase";
import { resolveImage } from "./asset-map";
import {
  staticCategories,
  staticProducts,
  staticSettings,
  staticStats,
  type Category,
  type Loc,
  type Product,
  type SiteSettings,
  type Stat,
} from "./catalog";

export interface Catalog {
  categories: Category[];
  products: Product[];
  stats: Stat[];
  settings: SiteSettings;
  /** ma'lumot qayerdan keldi — muammoni topishda yordam beradi */
  source: "supabase" | "static";
}

export const STATIC_CATALOG: Catalog = {
  categories: staticCategories,
  products: staticProducts,
  stats: staticStats,
  settings: staticSettings,
  source: "static",
};

/* --------------------------------------------------------------- */
/* Bazadagi qatorni saytdagi ko'rinishga aylantirish                */
/* --------------------------------------------------------------- */

const EMPTY_LOC: Loc = { uz: "", uzc: "", ru: "", en: "" };

/** jsonb dan kelgan tarjimani xavfsiz o'qiydi; bo'sh til boshqasi bilan to'ldiriladi */
function toLoc(raw: unknown): Loc {
  const v = (raw ?? {}) as Partial<Record<keyof Loc, string>>;
  const fallback = v.uz || v.en || v.ru || v.uzc || "";
  return {
    uz: v.uz || fallback,
    uzc: v.uzc || fallback,
    ru: v.ru || fallback,
    en: v.en || fallback,
  };
}

interface CategoryRow {
  id: string;
  slug: string;
  name: unknown;
  image_url: string | null;
}

interface ProductRow {
  id: string;
  category_id: string | null;
  slug: string;
  name: unknown;
  description: unknown;
  image_url: string | null;
  gallery: unknown;
  price_uzs: number | string | null;
  bestseller: boolean | null;
  specs: unknown;
}

interface StatRow {
  id: string;
  value: string;
  label: unknown;
}

interface SettingsRow {
  about: unknown;
  address: unknown;
  tagline: unknown;
  phone: string | null;
  phones: unknown;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  telegram: string | null;
  catalog_pdf_url: string | null;
  catalog_pdf_name: string | null;
  catalog_pdf_updated_at: string | null;
  map_lat: number | null;
  map_lng: number | null;
  map_zoom: number | null;
}

/**
 * Telefon ro'yxatini o'qiydi.
 * Yangi `phones` massivi bo'lmasa, eski bitta `phone` ustunidan oladi.
 */
function readPhones(row: SettingsRow): string[] {
  const list = Array.isArray(row.phones)
    ? (row.phones as unknown[]).map((v) => String(v ?? "").trim()).filter(Boolean)
    : [];
  if (list.length) return list;
  const single = (row.phone ?? "").trim();
  return single ? [single] : staticSettings.phones;
}

/** Bazadagi bo'sh maydonlar zaxira qiymat bilan to'ldiriladi */
function mapSettings(row: SettingsRow | null): SiteSettings {
  if (!row) return staticSettings;
  const pick = (v: string | null, fallback: string) => (v && v.trim() ? v : fallback);
  return {
    about: toLoc(row.about),
    address: toLoc(row.address),
    tagline: toLoc(row.tagline),
    phones: readPhones(row),
    email: pick(row.email, staticSettings.email),
    facebook: row.facebook ?? "",
    instagram: row.instagram ?? "",
    linkedin: row.linkedin ?? "",
    telegram: row.telegram ?? "",
    catalogPdfUrl: row.catalog_pdf_url ?? "",
    catalogPdfName: row.catalog_pdf_name ?? "",
    catalogPdfUpdatedAt: row.catalog_pdf_updated_at ?? "",
    mapLat: row.map_lat ?? staticSettings.mapLat,
    mapLng: row.map_lng ?? staticSettings.mapLng,
    mapZoom: row.map_zoom ?? staticSettings.mapZoom,
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.slug,
    name: toLoc(row.name),
    image: resolveImage(row.image_url),
  };
}

function mapProduct(row: ProductRow, categoryIdBySlug: Map<string, string>): Product {
  const gallery = Array.isArray(row.gallery) ? (row.gallery as string[]) : [];
  const image = resolveImage(row.image_url);
  const specsRaw = Array.isArray(row.specs) ? (row.specs as { label?: unknown; value?: unknown }[]) : [];

  return {
    id: row.slug,
    categoryId: categoryIdBySlug.get(row.category_id ?? "") ?? "",
    name: toLoc(row.name),
    description: toLoc(row.description),
    image,
    gallery: gallery.length ? gallery.map((g) => resolveImage(g, image)) : [image],
    priceUzs: row.price_uzs == null ? null : Number(row.price_uzs),
    bestseller: Boolean(row.bestseller),
    specs: specsRaw.map((s) => ({ label: toLoc(s.label), value: String(s.value ?? "") })),
  };
}

/* --------------------------------------------------------------- */
/* Asosiy yuklovchi                                                 */
/* --------------------------------------------------------------- */

/**
 * Katalogni Supabase'dan o'qiydi.
 *
 * Agar Supabase ulanmagan bo'lsa, xato bersa yoki baza hali bo'sh bo'lsa —
 * eski statik ma'lumotni qaytaradi. Shu sababli sayt hech qachon
 * bo'sh sahifa ko'rsatmaydi.
 */
/**
 * So'rov osilib qolmasligi uchun vaqt chegarasi.
 * Bazasi javob bermasa sahifa 8 soniyadan ortiq kutmaydi va
 * eski (statik) ma'lumot bilan ochilaveradi.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Baza javob bermadi")), ms);
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

export async function loadCatalog(): Promise<Catalog> {
  if (!supabase) return STATIC_CATALOG;

  try {
    const [catRes, prodRes, statRes, setRes] = await withTimeout(
      Promise.all([
      supabase
        .from("categories")
        .select("id, slug, name, image_url")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select("id, category_id, slug, name, description, image_url, gallery, price_uzs, bestseller, specs")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_stats")
        .select("id, value, label")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      // "*" — ustunlar ro'yxati qat'iy yozilsa, bazaga biror migratsiya
      // (masalan phones yoki map_*) hali qo'llanmagan bo'lsa butun so'rov
      // 400 qaytaradi va barcha sozlamalar (PDF katalog ham) yo'qoladi.
      // Yetishmagan ustunlarni mapSettings zaxira qiymat bilan to'ldiradi.
      supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle(),
      ]),
    );

    if (catRes.error) throw catRes.error;
    if (prodRes.error) throw prodRes.error;

    const catRows = (catRes.data ?? []) as CategoryRow[];
    const prodRows = (prodRes.data ?? []) as ProductRow[];

    // Baza hali to'ldirilmagan — eski ma'lumot bilan ishlayveramiz
    if (catRows.length === 0 && prodRows.length === 0) return STATIC_CATALOG;

    const categoryIdBySlug = new Map(catRows.map((c) => [c.id, c.slug]));
    const statRows = (statRes.error ? [] : ((statRes.data ?? []) as StatRow[]));

    return {
      categories: catRows.map(mapCategory),
      products: prodRows.map((p) => mapProduct(p, categoryIdBySlug)),
      stats: statRows.length
        ? statRows.map((s) => ({ id: s.id, value: s.value, label: toLoc(s.label) }))
        : staticStats,
      settings: mapSettings(setRes.error ? null : ((setRes.data ?? null) as SettingsRow | null)),
      source: "supabase",
    };
  } catch (err) {
    console.warn("[MCITY] Supabase'dan katalogni o'qib bo'lmadi, statik ma'lumotga qaytildi:", err);
    return STATIC_CATALOG;
  }
}
