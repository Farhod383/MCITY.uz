import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Layout, PageHeader } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/i18n/LanguageContext";
import { useCatalog } from "@/data/useCatalog";
import { sendContactMessage } from "@/data/contact-api";

export function ContactPage() {
  const { t, lang } = useLang();
  // Manzil, telefon, email va xarita nuqtasi admin panelidan boshqariladi
  const { settings } = useCatalog();
  const [busy, setBusy] = useState(false);

  // Har bir telefon raqami alohida qator bo'lib chiqadi
  const info: { Icon: typeof MapPin; label: string; href?: string }[] = [
    { Icon: MapPin, label: settings.address[lang] },
    ...settings.phones.map((tel) => ({
      Icon: Phone,
      label: tel,
      href: `tel:${tel.replace(/[^+\d]/g, "")}`,
    })),
    { Icon: Mail, label: settings.email, href: `mailto:${settings.email}` },
    { Icon: Clock, label: "Dush–Shan: 09:00 – 18:00" },
  ];

  /**
   * Xarita — aniq nuqtaga belgi (marker) qo'yiladi.
   *
   * Avval butun Toshkentni qamrab olgan keng ramka ishlatilgan edi va
   * hech qanday belgi yo'q edi — shuning uchun joy ko'rinmasdi.
   * Endi koordinata atrofida tor ramka olinadi va ustiga pin qo'yiladi.
   */
  const { mapLat: lat, mapLng: lng } = settings;
  const d = 0.006; // ramka kengligi — taxminan 600 metr
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].join("%2C");
  const mapSrc =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik&marker=${lat}%2C${lng}`;
  const bigMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    setBusy(true);
    try {
      await sendContactMessage({
        name: String(fd.get("name") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim() || null,
        message: String(fd.get("message") ?? "").trim(),
        source: "contact",
        lang,
      });
      toast.success(t("checkout.success"));
      form.reset();
    } catch (err) {
      toast.error(
        (err as Error).message ||
          "Xabar yuborilmadi. Iltimos, telefon orqali bog'laning.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <PageHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="space-y-5">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
                  <i.Icon className="h-5 w-5" />
                </span>
                {i.href ? (
                  <a
                    href={i.href}
                    className="pt-2 text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {i.label}
                  </a>
                ) : (
                  <p className="pt-2 text-foreground/85">{i.label}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-sm border border-border">
            <iframe
              title={`MCITY — ${settings.address[lang]}`}
              className="aspect-[16/10] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
            />
          </div>

          <a
            href={bigMapUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            {t("contact.openMap")}
          </a>
        </div>

        <form
          onSubmit={submit}
          className="h-fit rounded-sm border border-border bg-card p-7 shadow-card"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-name" className="mb-1.5 block text-sm">
                {t("checkout.name")}
              </Label>
              <Input id="c-name" name="name" required maxLength={120} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="c-phone" className="mb-1.5 block text-sm">
                {t("checkout.phone")}
              </Label>
              <Input
                id="c-phone"
                name="phone"
                type="tel"
                required
                maxLength={40}
                autoComplete="tel"
                placeholder="+998 __ ___ __ __"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="c-email" className="mb-1.5 block text-sm">
              {t("checkout.email")}
            </Label>
            <Input id="c-email" name="email" type="email" maxLength={160} autoComplete="email" />
          </div>

          <div className="mt-4">
            <Label htmlFor="c-message" className="mb-1.5 block text-sm">
              {t("contact.message")}
            </Label>
            <Textarea id="c-message" name="message" rows={5} required maxLength={4000} />
          </div>

          <Button
            type="submit"
            variant="industrial"
            size="lg"
            className="mt-6 w-full"
            disabled={busy}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("contact.send")}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
