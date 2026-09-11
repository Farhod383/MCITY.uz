import type { PageKey } from "@/lib/site";
import { L } from "@/components/L";
import { useRef, useState } from "react";
import { Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/i18n/LanguageContext";
import { LANGS, type Lang } from "@/i18n/translations";
import { useAuth } from "@/auth/AuthContext";
import { Logo } from "@/components/Logo";

const navItems: { page: PageKey; key: string }[] = [
  { page: "home", key: "nav.home" },
  { page: "about", key: "nav.about" },
  { page: "catalog", key: "nav.products" },
  { page: "projects", key: "nav.projects" },
  { page: "certificates", key: "nav.certificates" },
  { page: "news", key: "nav.news" },
  { page: "contact", key: "nav.contact" },
];

export function Header() {
  const { t, lang, setLang } = useLang();
  const { setLoginOpen } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Yashirin kirish: logotip TEZ IKKI MARTA bosilsa admin login oynasi ochiladi.
   * Saytda hech qanday "Kirish" tugmasi ko'rinmaydi va logotipda hech qanday
   * belgi yo'q — u oddiy logotipdek ishlaydi (bir marta bosilsa bosh sahifa).
   */
  const lastLogoClick = useRef(0);
  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastLogoClick.current < 400) {
      e.preventDefault();
      lastLogoClick.current = 0;
      setLoginOpen(true);
      return;
    }
    lastLogoClick.current = now;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-darker/90 backdrop-blur supports-[backdrop-filter]:bg-surface-darker/75">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <L
          page="home"
          onClick={handleLogoClick}
          onDoubleClick={(e) => e.preventDefault()}
          aria-label={t("brand.name")}
          className="logo-link flex shrink-0 select-none items-center"
        >
          <Logo className="h-10 w-auto text-white sm:h-12" />
        </L>

        <nav className="ml-6 hidden flex-1 items-center gap-0.5 xl:flex">
          {navItems.map((n) => (
            <L
              key={n.page}
              page={n.page}
              activeOptions={{ exact: n.page === "home" }}
              className="rounded-sm px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-sidebar-foreground/70 transition-colors hover:text-white"
              activeProps={{ className: "text-white" }}
            >
              {t(n.key)}
            </L>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-1 px-2 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-white">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang)?.short}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code as Lang)}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CTA */}
          <Button asChild variant="outlineLight" size="sm" className="hidden h-9 lg:inline-flex">
            <L page="contact">{t("cta.quote")}</L>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-sidebar-foreground xl:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-surface-dark text-sidebar-foreground">
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map((n) => (
                  <L
                    key={n.page}
                    page={n.page}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-sm px-3 py-3 text-base font-semibold uppercase tracking-wide text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-white"
                    activeProps={{ className: "text-white bg-sidebar-accent" }}
                    activeOptions={{ exact: n.page === "home" }}
                  >
                    {t(n.key)}
                  </L>
                ))}
                <Button asChild variant="industrial" size="lg" className="mt-4">
                  <L page="contact" onClick={() => setMobileOpen(false)}>{t("cta.quote")}</L>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}