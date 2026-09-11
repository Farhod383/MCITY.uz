# MCITY — kiritilgan o'zgarishlar

Sana: 07.09.2026

Quyida siz so'ragan barcha o'zgarishlar va ularni ishga tushirish tartibi.

---

## 1. Bosh sahifadagi raqamlar

- `25+` → **`40+`**
- `8 / Texnika yo'nalishlari` katagi **butunlay olib tashlandi**
- Endi 3 ta katak qoldi: **2019 / 40+ / 100%**. Ular sahifa kengligi bo'ylab
  tekis joylashadi — bo'sh joy qolmaydi.
- Bu raqamlar ikki joyda ko'rinadi (yuqoridagi qora chiziq va "Yutuqlar"
  bo'limi) — ikkalasi ham yangilandi.

Fayl: `src/routes/index.tsx`, `src/data/catalog.ts`

---

## 2. Rasm fonlari — qoradan och kulrangga

14 ta texnika rasmining foni almashtirildi: qora studiya foni kesib olinib,
o'rniga **och kulrang** (yumshoq gradient `#F3F4F6` → `#D7DADE`) qo'yildi.
Har bir mashina ostiga tabiiy ko'rinishi uchun yengil soya qo'shildi.

Fayl nomlari o'zgarmadi, shuning uchun kodga hech narsa qo'shish shart emas —
rasmlar shunchaki almashtirildi.

> **Eslatma:** eski qora fonli rasmlar bu arxivda yo'q. Agar ular kerak bo'lsa,
> menga yuborgan asl zip faylingizdan oling — u o'zgarmagan holida turibdi.

Papka: `src/assets/veh-*.jpg`

---

## 3. Ma'lumotlar bazasi (Supabase)

Uchta jadval yaratildi:

| Jadval | Nima uchun |
|---|---|
| `categories` | Texnika yo'nalishlari (8 ta) |
| `products` | Texnika modellari (25 ta) — nomi, tavsifi, xarakteristikalari, narxi, rasmi |
| `site_stats` | Bosh sahifadagi raqamlar (2019 / 40+ / 100%) |

Barcha matnlar **4 tilda** saqlanadi (o'zbek lotin, o'zbek kirill, rus,
ingliz) — sayt allaqachon 4 tilli bo'lgani uchun.

Xarakteristikalar (`specs`) ro'yxat ko'rinishida saqlanadi, chunki har bir
texnikada ular soni har xil — birida 3 ta, boshqasida 5 ta bo'lishi mumkin.

**Xavfsizlik (RLS):** oddiy mehmonlar faqat o'qiy oladi, ham faqat
"ko'rinsin" belgilangan qatorlarni. Qo'shish, o'zgartirish va o'chirish
faqat tizimga kirgan admin uchun.

Fayl: `supabase/migrations/20260907120000_mcity_catalog.sql`
(sxema + hozirgi barcha 25 ta texnika ichida)

---

## 4. Yashirin kirish

Saytda **hech qanday "Kirish" yoki "Ro'yxatdan o'tish" tugmasi yo'q.**

Panelga kirish: yuqoridagi **MCITY logotipini tez ikki marta bosing** —
email va parol so'raydigan kichik oyna chiqadi. Logotipda hech qanday belgi
yo'q, sichqoncha ustiga borganda ham hech narsa o'zgarmaydi.

> Logotipni yashirish — bu qulaylik, himoya emas. Haqiqiy himoya parol va
> bazadagi RLS qoidalari. Shuning uchun **kuchli parol qo'ying.**

Fayllar: `src/auth/AuthContext.tsx`, `src/components/HiddenLoginDialog.tsx`,
`src/components/layout/Header.tsx`

---

## 5. Boshqaruv paneli — `/admin`

Kirgandan keyin ochiladi. Kirmagan odam `/admin` manzilini yozsa, jimgina
bosh sahifaga qaytariladi — login sahifasi umuman ko'rsatilmaydi.

Panelda qila oladigan ishlaringiz:

