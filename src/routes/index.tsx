import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ArrowUpRight, Award, PenTool, Factory, Cog, ShieldCheck, FlaskConical,
  Gauge, MapPin,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { categories, bestsellers, products } from "@/data/catalog";
import heroImg from "@/assets/mcity-hero.jpg";
import factoryImg from "@/assets/mcity-factory.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MCITY — Special Vehicle Manufacturer in Uzbekistan" },
      { name: "description", content: "MCITY (Machinery City) manufactures special-purpose and municipal vehicles since 2019: tankers, cranes, fire trucks, sweepers and more. Full catalog and online ordering." },
      { property: "og:title", content: "MCITY — Special Vehicle Manufacturer" },
      { property: "og:description", content: "Special-purpose and municipal vehicles built in Uzbekistan since 2019. Catalog, technical specs and online ordering." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "MCITY",
        foundingDate: "2019",
        industry: "Special Vehicle Manufacturing",
        url: "/",
      }),
    }],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useLang();
  const stats = [
    { v: "2019", k: { uz: "Tashkil topgan", uzc: "Ташкил топган", ru: "Год основания", en: "Established" } },
    { v: "25+", k: { uz: "Texnika modellari", uzc: "Техника моделлари", ru: "Моделей техники", en: "Vehicle models" } },
    { v: "8", k: { uz: "Texnika yo'nalishlari", uzc: "Техника йўналишлари", ru: "Направлений", en: "Solution lines" } },
    { v: "100%", k: { uz: "Sifat nazorati", uzc: "Сифат назорати", ru: "Контроль качества", en: "Quality control" } },
  ];
  const capabilities = [
    { Icon: PenTool, k: "cap.engineering" },
    { Icon: Factory, k: "cap.production" },
    { Icon: Cog, k: "cap.assembly" },
    { Icon: ShieldCheck, k: "cap.qc" },
    { Icon: FlaskConical, k: "cap.rd" },
  ];
  const featured = bestsellers.slice(0, 3);
  const news = [
    { tag: { uz: "Zavod", uzc: "Завод", ru: "Завод", en: "Factory" }, title: { uz: "Ishlab chiqarish quvvati kengaytirildi", uzc: "Ишлаб чиқариш қуввати кенгайтирилди", ru: "Расширены производственные мощности", en: "Production capacity expanded" } },
    { tag: { uz: "Yangilik", uzc: "Янгилик", ru: "Новинка", en: "Launch" }, title: { uz: "Yangi sisterna texnikasi liniyasi", uzc: "Янги систерна техникаси линияси", ru: "Новая линейка цистерн", en: "New tanker vehicle line" } },
    { tag: { uz: "Sifat", uzc: "Сифат", ru: "Качество", en: "Quality" }, title: { uz: "Sifat nazorati standartlari yangilandi", uzc: "Сифат назорати стандартлари янгиланди", ru: "Обновлены стандарты контроля качества", en: "Quality control standards upgraded" } },
  ];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
        <img src={heroImg} alt="MCITY fleet of special-purpose trucks in front of manufacturing facility" width={1920} height={1080} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-4xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <Award className="h-4 w-4" /> {t("hero.badge")}
            </span>
            <p className="mt-8 font-display text-2xl font-extrabold uppercase tracking-[0.4em] text-white/90">MCITY</p>
            <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.98] tracking-tight text-white text-balance sm:text-7xl md:text-[5.5rem]">
              {t("hero.title")}
            </h1>
            <p className="mt-7 max-w-2xl text-lg text-white/75 md:text-xl">{t("hero.subtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="industrial" size="xl">
                <Link to="/products">{t("cta.explore")} <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outlineLight" size="xl">
                <Link to="/about">{t("cta.aboutBrand")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-border bg-surface-darker">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-4 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v} className="px-4 py-10 text-center md:py-12">
              <p className="font-display text-4xl font-extrabold text-white md:text-5xl">{s.v}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">{s.k[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2 — WHO WE ARE */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">{t("who.title")}</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">{t("since.title")}</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{t("who.text")}</p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
            {capabilities.slice(0, 4).map(({ Icon, k }) => (
              <div key={k} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
                <span className="font-display text-sm font-bold uppercase tracking-wide">{t(k)}</span>
              </div>
            ))}
          </div>
          <Button asChild variant="hero" size="lg" className="mt-10">
            <Link to="/about">{t("cta.aboutBrand")} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="order-1 overflow-hidden rounded-sm shadow-elevated lg:order-2">
          <img src={factoryImg} alt="MCITY manufacturing assembly line" width={1600} height={900} loading="lazy" className="h-full w-full object-cover" />
        </div>
      </section>

      {/* SECTION 3 — VEHICLE SOLUTIONS */}
      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title={t("solutions.title")} subtitle={t("solutions.subtitle")} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} to="/products" search={{ cat: c.id }} className="group relative block aspect-[4/5] overflow-hidden rounded-sm">
                <img src={c.image} alt={c.name[lang]} width={800} height={1000} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-darker via-surface-darker/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-white">{c.name[lang]}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm text-white/70 transition-all group-hover:gap-2 group-hover:text-white">{t("cta.viewAll")} <ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURED VEHICLES */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading title={t("featured.title")} subtitle={t("featured.subtitle")} />
        <div className="mt-14 space-y-6">
          {featured.map((p, i) => (
            <div key={p.id} className={`grid items-stretch gap-0 overflow-hidden rounded-sm border border-border bg-card shadow-card lg:grid-cols-2 ${i % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
              <div className="aspect-[16/10] overflow-hidden lg:aspect-auto">
                <img src={p.image} alt={p.name[lang]} width={1280} height={800} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">{p.name[lang]}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{p.description[lang]}</p>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                  {p.specs.map((sp, j) => (
                    <div key={j}>
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> {sp.label[lang]}</p>
                      <p className="mt-0.5 font-display text-lg font-bold">{sp.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex gap-3">
                  <Button asChild variant="industrial" size="lg"><Link to="/products/$id" params={{ id: p.id }}>{t("cta.details")}</Link></Button>
                  <Button asChild variant="outline" size="lg"><Link to="/contact">{t("cta.quote")}</Link></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="hero" size="lg"><Link to="/products">{t("cta.explore")} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      {/* SECTION 5 — MANUFACTURING */}
      <section className="relative isolate overflow-hidden bg-surface-darker py-24 text-white">
        <img src={factoryImg} alt="" aria-hidden width={1600} height={900} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{t("mfg.title")}</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">{t("mfg.subtitle")}</h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-sm bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {capabilities.map(({ Icon, k }, i) => (
              <div key={k} className="bg-surface-darker p-8">
                <span className="font-display text-sm font-bold text-white/40">0{i + 1}</span>
                <Icon className="mt-6 h-8 w-8 text-white" />
                <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide">{t(k)}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — ACHIEVEMENTS */}
      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title={t("ach.title")} subtitle={t("ach.subtitle")} />
          <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.v} className="rounded-sm border border-border bg-card p-8 text-center shadow-card">
                <p className="font-display text-5xl font-extrabold text-primary">{s.v}</p>
                <p className="mt-3 text-sm uppercase tracking-wide text-muted-foreground">{s.k[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — NEWS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading title={t("news.title")} subtitle={t("news.subtitle")} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {news.map((n, i) => (
            <Link key={i} to="/news" className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={products[(i + 2) % products.length].image} alt={n.title[lang]} width={800} height={500} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{n.tag[lang]}</span>
                <h3 className="mt-3 font-display text-xl font-bold uppercase leading-tight tracking-wide">{n.title[lang]}</h3>
                <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-foreground transition-all group-hover:gap-2">{t("cta.details")} <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 8 — CONTACT CTA */}
      <section className="bg-surface-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6">
          <MapPin className="h-8 w-8 text-white/60" />
          <h2 className="max-w-3xl font-display text-4xl font-extrabold uppercase tracking-tight text-white text-balance md:text-5xl">{t("hero.title")}</h2>
          <p className="max-w-xl text-white/70">{t("contact.subtitle")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="industrial" size="xl"><Link to="/contact">{t("cta.contactUs")}</Link></Button>
            <Button asChild variant="outlineLight" size="xl"><Link to="/products">{t("cta.explore")}</Link></Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-4xl font-extrabold uppercase tracking-tight md:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{subtitle}</p>
      <div className="mx-auto mt-6 h-px w-20 bg-foreground/30" />
    </div>
  );
}
