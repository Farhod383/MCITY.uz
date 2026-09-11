import type { PageKey } from "@/lib/site";
import { L } from "@/components/L";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useCatalog } from "@/data/useCatalog";
import { Logo } from "@/components/Logo";

export function Footer() {
  const { t, lang } = useLang();
  // Manzil, telefon, email va ijtimoiy tarmoqlar admin panelidan boshqariladi
  const { settings } = useCatalog();

  const links: { page: PageKey; key: string }[] = [
    { page: "about", key: "nav.about" },
    { page: "catalog", key: "nav.products" },
    { page: "projects", key: "nav.projects" },
    { page: "certificates", key: "nav.certificates" },
    { page: "news", key: "nav.news" },
    { page: "contact", key: "nav.contact" },
  ];

  // Havolasi kiritilmagan ijtimoiy tarmoq ko'rsatilmaydi
  const socials = [
    { Icon: Facebook, href: settings.facebook, label: "Facebook" },
    { Icon: Instagram, href: settings.instagram, label: "Instagram" },
    { Icon: Linkedin, href: settings.linkedin, label: "LinkedIn" },
    { Icon: Send, href: settings.telegram, label: "Telegram" },
  ].filter((s) => s.href && s.href.trim());

  return (
    <footer className="bg-surface-darker text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <L page="home" aria-label={t("brand.name")} className="logo-link inline-block">
            <Logo className="h-11 w-auto text-white" />
          </L>

          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">
            {settings.about[lang]}
          </p>

          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-sm bg-sidebar-accent text-sidebar-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-accent">
            {t("footer.quickLinks")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map((l) => (
              <li key={l.page}>
                <L page={l.page} className="text-sidebar-foreground/75 transition-colors hover:text-accent">
                  {t(l.key)}
                </L>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-accent">
            {t("footer.contact")}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {settings.address[lang]}
            </li>
            {settings.phones.map((tel, i) => (
              <li key={tel} className="flex items-center gap-2.5">
                {/* Belgi faqat birinchi raqam yonida — qolganlari tekislanadi */}
                {i === 0 ? (
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <span className="h-4 w-4 shrink-0" aria-hidden />
                )}
                <a
                  href={`tel:${tel.replace(/[^+\d]/g, "")}`}
                  className="transition-colors hover:text-accent"
                >
                  {tel}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-accent">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-accent">MCITY</h4>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            {settings.tagline[lang]} • EST. 2019
          </p>
        </div>
      </div>

      <div className="border-t border-sidebar-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-sidebar-foreground/55 sm:px-6">
          © {new Date().getFullYear()} MCITY. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