- **Texnika** bo'limi — ro'yxat, tahrirlash, yangi qo'shish, o'chirish
  - Nomi va tavsifi — 4 tilda
  - **Xarakteristikalar** — qator qo'shish, o'chirish, joyini almashtirish
    (yuqoriga / pastga). Har bir qatorning nomi 4 tilda, qiymati bitta.
  - **Narxi** — so'mda. Bo'sh qoldirsangiz saytda "Narx so'rov bo'yicha"
    deb chiqadi.
  - Rasm — tayyor ro'yxatdan tanlash yoki tashqi havola qo'yish
  - Tartib raqami — qaysi biri oldin turishi
  - "Saytda ko'rinsin" — o'chirsangiz texnika o'chmaydi, shunchaki
    saytdan yashirinadi
  - "Bosh sahifada ajratib ko'rsatilsin"
- **Raqamlar** bo'limi — 2019 / 40+ / 100% ni tahrirlash

Panel telefonda ham qulay ishlaydi.

Fayllar: `src/routes/admin.tsx`, `src/data/admin-api.ts`

---

## 6. Sayt endi bazadan o'qiydi

Bosh sahifa, katalog, har bir texnika sahifasi, onlayn do'kon, savat va
sitemap — hammasi bazadan ma'lumot oladi.

**Muhim:** agar Supabase hali ulanmagan bo'lsa yoki baza bo'sh bo'lsa,
sayt eski ma'lumot bilan **xuddi avvalgidek ishlayveradi**. Ya'ni bu arxivni
hoziroq Lovable'ga yuklasangiz ham hech narsa buzilmaydi — sayt bemalol
ochiladi, faqat admin panel "Supabase ulanmagan" deb yozadi.

Dizayn, ranglar, shriftlar, animatsiyalar — hech biri o'zgarmadi.

Fayllar: `src/lib/supabase.ts`, `src/data/catalog-source.ts`,
`src/data/useCatalog.ts`, `src/data/asset-map.ts`

---

## 7. Logotip (yangi)

Yuborgan logotipingiz **vektorga (SVG)** aylantirildi — endi u har qanday
o'lchamda, har qanday ekranda tiniq chiqadi, rasm sifatida "xiralashmaydi".

Joylashuvi: sahifa yuqorisidagi menyuda va sahifa pastida (footer). Eski
kvadrat "M" belgisi va yozuv olib tashlandi.

**Animatsiya:**
- Sahifa ochilganda logotip chapdan o'ngga ochilib chiqadi (~1 soniya)
- Sichqoncha ustiga kelganda yengil kattalashadi va ko'k nur beradi
- Bosganda ozgina kichrayadi

Rang `currentColor` orqali beriladi, ya'ni qora fonda oq, oq fonda ko'k
qilib qo'yish uchun bitta klass yetarli:
`<Logo className="text-white" />` yoki `<Logo className="text-[#0A08EE]" />`

> Logotip qora fonda **oq** rangda turibdi. Brend ko'ki (#0A08EE) qora fonda
> juda xira ko'rinardi, shuning uchun oq tanlandi — ko'k nur (glow) esa
> brend rangini eslatib turadi.

Fayllar: `src/components/Logo.tsx`, `src/styles.css`,
`src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`

---

## 8. Footer ma'lumotlari endi admin panelda (yangi)

Sahifa pastidagi blokdagi hamma narsa endi paneldan o'zgartiriladi:

- Kompaniya haqida qisqacha matn (4 tilda)
- Manzil (4 tilda)
- Shior / tagline (4 tilda)
- Telefon raqami
- Email
- Ijtimoiy tarmoq havolalari: Facebook, Instagram, LinkedIn, Telegram

Panel: `/admin` → **«Sayt ma'lumotlari»** bo'limi.

Ikkita foydali xususiyat:

1. **Bo'sh ijtimoiy tarmoq ko'rinmaydi.** Hozir havolalar bo'sh, shuning
   uchun footer'da hech qanday belgi chiqmayapti. Havola qo'ysangiz —
   o'sha belgi paydo bo'ladi.
2. **Telefon va email bosiladigan bo'ldi.** Telefonda bosilsa qo'ng'iroq,
   emailda bosilsa pochta ochiladi.

Bu ma'lumotlar **«Bog'lanish» sahifasida ham** avtomatik yangilanadi —
ikki joyda alohida yozib chiqish shart emas.

Jadval: `site_settings` (bitta qator, `id = 'main'`)
Migratsiya: `supabase/migrations/20260907130000_site_settings.sql`
Fayllar: `src/components/layout/Footer.tsx`, `src/routes/contact.tsx`,
`src/routes/admin.tsx`, `src/data/admin-api.ts`

