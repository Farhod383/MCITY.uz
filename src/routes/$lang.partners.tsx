import { createFileRoute } from "@tanstack/react-router";
import { PartnersPage } from "@/pages/partners";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/partners")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "partners" }),
  component: PartnersPage,
});
