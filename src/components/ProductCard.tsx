import { Link } from "@tanstack/react-router";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { useCart } from "@/store/cart";
import type { Product } from "@/data/catalog";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { t, lang, formatPrice } = useLang();
  const { add, setOpen } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
      <Link to="/products/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name[lang]}
          width={800}
          height={800}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.bestseller && (
          <span className="absolute left-3 top-3 rounded-sm gradient-accent px-2.5 py-1 text-xs font-bold uppercase text-accent-foreground">
            TOP
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-display text-lg font-bold leading-tight transition-colors group-hover:text-accent">
            {product.name[lang]}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.description[lang]}</p>
        <div className="mt-auto pt-4">
          <p className="font-display text-xl font-bold">
            {product.priceUzs ? formatPrice(product.priceUzs) : <span className="text-base text-muted-foreground">{t("product.priceOnRequest")}</span>}
          </p>
          <div className="mt-3 flex gap-2">
            {product.priceUzs ? (
              <Button
                variant="industrial"
                size="sm"
                className="flex-1"
                onClick={() => { add(product.id); toast.success(t("cta.addCart")); setOpen(true); }}
              >
                <ShoppingCart className="h-4 w-4" /> {t("cta.addCart")}
              </Button>
            ) : (
              <Button asChild variant="hero" size="sm" className="flex-1">
                <Link to="/contact">{t("cta.quote")}</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" aria-label={t("cta.details")}>
              <Link to="/products/$id" params={{ id: product.id }}><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}