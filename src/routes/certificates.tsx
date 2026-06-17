import { createFileRoute } from "@tanstack/react-router";
import { Award, ShieldCheck, FileBadge, BadgeCheck } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates & Licenses — STEELPROM" },
      { name: "description", content: "STEELPROM products are certified to international standards including ISO 9001, CE and GOST." },
      { property: "og:title", content: "Certificates & Licenses — STEELPROM" },
      { property: "og:url", content: "/certificates" },
    ],
    links: [{ rel: "canonical", href: "/certificates" }],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const { t } = useLang();
  const certs = [
    { Icon: ShieldCheck, name: "ISO 9001:2015", desc: "Quality Management" },
    { Icon: Award, name: "ISO 14001", desc: "Environmental Management" },
    { Icon: BadgeCheck, name: "CE Marking", desc: "European Conformity" },
    { Icon: FileBadge, name: "GOST R", desc: "Russian Standard" },
    { Icon: ShieldCheck, name: "OHSAS 18001", desc: "Occupational Safety" },
    { Icon: Award, name: "O'zStandart", desc: "Uzbekistan Standard" },
  ];
  return (
    <Layout>
      <PageHeader title={t("page.certificates.title")} subtitle={t("certs.subtitle")} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((c) => (
          <div key={c.name} className="flex flex-col items-center rounded-sm border border-border bg-card p-8 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary"><c.Icon className="h-8 w-8" /></span>
            <h3 className="mt-5 font-display text-2xl font-bold">{c.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}