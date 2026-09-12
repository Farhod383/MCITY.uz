// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Xavfsizlik va kesh sarlavhalari.
 *
 * Ilgari bular `public/_headers` faylida edi — u faqat Cloudflare Pages
 * va Netlify'da ishlaydi, Vercel uni umuman o'qimaydi. Bu yerga
 * ko'chirildi: nitro ularni build natijasiga yozib qo'yadi, ya'ni qaysi
 * hostingda bo'lishidan qat'i nazar ishlaydi.
 */
const routeRules = {
  "/**": {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    },
  },
  // Vite hashlangan fayllari — abadiy keshlanadi
  "/assets/**": {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  },
  // Boshqaruv paneli qidiruv tizimlariga chiqmasin
  "/admin": { headers: { "X-Robots-Tag": "noindex, nofollow" } },
  "/admin/**": { headers: { "X-Robots-Tag": "noindex, nofollow" } },
};

/**
 * Nitro sozlamalari.
 *
 * Nitro majburan yoqiladi — aks holda Lovable sandbox'dan tashqarida u
 * umuman ishlamaydi va serverni ishga tushiradigan fayl chiqmaydi.
 *
 * Standart maqsad — Vercel: natija `.vercel/output` papkasiga tushadi
 * (Build Output API v3) va Vercel uni avtomatik tanib oladi.
 *
 * Boshqa hostingga chiqarish uchun kodni o'zgartirish shart emas, faqat
 * NITRO_PRESET o'zgaruvchisini qo'ying:
 *   NITRO_PRESET=node-server        -> .output/server/index.mjs (VPS)
 *   NITRO_PRESET=cloudflare-module  -> Cloudflare Pages/Workers
 *
 * Lovable sandbox ichida bu e'tiborga olinmaydi (u yerda Cloudflare
 * majburiy).
 *
 * `as` kerak, chunki @lovable.dev/vite-tanstack-config tiplarida faqat
 * `preset`/`output`/`cloudflare` e'lon qilingan, lekin qolgan sozlamalar
 * nitro'ga o'zgarishsiz uzatiladi.
 */
const nitro = {
  preset: process.env.NITRO_PRESET || "vercel",
  routeRules,
} as { preset: string };

export default defineConfig({
  nitro,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
