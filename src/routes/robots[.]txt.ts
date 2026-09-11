import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt
 *
 * MUHIM: CSS, JavaScript va rasmlar BLOKLANMAYDI. Google sahifani
 * to'liq chizib ko'rishi kerak — ularni yopish indekslashni buzadi.
 * Faqat admin panel, savat va buyurtma sahifalari yopiladi.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = [
          "User-agent: *",
          "Allow: /",
          "",
          "# Boshqaruv paneli va shaxsiy sahifalar",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /*/checkout",
          "Disallow: /api/",
          "",
          "# Ichki qidiruv natijalari — indekslash shart emas",
          "Disallow: /*?q=",
          "",
          "# Rasmlar, CSS va JS ochiq bo'lishi shart",
          "Allow: /assets/",
          "Allow: /*.css$",
          "Allow: /*.js$",
          "Allow: /*.jpg$",
          "Allow: /*.png$",
          "Allow: /*.webp$",
          "Allow: /*.svg$",
          "",
          "# Yandex uchun asosiy domen",
          "User-agent: Yandex",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /*/checkout",
          `Host: ${SITE_URL.replace(/^https?:\/\//, "")}`,
          "",
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
