import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useLang } from "@/i18n/LanguageContext";
import { products } from "@/data/catalog";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Online Store — STEELPROM" },
      { name: "description", content: "Order industrial products online from STEELPROM. Multi-currency pricing (UZS, USD, RUB), cart and checkout." },
      { property: "og:title", content: "Online Store — STEELPROM" },
      { property: "og:url", content: "/store" },
    ],
    links: [{ rel: "canonical", href: "/store" }],
  }),
  component: StorePage,
});

function StorePage() {
  const { t } = useLang();
  return (
    <Layout>
      <PageHeader title={t("page.store.title")} subtitle={t("bestsellers.subtitle")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </Layout>
  );
}