---

## 9. Ko'p tilli URL va SEO (yangi)

Eng katta o'zgarish: **har bir tilning endi o'z manzili bor.** Avval til
faqat brauzer xotirasida saqlanardi va Google faqat bitta (o'zbekcha)
versiyani ko'rardi — rus va ingliz kontenti qidiruvda umuman yo'q edi.

Yangi manzil strukturasi:

```
mcity.uz/uz                              bosh sahifa
mcity.uz/uz/maxsus-texnika               katalog
mcity.uz/ru/specztehnika                 каталог
mcity.uz/en/special-equipment            catalog
mcity.uz/uz/maxsus-texnika/mobile-crane  mahsulot
```

Katalog manzili har bir tilda tarjima qilingan — URL ham qidiruv
tizimlari uchun kalit so'z hisoblanadi.

Eski manzillar yo'qolmadi: `/products/mobile-crane` → `/uz/maxsus-texnika/mobile-crane`
ga **301** bilan ko'chiriladi, ya'ni tashqi havolalar va Google'dagi
mavjud o'rin saqlanadi.

Har bir sahifada endi bor:

- takrorlanmas `title` va `description` — 4 tilda alohida yozilgan
- `canonical` — har doim o'sha tilning o'z manziliga
- `hreflang` — uz, uz-Cyrl, ru, en va x-default
- Open Graph va Twitter kartochkalari + `og-default.jpg` rasmi
- `<html lang="...">` sahifa tiliga mos
- JSON-LD: Organization, WebSite, WebPage, BreadcrumbList, Product, ItemList

Katalogdagi har bir kategoriya ham mustaqil indekslanadigan sahifa
(`?cat=lifting`) — o'z sarlavhasi, tavsifi va canonical'i bilan.

`sitemap.xml` — 168 ta manzil (4 til × 42 sahifa), har biri boshqa
tillarga `xhtml:link` bilan bog'langan.
`robots.txt` — admin va buyurtma sahifalari yopiq, CSS/JS/rasmlar ochiq.

Mahsulot sahifasiga qo'shildi: **breadcrumbs**, ishlab chiqaruvchi,
model, kategoriya qatorlari va mavjudlik belgisi.

**Muhim:** dizayn, ranglar, shriftlar va animatsiyalar o'zgarmadi.

Batafsil: **`DEPLOYMENT.md`** faylida — domen, DNS, hosting va Google
Search Console bo'yicha qadamma-qadam ko'rsatma.

---

## 10. PDF katalogni yuklash (yangi)

Katalog sahifasidagi **«PDF katalogni yuklab olish»** tugmasi avval faqat
xabar chiqarardi — hech qanday fayl yuklanmasdi. Endi u haqiqiy ishlaydi.

**Admin panelda:** `/admin` → **«PDF katalog»** bo'limi.

- «PDF faylni tanlash» tugmasini bosib, tayyor PDF'ingizni yuklaysiz
- Fayl Supabase Storage'ga saqlanadi, havolasi bazaga yoziladi
- Yuklangan fayl nomi va sanasi ko'rinib turadi, «Ochish» bilan
  tekshirasiz
- Yangi fayl yuklasangiz — eskisining **ustiga yoziladi**, chiqindi
  fayllar to'planmaydi
- O'chirish tugmasi ham bor (tasdiqlash so'raladi)

**Cheklovlar:** faqat `.pdf`, maksimal **40 MB**. Bular ham brauzerda,
ham bazada tekshiriladi.

**Saytda:** fayl yuklanmagan bo'lsa tugma **umuman ko'rinmaydi**.
Ishlamaydigan tugma ko'rsatgandan ko'ra shunisi to'g'ri. Fayl yuklangach
tugma o'zi paydo bo'ladi va yangi oynada ochiladi.

