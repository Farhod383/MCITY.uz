import { Handshake } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { useLang } from "@/i18n/LanguageContext";

export function PartnersPage() {
  const { t } = useLang();
  const partners = ["TechBuild", "MetalGroup", "Global Industries", "UzSteel", "ProMash", "EcoEnergy", "MegaConstruct", "IndustrialPro", "SteelWorks", "PowerGrid", "MachineCorp", "BuildMaster"];
  return (
    <Layout>
      <PageHeader title={t("page.partners.title")} subtitle={t("partners.subtitle")} />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 sm:grid-cols-3 lg:grid-cols-4">
        {partners.map((p) => (
          <div key={p} className="flex h-28 flex-col items-center justify-center gap-2 rounded-sm border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
            <Handshake className="h-6 w-6 text-accent" />
            <span className="font-display text-lg font-bold text-muted-foreground">{p}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
