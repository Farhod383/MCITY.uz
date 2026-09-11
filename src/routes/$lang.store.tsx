import { createFileRoute } from "@tanstack/react-router";
import { StorePage } from "@/pages/store";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/store")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "store" }),
  component: StorePage,
});
