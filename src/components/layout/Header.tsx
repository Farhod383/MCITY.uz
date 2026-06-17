import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang, type Currency } from "@/i18n/LanguageContext";
import { LANGS, type Lang } from "@/i18n/translations";
import { useCart } from "@/store/cart";

const navItems: { to: string; key: string }[] = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/products", key: "nav.products" },
  { to: "/store", key: "nav.store" },
  { to: "/projects", key: "nav.projects" },
  { to: "/certificates", key: "nav.certificates" },
  { to: "/news", key: "nav.news" },
  { to: "/partners", key: "nav.partners" },
  { to: "/contact", key: "nav.contact" },
];

const currencies: Currency[] = ["UZS", "USD", "RUB"];

export function Header() {
  const { t, lang, setLang, currency, setCurrency } = useLang();
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-surface-dark/95 backdrop-blur supports-[backdrop-filter]:bg-surface-dark/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-sm gradient-accent font-display text-lg font-extrabold text-accent-foreground">
            S
          </span>
          <span className="font-display text-xl font-extrabold tracking-wide text-sidebar-foreground">
            {t("brand.name")}
          </span>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-0.5 xl:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-sm px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
          {/* Currency */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-1 px-2 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-accent">
                {currency} <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currencies.map((c) => (
                <DropdownMenuItem key={c} onClick={() => setCurrency(c)}>{c}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-1 px-2 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-accent">
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

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-accent"
            onClick={() => setOpen(true)}
            aria-label={t("cart.title")}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full gradient-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
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
                    className="rounded-sm px-3 py-3 text-base font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-accent"
                    activeProps={{ className: "text-accent bg-sidebar-accent" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {t(n.key)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}