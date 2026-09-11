import { useState } from "react";
import { ShoppingCart, Check, ArrowLeft, ChevronRight, Factory, Layers } from "lucide-react";
import { toast } from "sonner";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { L } from "@/components/L";
import { useLang } from "@/i18n/LanguageContext";
import { useCatalog } from "@/data/useCatalog";
import { useCart } from "@/store/cart";
import type { Product } from "@/data/catalog";
import { SITE_NAME } from "@/lib/site";

export function ProductDetailPage({ product }: { product: Product }) {
  const { t, lang, formatPrice } = useLang();
  const { products, categories } = useCatalog();
  const { add, setOpen } = useCart();
  const [activeImg, setActiveImg] = useState(0);

  const category = categories.find((c) => c.id === product.categoryId);
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Breadcrumbs — foydalanuvchi uchun ham, Google uchun ham */}
        <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <L page="home" className="transition-colors hover:text-foreground">
                {t("nav.home")}
              </L>
            </li>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <li>
              <L page="catalog" className="transition-colors hover:text-foreground">
                {t("nav.products")}
              </L>
            </li>
            {category && (
              <>
                <ChevronRight aria-hidden className="h-3.5 w-3.5" />
                <li>
                  <L
                    page="catalog"
                    search={{ cat: category.id }}
                    className="transition-colors hover:text-foreground"
                  >
                    {category.name[lang]}
                  </L>
                </li>
              </>
            )}
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <li aria-current="page" className="font-medium text-foreground">
              {product.name[lang]}
            </li>
          </ol>
        </nav>

        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <L page="catalog">
            <ArrowLeft className="h-4 w-4" /> {t("nav.products")}
          </L>
        </Button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Galereya */}
          <div>
            <div className="overflow-hidden rounded-sm border border-border bg-secondary">
              <img
                src={product.gallery[activeImg]}
                alt={`${product.name[lang]} — ${SITE_NAME}`}
                width={800}
                height={800}
                fetchPriority="high"
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.gallery.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.gallery.map((g: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`${product.name[lang]} — ${i + 1}`}
                    className={`h-20 w-20 overflow-hidden rounded-sm border-2 transition-colors ${
                      activeImg === i ? "border-accent" : "border-border"
                    }`}
                  >
                    <img
                      src={g}
                      alt={`${product.name[lang]} ${i + 1}`}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ma'lumot */}
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
              {product.name[lang]}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-sm font-medium text-primary">
                <Check className="h-4 w-4 text-accent" /> {t("product.inStock")}
              </span>
              {category && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" /> {category.name[lang]}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-sm text-muted-foreground">
                <Factory className="h-4 w-4" /> {SITE_NAME}
              </span>
            </div>

            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {product.description[lang]}
            </p>

            <div className="mt-7 font-display text-4xl font-extrabold">
              {product.priceUzs ? (
                formatPrice(product.priceUzs)
              ) : (
                <span className="text-2xl text-muted-foreground">{t("product.priceOnRequest")}</span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {product.priceUzs ? (
                <Button
                  variant="industrial"
                  size="xl"
                  onClick={() => {
                    add(product.id);
                    toast.success(t("cta.addCart"));
                    setOpen(true);
                  }}
                >
                  <ShoppingCart className="h-5 w-5" /> {t("cta.addCart")}
                </Button>
              ) : (
                <Button asChild variant="hero" size="xl">
                  <L page="contact">{t("cta.quote")}</L>
                </Button>
              )}
              <Button asChild variant="outline" size="xl">
                <L page="checkout">{t("cta.order")}</L>
              </Button>
            </div>

            {/* Texnik xususiyatlar */}
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold uppercase">{t("product.specs")}</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 pr-4 text-muted-foreground">{t("product.model")}</td>
                    <td className="py-3 font-medium">{product.name[lang]}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 pr-4 text-muted-foreground">{t("product.manufacturer")}</td>
                    <td className="py-3 font-medium">{SITE_NAME}</td>
                  </tr>
                  {category && (
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 text-muted-foreground">{t("product.category")}</td>
                      <td className="py-3 font-medium">{category.name[lang]}</td>
                    </tr>
                  )}
                  {product.specs.map((s: Product["specs"][number], i: number) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 pr-4 text-muted-foreground">{s.label[lang]}</td>
                      <td className="py-3 font-medium">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              {t("product.related")}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
