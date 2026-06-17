import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { useLang } from "@/i18n/LanguageContext";
import factory from "@/assets/mcity-hero.jpg";
import machinery from "@/assets/veh-fire.jpg";
import parts from "@/assets/veh-aerial.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — MCITY" },
      { name: "description", content: "Latest news, product launches and company updates from MCITY industrial manufacturing." },
      { property: "og:title", content: "News — MCITY" },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { t, lang } = useLang();
  const news = [
    { img: factory, date: "2025-05-12", title: { uz: "Yangi ishlab chiqarish liniyasi ishga tushirildi", uzc: "Янги ишлаб чиқариш линияси ишга туширилди", ru: "Запущена новая производственная линия", en: "New production line launched" } },
    { img: machinery, date: "2025-03-28", title: { uz: "Xalqaro ko'rgazmada ishtirok etdik", uzc: "Халқаро кўргазмада иштирок этдик", ru: "Участие в международной выставке", en: "Participated in international exhibition" } },
    { img: parts, date: "2025-02-10", title: { uz: "Yangi mahsulot katalogi e'lon qilindi", uzc: "Янги маҳсулот каталоги эълон қилинди", ru: "Опубликован новый каталог продукции", en: "New product catalog released" } },
  ];
  return (
    <Layout>
      <PageHeader title={t("page.news.title")} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3">
        {news.map((n) => (
          <article key={n.title.en} className="group overflow-hidden rounded-sm border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
            <div className="aspect-[16/10] overflow-hidden"><img src={n.img} alt={n.title[lang]} width={800} height={500} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
            <div className="p-5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {n.date}</p>
              <h3 className="mt-2 font-display text-xl font-bold leading-tight group-hover:text-accent">{n.title[lang]}</h3>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}