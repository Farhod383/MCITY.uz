import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingCart, Check, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useLang } from "@/i18n/LanguageContext";
import { getProduct, products, type Product } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name.en} — MCITY` : "Product — MCITY" },
        { name: "description", content: p?.description.en ?? "Industrial product details." },
        { property: "og:title", content: p?.name.en ?? "Product" },
        { property: "og:type", content: "product" },
        { property: "og:image", content: p?.image ?? "" },
        { property: "og:url", content: p ? `/products/${p.id}` : "/products" },
      ],
      links: [{ rel: "canonical", href: p ? `/products/${p.id}` : "/products" }],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <Layout><div className="mx-auto max-w-7xl px-4 py-32 text-center"><p className="text-xl">404 — Product not found</p></div></Layout>
  ),
  errorComponent: () => (
    <Layout><div className="mx-auto max-w-7xl px-4 py-32 text-center"><p className="text-xl">Something went wrong.</p></div></Layout>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { t, lang, formatPrice } = useLang();
  const { add, setOpen } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/products"><ArrowLeft className="h-4 w-4" /> {t("nav.products")}</Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-sm border border-border bg-secondary">
              <img src={product.gallery[activeImg]} alt={product.name[lang]} width={800} height={800} className="aspect-square w-full object-cover" />
            </div>
            {product.gallery.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.gallery.map((g: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-20 overflow-hidden rounded-sm border-2 transition-colors ${activeImg === i ? "border-accent" : "border-border"}`}>
                    <img src={g} alt="" width={80} height={80} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">{product.name[lang]}</h1>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-sm font-medium text-primary"><Check className="h-4 w-4 text-accent" /> {t("product.inStock")}</div>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{product.description[lang]}</p>

            <div className="mt-7 font-display text-4xl font-extrabold">
              {product.priceUzs ? formatPrice(product.priceUzs) : <span className="text-2xl text-muted-foreground">{t("product.priceOnRequest")}</span>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {product.priceUzs ? (
                <Button variant="industrial" size="xl" onClick={() => { add(product.id); toast.success(t("cta.addCart")); setOpen(true); }}>
                  <ShoppingCart className="h-5 w-5" /> {t("cta.addCart")}
                </Button>
              ) : (
                <Button asChild variant="hero" size="xl"><Link to="/contact">{t("cta.quote")}</Link></Button>
              )}
              <Button asChild variant="outline" size="xl"><Link to="/checkout">{t("cta.order")}</Link></Button>
            </div>

            {/* Specs */}
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold uppercase">{t("product.specs")}</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
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
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">{t("product.related")}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}