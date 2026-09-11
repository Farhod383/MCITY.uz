import type { Lang } from "./translations";
import type { Loc } from "@/data/catalog";

/**
 * Sahifalarning SEO matnlari — har bir tilda ALOHIDA va TAKRORLANMAS.
 *
 * Qoida: hech bir sahifaning title/description'i boshqasiga o'xshamaydi.
 * Kalit so'zlar tabiiy jumla ichida keladi, sun'iy takrorlanmaydi.
 */

const L = (uz: string, uzc: string, ru: string, en: string): Loc => ({ uz, uzc, ru, en });

export interface SeoCopy {
  title: Loc;
  description: Loc;
}

/** Brend qo'shimchasi — title oxiriga qo'shiladi */
export const TITLE_SUFFIX: Record<Lang, string> = {
  uz: "MCITY | O'zbekiston",
  uzc: "MCITY | Ўзбекистон",
  ru: "MCITY | Узбекистан",
  en: "MCITY | Uzbekistan",
};

/** Mahsulot sahifasi uchun title andozasi */
export const PRODUCT_TITLE: Record<Lang, (name: string) => string> = {
  uz: (n) => `${n} — MCity maxsus texnikalari | O'zbekiston`,
  uzc: (n) => `${n} — MCity махсус техникалари | Ўзбекистон`,
  ru: (n) => `${n} — Спецтехника MCity | Узбекистан`,
  en: (n) => `${n} — MCity Special Equipment | Uzbekistan`,
};

/** Mahsulot sahifasi uchun description andozasi */
export const PRODUCT_DESCRIPTION: Record<
  Lang,
  (name: string, category: string, summary: string) => string
> = {
  uz: (n, c, s) =>
    `${n} — ${c.toLowerCase()} turkumidagi maxsus texnika. ${s} Texnik xususiyatlari, narxi va yetkazib berish bo'yicha MCITY bilan bog'laning.`,
  uzc: (n, c, s) =>
    `${n} — ${c.toLowerCase()} туркумидаги махсус техника. ${s} Техник хусусиятлари, нархи ва етказиб бериш бўйича MCITY билан боғланинг.`,
  ru: (n, c, s) =>
    `${n} — спецтехника из категории «${c}». ${s} Технические характеристики, цена и условия поставки — свяжитесь с MCITY.`,
  en: (n, c, s) =>
    `${n} — special equipment in the ${c.toLowerCase()} category. ${s} Technical specifications, price and delivery — contact MCITY.`,
};

