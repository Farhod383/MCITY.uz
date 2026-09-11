import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { loadCatalog } from "@/data/catalog-source";
import {
  HREFLANG,
  NOINDEX_PAGES,
  SITE_URL,
  URL_LANGS,
  urlFor,
  type PageKey,
} from "@/lib/site";
import type { Lang } from "@/i18n/translations";

/**
 * Sitemap — barcha til versiyalari bilan.
 *
 * Har bir <url> ichida boshqa tillarga `xhtml:link rel="alternate"`
 * qo'yiladi. Google shu orqali qaysi sahifa qaysi tildagi variant ekanini
 * aniq biladi va noto'g'ri tilni ko'rsatmaydi.
 */

const STATIC_PAGES: PageKey[] = [
  "home",
  "catalog",
  "about",
  "projects",
  "certificates",
  "news",
  "partners",
  "contact",
  "store",
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function urlEntry(opts: {
  page: PageKey;
  productSlug?: string;
  lang: Lang;
  changefreq: string;
  priority: string;
  lastmod: string;
  query?: string;
}) {
  const { page, productSlug, lang, changefreq, priority, lastmod, query = "" } = opts;

  const alternates = URL_LANGS.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${esc(
        urlFor(l, page, productSlug) + query,
      )}" />`,
  ).join("\n");

  return [
    "  <url>",
    `    <loc>${esc(urlFor(lang, page, productSlug) + query)}</loc>`,
    alternates,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(
      urlFor("uz", page, productSlug) + query,
    )}" />`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { products, categories } = await loadCatalog();
        const lastmod = new Date().toISOString().slice(0, 10);
        const entries: string[] = [];

        for (const lang of URL_LANGS) {
          // Asosiy sahifalar
          for (const page of STATIC_PAGES) {
            if (NOINDEX_PAGES.includes(page)) continue;
            entries.push(
              urlEntry({
                page,
                lang,
                lastmod,
                changefreq: page === "home" || page === "catalog" ? "weekly" : "monthly",
                priority: page === "home" ? "1.0" : page === "catalog" ? "0.9" : "0.7",
              }),
            );
          }

          // Kategoriya sahifalari (katalogning filtrlangan ko'rinishi)
          for (const c of categories) {
            entries.push(
              urlEntry({
                page: "catalog",
                lang,
                lastmod,
                changefreq: "weekly",
                priority: "0.8",
                query: `?cat=${encodeURIComponent(c.id)}`,
              }),
            );
          }

          // Mahsulotlar
          for (const p of products) {
            entries.push(
              urlEntry({
                page: "product",
                productSlug: p.id,
                lang,
                lastmod,
                changefreq: "monthly",
                priority: "0.8",
              }),
            );
          }
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
            "X-Sitemap-Base": SITE_URL,
          },
        });
      },
    },
  },
});
