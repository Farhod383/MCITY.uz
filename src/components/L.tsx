import type { ComponentType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageContext";
import { pathFor, type PageKey } from "@/lib/site";

/**
 * Til prefiksini avtomatik qo'yadigan havola.
 *
 *   <L page="about">Kompaniya haqida</L>   ->  /uz/about
 *   <L page="product" productSlug="fuel-tanker">...</L>
 *       ->  /ru/specztehnika/fuel-tanker   (rus tilida turgan bo'lsangiz)
 *
 * Shu tufayli sayt bo'ylab hech qayerda til prefiksi qo'lda yozilmaydi —
 * foydalanuvchi qaysi tilda bo'lsa, havolalar ham o'sha tilda qoladi.
 */

// TanStack Link `to` ni faqat ma'lum marshrutlar ro'yxatidan qabul qiladi.
// Bu yerda manzil ish vaqtida yig'ilgani uchun tipni bo'shatamiz —
// noto'g'ri manzil yuborilmasligini `page` tipining o'zi kafolatlaydi.
const RouterLink = Link as unknown as ComponentType<
  Record<string, unknown> & { to: string; children?: ReactNode }
>;

export interface LProps {
  page: PageKey;
  productSlug?: string;
  className?: string;
  activeProps?: Record<string, unknown>;
  activeOptions?: Record<string, unknown>;
  search?: Record<string, unknown>;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  "aria-label"?: string;
  title?: string;
  children?: ReactNode;
}

export function L({ page, productSlug, children, ...rest }: LProps) {
  const { lang } = useLang();
  return (
    <RouterLink to={pathFor(lang, page, productSlug)} {...rest}>
      {children}
    </RouterLink>
  );
}
