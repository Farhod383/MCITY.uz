import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Layout } from "@/components/layout/Layout";
import { ProductDetailPage } from "@/pages/product-detail";
import { loadCatalog } from "@/data/catalog-source";
import { buildSeo } from "@/lib/seo";
import {
  breadcrumbSchema,
  jsonLd,
  organizationSchema,
  productSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";
import { PRODUCT_DESCRIPTION, PRODUCT_TITLE } from "@/i18n/seo-copy";
import { translations, type Lang } from "@/i18n/translations";
import {
  CATALOG_SLUG,
  DEFAULT_LANG,
  isLang,
  langOfCatalogSlug,
  urlFor,
} from "@/lib/site";

/**
 * Mahsulot sahifasi.
 *
 *   /uz/maxsus-texnika/fuel-tanker
 *   /ru/specztehnika/fuel-tanker
 *   /en/special-equipment/fuel-tanker
 *
 * Ma'lumot serverda yuklanadi (SSR), shuning uchun Google JavaScript'ni
 * ishga tushirmasdan ham mahsulot nomi, tavsifi va xususiyatlarini ko'radi.
 */
export const Route = createFileRoute("/$lang/$catalog/$id")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
    const lang = params.lang as Lang;

    if (params.catalog !== CATALOG_SLUG[lang]) {
      if (langOfCatalogSlug(params.catalog)) {
        throw redirect({
          href: `/${lang}/${CATALOG_SLUG[lang]}/${params.id}`,
          statusCode: 301,
          replace: true,
        });
      }
      throw notFound();
    }
  },

  loader: async ({ params }) => {
    const catalog = await loadCatalog();
    const product = catalog.products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    const category = catalog.categories.find((c) => c.id === product.categoryId);
    return { product, category, settings: catalog.settings };
  },

  head: ({ params, loaderData }) => {
    const lang: Lang = isLang(params.lang) ? (params.lang as Lang) : DEFAULT_LANG;
    const product = loaderData?.product;
    if (!product) return {};

    const categoryName = loaderData?.category?.name[lang] ?? "";
    const name = product.name[lang];

    // Tavsifni qisqartiramiz — meta description ~160 belgidan oshmasin
    const summary = product.description[lang].split(". ")[0] + ".";
    const title = PRODUCT_TITLE[lang](name);
    const description = PRODUCT_DESCRIPTION[lang](name, categoryName, summary).slice(0, 300);

    const { meta, links } = buildSeo({
      lang,
      page: "product",
      productSlug: product.id,
      title,
      description,
      image: product.image,
      imageAlt: name,
      type: "product",
    });

    const t = (k: string) => translations[lang][k] ?? k;
    const crumbs = [
      { name: t("nav.home"), url: urlFor(lang, "home") },
      { name: t("nav.products"), url: urlFor(lang, "catalog") },
    ];
    if (loaderData?.category) {
      crumbs.push({
        name: categoryName,
        url: `${urlFor(lang, "catalog")}?cat=${encodeURIComponent(loaderData.category.id)}`,
      });
    }
    crumbs.push({ name, url: urlFor(lang, "product", product.id) });

    return {
      meta,
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd(
            loaderData?.settings ? organizationSchema(loaderData.settings, lang) : {},
            websiteSchema(lang),
            webPageSchema({
              lang,
              page: "product",
              productSlug: product.id,
              name: title,
              description,
            }),
            breadcrumbSchema(crumbs),
            productSchema({ product, categoryName, lang }),
          ),
        },
      ],
    };
  },

  component: ProductRoute,

  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <p className="text-xl">404 — Mahsulot topilmadi</p>
      </div>
    </Layout>
  ),

  errorComponent: () => (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <p className="text-xl">Sahifani yuklashda xatolik yuz berdi.</p>
      </div>
    </Layout>
  ),
});

function ProductRoute() {
  const { product } = Route.useLoaderData();
  return <ProductDetailPage product={product} />;
}
