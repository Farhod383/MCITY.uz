import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { L } from "@/components/L";
import { useLang } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";
import { CHASSIS_IMAGE, CONFIGS, SCENE_IMAGE, type ConfigItem } from "@/data/configurator";

/**
 * "Bitta shassi — ko'plab yechimlar" konfiguratori.
 * Kabina va shassi joyida turadi, ustidagi kuzov strelka / swipe /
 * klaviatura bilan almashadi. Kuzovlar ro'yxati — `@/data/configurator`.
 */

const MOVE_MS = 650;

const TEXT: Record<string, Record<Lang, string>> = {
  eyebrow: { uz: "Konfigurator", uzc: "Конфигуратор", ru: "Конфигуратор", en: "Configurator" },
  title: {
    uz: "Bitta shassi — ko'plab yechimlar",
    uzc: "Битта шасси — кўплаб ечимлар",
    ru: "Одно шасси — множество решений",
    en: "One chassis — many solutions",
  },
  specs: { uz: "Texnik ma'lumotlar", uzc: "Техник маълумотлар", ru: "Технические данные", en: "Specifications" },
  note: {
    uz: "* Qiymatlar komplektatsiyaga qarab farq qilishi mumkin",
    uzc: "* Қийматлар комплектацияга қараб фарқ қилиши мумкин",
    ru: "* Значения могут отличаться в зависимости от комплектации",
    en: "* Values may vary depending on configuration",
  },
  more: { uz: "Batafsil", uzc: "Батафсил", ru: "Подробнее", en: "Details" },
  prev: { uz: "Oldingi", uzc: "Олдинги", ru: "Предыдущий", en: "Previous" },
  next: { uz: "Keyingi", uzc: "Кейинги", ru: "Следующий", en: "Next" },
};

const wrap = (i: number, n: number) => ((i % n) + n) % n;
const loc = (v: string | Record<Lang, string>, lang: Lang) => (typeof v === "string" ? v : v[lang]);

function BodyImage({ item }: { item: ConfigItem }) {
  return item.body ? (
    <image href={item.body} x="0" y="0" width="914" height="577" preserveAspectRatio="none" />
  ) : null;
}

/** Shassi + kuzov. `children` — kuzov qatlami (animatsiya uchun) */
function Truck({ shadowId, children, className }: { shadowId: string; children?: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 914 577" preserveAspectRatio="xMidYMax meet" overflow="visible" className={className} aria-hidden="true">
      <g fill={`url(#${shadowId})`}>
        <ellipse cx="470" cy="540" rx="430" ry="30" transform="rotate(-3 470 540)" />
        <ellipse cx="455" cy="560" rx="70" ry="12" />
        <ellipse cx="800" cy="522" rx="60" ry="10" />
        <ellipse cx="160" cy="545" rx="70" ry="11" />
      </g>
      {children}
      <image href={CHASSIS_IMAGE} x="0" y="0" width="914" height="577" preserveAspectRatio="none" />
    </svg>
  );
}

