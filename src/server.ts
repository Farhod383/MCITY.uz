import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}


/* ------------------------------------------------------------------ *
 * Domen normalizatsiyasi (SEO uchun majburiy)
 *
 *   http://mcity.uz       -> https://mcity.uz        301
 *   https://www.mcity.uz  -> https://mcity.uz        301
 *   /uz/about/            -> /uz/about               301  (trailing slash yo'q)
 *
 * Bularsiz Google bitta sahifani bir nechta manzilda ko'radi va
 * "duplicate content" sifatida reytingni bo'lib yuboradi.
 *
 * CANONICAL_HOST muhit o'zgaruvchisi orqali beriladi; berilmasa
 * mcity.uz ishlatiladi. Lokal ishlashda (localhost) hech narsa
 * o'zgarmaydi.
 * ------------------------------------------------------------------ */

const CANONICAL_HOST =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.CANONICAL_HOST ?? "mcity.uz";

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".localhost")
  );
}

function canonicalRedirect(request: Request): Response | null {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return null;
  }

  if (isLocalHost(url.hostname)) return null;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto ? forwardedProto.split(",")[0].trim() : url.protocol.replace(":", "");

  let changed = false;
  const target = new URL(url.toString());

  // 1) HTTPS majburiy.
  // Render/Cloudflare TLS ni o'zi tugatadi, shuning uchun ichkarida so'rov
  // "http" bo'lib keladi. Yo'naltirish manzili HAR DOIM https bo'lishi shart —
  // aks holda www -> apex ko'chishi http ga tushib, yana bir marta
  // yo'naltirish (redirect chain) hosil bo'ladi.
  target.protocol = "https:";
  if (proto === "http") changed = true;

  // 2) www yo'q qilinadi (yoki CANONICAL_HOST ga keltiriladi)
  const bareHost = url.hostname.replace(/^www\./i, "");
  if (bareHost === CANONICAL_HOST && url.hostname !== CANONICAL_HOST) {
    target.hostname = CANONICAL_HOST;
    changed = true;
  }

  // 3) Oxiridagi "/" olib tashlanadi (bosh sahifadan tashqari)
  if (target.pathname.length > 1 && target.pathname.endsWith("/")) {
    target.pathname = target.pathname.replace(/\/+$/, "");
    changed = true;
  }

  if (!changed) return null;

  return new Response(null, {
    status: 301,
    headers: { Location: target.toString(), "Cache-Control": "public, max-age=3600" },
  });
}

/* ------------------------------------------------------------------ *
 * Eski manzillar -> yangi tilli manzillar (301)
 *
 * Sayt avval til prefiksisiz ishlagan (/about, /products/fuel-tanker).
 * Google indeksida va tashqi havolalarda o'sha manzillar qolgan, shuning
 * uchun ular yangi manzilga 301 bilan ko'chiriladi — reyting yo'qolmaydi.
 * ------------------------------------------------------------------ */

const LEGACY_PATHS: Record<string, string> = {
  "": "/uz",
  "/": "/uz",
  "/about": "/uz/about",
  "/projects": "/uz/projects",
  "/certificates": "/uz/certificates",
  "/news": "/uz/news",
  "/partners": "/uz/partners",
  "/contact": "/uz/contact",
  "/store": "/uz/store",
  "/checkout": "/uz/checkout",
  "/products": "/uz/maxsus-texnika",
};

function legacyRedirect(url: URL): Response | null {
  const path = url.pathname.replace(/\/+$/, "") || "/";

  let target = LEGACY_PATHS[path];

  // /products/<slug> -> /uz/maxsus-texnika/<slug>
  if (!target && path.startsWith("/products/")) {
    const slug = path.slice("/products/".length).split("/")[0];
    if (slug) target = `/uz/maxsus-texnika/${slug}`;
  }

  if (!target) return null;

  return new Response(null, {
    status: 301,
    headers: {
      Location: target + url.search,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const redirectResponse = canonicalRedirect(request);
      if (redirectResponse) return redirectResponse;

      const legacy = legacyRedirect(new URL(request.url));
      if (legacy) return legacy;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
