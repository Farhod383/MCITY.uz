import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/data/catalog";

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useLang();

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
          <span className="absolute left-3 top-3 rounded-sm bg-surface-darker/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide transition-colors group-hover:text-foreground">
            {product.name[lang]}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.description[lang]}</p>
        <div className="mt-auto flex gap-2 pt-4">
          <Button asChild variant="industrial" size="sm" className="flex-1">
            <Link to="/contact">{t("cta.quote")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm" aria-label={t("cta.details")}>
            <Link to="/products/$id" params={{ id: product.id }}><ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}