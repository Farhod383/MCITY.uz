import type { Lang } from "@/i18n/translations";
import chassisImg from "@/assets/configurator/chassis.webp";
import sceneImg from "@/assets/configurator/scene.webp";
import photoTanker from "@/assets/configurator/photo-tanker.webp";
import photoDump from "@/assets/configurator/photo-dump.webp";

/**
 * "Bitta shassi — ko'plab yechimlar" konfiguratori uchun ma'lumotlar.
 *
 * YANGI KUZOV QO'SHISH:
 *   1. Kuzov rasmini `src/assets/configurator/bodies/` papkasiga qo'ying.
 *      - shaffof fonli PNG yoki WEBP, o'lchami 914 × 577 px;
 *      - kuzov `chassis.webp` dagi Isuzu shassisi bilan bir xil burchakda
 *        va aynan shassi ustiga tushadigan joyda chizilgan bo'lishi kerak
 *        (namuna: bodies/tanker.webp).
 *   2. Fayl nomi kuzovning id'si bo'ladi: `bodies/crane.png` -> "crane".
 *   3. Shu kifoya — konfiguratorda avtomatik paydo bo'ladi.
 *      Nomi, tavsifi va texnik ma'lumotlarini qo'shish uchun pastdagi
 *      CONFIG_INFO ga shu id bilan yozuv qo'shing.
 */

type Loc = Record<Lang, string>;

export interface ConfigSpec {
  label: Loc;
  value: string | Loc;
}

export interface ConfigInfo {
  name: Loc;
  tagline: Loc;
  year?: string;
  /** Katalogdagi mahsulot id'si — "Batafsil" tugmasi shu sahifaga olib boradi */
  productId?: string;
  /** O'ng tomondagi katta foto */
  photo?: string;
  specs: ConfigSpec[];
  /** Ro'yxatdagi tartibi (kichigi oldinda) */
  order?: number;
}

export interface ConfigItem extends ConfigInfo {
  id: string;
  /** Kuzov rasmi; shassining o'zi uchun bo'sh */
  body?: string;
}

export const CHASSIS_IMAGE = chassisImg;
export const SCENE_IMAGE = sceneImg;

// ---- Umumiy texnik ma'lumotlar (shassi) ----
const ENGINE: ConfigSpec = {
  label: { uz: "Dvigatel", uzc: "Двигатель", ru: "Двигатель", en: "Engine" },
  value: "7.8 L · Euro 5",
};
const POWER: ConfigSpec = {
  label: { uz: "Ot kuchi", uzc: "От кучи", ru: "Мощность", en: "Power" },
  value: { uz: "240 o.k.", uzc: "240 о.к.", ru: "240 л.с.", en: "240 hp" },
};
const WHEELS: ConfigSpec = {
  label: { uz: "G'ildirak formulasi", uzc: "Ғилдирак формуласи", ru: "Колёсная формула", en: "Wheel formula" },
  value: "4×2",
};
const FUEL: ConfigSpec = {
  label: { uz: "Yoqilg'i turi", uzc: "Ёқилғи тури", ru: "Тип топлива", en: "Fuel type" },
  value: { uz: "Dizel", uzc: "Дизел", ru: "Дизель", en: "Diesel" },
};
const GROSS: ConfigSpec = {
  label: { uz: "To'liq massa", uzc: "Тўлиқ масса", ru: "Полная масса", en: "Gross weight" },
  value: "16 t",
};
const DIMENSIONS = (value: string): ConfigSpec => ({
  label: { uz: "Gabarit o'lchamlari", uzc: "Габарит ўлчамлари", ru: "Габаритные размеры", en: "Overall dimensions" },
  value,
});
const BASE = [ENGINE, POWER, WHEELS, FUEL];

/** Shassining o'zi — har doim birinchi turadi */
const CHASSIS: ConfigItem = {
  id: "chassis",
  year: "2025",
  order: 0,
  name: { uz: "Shassi", uzc: "Шасси", ru: "Шасси", en: "Cab-chassis" },
  tagline: {
    uz: "Har qanday ustki qurilma uchun bazaviy platforma",
    uzc: "Ҳар қандай устки қурилма учун базавий платформа",
    ru: "Базовая платформа под любую надстройку",
    en: "Base platform for any superstructure",
  },
  specs: [
    ...BASE,
    GROSS,
    {
      label: { uz: "Montaj uzunligi", uzc: "Монтаж узунлиги", ru: "Монтажная длина", en: "Mounting length" },
      value: "5 600 mm",
    },
    DIMENSIONS("8 200 × 2 500 × 2 900 mm"),
  ],
};

/** Kuzovlar haqidagi matnlar. Kalit — rasm fayli nomi (bodies/<id>.webp) */
export const CONFIG_INFO: Record<string, ConfigInfo> = {
  tanker: {
    order: 10,
    name: { uz: "Sisterna", uzc: "Систерна", ru: "Цистерна", en: "Tanker" },
    tagline: {
      uz: "Suv va suyuqliklarni tashish uchun avtosisterna",
      uzc: "Сув ва суюқликларни ташиш учун автосистерна",
      ru: "Автоцистерна для перевозки воды и жидкостей",
      en: "Tanker for water and liquid transport",
    },
    productId: "technical-water",
    photo: photoTanker,
    specs: [
      ...BASE,
      {
        label: { uz: "Sisterna hajmi", uzc: "Систерна ҳажми", ru: "Объём цистерны", en: "Tank volume" },
        value: "10 000 L",
      },
      GROSS,
      DIMENSIONS("8 400 × 2 500 × 3 000 mm"),
    ],
  },
  dump: {
    order: 20,
    name: { uz: "Samosval", uzc: "Самосвал", ru: "Самосвал", en: "Dump truck" },
    tagline: {
      uz: "Sochiluvchan yuklar uchun ag'dariladigan kuzov",
      uzc: "Сочилувчан юклар учун ағдариладиган кузов",
      ru: "Опрокидывающийся кузов для сыпучих грузов",
      en: "Tipping body for bulk cargo",
    },
    photo: photoDump,
    specs: [
      ...BASE,
      {
        label: { uz: "Kuzov hajmi", uzc: "Кузов ҳажми", ru: "Объём кузова", en: "Body volume" },
        value: "8 m³",
      },
      {
        label: { uz: "Yuk ko'tarish qobiliyati", uzc: "Юк кўтариш қобилияти", ru: "Грузоподъёмность", en: "Payload" },
        value: "9 t",
      },
      {
        label: { uz: "Yukxona o'lchami", uzc: "Юкхона ўлчами", ru: "Размеры кузова", en: "Body size" },
        value: "5 200 × 2 350 × 700 mm",
      },
    ],
  },
};

// `bodies/` papkasidagi barcha rasmlarni avtomatik yig'amiz
const bodyFiles = import.meta.glob<string>("../assets/configurator/bodies/*.{png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

function titleFromId(id: string): Loc {
  const s = id.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return { uz: s, uzc: s, ru: s, en: s };
}

const bodies: ConfigItem[] = Object.entries(bodyFiles).map(([path, url]) => {
  const id = path.split("/").pop()!.replace(/\.(png|webp)$/, "");
  const info = CONFIG_INFO[id];
  return {
    year: "2025",
    order: 100,
    ...info,
    id,
    body: url,
    name: info?.name ?? titleFromId(id),
    tagline: info?.tagline ?? { uz: "", uzc: "", ru: "", en: "" },
    specs: info?.specs ?? BASE,
  };
});

export const CONFIGS: ConfigItem[] = [CHASSIS, ...bodies].sort(
  (a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id),
);
