import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/about";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "about" }),
  component: AboutPage,
});