export function Configurator() {
  const { lang } = useLang();
  const shadowId = `cfg-contact-${useId().replace(/:/g, "")}`;
  const n = CONFIGS.length;

  const [state, setState] = useState({ idx: n > 1 ? 1 : 0, prev: -1, dir: 1, step: 0 });
  // Qaysi qadamning animatsiyasi tugaganini eslab qolamiz
  const [settledStep, setSettledStep] = useState(0);
  const pointerX = useRef<number | null>(null);

  const { idx, prev, dir, step } = state;
  const cur = CONFIGS[idx];
  const left = CONFIGS[wrap(idx - 1, n)];
  const right = CONFIGS[wrap(idx + 1, n)];

  const go = (d: number) => {
    if (!d || n < 2) return;
    setState((s) => ({ idx: wrap(s.idx + d, n), prev: s.idx, dir: d > 0 ? 1 : -1, step: s.step + 1 }));
  };

  // Animatsiya tugagach kuzovni oddiy holatga qaytaramiz
  useEffect(() => {
    if (step === settledStep) return;
    const t = setTimeout(() => setSettledStep(step), MOVE_MS + 40);
    return () => clearTimeout(t);
  }, [step, settledStep]);

  const goTo = (i: number) => {
    let d = i - idx;
    if (Math.abs(d) > n / 2) d -= Math.sign(d) * n;
    go(d);
  };

  const preview = (item: ConfigItem, side: "left" | "right") => {
    const fromX = side === "left" ? (dir === 1 ? "95%" : "-60%") : dir === 1 ? "60%" : "-95%";
    const fromS = side === "left" ? (dir === 1 ? 1.9 : 0.8) : dir === 1 ? 0.8 : 1.9;
    return (
      <div
        key={`${side}-${step}`}
        className="cfg-preview"
        style={{ "--cfg-from-x": fromX, "--cfg-from-s": fromS } as CSSProperties}
      >
        <Truck shadowId={shadowId} className={side === "left" ? "cfg-persp-left" : "cfg-persp-right"}>
          <BodyImage item={item} />
        </Truck>
        <p>{item.name[lang]}</p>
      </div>
    );
  };

  const arrow = "cfg-arrow grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-colors sm:h-14 sm:w-14";

  return (
    <section
      className="cfg relative overflow-hidden rounded-sm text-white outline-none"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label={TEXT.title[lang]}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <radialGradient id={shadowId} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#000" stopOpacity="0.6" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{TEXT.eyebrow[lang]}</span>
            <h2 className="mt-2 font-display text-[clamp(26px,4vw,40px)] font-extrabold uppercase leading-tight">
              {TEXT.title[lang]}
            </h2>
          </div>
          <p className="whitespace-nowrap font-display text-xl font-bold tracking-[0.15em] text-white/40">
            <b className="text-white">{String(idx + 1).padStart(2, "0")}</b> / {String(n).padStart(2, "0")}
          </p>
        </div>

        <div
          className="cfg-stage"
          onPointerDown={(e) => (pointerX.current = e.clientX)}
          onPointerUp={(e) => {
            if (pointerX.current === null) return;
            const dx = e.clientX - pointerX.current;
            pointerX.current = null;
            if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
          }}
        >
          <img src={SCENE_IMAGE} alt="" className="cfg-scene" loading="lazy" decoding="async" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="cfg-grid">
            <button className={`${arrow} self-center max-md:hidden`} onClick={() => go(-1)} aria-label={TEXT.prev[lang]}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button className="cfg-pv" onClick={() => go(-1)} aria-label={left.name[lang]}>
              {preview(left, "left")}
            </button>

            <div className="cfg-main">
              <Truck shadowId={shadowId}>
                {step === settledStep || prev < 0 ? (
                  <g className="cfg-body">
                    <BodyImage item={cur} />
                  </g>
                ) : (
                  <g key={step}>
                    {prev !== idx && (
                      <g className="cfg-body cfg-body-out" style={{ "--cfg-dir": dir } as CSSProperties}>
                        <BodyImage item={CONFIGS[prev]} />
                      </g>
                    )}
                    <g className="cfg-body cfg-body-in" style={{ "--cfg-dir": dir } as CSSProperties}>
                      <BodyImage item={cur} />
                    </g>
                  </g>
                )}
              </Truck>
              <div className="cfg-shadow" />
            </div>

            <button className="cfg-pv" onClick={() => go(1)} aria-label={right.name[lang]}>
              {preview(right, "right")}
            </button>
            <button className={`${arrow} self-center max-md:hidden`} onClick={() => go(1)} aria-label={TEXT.next[lang]}>
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div key={`title-${step}`} className="mt-6 text-center" aria-live="polite">
          {cur.year && <p className="cfg-text text-sm font-semibold tracking-[0.3em] text-white/50">{cur.year}</p>}
          <h3 className="cfg-text mt-1 font-display text-[clamp(36px,5vw,52px)] font-extrabold uppercase leading-none" style={{ animationDelay: "60ms" }}>
            {cur.name[lang]}
          </h3>
          {cur.tagline[lang] && (
            <p className="cfg-text mt-2 text-white/60" style={{ animationDelay: "120ms" }}>
              {cur.tagline[lang]}
            </p>
          )}
        </div>

        <div className="mx-auto mt-6 flex max-w-sm items-center gap-3">
          <button className={`${arrow} md:hidden`} onClick={() => go(-1)} aria-label={TEXT.prev[lang]}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-1.5">
            {CONFIGS.map((c, i) => (
              <button key={c.id} className="flex-1 py-2" onClick={() => goTo(i)} aria-label={c.name[lang]}>
                <span className={`block h-[3px] rounded-full transition-colors duration-500 ${i === idx ? "bg-white" : "bg-white/15"}`} />
              </button>
            ))}
          </div>
          <button className={`${arrow} md:hidden`} onClick={() => go(1)} aria-label={TEXT.next[lang]}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div key={`specs-${step}`} className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{TEXT.specs[lang]}</span>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {cur.specs.map((s, i) => {
                const value = loc(s.value, lang);
                return (
                  <div
                    key={i}
                    className={`cfg-text border-l border-white/10 pl-4 ${value.length > 14 ? "col-span-2" : ""}`}
                    style={{ animationDelay: `${80 + i * 45}ms` }}
                  >
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">{s.label[lang]}</dt>
                    <dd className="mt-1 font-display text-[21px] font-bold">{value}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-6 text-xs text-white/35">{TEXT.note[lang]}</p>
          </div>

          {(cur.photo || cur.productId) && (
            <div className="cfg-text max-w-sm">
              {cur.photo && (
                <img
                  src={cur.photo}
                  alt={cur.name[lang]}
                  loading="lazy"
                  className="aspect-[16/10] w-full rounded-sm border border-white/10 object-cover"
                />
              )}
              {cur.productId && (
                <L
                  page="product"
                  productSlug={cur.productId}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/80 hover:text-white"
                >
                  {TEXT.more[lang]} <ArrowRight className="h-4 w-4" />
                </L>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
