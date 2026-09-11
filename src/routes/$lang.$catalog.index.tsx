import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { ProductsPage, type CatalogSearch } from "@/pages/products";
import { loadCatalog } from "@/data/catalog-source";
import { buildSeo } from "@/lib/seo";
import {
  breadcrumbSchema,
  itemListSchema,
  jsonLd,
  organizationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";
import {
  CATALOG_SLUG,
  DEFAULT_LANG,
  isLang,
  langOfCatalogSlug,
  urlFor,
} from "@/lib/site";
import {
  CATALOG_HEADING,
  CATALOG_SUBHEADING,
  CATEGORY_DESCRIPTION,
  CATEGORY_TITLE,
  PAGE_SEO,
} from "@/i18n/seo-copy";
import { translations, type Lang } from "@/i18n/translations";
import { useLang } from "@/i18n/LanguageContext";
import { useCatalog } from "@/data/useCatalog";

/**
 * Katalog sahifasi.
 *
 *   /uz/maxsus-texnika
 *   /ru/specztehnika
 *   /en/special-equipment
 *
 * `?cat=` bilan filtrlangan ko'rinish alohida indekslanadigan
 * kategoriya sahifasi hisoblanadi — o'z title, description va
 * canonical'iga ega.
 */
export const Route = createFileRoute("/$lang/$catalog/")({
  validateSearch: (s: Record<string, unknown>): CatalogSearch => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),

  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
    const lang = params.lang as Lang;

    // Katalog manzili shu tilga to'g'ri kelmasa —
    // boshqa tilnikimi, tekshiramiz va 301 bilan to'g'rilaymiz
    if (params.catalog !== CATALOG_SLUG[lang]) {
      if (langOfCatalogSlug(params.catalog)) {
        throw redirect({
          href: `/${lang}/${CATALOG_SLUG[lang]}`,
          statusCode: 301,
          replace: true,
        });
      }
      throw notFound();
    }
  },

  loader: async () => await loadCatalog(),

  head: ({ params, loaderData, match }) => {
    const lang: Lang = isLang(params.lang) ? (params.lang as Lang) : DEFAULT_LANG;
    const search = (match.search ?? {}) as CatalogSearch;
    const catalog = loaderData ?? { products: [], categories: [], settings: null };

    const category = catalog.categories.find((c) => c.id === search.cat);
    const inCategory = category
      ? catalog.products.filter((p) => p.categoryId === category.id)
      : catalog.products;

    // Ichki qidiruv natijalari indekslanmaydi (Google tavsiyasi)
    const isSearch = Boolean(search.q);

    const title = category
      ? CATEGORY_TITLE[lang](category.name[lang])
      : PAGE_SEO.catalog.title[lang];

    const description = category
      ? CATEGORY_DESCRIPTION[lang](category.name[lang], inCategory.length)
      : PAGE_SEO.catalog.description[lang];

    const query = category && !isSearch ? `?cat=${encodeURIComponent(category.id)}` : "";

    const { meta, links } = buildSeo({
      lang,
      page: "catalog",
      title,
      description,
      image: inCategory[0]?.image,
      noindex: isSearch,
      query,
    });

    if (isSearch) return { meta, links };

    const t = (k: string) => translations[lang][k] ?? k;
    const crumbs = [
      { name: t("nav.home"), url: urlFor(lang, "home") },
      { name: t("nav.products"), url: urlFor(lang, "catalog") },
    ];
    if (category) {
      crumbs.push({ name: category.name[lang], url: urlFor(lang, "catalog") + query });
    }

    return {
      meta,
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd(
            catalog.settings ? organizationSchema(catalog.settings, lang) : {},
            websiteSchema(lang),
            webPageSchema({ lang, page: "catalog", name: title, description }),
            breadcrumbSchema(crumbs),
            itemListSchema({ lang, products: inCategory, name: title }),
          ),
        },
      ],
    };
  },

  component: CatalogRoute,
});

function CatalogRoute() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { lang } = useLang();
  const { categories } = useCatalog();

  // Kategoriya tanlanganda H1 o'sha kategoriya nomi bo'ladi —
  // bu sahifani qidiruv tizimlari uchun aniqroq qiladi
  const category = categories.find((c) => c.id === search.cat);

  return (
    <ProductsPage
      search={search}
      onSearchChange={(next) => navigate({ search: () => next })}
      heading={category ? category.name[lang] : CATALOG_HEADING[lang]}
      subheading={category ? undefined : CATALOG_SUBHEADING[lang]}
    />
  );
}
