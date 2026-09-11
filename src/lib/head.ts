import type { Lang } from "@/i18n/translations";
import { PAGE_SEO } from "@/i18n/seo-copy";
import { staticSettings } from "@/data/catalog";
import { buildSeo } from "./seo";
import { jsonLd, organizationSchema, webPageSchema, websiteSchema } from "./schema";
import { DEFAULT_LANG, isLang, type PageKey } from "./site";

/**
 * Oddiy (mahsulot bo'lmagan) sahifalar uchun `head` ni bir qatorda yig'adi:
 * title, description, canonical, hreflang, Open Graph, Twitter va JSON-LD.
 *
 * Mahsulot va katalog sahifalari o'z fayllarida boyroq ma'lumot bilan
 * to'ldiriladi.
 */
export function seoHeadFor(opts: {
  lang: string;
  page: PageKey;
  noindex?: boolean;
  image?: string;
}) {
  const lang: Lang = isLang(opts.lang) ? (opts.lang as Lang) : DEFAULT_LANG;
  const copy = PAGE_SEO[opts.page] ?? PAGE_SEO.home;

  const title = copy.title[lang];
  const description = copy.description[lang];

  const { meta, links } = buildSeo({
    lang,
    page: opts.page,
    title,
    description,
    image: opts.image,
    noindex: opts.noindex,
    type: opts.page === "home" ? "website" : "website",
  });

  return {
    meta,
    links,
    scripts: opts.noindex
      ? []
      : [
          {
            type: "application/ld+json",
            children: jsonLd(
              organizationSchema(staticSettings, lang),
              websiteSchema(lang),
              webPageSchema({ lang, page: opts.page, name: title, description }),
            ),
          },
        ],
  };
}