Yangi migratsiya: `supabase/migrations/20260907140000_catalog_pdf.sql`
— `site_settings` ga 3 ta ustun qo'shadi va Storage'da `catalog` papkasini
yaratadi (hamma o'qiydi, faqat admin yozadi).

Fayllar: `src/routes/admin.tsx`, `src/data/admin-api.ts`,
`src/pages/products.tsx`, `src/data/catalog.ts`, `src/data/catalog-source.ts`

---

## 11. Bog'lanish sahifasi (yangi)

**Xarita tuzatildi.** Avval xarita butun Toshkentni ko'rsatardi va hech
qanday belgi yo'q edi — shuning uchun joy ko'rinmasdi. Endi:

- Xarita aniq nuqtaga **belgi (pin)** qo'yadi
- Ko'rinish tor — taxminan 600 metrlik hudud
- Ostida «Kattaroq xaritada ochish» havolasi (Google Maps'da ochiladi)

**Koordinata admin paneldan qo'yiladi:** `/admin` → «Sayt ma'lumotlari»
→ pastda **«Xaritadagi joy»**. Kenglik va uzunlikni yozasiz, ostidagi
ko'rinish darhol yangilanadi — belgi to'g'ri joyda turganini ko'rib,
so'ng saqlaysiz.

> Hozircha Toshkent markazi qo'yilgan, chunki zavodning aniq
> koordinatasini bilmayman. Google Maps'da kerakli joyni **o'ng tugma**
> bilan bossangiz, birinchi qatorda ikkita raqam chiqadi — o'shani
> ko'chirasiz.

**Forma endi haqiqatan ishlaydi.** Avval "Xabar yuborish" tugmasi
faqat "yuborildi" deb yozardi, aslida hech qayerga saqlamasdi —
ya'ni barcha murojaatlar yo'qolib ketardi.

Endi xabar bazaga tushadi va panelda **«Xabarlar»** bo'limida ko'rinadi:

- O'qilmagan xabarlar ajratib turadi, bo'lim nomida ularning soni chiqadi
- Telefon raqamiga bosilsa qo'ng'iroq, emailga bosilsa pochta ochiladi
- «O'qildi» belgisi va o'chirish tugmasi bor
- Qaysi tilda va qaysi sahifadan yozilgani ko'rsatiladi

**Xavfsizlik:** mehmon faqat xabar **yoza** oladi. Boshqalarning
xabarlarini o'qish faqat tizimga kirgan admin uchun ochiq — buni baza
darajasida (RLS) cheklab qo'ydim, brauzerdan aylanib o'tib bo'lmaydi.

Yangi migratsiya: `supabase/migrations/20260908120000_contact.sql`
Fayllar: `src/pages/contact.tsx`, `src/data/contact-api.ts`,
`src/routes/admin.tsx`, `src/data/admin-api.ts`

---

## 12. Bir nechta telefon raqami (yangi)

Avval bitta raqam saqlanardi. Endi **ro'yxat** — uchta ham, ko'proq ham
qo'sha olasiz.

Admin panelda: **«Sayt ma'lumotlari»** → **«Telefon raqamlari»**

- «Raqam qo'shish» tugmasi bilan yangi qator qo'shiladi
- Yuqoriga ko'chirish va o'chirish tugmalari bor
- Birinchi raqam asosiy hisoblanadi

Barcha raqamlar saytda ikki joyda ketma-ket ko'rinadi: sahifa pastidagi
footer'da va «Bog'lanish» sahifasida. Har biri bosilsa qo'ng'iroq qiladi
(telefonda), va Google uchun ham har biri alohida aloqa nuqtasi sifatida
yoziladi.

Eski bitta raqam avtomatik ro'yxatga ko'chiriladi — qo'lda qayta kiritish
shart emas.

Yangi migratsiya: `supabase/migrations/20260908130000_phones.sql`
Fayllar: `src/data/catalog.ts`, `src/data/catalog-source.ts`,
`src/data/admin-api.ts`, `src/routes/admin.tsx`,
`src/components/layout/Footer.tsx`, `src/pages/contact.tsx`,
`src/lib/schema.ts`

---

# Ishga tushirish — 4 qadam

### 1-qadam. Supabase'ni ulang

Lovable'da loyihangizni oching → **Supabase → Connect**.

Lovable kalitlarni o'zi qo'shadi (`VITE_SUPABASE_URL` va
`VITE_SUPABASE_ANON_KEY`). Qo'lda hech narsa yozish shart emas.

### 2-qadam. Migratsiyani ishga tushiring

Ikki xil yo'l bor. Ikkalasi ham bir xil natija beradi.

**A) Eng oson — bitta fayl, bitta Run**

Loyihadagi shu faylni oching va **ichidagi hamma narsani** nusxalang:

```
supabase/migrations/HAMMASI-BIRGA.sql
```

Supabase → **SQL Editor → New query** → qo'ying → **Run**.

Bu faylda uchala migratsiya ketma-ket jamlangan: jadvallar, 8 yo'nalish,
25 texnika, footer ma'lumotlari va PDF katalog uchun Storage papkasi.

**B) Terminal orqali — Supabase panelini ochmasdan**

