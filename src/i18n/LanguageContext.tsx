import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

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
  const [lang, setLangState] = useState<Lang>("uz");
  const [currency, setCurrencyState] = useState<Currency>("UZS");

  useEffect(() => {
    const l = localStorage.getItem("lang") as Lang | null;
    const c = localStorage.getItem("currency") as Currency | null;
    if (l) setLangState(l);
    if (c) setCurrencyState(c);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  const t = (key: string) => translations[lang][key] ?? translations.en[key] ?? key;

  const formatPrice = (uzs: number) => {
    const val = uzs * RATES[currency];
    if (currency === "USD") return `${SYMBOL.USD}${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (currency === "RUB") return `${val.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${SYMBOL.RUB}`;
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