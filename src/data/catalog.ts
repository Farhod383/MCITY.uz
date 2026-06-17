import type { Lang } from "@/i18n/translations";
import fuelTanker from "@/assets/veh-fuel-tanker.jpg";
import waterTanker from "@/assets/veh-water-tanker.jpg";
import sewerTruck from "@/assets/veh-sewer-truck.jpg";
import sweeper from "@/assets/veh-sweeper.jpg";
import garbage from "@/assets/veh-garbage.jpg";
import aerial from "@/assets/veh-aerial.jpg";
import crane from "@/assets/veh-crane.jpg";
import manipulator from "@/assets/veh-manipulator.jpg";
import tow from "@/assets/veh-tow.jpg";
import fire from "@/assets/veh-fire.jpg";
import ambulance from "@/assets/veh-ambulance.jpg";
import ambulift from "@/assets/veh-ambulift.jpg";
import workshop from "@/assets/veh-workshop.jpg";
import roadmaint from "@/assets/veh-roadmaint.jpg";

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
  { id: "tank", name: L("Sisterna texnikasi", "Систерна техникаси", "Цистерны", "Tanker Vehicles"), image: fuelTanker },
  { id: "municipal", name: L("Kommunal texnika", "Коммунал техника", "Коммунальная техника", "Municipal Vehicles"), image: sweeper },
  { id: "lifting", name: L("Ko'tarish va yuk texnikasi", "Кўтариш ва юк техникаси", "Подъёмная техника", "Lifting & Cargo"), image: crane },
  { id: "airport", name: L("Aeroport texnikasi", "Аэропорт техникаси", "Аэропортовая техника", "Airport Equipment"), image: ambulift },
  { id: "emergency", name: L("Favqulodda xizmat texnikasi", "Фавқулодда хизмат техникаси", "Аварийно-спасательная техника", "Emergency Vehicles"), image: fire },
  { id: "special", name: L("Maxsus texnika", "Махсус техника", "Специальная техника", "Special Vehicles"), image: workshop },
];

const spec = (lbl: Loc, value: string) => ({ label: lbl, value });
const CHS = L("Shassi", "Шасси", "Шасси", "Chassis");
const CAP = L("Sig'imi", "Сиғими", "Объём", "Capacity");
const PWR = L("Quvvat", "Қувват", "Мощность", "Power");
const GVW = L("To'liq massa", "Тўлиқ масса", "Полная масса", "Gross weight");
const APP = L("Qo'llanilishi", "Қўлланилиши", "Применение", "Application");