export const PAGE_SEO: Record<string, SeoCopy> = {
  home: {
    title: L(
      "Maxsus texnika ishlab chiqarish — MCITY | O'zbekiston",
      "Махсус техника ишлаб чиқариш — MCITY | Ўзбекистон",
      "Производство спецтехники — MCITY | Узбекистан",
      "Special Equipment Manufacturer — MCITY | Uzbekistan",
    ),
    description: L(
      "MCITY — 2019-yildan buyon O'zbekistonda maxsus va kommunal texnika ishlab chiqaruvchi zavod: avtosisternalar, kranlar, manipulyatorlar, yong'in va aeroport texnikasi. Katalog, texnik xususiyatlar va narx so'rovi.",
      "MCITY — 2019-йилдан буён Ўзбекистонда махсус ва коммунал техника ишлаб чиқарувчи завод: автосистерналар, кранлар, манипуляторлар, ёнғин ва аэропорт техникаси. Каталог, техник хусусиятлар ва нарх сўрови.",
      "MCITY — завод по производству специальной и коммунальной техники в Узбекистане с 2019 года: автоцистерны, краны, манипуляторы, пожарная и аэропортовая техника. Каталог, характеристики и запрос цены.",
      "MCITY has manufactured special-purpose and municipal vehicles in Uzbekistan since 2019: tankers, cranes, truck-mounted manipulators, fire and airport equipment. Catalog, specifications and quote requests.",
    ),
  },

  catalog: {
    title: L(
      "Maxsus texnika katalogi — kran, manipulyator, avtosisterna",
      "Махсус техника каталоги — кран, манипулятор, автосистерна",
      "Каталог спецтехники — кран, манипулятор, автоцистерна",
      "Special Equipment Catalog — Cranes, Manipulators, Tankers",
    ),
    description: L(
      "MCITY maxsus texnika katalogi: yuk ko'taruvchi texnika, avtokranlar, kran-manipulyatorlar, yoqilg'i va suv sisternalari, kommunal hamda qurilish texnikasi. Har bir model bo'yicha texnik xususiyatlar.",
      "MCITY махсус техника каталоги: юк кўтарувчи техника, автокранлар, кран-манипуляторлар, ёқилғи ва сув систерналари, коммунал ҳамда қурилиш техникаси. Ҳар бир модел бўйича техник хусусиятлар.",
      "Каталог спецтехники MCITY: грузоподъёмная техника, автокраны, краны-манипуляторы, топливные и водяные цистерны, коммунальная и строительная техника. Характеристики по каждой модели.",
      "MCITY special machinery catalog: lifting equipment, mobile cranes, truck-mounted cranes, fuel and water tankers, municipal and construction equipment. Full specifications for every model.",
    ),
  },

  about: {
    title: L(
      "Kompaniya haqida — MCITY zavodi",
      "Компания ҳақида — MCITY заводи",
      "О компании — завод MCITY",
      "About the Company — MCITY Plant",
    ),
    description: L(
      "MCITY zavodi 2019-yilda tashkil topgan. Muhandislik, ishlab chiqarish, yig'ish va sifat nazorati — to'liq sikl O'zbekistonda amalga oshiriladi.",
      "MCITY заводи 2019-йилда ташкил топган. Муҳандислик, ишлаб чиқариш, йиғиш ва сифат назорати — тўлиқ сикл Ўзбекистонда амалга оширилади.",
      "Завод MCITY основан в 2019 году. Инжиниринг, производство, сборка и контроль качества — полный цикл в Узбекистане.",
      "MCITY was founded in 2019. Engineering, manufacturing, assembly and quality control — a full production cycle in Uzbekistan.",
    ),
  },

  projects: {
    title: L(
      "Loyihalar va amalga oshirilgan ishlar — MCITY",
      "Лойиҳалар ва амалга оширилган ишлар — MCITY",
      "Проекты и реализованные работы — MCITY",
      "Projects and Delivered Works — MCITY",
    ),
    description: L(
      "MCITY tomonidan yetkazib berilgan maxsus texnika loyihalari: zavod kengaytmalari, sanoat obyektlari va kommunal xo'jalik uchun texnika yetkazib berish.",
      "MCITY томонидан етказиб берилган махсус техника лойиҳалари: завод кенгайтмалари, саноат объектлари ва коммунал хўжалик учун техника етказиб бериш.",
      "Проекты MCITY по поставке спецтехники: расширение заводов, промышленные объекты и техника для коммунального хозяйства.",
      "MCITY project references: plant expansions, industrial facilities and equipment supplied for municipal services.",
    ),
  },

  certificates: {
    title: L(
      "Sertifikatlar va litsenziyalar — MCITY",
      "Сертификатлар ва лицензиялар — MCITY",
      "Сертификаты и лицензии — MCITY",
      "Certificates and Licences — MCITY",
    ),
    description: L(
      "MCITY mahsulotlari xalqaro standartlarga muvofiq sertifikatlangan: ISO 9001, ISO 14001, CE, GOST R va O'zStandart.",
      "MCITY маҳсулотлари халқаро стандартларга мувофиқ сертификатланган: ISO 9001, ISO 14001, CE, GOST R ва Ўзстандарт.",
      "Продукция MCITY сертифицирована по международным стандартам: ISO 9001, ISO 14001, CE, ГОСТ Р и Узстандарт.",
      "MCITY products are certified to international standards: ISO 9001, ISO 14001, CE, GOST R and O'zStandart.",
    ),
  },

  news: {
    title: L(
      "Yangiliklar va e'lonlar — MCITY",
      "Янгиликлар ва эълонлар — MCITY",
      "Новости и события — MCITY",
      "News and Announcements — MCITY",
    ),
    description: L(
      "MCITY zavodining so'nggi yangiliklari: yangi ishlab chiqarish liniyalari, ko'rgazmalar va mahsulot katalogi yangilanishlari.",
      "MCITY заводининг сўнгги янгиликлари: янги ишлаб чиқариш линиялари, кўргазмалар ва маҳсулот каталоги янгиланишлари.",
      "Последние новости завода MCITY: новые производственные линии, выставки и обновления каталога продукции.",
      "Latest news from the MCITY plant: new production lines, exhibitions and catalog updates.",
    ),
  },

  partners: {
    title: L(
      "Hamkorlar — MCITY",
      "Ҳамкорлар — MCITY",
      "Партнёры — MCITY",
      "Partners — MCITY",
    ),
    description: L(
      "MCITY sanoat kompaniyalari va yetkazib beruvchilar bilan hamkorlik qiladi. Hamkorlik takliflari uchun biz bilan bog'laning.",
      "MCITY саноат компаниялари ва етказиб берувчилар билан ҳамкорлик қилади. Ҳамкорлик таклифлари учун биз билан боғланинг.",
      "MCITY сотрудничает с промышленными компаниями и поставщиками. По вопросам партнёрства свяжитесь с нами.",
      "MCITY works with industrial companies and suppliers. Contact us to discuss partnership.",
    ),
  },

  contact: {
    title: L(
      "Bog'lanish va narx so'rash — MCITY",
      "Боғланиш ва нарх сўраш — MCITY",
      "Контакты и запрос цены — MCITY",
      "Contact and Quote Request — MCITY",
    ),
    description: L(
      "MCITY bilan bog'lanish: manzil, telefon va elektron pochta. Maxsus texnika bo'yicha narx so'rovi va texnik maslahat.",
      "MCITY билан боғланиш: манзил, телефон ва электрон почта. Махсус техника бўйича нарх сўрови ва техник маслаҳат.",
      "Контакты MCITY: адрес, телефон и электронная почта. Запрос цены на спецтехнику и техническая консультация.",
      "Contact MCITY: address, phone and email. Request a quote for special equipment and get technical advice.",
    ),
  },

  store: {
    title: L(
      "Onlayn buyurtma — maxsus texnika sotib olish",
      "Онлайн буюртма — махсус техника сотиб олиш",
      "Онлайн-заказ — купить спецтехнику",
      "Online Ordering — Buy Special Equipment",
    ),
    description: L(
      "MCITY maxsus texnikasini onlayn buyurtma qilish: modelni tanlang, savatga qo'shing va so'rov yuboring. Yetkazib berish O'zbekiston bo'ylab.",
      "MCITY махсус техникасини онлайн буюртма қилиш: моделни танланг, саватга қўшинг ва сўров юборинг. Етказиб бериш Ўзбекистон бўйлаб.",
      "Онлайн-заказ спецтехники MCITY: выберите модель, добавьте в корзину и отправьте запрос. Доставка по Узбекистану.",
      "Order MCITY special equipment online: choose a model, add it to the cart and send a request. Delivery across Uzbekistan.",
    ),
  },

  checkout: {
    title: L(
      "Buyurtmani rasmiylashtirish — MCITY",
      "Буюртмани расмийлаштириш — MCITY",
      "Оформление заказа — MCITY",
      "Checkout — MCITY",
    ),
    description: L(
      "Buyurtmani rasmiylashtirish sahifasi.",
      "Буюртмани расмийлаштириш саҳифаси.",
      "Страница оформления заказа.",
      "Order checkout page.",
    ),
  },
};

