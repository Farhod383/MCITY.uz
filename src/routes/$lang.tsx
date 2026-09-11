import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LANG, isLang } from "@/lib/site";

/**
 * Til qatlami — /uz, /uzc, /ru, /en.
 *
 * Barcha sahifalar shu marshrut ostida turadi. Noto'g'ri til kodi
 * kiritilsa (masalan /de/about), foydalanuvchi standart tildagi bosh
 * sahifaga 301 bilan yo'naltiriladi.
 */
export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) {
      throw redirect({ href: `/${DEFAULT_LANG}`, statusCode: 301, replace: true });
    }
  },
  component: () => <Outlet />,
});
