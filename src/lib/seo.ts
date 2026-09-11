import type { Lang } from "@/i18n/translations";
import {
  HREFLANG,
  OG_LOCALE,
  SITE_NAME,
  SITE_URL,
  URL_LANGS,
  absoluteUrl,
  alternatesFor,
  urlFor,
  type PageKey,
} from "./site";

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

type LinkTag = { rel: string; href: string; hrefLang?: string };

export interface SeoInput {
  lang: Lang;
  page: PageKey;
  /** mahsulot sahifasi uchun */
  productSlug?: string;
  title: string;
  description: string;
  /** rasm — nisbiy yo'l ham bo'ladi, absolyutga aylantiriladi */
  image?: string;
  imageAlt?: string;
  /** "website" | "article" | "product" */
  type?: string;
  /** qidiruv tizimlari indekslamasin */
  noindex?: boolean;
  /** canonical'ni qo'lda berish (masalan filtr sahifalari uchun) */
  canonicalOverride?: string;
  /**
   * Manzilga qo'shiladigan so'rov qismi, masalan "?cat=lifting".
   * canonical va barcha hreflang variantlariga bir xil qo'shiladi —
   * shunda kategoriya sahifalari ham mustaqil sahifa bo'lib indekslanadi.
   */
  query?: string;
}

/**
 * Sahifaning barcha SEO teglarini bir joyda yig'adi:
 * title, description, robots, canonical, hreflang, Open Graph va Twitter.
 *
 * MUHIM: canonical har doim SHU sahifaning O'Z tilidagi manziliga ishora
 * qiladi. Bir tildagi sahifa boshqa tildagi sahifaning canonical'i
 * bo'lmaydi — hreflang esa barcha variantlarni bog'laydi.
 */
export function buildSeo(input: SeoInput): { meta: MetaTag[]; links: LinkTag[] } {
  const {
    lang,
    page,
    productSlug,
    title,
    description,
    image,
    imageAlt,
    type = "website",
    noindex = false,
    canonicalOverride,
    query = "",
  } = input;

  const canonical = canonicalOverride ?? urlFor(lang, page, productSlug) + query;
  const ogImage = absoluteUrl(image || "/og-default.jpg");

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    {
      name: "robots",
      content: noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },

    // Open Graph
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: imageAlt || title },
    { property: "og:locale", content: OG_LOCALE[lang] },

    // Twitter / X
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: imageAlt || title },
  ];

  // Boshqa tillardagi og:locale:alternate
  for (const l of URL_LANGS) {
    if (l !== lang) meta.push({ property: "og:locale:alternate", content: OG_LOCALE[l] });
  }

  const links: LinkTag[] = [{ rel: "canonical", href: canonical }];

  // hreflang — noindex sahifalarga kerak emas
  if (!noindex) {
    for (const alt of alternatesFor(page, productSlug)) {
      links.push({ rel: "alternate", hrefLang: alt.hreflang, href: alt.href + query });
    }
    links.push({
      rel: "alternate",
      hrefLang: "x-default",
      href: urlFor("uz", page, productSlug) + query,
    });
  }

  return { meta, links };
}

/** Barcha sahifalar uchun umumiy <link> teglari */
export const COMMON_LINKS: LinkTag[] = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "dns-prefetch", href: SITE_URL },
];

/** hreflang ro'yxatini boshqa joylarda ham ishlatish uchun */
export { HREFLANG };
