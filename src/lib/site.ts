import type { Lang } from "@/i18n/translations";

/**
 * Sayt manzili va ko'p tilli URL strukturasi — bitta manba.
 *
 * URL ko'rinishi:
 *   /uz                          bosh sahifa
 *   /uz/maxsus-texnika           katalog
 *   /uz/maxsus-texnika/fuel-tanker   mahsulot
 *   /ru/specztehnika/fuel-tanker
 *   /en/special-equipment/fuel-tanker
 *
 * Domen `VITE_SITE_URL` orqali beriladi (masalan Lovable yoki hosting
 * sozlamalarida). Berilmasa production qiymati ishlatiladi.
 */

const RAW_SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://mcity.uz";

/** Oxiridagi "/" olib tashlanadi, canonical'lar bir xil ko'rinishda bo'lishi uchun */
export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, "");

export const SITE_NAME = "MCITY";
export const SITE_LEGAL_NAME = "MCITY — Machinery City";

/** URL'da ishlatiladigan tillar */
export const URL_LANGS = ["uz", "uzc", "ru", "en"] as const satisfies readonly Lang[];

/** Prefikssiz kirilganda yo'naltiriladigan til */
export const DEFAULT_LANG: Lang = "uz";

/** <link rel="alternate" hreflang="..."> qiymatlari */
export const HREFLANG: Record<Lang, string> = {
  uz: "uz",
  uzc: "uz-Cyrl",
  ru: "ru",
  en: "en",
};

/** <html lang="..."> qiymatlari */
export const HTML_LANG: Record<Lang, string> = {
  uz: "uz-UZ",
  uzc: "uz-Cyrl-UZ",
  ru: "ru-RU",
  en: "en-US",
};

/** Open Graph uchun locale */
export const OG_LOCALE: Record<Lang, string> = {
  uz: "uz_UZ",
  uzc: "uz_UZ",
  ru: "ru_RU",
  en: "en_US",
};

/**
 * Katalog bo'limining har bir tildagi manzili.
 * Bu qidiruv tizimlari uchun muhim — URL ham kalit so'z hisoblanadi.
 */
export const CATALOG_SLUG: Record<Lang, string> = {
  uz: "maxsus-texnika",
  uzc: "maxsus-texnika",
  ru: "specztehnika",
  en: "special-equipment",
};

export type PageKey =
  | "home"
  | "catalog"
  | "product"
  | "about"
  | "projects"
  | "certificates"
  | "news"
  | "partners"
  | "contact"
  | "store"
  | "checkout";

/** Tilga bog'liq bo'lmagan bo'limlar */
const STATIC_SEGMENT: Record<
  Exclude<PageKey, "home" | "catalog" | "product">,
  string
> = {
  about: "about",
  projects: "projects",
  certificates: "certificates",
  news: "news",
  partners: "partners",
  contact: "contact",
  store: "store",
  checkout: "checkout",
};

/** Qidiruv tizimlari indekslamasligi kerak bo'lgan bo'limlar */
export const NOINDEX_PAGES: PageKey[] = ["checkout"];

export function isLang(value: string | undefined): value is Lang {
  return !!value && (URL_LANGS as readonly string[]).includes(value);
}

/** Katalog manzilini tilga qarab aniqlaydi (masalan "specztehnika" -> "ru") */
export function langOfCatalogSlug(slug: string): Lang | null {
  const found = (URL_LANGS as readonly Lang[]).find((l) => CATALOG_SLUG[l] === slug);
  return found ?? null;
}

/** Ichki yo'l (pathname), domensiz */
export function pathFor(lang: Lang, page: PageKey, productSlug?: string): string {
  if (page === "home") return `/${lang}`;
  if (page === "catalog") return `/${lang}/${CATALOG_SLUG[lang]}`;
  if (page === "product") return `/${lang}/${CATALOG_SLUG[lang]}/${productSlug ?? ""}`;
  return `/${lang}/${STATIC_SEGMENT[page]}`;
}

/** To'liq absolyut manzil — canonical, og:url va sitemap uchun */
export function urlFor(lang: Lang, page: PageKey, productSlug?: string): string {
  return `${SITE_URL}${pathFor(lang, page, productSlug)}`;
}

/** Bir sahifaning barcha tildagi variantlari — hreflang uchun */
export function alternatesFor(
  page: PageKey,
  productSlug?: string,
): { lang: Lang; hreflang: string; href: string }[] {
  return (URL_LANGS as readonly Lang[]).map((lang) => ({
    lang,
    hreflang: HREFLANG[lang],
    href: urlFor(lang, page, productSlug),
  }));
}

/** Nisbiy yo'lni absolyut qiladi (og:image uchun) */
export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Manzilni bo'laklarga ajratadi — til almashtirgichda "shu sahifada qolish"
 * uchun kerak.
 */
export function parsePath(pathname: string): {
  lang: Lang;
  page: PageKey;
  productSlug?: string;
} {
  const parts = pathname.split("/").filter(Boolean);
  const lang = isLang(parts[0]) ? (parts[0] as Lang) : DEFAULT_LANG;
  const rest = isLang(parts[0]) ? parts.slice(1) : parts;

  if (rest.length === 0) return { lang, page: "home" };

  const first = rest[0];
  if (first === CATALOG_SLUG[lang] || langOfCatalogSlug(first)) {
    return rest[1]
      ? { lang, page: "product", productSlug: rest[1] }
      : { lang, page: "catalog" };
  }

  const staticKey = (Object.keys(STATIC_SEGMENT) as (keyof typeof STATIC_SEGMENT)[]).find(
    (k) => STATIC_SEGMENT[k] === first,
  );
  return { lang, page: staticKey ?? "home" };
}
