import { useState } from "react";
import { Link } from "@tanstack/react-router";
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

const navItems: { to: string; key: string }[] = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/products", key: "nav.products" },
  { to: "/projects", key: "nav.projects" },
  { to: "/certificates", key: "nav.certificates" },
  { to: "/news", key: "nav.news" },
  { to: "/contact", key: "nav.contact" },
];

export function Header() {
  const { t, lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-darker/90 backdrop-blur supports-[backdrop-filter]:bg-surface-darker/75">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-sm gradient-accent font-display text-lg font-extrabold text-accent-foreground">
            M
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-extrabold tracking-[0.18em] text-sidebar-foreground">
              {t("brand.name")}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/45">
              Special Vehicles
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden flex-1 items-center gap-0.5 xl:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-sm px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-sidebar-foreground/70 transition-colors hover:text-white"
              activeProps={{ className: "text-white" }}
            >
              {t(n.key)}
            </Link>
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
            <Link to="/contact">{t("cta.quote")}</Link>
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
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-sm px-3 py-3 text-base font-semibold uppercase tracking-wide text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-white"
                    activeProps={{ className: "text-white bg-sidebar-accent" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {t(n.key)}
                  </Link>
                ))}
                <Button asChild variant="industrial" size="lg" className="mt-4">
                  <Link to="/contact" onClick={() => setMobileOpen(false)}>{t("cta.quote")}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}