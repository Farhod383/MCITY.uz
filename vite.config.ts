// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Nitro'ni majburan yoqamiz (aks holda Lovable sandbox'dan tashqarida
  // u umuman ishlamaydi va serverni ishga tushiradigan fayl chiqmaydi).
  //
  // Standart maqsad — oddiy Node serveri (Oracle Cloud VM yoki har qanday
  // VPS). Build natijasi: `.output/server/index.mjs` — `npm start` shuni
  // ishga tushiradi, systemd esa uni doim tirik ushlab turadi.
  //
  // Boshqa hostingga chiqarmoqchi bo'lsangiz kodni o'zgartirish shart emas,
  // faqat NITRO_PRESET o'zgaruvchisini qo'ying:
  //   NITRO_PRESET=vercel             -> .vercel/output
  //   NITRO_PRESET=cloudflare-module  -> Cloudflare Pages/Workers
  //
  // Lovable sandbox ichida bu e'tiborga olinmaydi (u yerda Cloudflare majburiy).
  nitro: {
    preset: process.env.NITRO_PRESET || "node-server",

    // Xavfsizlik va kesh sarlavhalari.
    //
    // Ilgari bular `public/_headers` faylida edi — u faqat Cloudflare
    // Pages va Netlify'da ishlaydi, boshqa hech qayerda o'qilmaydi.
    // Bu yerga ko'chirildi: nitro ularni server javoblariga o'zi qo'shadi,
    // ya'ni qaysi hostingda bo'lishidan qat'i nazar ishlaydi.
    routeRules: {
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
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