/** Kategoriya sahifasi (katalogning filtrlangan ko'rinishi) uchun matn */
export const CATEGORY_TITLE: Record<Lang, (name: string) => string> = {
  uz: (n) => `${n} — MCITY katalogi | O'zbekiston`,
  uzc: (n) => `${n} — MCITY каталоги | Ўзбекистон`,
  ru: (n) => `${n} — каталог MCITY | Узбекистан`,
  en: (n) => `${n} — MCITY Catalog | Uzbekistan`,
};

export const CATEGORY_DESCRIPTION: Record<Lang, (name: string, count: number) => string> = {
  uz: (n, c) =>
    `${n} turkumidagi ${c} ta model. MCITY zavodida ishlab chiqarilgan maxsus texnika: texnik xususiyatlari, rasmlari va narx so'rovi.`,
  uzc: (n, c) =>
    `${n} туркумидаги ${c} та модел. MCITY заводида ишлаб чиқарилган махсус техника: техник хусусиятлари, расмлари ва нарх сўрови.`,
  ru: (n, c) =>
    `${c} моделей в категории «${n}». Спецтехника производства завода MCITY: характеристики, фотографии и запрос цены.`,
  en: (n, c) =>
    `${c} models in the ${n} category. Special equipment built at the MCITY plant: specifications, photos and quote requests.`,
};

/** Katalog sahifasining H1 sarlavhasi (title tegidan farqli, qisqaroq) */
export const CATALOG_HEADING: Record<Lang, string> = {
  uz: "Maxsus texnika katalogi",
  uzc: "Махсус техника каталоги",
  ru: "Каталог спецтехники",
  en: "Special Equipment Catalog",
};

/** Katalog sahifasi H1 ostidagi izoh */
export const CATALOG_SUBHEADING: Record<Lang, string> = {
  uz: "Yuk ko'taruvchi, kommunal, aeroport va yong'in texnikasi — MCITY zavodida ishlab chiqarilgan",
  uzc: "Юк кўтарувчи, коммунал, аэропорт ва ёнғин техникаси — MCITY заводида ишлаб чиқарилган",
  ru: "Грузоподъёмная, коммунальная, аэропортовая и пожарная техника — производство завода MCITY",
  en: "Lifting, municipal, airport and firefighting machinery — built at the MCITY plant",
};
