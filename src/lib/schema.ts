import type { Lang } from "@/i18n/translations";
import type { Product, SiteSettings } from "@/data/catalog";
import { HTML_LANG, SITE_NAME, SITE_URL, absoluteUrl, urlFor, type PageKey } from "./site";

/**
 * Schema.org (JSON-LD) — Google uchun tuzilgan ma'lumot.
 *
 * QOIDA: mavjud bo'lmagan ma'lumot o'ylab topilmaydi. Narx bo'lmasa
 * `offers` qo'shilmaydi, sharh (review) yoki reyting umuman yozilmaydi,
 * chunki saytda ular yo'q — soxta ma'lumot Google jazosiga olib keladi.
 */

type Json = Record<string, unknown>;

/* ------------------------------ Organization ----------------------------- */

export function organizationSchema(settings: SiteSettings, lang: Lang): Json {
  const sameAs = [settings.facebook, settings.instagram, settings.linkedin, settings.telegram]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);

  const org: Json = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Machinery City",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo-mcity.png"),
    },
    description: settings.about[lang],
    foundingDate: "2019",
  };

  if (settings.address[lang]) {
    org.address = {
      "@type": "PostalAddress",
      streetAddress: settings.address[lang],
      addressCountry: "UZ",
      addressLocality: "Tashkent",
    };
  }

  // Har bir telefon raqami alohida contactPoint bo'ladi
  const contacts: Json[] = settings.phones
    .filter((t) => t && t.trim())
    .map((telephone) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone,
      availableLanguage: ["uz", "ru", "en"],
    }));

  if (settings.email) {
    contacts.push({
      "@type": "ContactPoint",
      contactType: "customer support",
      email: settings.email,
      availableLanguage: ["uz", "ru", "en"],
    });
  }

  if (contacts.length) org.contactPoint = contacts;

  if (sameAs.length) org.sameAs = sameAs;

  return org;
}

/* -------------------------------- WebSite -------------------------------- */

export function websiteSchema(lang: Lang): Json {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: HTML_LANG[lang],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/* -------------------------------- WebPage -------------------------------- */

export function webPageSchema(opts: {
  lang: Lang;
  page: PageKey;
  productSlug?: string;
  name: string;
  description: string;
}): Json {
  const url = urlFor(opts.lang, opts.page, opts.productSlug);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: HTML_LANG[opts.lang],
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

/* ----------------------------- BreadcrumbList ---------------------------- */

export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/* -------------------------------- Product -------------------------------- */

export function productSchema(opts: {
  product: Product;
  categoryName: string;
  lang: Lang;
  brand?: string;
}): Json {
  const { product, categoryName, lang, brand = SITE_NAME } = opts;
  const url = urlFor(lang, "product", product.id);

  const schema: Json = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name[lang],
    description: product.description[lang],
    sku: product.id,
    category: categoryName,
    url,
    image: (product.gallery.length ? product.gallery : [product.image]).map(absoluteUrl),
    brand: { "@type": "Brand", name: brand },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    inLanguage: HTML_LANG[lang],
  };

  // Texnik xususiyatlar
  if (product.specs.length) {
    schema.additionalProperty = product.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label[lang],
      value: s.value,
    }));
  }

  // Narx faqat HAQIQATAN mavjud bo'lsa yoziladi.
  // Narx yo'q bo'lsa `offers` umuman qo'shilmaydi — Google soxta narxni
  // jazolaydi, "0" yoki "so'rov bo'yicha" deb yozish ham xato.
  if (typeof product.priceUzs === "number" && product.priceUzs > 0) {
    schema.offers = {
      "@type": "Offer",
      url,
      price: String(product.priceUzs),
      priceCurrency: "UZS",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    };
  }

  return schema;
}

/* ------------------------------- ItemList -------------------------------- */

export function itemListSchema(opts: {
  lang: Lang;
  products: Product[];
  name: string;
}): Json {
  return {
    "@type": "ItemList",
    name: opts.name,
    numberOfItems: opts.products.length,
    itemListElement: opts.products.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: urlFor(opts.lang, "product", p.id),
      name: p.name[opts.lang],
    })),
  };
}

/* ------------------------------ Yig'uvchi -------------------------------- */

/**
 * Bir nechta schema'ni bitta `@graph` ichiga joylaydi — Google shuni afzal
 * ko'radi va sahifada bitta JSON-LD blok bo'ladi.
 */
export function jsonLd(...nodes: Json[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  });
}
