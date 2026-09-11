import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/contact";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "contact" }),
  component: ContactPage,
});
