import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { translations, type Lang } from "./translations";
import { DEFAULT_LANG, isLang, parsePath, pathFor } from "@/lib/site";

export type Currency = "UZS" | "USD" | "RUB";

const RATES: Record<Currency, number> = { UZS: 1, USD: 1 / 12600, RUB: 1 / 138 };
const SYMBOL: Record<Currency, string> = { UZS: "so'm", USD: "$", RUB: "₽" };

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (uzs: number) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  /**
   * Til endi MANZILDAN olinadi (/uz, /ru, /en, /uzc), localStorage'dan emas.
   *
   * Sabab: qidiruv tizimlari uchun har bir tilning o'z URL'i bo'lishi shart.
   * Manzildan o'qilgani uchun server tomonda ham (SSR) to'g'ri til bilan
   * chiziladi — Google birinchi so'rovdayoq to'g'ri matnni ko'radi.
   */
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const lang: Lang = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return isLang(first) ? (first as Lang) : DEFAULT_LANG;
  }, [pathname]);

  const [currency, setCurrencyState] = useState<Currency>("UZS");

  useEffect(() => {
    try {
      const c = localStorage.getItem("currency") as Currency | null;
      if (c) setCurrencyState(c);
    } catch {
      /* private rejimda localStorage ishlamasligi mumkin */
    }
  }, []);

  // Tanlangan tilni eslab qolamiz (faqat qulaylik uchun)
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("currency", c);
    } catch {
      /* ignore */
    }
  };

  /** Tilni almashtirish = shu sahifaning boshqa tildagi manziliga o'tish */
  const setLang = (next: Lang) => {
    if (next === lang) return;
    const { page, productSlug } = parsePath(pathname);
    void router.navigate({ to: pathFor(next, page, productSlug) });
  };

  const t = (key: string) => translations[lang][key] ?? translations.en[key] ?? key;

  const formatPrice = (uzs: number) => {
    const val = uzs * RATES[currency];
    if (currency === "USD")
      return `${SYMBOL.USD}${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (currency === "RUB")
      return `${val.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${SYMBOL.RUB}`;
    return `${val.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${SYMBOL.UZS}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, currency, setCurrency, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
