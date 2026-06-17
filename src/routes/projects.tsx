import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { useLang } from "@/i18n/LanguageContext";
import hero from "@/assets/hero-factory.jpg";
import factory from "@/assets/factory-exterior.jpg";
import machinery from "@/assets/cat-machinery.jpg";
import electrical from "@/assets/cat-electrical.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Portfolio — MCITY" },
      { name: "description", content: "Explore completed industrial projects and references delivered by MCITY for clients across multiple countries." },
      { property: "og:title", content: "Projects & Portfolio — MCITY" },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { t, lang } = useLang();
  const projects = [
    { img: factory, year: "2024", title: { uz: "Toshkent zavod kengaytmasi", uzc: "Тошкент завод кенгайтмаси", ru: "Расширение завода в Ташкенте", en: "Tashkent Plant Expansion" } },
    { img: machinery, year: "2023", title: { uz: "Sement zavodi modernizatsiyasi", uzc: "Цемент заводи модернизацияси", ru: "Модернизация цементного завода", en: "Cement Plant Modernization" } },
    { img: electrical, year: "2023", title: { uz: "Elektr taqsimlash tizimi", uzc: "Электр тақсимлаш тизими", ru: "Система электрораспределения", en: "Power Distribution System" } },
    { img: hero, year: "2022", title: { uz: "Ishlab chiqarish liniyasi qurilishi", uzc: "Ишлаб чиқариш линияси қурилиши", ru: "Строительство производственной линии", en: "Production Line Construction" } },
  ];
  return (
    <Layout>
      <PageHeader title={t("page.projects.title")} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2">
        {projects.map((p) => (
          <div key={p.title.en} className="group relative aspect-[16/10] overflow-hidden rounded-sm">
            <img src={p.img} alt={p.title[lang]} width={1280} height={800} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-darker via-surface-darker/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="rounded-sm gradient-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">{p.year}</span>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{p.title[lang]}</h3>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}