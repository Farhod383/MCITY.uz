import { Layout, PageHeader } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useLang } from "@/i18n/LanguageContext";
import { useCatalog } from "@/data/useCatalog";

export function StorePage() {
  const { t } = useLang();
  const { products } = useCatalog();
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
