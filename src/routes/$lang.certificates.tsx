import { createFileRoute } from "@tanstack/react-router";
import { CertificatesPage } from "@/pages/certificates";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/certificates")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "certificates" }),
  component: CertificatesPage,
});
