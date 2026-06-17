import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLang();
  const links = [
    { to: "/about", key: "nav.about" },
    { to: "/products", key: "nav.products" },
    { to: "/projects", key: "nav.projects" },
    { to: "/certificates", key: "nav.certificates" },
    { to: "/news", key: "nav.news" },
    { to: "/contact", key: "nav.contact" },
  ];
  return (
    <footer className="bg-surface-darker text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-sm gradient-accent font-display text-lg font-extrabold text-accent-foreground">S</span>
            <span className="font-display text-xl font-extrabold tracking-wide">{t("brand.name")}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">{t("footer.about")}</p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Linkedin, Send].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="grid h-9 w-9 place-items-center rounded-sm bg-sidebar-accent text-sidebar-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-accent">{t("footer.quickLinks")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sidebar-foreground/75 transition-colors hover:text-accent">{t(l.key)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-accent">{t("footer.contact")}</h4>
          <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/75">
            <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Toshkent sh., Sanoat ko'chasi 24, O'zbekiston</li>
            <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-accent" /> +998 71 200 00 00</li>
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-accent" /> info@steelprom.uz</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-accent">STEELPROM</h4>
          <p className="mt-4 text-sm text-sidebar-foreground/70">{t("brand.tagline")} • EST. 2019</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-sidebar-foreground/55 sm:px-6">
          © {new Date().getFullYear()} STEELPROM. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}