`.env.local` fayliga bazaga ulanish qatorini qo'shing:

```
DATABASE_URL=postgresql://postgres.xxxx:PAROL@...pooler.supabase.com:5432/postgres
```

(Supabase → yashil **Connect** tugmasi → Connection string → Session pooler)

So'ng:

```
npm run db:setup
```

Skript `supabase/migrations/` dagi barcha fayllarni to'g'ri tartibda
o'zi bajaradi va sxema keshini yangilaydi.

> Ikkala yo'lda ham qayta ishga tushirish xavfsiz — hech narsa
> takrorlanmaydi va o'chib ketmaydi.

### 3-qadam. O'zingizga admin akkaunt oching

Supabase panelida: **Authentication → Users → Add user → Create new user**

- Email: `admin@gmail.com`
- Parol: o'zingiz kiritasiz
- **"Auto Confirm User" belgilansin** (aks holda kira olmaysiz)

> Bu akkauntni men ochib bera olmayman — parol kiritish va akkaunt yaratish
> menga taqiqlangan, va sizning Supabase'ingizga ham ulana olmayman.
> Shuning uchun bu qadamni o'zingiz bajarasiz, 30 soniyalik ish.
>
> **Parol haqida:** `admin1234` juda oson parol. Sayt ommaviy bo'lgani uchun
> uni topish qiyin emas — kim topsa, butun katalogingizni o'chirib
> yuborishi mumkin. Kamida 12 belgili, harf-raqam-belgi aralash parol
> qo'yishni maslahat beraman. Qaror sizniki.

### 4-qadam. Ochiq ro'yxatdan o'tishni yoping

Supabase panelida: **Authentication → Sign In / Providers → Email** →
"Allow new users to sign up" **o'chirilgan** bo'lsin.

Shundan keyin sizdan boshqa hech kim akkaunt ocholmaydi.

---

# Tekshirish

1. Saytni oching — raqamlar **2019 / 40+ / 100%** bo'lishi kerak
2. Texnika rasmlari fonlari **och kulrang** bo'lishi kerak
3. Logotipni **tez ikki marta bosing** — login oynasi chiqishi kerak
4. Email va parolni kiriting — `/admin` ochiladi
5. Biror texnikani tahrirlab saqlang, keyin saytni yangilang — o'zgarish
   ko'rinishi kerak

---

## 13. Serverga joylashga tayyorlash (yangi)

Sayt endi **Oracle Cloud Always Free** serverida (va umuman har qanday
Node serverida) ishlaydigan holatga keltirildi. Ilgari build faqat
Cloudflare uchun mo'ljallangan edi va **ishga tushiriladigan fayl
umuman chiqmasdi** — hech qaysi hostingda ishlamasdi.

**Nima o'zgardi:**

- `vite.config.ts` — nitro majburan yoqildi va `node-server` rejimiga
  o'tkazildi. Endi `npm run build` `.output/server/index.mjs` faylini
  chiqaradi. `NITRO_PRESET` o'zgaruvchisi orqali Vercel yoki Cloudflare
  uchun ham yig'sa bo'ladi — kodga tegmasdan.
- `vite.config.ts` — xavfsizlik va kesh sarlavhalari (`X-Frame-Options`,
  `Referrer-Policy`, `/assets` uchun abadiy kesh, `/admin` uchun
  `noindex`) shu yerga ko'chirildi. Ilgari ular `public/_headers`
  faylida edi — u faqat Cloudflare Pages'da ishlardi, boshqa hech
  qayerda o'qilmasdi.
- `package.json` — `npm start` buyrug'i va Node 22 talabi qo'shildi.
- `src/server.ts` — `www` → `mcity.uz` yo'naltirishi tuzatildi.
  Ilgari u `http://mcity.uz` ga olib borardi (chunki nginx orqasida
  so'rov http bo'lib keladi), natijada ikki marta yo'naltirish
  (redirect chain) hosil bo'lardi — bu SEO uchun zarar. Endi doim
  `https://mcity.uz` ga bir marta yo'naltiradi.

