import type { Lang } from "@/i18n/translations";
import pipes from "@/assets/cat-pipes.jpg";
import machinery from "@/assets/cat-machinery.jpg";
import electrical from "@/assets/cat-electrical.jpg";
import parts from "@/assets/product-parts.jpg";

export type Loc = Record<Lang, string>;

export interface Category {
  id: string;
  name: Loc;
  image: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: Loc;
  description: Loc;
  image: string;
  gallery: string[];
  priceUzs: number | null; // null = price on request
  bestseller?: boolean;
  specs: { label: Loc; value: string }[];
}

const L = (uz: string, uzc: string, ru: string, en: string): Loc => ({ uz, uzc, ru, en });

export const categories: Category[] = [
  { id: "pipes", name: L("Quvurlar va profillar", "Қувурлар ва профиллар", "Трубы и профили", "Pipes & Profiles"), image: pipes },
  { id: "machinery", name: L("Sanoat uskunalari", "Саноат ускуналари", "Промышленное оборудование", "Industrial Machinery"), image: machinery },
  { id: "electrical", name: L("Elektr jihozlari", "Электр жиҳозлари", "Электрооборудование", "Electrical Equipment"), image: electrical },
  { id: "parts", name: L("Metall qismlar", "Металл қисмлар", "Металлические детали", "Metal Parts"), image: parts },
];

const spec = (lbl: Loc, value: string) => ({ label: lbl, value });
const MAT = L("Material", "Материал", "Материал", "Material");
const STD = L("Standart", "Стандарт", "Стандарт", "Standard");
const WGT = L("Og'irligi", "Оғирлиги", "Вес", "Weight");
const DIM = L("O'lchami", "Ўлчами", "Размер", "Dimensions");