export const products: Product[] = [
  {
    id: "fuel-tanker", categoryId: "tank", bestseller: true,
    name: L("Avtotoplivozapravshik", "Автотопливозаправшик", "Автотопливозаправщик", "Fuel Tank Truck"),
    description: L(
      "Yoqilg'ini xavfsiz tashish va quyish uchun maxsus avtosisterna, hisoblagich va nasos tizimi bilan jihozlangan.",
      "Ёқилғини хавфсиз ташиш ва қуйиш учун махсус автосистерна, ҳисоблагич ва насос тизими билан жиҳозланган.",
      "Автоцистерна для безопасной перевозки и заправки топливом, оснащённая счётчиком и насосной системой.",
      "Special tanker for safe transport and dispensing of fuel, equipped with metering and pump systems.",
    ),
    image: fuelTanker, gallery: [fuelTanker],
    specs: [spec(CAP, "10 000 – 25 000 L"), spec(CHS, "MAN / Isuzu / KamAZ"), spec(GVW, "18 – 32 t")],
  },
  {
    id: "road-maintenance", categoryId: "municipal",
    name: L("Kombinatsiyalangan yo'l mashinasi", "Комбинациялаштирилган йўл машинаси", "Комбинированная дорожная машина", "Combined Road Maintenance Vehicle"),
    description: L(
      "Yil davomida yo'llarni parvarishlash uchun ko'p funksiyali mashina: qor tozalash, reagent sepish va yuvish.",
      "Йил давомида йўлларни парваришлаш учун кўп функцияли машина: қор тозалаш, реагент сепиш ва ювиш.",
      "Многофункциональная машина для круглогодичного содержания дорог: уборка снега, распределение реагентов и мойка.",
      "Multi-function vehicle for year-round road maintenance: snow clearing, de-icer spreading and washing.",
    ),
    image: roadmaint, gallery: [roadmaint],
    specs: [spec(APP, "Yo'l xizmati"), spec(CHS, "Universal"), spec(GVW, "18 – 26 t")],
  },
  {
    id: "water-sprinkler", categoryId: "municipal", bestseller: true,
    name: L("Polivomoechnaya mashina", "Поливомоечная машина", "Поливомоечная машина", "Water Sprinkler Truck"),
    description: L(
      "Ko'cha va yo'llarni yuvish, sug'orish va changni bostirish uchun suv sepuvchi mashina.",
      "Кўча ва йўлларни ювиш, суғориш ва чангни бостириш учун сув сепувчи машина.",
      "Машина для мойки и полива улиц и дорог, а также для пылеподавления.",
      "Sprinkler truck for washing, watering streets and roads, and dust suppression.",
    ),
    image: sweeper, gallery: [sweeper],
    specs: [spec(CAP, "6 000 – 12 000 L"), spec(CHS, "Isuzu / Howo"), spec(APP, "Kommunal")],
  },
  {
    id: "drinking-water", categoryId: "tank",
    name: L("Ichimlik suvi sisternasi", "Ичимлик суви систернаси", "Цистерна для питьевой воды", "Drinking Water Tanker"),
    description: L(
      "Ichimlik suvini gigiyenik tashish uchun zanglamaydigan po'latdan tayyorlangan izolyatsiyalangan sisterna.",
      "Ичимлик сувини гигиеник ташиш учун зангламайдиган пўлатдан тайёрланган изоляцияланган систерна.",
      "Изолированная цистерна из нержавеющей стали для гигиеничной перевозки питьевой воды.",
      "Insulated stainless-steel tanker for hygienic transport of drinking water.",
    ),
    image: waterTanker, gallery: [waterTanker],
    specs: [spec(CAP, "5 000 – 16 000 L"), spec(L("Material", "Материал", "Материал", "Material"), "AISI 304"), spec(CHS, "Universal")],
  },
  {
    id: "milk-tanker", categoryId: "tank",
    name: L("Molokovoz", "Молоковоз", "Молоковоз", "Milk Tanker"),
    description: L(
      "Sutni sovuq holatda tashish uchun termoizolyatsiyalangan zanglamaydigan po'lat sisterna.",
      "Сутни совуқ ҳолатда ташиш учун термоизоляцияланган зангламайдиган пўлат систерна.",
      "Термоизолированная цистерна из нержавеющей стали для перевозки молока в охлаждённом виде.",
      "Thermally insulated stainless-steel tanker for chilled milk transport.",
    ),
    image: waterTanker, gallery: [waterTanker],
    specs: [spec(CAP, "4 000 – 18 000 L"), spec(L("Sektsiyalar", "Секциялар", "Секции", "Sections"), "1 – 3"), spec(L("Material", "Материал", "Материал", "Material"), "AISI 304")],
  },
  {
    id: "technical-water", categoryId: "tank",
    name: L("Texnik suv sisternasi", "Техник сув систернаси", "Цистерна для технической воды", "Technical Water Tanker"),
    description: L(
      "Texnik suvni qurilish va sanoat maydonlariga yetkazib berish uchun avtosisterna.",
      "Техник сувни қурилиш ва саноат майдонларига етказиб бериш учун автосистерна.",
      "Автоцистерна для доставки технической воды на строительные и промышленные объекты.",
      "Tanker for delivering technical water to construction and industrial sites.",
    ),
    image: waterTanker, gallery: [waterTanker],
    specs: [spec(CAP, "8 000 – 20 000 L"), spec(CHS, "KamAZ / Howo"), spec(APP, "Sanoat")],
  },
  {
    id: "vacuum-sewer", categoryId: "municipal", bestseller: true,
    name: L("Assenizator", "Ассенизатор", "Ассенизаторская машина", "Vacuum Sewer Truck"),
    description: L(
      "Suyuq chiqindilarni vakuum yordamida so'rib olish va tashish uchun assenizatsiya mashinasi.",
      "Суюқ чиқиндиларни вакуум ёрдамида сўриб олиш ва ташиш учун ассенизация машинаси.",
      "Ассенизаторская машина для вакуумного сбора и вывоза жидких отходов.",
      "Vacuum truck for suction collection and transport of liquid waste.",
    ),
    image: sewerTruck, gallery: [sewerTruck],
    specs: [spec(CAP, "5 000 – 15 000 L"), spec(L("Vakuum nasosi", "Вакуум насоси", "Вакуумный насос", "Vacuum pump"), "Battioni / Jurop"), spec(CHS, "Isuzu / KamAZ")],
  },
  {
    id: "combined-sewer", categoryId: "municipal",
    name: L("Kombinatsiyalangan kanal yuvish mashinasi", "Комбинациялаштирилган канал ювиш машинаси", "Комбинированная каналопромывочная машина", "Combined Sewer Cleaning Vehicle"),
    description: L(
      "Kanalizatsiya tarmoqlarini yuqori bosimda yuvish va so'rib tozalash uchun kombinatsiyalangan mashina.",
      "Канализация тармоқларини юқори босимда ювиш ва сўриб тозалаш учун комбинациялаштирилган машина.",
      "Комбинированная машина для промывки канализационных сетей под высоким давлением и вакуумной откачки.",
      "Combined machine for high-pressure jetting and vacuum cleaning of sewer networks.",
    ),
    image: sewerTruck, gallery: [sewerTruck],
    specs: [spec(CAP, "8 000 – 16 000 L"), spec(L("Bosim", "Босим", "Давление", "Pressure"), "150 – 200 bar"), spec(CHS, "Howo / MAN")],
  },
  {
    id: "airport-sanitation", categoryId: "airport",
    name: L("Aeroport assenizatsiya mashinasi", "Аэропорт ассенизация машинаси", "Аэропортовая ассенизаторская машина", "Airport Service Vehicle"),
    description: L(
      "Aeroportlarda samolyot hojatxonalarini xizmat ko'rsatish uchun maxsus assenizatsiya mashinasi.",
      "Аэропортларда самолёт ҳожатхоналарини хизмат кўрсатиш учун махсус ассенизация машинаси.",
      "Специальная машина для обслуживания туалетных систем самолётов в аэропортах.",
      "Special vehicle for servicing aircraft lavatory systems at airports.",
    ),
    image: sewerTruck, gallery: [sewerTruck],
    specs: [spec(CAP, "1 000 – 3 000 L"), spec(APP, "Aeroport"), spec(CHS, "Isuzu")],
  },
  {
    id: "ambulift", categoryId: "airport", bestseller: true,
    name: L("Ambulift", "Амбулифт", "Амбулифт", "Ambulift"),
    description: L(
      "Harakatlanishi cheklangan yo'lovchilarni samolyotga chiqarish va tushirish uchun ko'taruvchi mashina.",
      "Ҳаракатланиши чекланган йўловчиларни самолётга чиқариш ва тушириш учун кўтарувчи машина.",
      "Подъёмная машина для посадки и высадки пассажиров с ограниченной подвижностью в самолёт.",
      "Lift vehicle for boarding and deboarding passengers with reduced mobility to aircraft.",
    ),
    image: ambulift, gallery: [ambulift],
    specs: [spec(L("Ko'tarish balandligi", "Кўтариш баландлиги", "Высота подъёма", "Lift height"), "2.5 – 5.8 m"), spec(L("Yuk ko'tarish", "Юк кўтариш", "Грузоподъёмность", "Capacity"), "1 500 kg"), spec(APP, "Aeroport")],
  },
  {
    id: "vacuum-sweeper", categoryId: "municipal",
    name: L("Vakuumli yo'l supurish mashinasi", "Вакуумли йўл супуриш машинаси", "Вакуумная подметально-уборочная машина", "Vacuum Road Sweeper"),
    description: L(
      "Ko'cha va yo'llarni cho'tka va vakuum tizimi bilan tozalovchi supurish mashinasi.",
      "Кўча ва йўлларни чўтка ва вакуум тизими билан тозаловчи супуриш машинаси.",
      "Подметально-уборочная машина для очистки улиц и дорог щётками и вакуумной системой.",
      "Sweeper that cleans streets and roads with brushes and a vacuum system.",
    ),
    image: sweeper, gallery: [sweeper],
    specs: [spec(L("Bunker", "Бункер", "Бункер", "Hopper"), "4 – 7 m³"), spec(L("Suv baki", "Сув баки", "Бак воды", "Water tank"), "1 000 – 2 000 L"), spec(CHS, "Isuzu")],
  },
  {
    id: "chemical-tanker", categoryId: "tank",
    name: L("Kimyoviy moddalar tashuvchi sisterna", "Кимёвий моддалар ташувчи систерна", "Цистерна для перевозки химических веществ", "Chemical Tank Truck"),
    description: L(
      "Agressiv kimyoviy suyuqliklarni xavfsiz tashish uchun maxsus qoplamali avtosisterna (ADR).",
      "Агрессив кимёвий суюқликларни хавфсиз ташиш учун махсус қопламали автосистерна (ADR).",
      "Автоцистерна со специальным покрытием для безопасной перевозки агрессивных химических жидкостей (ADR).",
      "Tanker with special lining for safe transport of aggressive chemical liquids (ADR).",
    ),
    image: fuelTanker, gallery: [fuelTanker],
    specs: [spec(CAP, "10 000 – 24 000 L"), spec(L("Standart", "Стандарт", "Стандарт", "Standard"), "ADR"), spec(CHS, "MAN / KamAZ")],
  },
  {
    id: "aerial-platform", categoryId: "lifting", bestseller: true,
    name: L("Teleskopik avtovishka", "Телескопик автовишка", "Телескопический автовышка", "Aerial Platform Truck"),
    description: L(
      "Balandlikdagi ishlar uchun teleskopik strelali ko'taruvchi platforma (avtovishka).",
      "Баландликдаги ишлар учун телескопик стрелали кўтарувчи платформа (автовишка).",
      "Подъёмная платформа с телескопической стрелой для работ на высоте.",
      "Telescopic boom aerial work platform for elevated tasks.",
    ),
    image: aerial, gallery: [aerial],
    specs: [spec(L("Ish balandligi", "Иш баландлиги", "Высота работы", "Working height"), "18 – 32 m"), spec(L("Korzina yuki", "Корзина юки", "Нагрузка люльки", "Basket load"), "250 kg"), spec(CHS, "Isuzu / KamAZ")],
  },
  {
    id: "mobile-crane", categoryId: "lifting", bestseller: true,
    name: L("Avtokran", "Автокран", "Автокран", "Mobile Crane"),
    description: L(
      "Og'ir yuklarni ko'tarish va o'rnatish uchun teleskopik strelali avtomobil kran.",
      "Оғир юкларни кўтариш ва ўрнатиш учун телескопик стрелали автомобил кран.",
      "Автомобильный кран с телескопической стрелой для подъёма и монтажа тяжёлых грузов.",
      "Truck-mounted telescopic crane for lifting and installing heavy loads.",
    ),
    image: crane, gallery: [crane],
    specs: [spec(L("Yuk ko'tarish", "Юк кўтариш", "Грузоподъёмность", "Lifting capacity"), "16 – 50 t"), spec(L("Strela", "Стрела", "Стрела", "Boom"), "21 – 40 m"), spec(CHS, "KamAZ / Howo")],
  },
  {
    id: "crane-manipulator", categoryId: "lifting",
    name: L("Kran-manipulyator", "Кран-манипулятор", "Кран-манипулятор", "Crane Manipulator"),
    description: L(
      "Yuk platformasi va bukiluvchi gidravlik kran bilan jihozlangan ko'p maqsadli mashina.",
      "Юк платформаси ва букилувчи гидравлик кран билан жиҳозланган кўп мақсадли машина.",
      "Многоцелевая машина с грузовой платформой и складной гидравлической крановой установкой.",
      "Versatile truck with cargo bed and folding hydraulic loader crane.",
    ),
    image: manipulator, gallery: [manipulator],
    specs: [spec(L("Kran momenti", "Кран моменти", "Момент крана", "Crane moment"), "7 – 15 t·m"), spec(L("Platforma", "Платформа", "Платформа", "Platform"), "5 – 7 m"), spec(CHS, "Isuzu")],
  },
  {
    id: "tow-truck", categoryId: "lifting",
    name: L("Evakuator", "Эвакуатор", "Эвакуатор", "Tow Truck"),
    description: L(
      "Avtomobillarni ko'tarib tashish uchun gidravlik qiyaluvchi platformali evakuator.",
      "Автомобилларни кўтариб ташиш учун гидравлик қиялувчи платформали эвакуатор.",
      "Эвакуатор с гидравлической наклонной платформой для перевозки автомобилей.",
      "Tow truck with hydraulic tilting platform for transporting vehicles.",
    ),
    image: tow, gallery: [tow],
    specs: [spec(L("Platforma uzunligi", "Платформа узунлиги", "Длина платформы", "Platform length"), "5 – 6.5 m"), spec(L("Lebyodka", "Лебёдка", "Лебёдка", "Winch"), "5 t"), spec(CHS, "Isuzu / KamAZ")],
  },
  {
    id: "garbage-truck", categoryId: "municipal", bestseller: true,
    name: L("Musorovoz", "Мусоровоз", "Мусоровоз", "Garbage Truck"),
    description: L(
      "Maishiy chiqindilarni yig'ish va presslab tashish uchun musor tashuvchi mashina.",
      "Маиший чиқиндиларни йиғиш ва прессдаб ташиш учун мусор ташувчи машина.",
      "Мусоровоз для сбора, прессования и вывоза бытовых отходов.",
      "Refuse truck for collecting, compacting and transporting household waste.",
    ),
    image: garbage, gallery: [garbage],
    specs: [spec(L("Bunker", "Бункер", "Бункер", "Body"), "10 – 18 m³"), spec(L("Presslash", "Прессдаш", "Прессование", "Compaction"), "1:5"), spec(CHS, "Howo / Isuzu")],
  },
  {
    id: "mobile-lab", categoryId: "special",
    name: L("Mobil laboratoriya", "Мобил лаборатория", "Мобильная лаборатория", "Mobile Laboratory"),
    description: L(
      "Dala sharoitida tahlil va sinovlar o'tkazish uchun jihozlangan mobil laboratoriya.",
      "Дала шароитида таҳлил ва синовлар ўтказиш учун жиҳозланган мобил лаборатория.",
      "Мобильная лаборатория, оборудованная для проведения анализов и испытаний в полевых условиях.",
      "Mobile laboratory equipped for field analysis and testing.",
    ),
    image: workshop, gallery: [workshop],
    specs: [spec(APP, "Laboratoriya"), spec(L("Quvvat manbai", "Қувват манбаи", "Электропитание", "Power supply"), "Generator"), spec(CHS, "Universal")],
  },
  {
    id: "fire-truck", categoryId: "emergency", bestseller: true,
    name: L("Yong'in o'chirish avtomobili", "Ёнғин ўчириш автомобили", "Пожарный автомобиль", "Fire Truck"),
    description: L(
      "Yong'inni o'chirish uchun suv-ko'pik tizimi va nasos bilan jihozlangan yong'in mashinasi.",
      "Ёнғинни ўчириш учун сув-кўпик тизими ва насос билан жиҳозланган ёнғин машинаси.",
      "Пожарный автомобиль с водопенной системой и насосом для тушения пожаров.",
      "Fire engine equipped with water-foam system and pump for firefighting.",
    ),
    image: fire, gallery: [fire],
    specs: [spec(CAP, "3 000 – 8 000 L"), spec(L("Nasos", "Насос", "Насос", "Pump"), "40 L/s"), spec(CHS, "KamAZ / MAN")],
  },
  {
    id: "ambulance", categoryId: "emergency",
    name: L("Tez yordam mashinasi", "Тез ёрдам машинаси", "Автомобиль скорой помощи", "Ambulance"),
    description: L(
      "Bemorlarni tashish va birinchi tibbiy yordam ko'rsatish uchun jihozlangan tez yordam avtomobili.",
      "Беморларни ташиш ва биринчи тиббий ёрдам кўрсатиш учун жиҳозланган тез ёрдам автомобили.",
      "Автомобиль скорой помощи, оснащённый для перевозки пациентов и оказания первой медицинской помощи.",
      "Ambulance equipped for patient transport and first medical aid.",
    ),
    image: ambulance, gallery: [ambulance],
    specs: [spec(L("Klass", "Класс", "Класс", "Class"), "A / B / C"), spec(APP, "Tibbiyot"), spec(CHS, "Transit / Sprinter")],
  },
  {
    id: "parm-workshop", categoryId: "special",
    name: L("Mobil ta'mirlash ustaxonasi (PARM)", "Мобил таъмирлаш устахонаси (ПАРМ)", "Мобильная ремонтная мастерская (ПАРМ)", "Mobile Workshop (PARM)"),
    description: L(
      "Texnikani dala sharoitida ta'mirlash uchun asbob-uskuna va jihozlar bilan to'liq jihozlangan ustaxona.",
      "Техникани дала шароитида таъмирлаш учун асбоб-ускуна ва жиҳозлар билан тўлиқ жиҳозланган устахона.",
      "Полностью оснащённая мастерская с инструментом и оборудованием для ремонта техники в полевых условиях.",
      "Fully equipped workshop with tools and machinery for field repair of equipment.",
    ),
    image: workshop, gallery: [workshop],
    specs: [spec(APP, "Ta'mirlash"), spec(L("Jihoz", "Жиҳоз", "Оснащение", "Equipment"), "Welder, compressor, crane"), spec(CHS, "KamAZ")],
  },
  {
    id: "engineering-transport", categoryId: "special",
    name: L("Muhandislik uskunalarini tashish avtomobili", "Муҳандислик ускуналарини ташиш автомобили", "Автомобиль для перевозки инженерного оборудования", "Engineering Equipment Transporter"),
    description: L(
      "Muhandislik va maxsus uskunalarni xavfsiz tashish uchun jihozlangan transport mashinasi.",
      "Муҳандислик ва махсус ускуналарни хавфсиз ташиш учун жиҳозланган транспорт машинаси.",
      "Транспортная машина для безопасной перевозки инженерного и специального оборудования.",
      "Transport vehicle equipped for the safe carriage of engineering and special equipment.",
    ),
    image: workshop, gallery: [workshop],
    specs: [spec(APP, "Transport"), spec(GVW, "12 – 26 t"), spec(CHS, "Universal")],
  },
  {
    id: "logging-station", categoryId: "special",
    name: L("Karotaj stansiyasi", "Каротаж станцияси", "Каротажная станция", "Mobile Logging Station"),
    description: L(
      "Quduqlarda geofizik karotaj ishlarini bajarish uchun maxsus jihozlangan mobil stansiya.",
      "Қудуқларда геофизик каротаж ишларини бажариш учун махсус жиҳозланган мобил станция.",
      "Мобильная станция, оснащённая для проведения геофизических каротажных работ в скважинах.",
      "Mobile station equipped for geophysical well-logging operations.",
    ),
    image: workshop, gallery: [workshop],
    specs: [spec(APP, "Geofizika"), spec(L("Lebyodka", "Лебёдка", "Лебёдка", "Winch"), "5 000 m"), spec(CHS, "KamAZ / Ural")],
  },
  {
    id: "rescue-vehicle", categoryId: "emergency",
    name: L("Avariya-qutqaruv avtomobili", "Авария-қутқарув автомобили", "Аварийно-спасательный автомобиль", "Emergency Rescue Vehicle"),
    description: L(
      "Favqulodda vaziyatlarda qutqaruv ishlari uchun maxsus asbob-uskunalar bilan jihozlangan avtomobil.",
      "Фавқулодда вазиятларда қутқарув ишлари учун махсус асбоб-ускуналар билан жиҳозланган автомобил.",
      "Автомобиль, оснащённый специальным оборудованием для проведения аварийно-спасательных работ.",
      "Vehicle equipped with special tools for rescue operations in emergencies.",
    ),
    image: workshop, gallery: [workshop],
    specs: [spec(APP, "Qutqaruv"), spec(L("Jihoz", "Жиҳоз", "Оснащение", "Equipment"), "Hydraulic tools, generator"), spec(CHS, "KamAZ")],
  },
  {
    id: "explosives-transport", categoryId: "special",
    name: L("Portlovchi moddalarni tashish avtomobili", "Портловчи моддаларни ташиш автомобили", "Автомобиль для перевозки взрывчатых веществ", "Explosives Transport Vehicle"),
    description: L(
      "Portlovchi moddalarni xavfsizlik talablariga to'liq mos holda tashish uchun maxsus avtomobil (ADR).",
      "Портловчи моддаларни хавфсизлик талабларига тўлиқ мос ҳолда ташиш учун махсус автомобил (ADR).",
      "Специальный автомобиль для перевозки взрывчатых веществ в полном соответствии с требованиями безопасности (ADR).",
      "Special vehicle for transporting explosives in full compliance with safety requirements (ADR).",
    ),
    image: workshop, gallery: [workshop],
    specs: [spec(L("Standart", "Стандарт", "Стандарт", "Standard"), "ADR Class 1"), spec(APP, "Maxsus yuk"), spec(CHS, "KamAZ")],
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const bestsellers = products.filter((p) => p.bestseller);