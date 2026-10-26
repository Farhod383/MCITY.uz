import { FileDown } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { useCatalog } from "@/data/useCatalog";

const DEFAULT_NAME = "MCITY-katalog.pdf";

/**
 * Admin panel → Sozlamalar orqali yuklangan PDF katalogning havolasi.
 * Fayl yuklanmagan bo'lsa `null` — tugma umuman ko'rsatilmaydi.
 *
 * PDF Supabase Storage'da (boshqa domen) turadi, shuning uchun brauzer
 * `<a download>` ni e'tiborsiz qoldirib faylni faqat ochib qo'yadi.
 * Supabase'ning `?download=` parametri esa faylni haqiqatan yuklab beradi —
 * telefonda ham, kompyuterda ham to'liq saqlanadi.
 */
export function useCatalogPdf(): { href: string; name: string } | null {
  const { settings } = useCatalog();
  const url = settings.catalogPdfUrl;
  if (!url) return null;

  const name = settings.catalogPdfName || DEFAULT_NAME;
  if (!url.includes(".supabase.co/storage/")) return { href: url, name };

  const sep = url.includes("?") ? "&" : "?";
  return { href: `${url}${sep}download=${encodeURIComponent(name)}`, name };
}

export function CatalogPdfButton({
  label = "full",
  className,
  onClick,
  ...props
}: Omit<ButtonProps, "asChild" | "children"> & { label?: "full" | "short" | "icon"; onClick?: () => void }) {
  const { t } = useLang();
  const pdf = useCatalogPdf();
  if (!pdf) return null;

  const text = label === "short" ? t("cta.pdfCatalog") : t("cta.downloadPdf");

  return (
    <Button asChild className={className} {...props}>
      <a
        href={pdf.href}
        download={pdf.name}
        rel="noopener"
        onClick={onClick}
        aria-label={label === "icon" ? t("cta.downloadPdf") : undefined}
        title={t("cta.downloadPdf")}
      >
        <FileDown className="h-4 w-4" />
        {label !== "icon" && text}
      </a>
    </Button>
  );
}
