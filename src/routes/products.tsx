import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal, FileDown } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { categories, products } from "@/data/catalog";
import { toast } from "sonner";

type Search = { cat?: string; q?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Products Catalog — MCITY" },
      { name: "description", content: "Browse the full MCITY catalog of special-purpose and municipal vehicles: tankers, cranes, fire trucks, sweepers, ambulances and more with technical specifications." },
      { property: "og:title", content: "Products Catalog — MCITY" },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t, lang } = useLang();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const [query, setQuery] = useState(search.q ?? "");
  const activeCat = search.cat;

  const setCat = (cat?: string) => navigate({ search: (p: Search) => ({ ...p, cat }) });

  const filtered = products.filter((p) => {
    const matchCat = !activeCat || p.categoryId === activeCat;
    const q = query.trim().toLowerCase();
    const matchQ = !q || p.name[lang].toLowerCase().includes(q) || p.description[lang].toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <Layout>
      <PageHeader title={t("nav.products")} subtitle={t("categories.subtitle")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("catalog.search")} className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => toast.info("PDF: MCITY-catalog-2025.pdf")}>
            <FileDown className="h-4 w-4" /> {t("cta.downloadPdf")}
          </Button>
        </div>

        {/* Category filter chips */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setCat(undefined)}
            className={`rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${!activeCat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            {t("catalog.allCategories")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${activeCat === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
            >
              {c.name[lang]}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{filtered.length} {t("catalog.results")}</p>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-lg text-muted-foreground">{t("catalog.noResults")}</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}