**Yangi `deploy/` papkasi:**

| Fayl | Nima qiladi |
|---|---|
| `setup-server.sh` | Serverni noldan sozlaydi: Node, swap, kod, build, systemd, nginx, portlar |
| `update.sh` | Kodni yangilaydi va qayta ishga tushiradi. Build yiqilsa — eski versiya ishlab turaveradi |
| `mcity.service` | systemd xizmati. `Restart=always` — **sayt uxlab qolmaydi** |
| `nginx-mcity.conf` | nginx: 80/443 ni ushlaydi, `/assets` ni o'zi beradi, qolganini Node'ga uzatadi |

**Git uchun qo'shilgan fayllar:**

- `.gitattributes` — Windows'da ishlaganda "butun fayl o'zgardi" degan
  soxta farqlar chiqmasligi uchun (CRLF/LF muammosi)
- `.nvmrc` — Node versiyasi (22)
- `.gitignore` yangilandi — `.vercel`, `.env.production` va boshqalar
  qo'shildi, ular hech qachon repo'ga tushmaydi

**Tekshirilgani:** toza muhitda (`node_modules` o'chirilgan holda)
`npm ci` va `npm run build` o'tkazildi, chiqqan server ishga tushirildi
va nginx orqali kelganday so'rovlar yuborildi:

| Tekshiruv | Natija |
|---|---|
| `/uz`, `/ru/specztehnika`, `/uz/contact` | 200 |
| `/` | `/uz` ga 301 |
| `/uz/about/` | `https://mcity.uz/uz/about` ga 301 |
| `www.mcity.uz/uz/about` | `https://mcity.uz/uz/about` ga 301 |
| `http` → `https` | 301 |
| `/products/fuel-tanker` | `/uz/maxsus-texnika/fuel-tanker` ga 301 |
| `/robots.txt`, `/sitemap.xml` | 200 |
| Xavfsizlik sarlavhalari | hammasi joyida |
| `/admin` | `X-Robots-Tag: noindex, nofollow` |
| `HOST=127.0.0.1` | faqat ichkarida eshitadi (nginx orqali chiqadi) |
| Brauzerdagi JS xatolari | yo'q |
| `npx tsc --noEmit` | xato yo'q |

**Qo'lda qilinadigan ishlar** — `DEPLOYMENT.md`, 2–3 bo'limlar:
Oracle'da VM yaratish, portlarni ochish, bitta skriptni ishga tushirish,
Cloudflare'da DNS'ni almashtirish, certbot bilan HTTPS olish.

> Eslatma: `__root.tsx` dagi eski tip xatosi ham shu safar tuzatildi —
> endi `npx tsc --noEmit` hech qanday xato bermaydi.

---

# Bilib qo'yish kerak bo'lgan narsalar

- **Yangi rasm qo'shish.** Hozircha panelda fayl yuklash yo'q. Yangi rasmni
  Supabase Storage'ga yuklab, uning to'liq havolasini ("https://...")
  tahrirlash oynasidagi rasm maydoniga qo'ying. Loyiha ichidagi tayyor
  rasmlar ro'yxatdan tanlanadi.
- **Slug'ni o'zgartirmang.** Har bir texnikaning "manzil nomi" (slug) uning
  sahifa havolasi. O'zgartirsangiz eski havola ishlamay qoladi va qidiruv
  tizimlaridagi o'rni yo'qoladi.
- **O'chirish o'rniga yashirish.** Texnikani vaqtincha olib qo'ymoqchi
  bo'lsangiz, o'chirmang — "Saytda ko'rinsin" tugmasini o'chiring.
  O'chirilgan ma'lumotni qaytarib bo'lmaydi.
- **Yo'nalishlar (kategoriyalar) panelda tahrirlanmaydi.** Ular kamdan-kam
  o'zgargani uchun hozircha faqat bazadan o'zgartiriladi. Kerak bo'lsa
  keyin qo'shib beraman.
- **`git push` o'zi saytni yangilamaydi.** Serverda `sudo
  /opt/mcity/app/deploy/update.sh` ni ishga tushirish kerak.
- **`VITE_` o'zgaruvchilari build paytida kodga yoziladi.**
  `.env.production` ni o'zgartirsangiz, qayta build qilish shart —
  `update.sh` buni o'zi qiladi.
