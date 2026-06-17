import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Gem, ArrowRight } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import factory from "@/assets/factory-exterior.jpg";
import hero from "@/assets/hero-factory.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MCITY Industrial Manufacturing" },
      { name: "description", content: "MCITY has been manufacturing premium industrial products since 2019, serving international clients with quality and reliability." },
      { property: "og:title", content: "About — MCITY" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useLang();
  const mvv = [
    { Icon: Target, title: { uz: "Bizning vazifamiz", uzc: "Бизнинг вазифамиз", ru: "Наша миссия", en: "Our Mission" }, text: { uz: "Sanoat korxonalarini yuqori sifatli, ishonchli mahsulotlar bilan ta'minlash.", uzc: "Саноат корхоналарини юқори сифатли, ишончли маҳсулотлар билан таъминлаш.", ru: "Обеспечивать промышленные предприятия качественной и надёжной продукцией.", en: "To supply industrial enterprises with high-quality, reliable products." } },
    { Icon: Eye, title: { uz: "Bizning maqsadimiz", uzc: "Бизнинг мақсадимиз", ru: "Наше видение", en: "Our Vision" }, text: { uz: "Mintaqadagi yetakchi ishlab chiqaruvchiga aylanish.", uzc: "Минтақадаги етакчи ишлаб чиқарувчига айланиш.", ru: "Стать ведущим производителем в регионе.", en: "To become the leading manufacturer in the region." } },
    { Icon: Gem, title: { uz: "Bizning qadriyatlar", uzc: "Бизнинг қадриятлар", ru: "Наши ценности", en: "Our Values" }, text: { uz: "Sifat, halollik va mijozga sodiqlik.", uzc: "Сифат, ҳалоллик ва мижозга содиқлик.", ru: "Качество, честность и преданность клиенту.", en: "Quality, integrity and customer commitment." } },
  ];
  return (
    <Layout>
      <PageHeader title={t("page.about.title")} subtitle={t("footer.about")} />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <img src={factory} alt="MCITY factory" width={1280} height={960} loading="lazy" className="rounded-sm object-cover shadow-elevated" />
        <div>
          <div className="h-1 w-16 gradient-accent" />
          <h2 className="mt-5 font-display text-3xl font-extrabold uppercase">{t("since.title")}</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">{t("since.text")}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{t("hero.subtitle")}</p>
          <Button asChild variant="hero" className="mt-7"><Link to="/contact">{t("cta.contactUs")} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
      <section className="bg-secondary py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3">
          {mvv.map(({ Icon, title, text }) => (
            <div key={title.en} className="rounded-sm border border-border bg-card p-7 shadow-card">
              <span className="grid h-12 w-12 place-items-center rounded-sm bg-primary text-primary-foreground"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-5 font-display text-xl font-bold">{title[lang]}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{text[lang]}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" width={1920} height={1080} loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 text-center sm:px-6 md:grid-cols-4">
          {[["5+", "stats.years"], ["120+", "stats.products"], ["350+", "stats.clients"], ["18", "stats.countries"]].map(([v, k]) => (
            <div key={k}><p className="font-display text-4xl font-extrabold text-white md:text-5xl">{v}</p><p className="mt-1 text-sm uppercase tracking-wide text-white/70">{t(k)}</p></div>
          ))}
        </div>
      </section>
    </Layout>
  );
}