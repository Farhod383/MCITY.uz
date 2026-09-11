import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/pages/checkout";
import { seoHeadFor } from "@/lib/head";

// Buyurtma sahifasi qidiruv tizimlariga kerak emas — noindex
export const Route = createFileRoute("/$lang/checkout")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "checkout", noindex: true }),
  component: CheckoutPage,
});
