import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { CartProvider } from "@/store/cart";
import { CartSheet } from "@/components/CartSheet";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_LANG, HTML_LANG, SITE_NAME, isLang } from "@/lib/site";
import type { Lang } from "@/i18n/translations";
import { AuthProvider } from "@/auth/AuthContext";
import { HiddenLoginDialog } from "@/components/HiddenLoginDialog";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href={`/${DEFAULT_LANG}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    </div>
  );
}

// TanStack Router `error` ni `unknown` deb beradi — shuning uchun uni
// Error ga keltiramiz (tsc xatosi shundan chiqayotgan edi).
function ErrorComponent({ error: rawError, reset }: ErrorComponentProps) {
  const error = rawError instanceof Error ? rawError : new Error(String(rawError));
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Quyidagilar har bir sahifada o'z qiymati bilan almashtiriladi
      { title: `${SITE_NAME} — Maxsus texnika ishlab chiqarish` },
      {
        name: "description",
        content:
          "MCITY — O'zbekistonda maxsus va kommunal texnika ishlab chiqaruvchi zavod.",
      },
      { name: "author", content: SITE_NAME },
      { name: "theme-color", content: "#0a0a0a" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // <html lang="..."> manzildagi tilga qarab qo'yiladi — bu qidiruv
  // tizimlari va ekran o'quvchilari uchun muhim
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const first = pathname.split("/").filter(Boolean)[0];
  const lang: Lang = isLang(first) ? (first as Lang) : DEFAULT_LANG;

  return (
    <html lang={HTML_LANG[lang]}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            <CartSheet />
            <HiddenLoginDialog />
            <Toaster position="top-center" richColors />
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
