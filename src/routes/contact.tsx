import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — STEELPROM" },
      { name: "description", content: "Contact STEELPROM for quotes, technical support and partnership inquiries. Phone, email and office address." },
      { property: "og:title", content: "Contact — STEELPROM" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLang();
  const submit = (e: React.FormEvent) => { e.preventDefault(); toast.success(t("checkout.success")); (e.target as HTMLFormElement).reset(); };
  const info = [
    { Icon: MapPin, label: "Toshkent sh., Sanoat ko'chasi 24, O'zbekiston" },
    { Icon: Phone, label: "+998 71 200 00 00" },
    { Icon: Mail, label: "info@steelprom.uz" },
    { Icon: Clock, label: "Dush–Shan: 09:00 – 18:00" },
  ];
  return (
    <Layout>
      <PageHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="space-y-5">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground"><i.Icon className="h-5 w-5" /></span>
                <p className="pt-2 text-foreground/85">{i.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 aspect-[16/10] overflow-hidden rounded-sm border border-border">
            <iframe title="map" className="h-full w-full" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=69.13%2C41.26%2C69.36%2C41.36&layer=mapnik" />
          </div>
        </div>
        <form onSubmit={submit} className="rounded-sm border border-border bg-card p-7 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label className="mb-1.5 block text-sm">{t("checkout.name")}</Label><Input required /></div>
            <div><Label className="mb-1.5 block text-sm">{t("checkout.phone")}</Label><Input type="tel" required /></div>
          </div>
          <div className="mt-4"><Label className="mb-1.5 block text-sm">{t("checkout.email")}</Label><Input type="email" /></div>
          <div className="mt-4"><Label className="mb-1.5 block text-sm">{t("contact.message")}</Label><Textarea rows={5} required /></div>
          <Button type="submit" variant="industrial" size="lg" className="mt-6 w-full">{t("contact.send")}</Button>
        </form>
      </div>
    </Layout>
  );
}