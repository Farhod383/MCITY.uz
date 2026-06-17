import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck, Truck, Wrench, BadgeDollarSign, ArrowRight, Award, Quote, Star,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useLang } from "@/i18n/LanguageContext";
import { categories, bestsellers } from "@/data/catalog";
import heroImg from "@/assets/hero-factory.jpg";
import factoryImg from "@/assets/factory-exterior.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STEELPROM — Industrial Manufacturing & Online Store" },
      { name: "description", content: "Premium industrial manufacturer since 2019. High-quality factory products, full catalog and online ordering for B2B and B2C clients worldwide." },
      { property: "og:title", content: "STEELPROM — Industrial Manufacturing" },
      { property: "og:description", content: "Premium industrial manufacturer since 2019. Catalog, technical specs and online ordering." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "STEELPROM",
        foundingDate: "2019",
        industry: "Industrial Manufacturing",
        url: "/",
      }),
    }],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useLang();
  const advantages = [
    { Icon: ShieldCheck, t: "adv.quality.t", d: "adv.quality.d" },
    { Icon: Truck, t: "adv.delivery.t", d: "adv.delivery.d" },
    { Icon: Wrench, t: "adv.tech.t", d: "adv.tech.d" },
    { Icon: BadgeDollarSign, t: "adv.price.t", d: "adv.price.d" },
  ];
  const stats = [
    { v: "5+", k: "stats.years" },
    { v: "120+", k: "stats.products" },
    { v: "350+", k: "stats.clients" },
    { v: "18", k: "stats.countries" },
  ];
  const testimonials = [
    { name: "Aziz Karimov", role: "TechBuild LLC", text: { uz: "Sifat va yetkazib berish muddatlari har doim mukammal. Ishonchli hamkor.", uzc: "Сифат ва етказиб бериш муддатлари ҳар доим мукаммал. Ишончли ҳамкор.", ru: "Качество и сроки доставки всегда на высоте. Надёжный партнёр.", en: "Quality and delivery times are always excellent. A reliable partner." } },
    { name: "Elena Petrova", role: "MetalGroup", text: { uz: "Texnik qo'llab-quvvatlash va professional yondashuv uchun rahmat.", uzc: "Техник қўллаб-қувватлаш ва профессионал ёндашув учун раҳмат.", ru: "Спасибо за техподдержку и профессиональный подход.", en: "Thank you for the technical support and professional approach." } },
    { name: "John Miller", role: "Global Industries", text: { uz: "International standards and great communication. Highly recommended.", uzc: "International standards and great communication. Highly recommended.", ru: "Международные стандарты и отличная коммуникация. Рекомендую.", en: "International standards and great communication. Highly recommended." } },
  ];
  const partners = ["TechBuild", "MetalGroup", "Global Ind.", "UzSteel", "ProMash", "EcoEnergy"];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
        <img src={heroImg} alt="Industrial factory production line" width={1920} height={1080} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-sm border border-accent/40 bg-surface-dark/60 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-accent">
              <Award className="h-4 w-4" /> {t("hero.badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white text-balance sm:text-6xl md:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">{t("hero.subtitle")}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild variant="industrial" size="xl">
                <Link to="/products">{t("cta.catalog")} <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outlineLight" size="xl">
                <Link to="/store">{t("cta.order")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="text-center">
              <p className="font-display text-4xl font-extrabold text-primary md:text-5xl">{s.v}</p>
              <p className="mt-1 text-sm uppercase tracking-wide text-muted-foreground">{t(s.k)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SINCE 2019 */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-sm shadow-elevated">
          <img src={factoryImg} alt="Factory exterior" width={1280} height={960} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="h-1 w-16 gradient-accent" />
          <h2 className="mt-5 font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">{t("since.title")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("since.text")}</p>
          <Button asChild variant="hero" size="lg" className="mt-8">
            <Link to="/about">{t("cta.details")} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title={t("advantages.title")} subtitle={t("advantages.subtitle")} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ Icon, t: tk, d }) => (
              <div key={tk} className="rounded-sm border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
                <span className="grid h-12 w-12 place-items-center rounded-sm bg-primary text-primary-foreground"><Icon className="h-6 w-6" /></span>
                <h3 className="mt-5 font-display text-xl font-bold">{t(tk)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading title={t("categories.title")} subtitle={t("categories.subtitle")} />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} to="/products" search={{ cat: c.id }} className="group relative block aspect-[4/5] overflow-hidden rounded-sm">
              <img src={c.image} alt={c.name[lang]} width={800} height={1000} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-darker via-surface-darker/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-xl font-bold text-white">{c.name[lang]}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">{t("cta.viewAll")} <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title={t("bestsellers.title")} subtitle={t("bestsellers.subtitle")} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading title={t("testimonials.title")} subtitle={t("testimonials.subtitle")} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((ts) => (
            <div key={ts.name} className="rounded-sm border border-border bg-card p-7 shadow-card">
              <Quote className="h-8 w-8 text-accent" />
              <p className="mt-4 leading-relaxed text-foreground/85">"{ts.text[lang]}"</p>
              <div className="mt-5 flex items-center gap-1 text-accent">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-4 font-display text-lg font-bold">{ts.name}</p>
              <p className="text-sm text-muted-foreground">{ts.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="border-y border-border bg-card py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("partners.title")}</p>
          <div className="mt-8 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => (
              <div key={p} className="grid h-14 place-items-center rounded-sm bg-secondary font-display text-lg font-bold text-muted-foreground">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl text-balance">{t("hero.title")}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild variant="industrial" size="xl"><Link to="/products">{t("cta.catalog")}</Link></Button>
            <Button asChild variant="outlineLight" size="xl"><Link to="/contact">{t("cta.contactUs")}</Link></Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{subtitle}</p>
      <div className="mx-auto mt-5 h-1 w-16 gradient-accent" />
    </div>
  );
}