export const products: Product[] = [
  {
    id: "steel-pipe-dn100",
    categoryId: "pipes",
    name: L("Po'lat quvur DN100", "Пўлат қувур DN100", "Стальная труба DN100", "Steel Pipe DN100"),
    description: L(
      "Yuqori bosimga chidamli payvandlangan po'lat quvur, sanoat tarmoqlari uchun.",
      "Юқори босимга чидамли пайвандланган пўлат қувур, саноат тармоқлари учун.",
      "Сварная стальная труба для высокого давления, для промышленных сетей.",
      "High-pressure welded steel pipe for industrial pipelines.",
    ),
    image: pipes, gallery: [pipes, parts], priceUzs: 1250000, bestseller: true,
    specs: [spec(MAT, "S235JR"), spec(STD, "GOST 10704-91"), spec(DIM, "DN100 / 6m"), spec(WGT, "48 kg")],
  },
  {
    id: "galv-profile-60",
    categoryId: "pipes",
    name: L("Galvanizli profil 60x40", "Галванизли профил 60x40", "Оцинкованный профиль 60x40", "Galvanized Profile 60x40"),
    description: L(
      "Korroziyaga chidamli galvanizli profil, qurilish konstruksiyalari uchun.",
      "Коррозияга чидамли галванизли профил, қурилиш конструкциялари учун.",
      "Оцинкованный профиль, устойчивый к коррозии, для строительных конструкций.",
      "Corrosion-resistant galvanized profile for building structures.",
    ),
    image: pipes, gallery: [pipes], priceUzs: 320000,
    specs: [spec(MAT, "Galvanized steel"), spec(DIM, "60x40x2mm"), spec(WGT, "5.2 kg/m")],
  },
  {
    id: "industrial-compressor",
    categoryId: "machinery",
    name: L("Sanoat kompressori 22kW", "Саноат компрессори 22kW", "Промышленный компрессор 22кВт", "Industrial Compressor 22kW"),
    description: L(
      "Energiya tejamkor vintli kompressor, uzluksiz ishlash uchun mo'ljallangan.",
      "Энергия тежамкор винтли компрессор, узлуксиз ишлаш учун мўлжалланган.",
      "Энергоэффективный винтовой компрессор для непрерывной работы.",
      "Energy-efficient screw compressor designed for continuous operation.",
    ),
    image: machinery, gallery: [machinery, parts], priceUzs: 185000000, bestseller: true,
    specs: [spec(L("Quvvat", "Қувват", "Мощность", "Power"), "22 kW"), spec(L("Bosim", "Босим", "Давление", "Pressure"), "10 bar"), spec(WGT, "640 kg")],
  },
  {
    id: "hydraulic-press",
    categoryId: "machinery",
    name: L("Gidravlik press 100t", "Гидравлик пресс 100т", "Гидравлический пресс 100т", "Hydraulic Press 100t"),
    description: L(
      "Metall qismlarni shakllantirish uchun kuchli gidravlik press.",
      "Металл қисмларни шакллантириш учун кучли гидравлик пресс.",
      "Мощный гидравлический пресс для формовки металлических деталей.",
      "Powerful hydraulic press for forming metal parts.",
    ),
    image: machinery, gallery: [machinery], priceUzs: null,
    specs: [spec(L("Kuch", "Куч", "Усилие", "Force"), "100 t"), spec(STD, "CE"), spec(WGT, "2800 kg")],
  },
  {
    id: "control-panel",
    categoryId: "electrical",
    name: L("Boshqaruv paneli 380V", "Бошқарув панели 380V", "Панель управления 380В", "Control Panel 380V"),
    description: L(
      "Sanoat avtomatlashtirish uchun modulli elektr boshqaruv paneli.",
      "Саноат автоматлаштириш учун модулли электр бошқарув панели.",
      "Модульная электрическая панель управления для промышленной автоматизации.",
      "Modular electrical control panel for industrial automation.",
    ),
    image: electrical, gallery: [electrical], priceUzs: 8500000, bestseller: true,
    specs: [spec(L("Kuchlanish", "Кучланиш", "Напряжение", "Voltage"), "380 V"), spec(STD, "IEC 61439"), spec(L("Himoya", "Ҳимоя", "Защита", "Protection"), "IP54")],
  },
  {
    id: "cable-tray",
    categoryId: "electrical",
    name: L("Kabel lotogi 200mm", "Кабел лотоги 200mm", "Кабельный лоток 200мм", "Cable Tray 200mm"),
    description: L(
      "Perforatsiyalangan po'lat kabel lotogi, sanoat elektr tarmoqlari uchun.",
      "Перфорацияланган пўлат кабел лотоги, саноат электр тармоқлари учун.",
      "Перфорированный стальной кабельный лоток для промышленных сетей.",
      "Perforated steel cable tray for industrial electrical networks.",
    ),
    image: electrical, gallery: [electrical], priceUzs: 240000,
    specs: [spec(MAT, "Galvanized steel"), spec(DIM, "200x60mm / 3m")],
  },
  {
    id: "flange-set",
    categoryId: "parts",
    name: L("Flanets to'plami DN80", "Фланец тўплами DN80", "Комплект фланцев DN80", "Flange Set DN80"),
    description: L(
      "Yuqori aniqlikdagi payvand flaneslari, quvur ulanishlari uchun.",
      "Юқори аниқликдаги пайванд фланеслари, қувур уланишлари учун.",
      "Высокоточные приварные фланцы для трубных соединений.",
      "High-precision weld flanges for pipe connections.",
    ),
    image: parts, gallery: [parts, pipes], priceUzs: 450000, bestseller: true,
    specs: [spec(MAT, "Carbon steel"), spec(STD, "GOST 12820"), spec(DIM, "DN80 PN16")],
  },
  {
    id: "bearing-housing",
    categoryId: "parts",
    name: L("Podshipnik korpusi", "Подшипник корпуси", "Корпус подшипника", "Bearing Housing"),
    description: L(
      "Aniq ishlangan podshipnik korpusi, sanoat uskunalari uchun.",
      "Аниқ ишланган подшипник корпуси, саноат ускуналари учун.",
      "Точно обработанный корпус подшипника для промышленного оборудования.",
      "Precisely machined bearing housing for industrial equipment.",
    ),
    image: parts, gallery: [parts], priceUzs: 680000,
    specs: [spec(MAT, "Cast iron"), spec(STD, "ISO 9001"), spec(WGT, "3.4 kg")],
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const bestsellers = products.filter((p) => p.bestseller);