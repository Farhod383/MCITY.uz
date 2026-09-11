import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/pages/news";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/news")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "news" }),
  component: NewsPage,
});
