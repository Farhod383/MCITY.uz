# MCITY — mcity.uz domenida ishga tushirish

Bu faylda **qo'lda bajariladigan** ishlar yozilgan: domen, DNS, hosting,
muhit o'zgaruvchilari va Google Search Console. Kod tomonidagi hamma narsa
allaqachon tayyor.

---

## 0. Qisqacha holat

| Nima | Holati |
|---|---|
| Domen `mcity.uz` | aHOST'da ro'yxatdan o'tgan, 08.01.2028 gacha to'langan |
| DNS | Hozircha **Cloudflare**da (`bob.ns.cloudflare.com`, `cecelia.ns.cloudflare.com`) |
| Hosting | **Vercel** — `vercel.json` repo ichida tayyor |
| Baza | Supabase (`zmagamwoupmmufxwgbcp.supabase.co`) |
| Kod | GitHub: `github.com/Farhod383/Mcity_siyt` — SSR, SEO, sitemap, robots, 301'lar tayyor |

---

## 1. Muhit o'zgaruvchilari (environment variables)

Hosting panelida quyidagilarni qo'shing. **Hech qaysi biri maxfiy emas** —
uchalasi ham brauzerga tushadi, shuning uchun bemalol qo'yish mumkin.

| O'zgaruvchi | Qiymati | Nima uchun |
|---|---|---|
| `VITE_SITE_URL` | `https://mcity.uz` | canonical, hreflang, sitemap va og:url shu manzildan quriladi |
| `VITE_SUPABASE_URL` | `https://zmagamwoupmmufxwgbcp.supabase.co` | baza |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` | bazaning ochiq kaliti |
| `CANONICAL_HOST` | `mcity.uz` | server tomonda www→apex yo'naltirish uchun |

> ⚠️ Supabase'ning **`service_role`** kalitini hech qachon bu yerga
> qo'ymang va kodga yozmang. U bazaga to'liq huquq beradi.

`VITE_SITE_URL` noto'g'ri bo'lsa, canonical'lar noto'g'ri domenni
ko'rsatadi va Google saytni indekslamaydi — **bu eng muhim o'zgaruvchi**.

---

## 1A. Kodni GitHub'ga qo'yish (birinchi qadam)

Vercel kodni GitHub'dan oladi va har bir `git push` da saytni **avtomatik
yangilaydi**. Shuning uchun bu birinchi qadam.

Zip ichidagi papkada git tarixi allaqachon bor va hamma o'zgarish commit
qilingan — faqat repo ochib, yuborish qoladi.

1. https://github.com/new
2. **Repository name:** `Mcity_siyt`
3. **Private** ham, **Public** ham bo'ladi — Vercel ikkalasini ham o'qiy
   oladi (Oracle serveridan farqi shu: u yerda public bo'lishi shart edi)
4. README / .gitignore / license — **hech qaysini belgilamang**
5. **Create repository**

Keyin zipni ochib, papka ichida terminal (Git Bash) oching:

```bash
git push -u origin main
```

Remote allaqachon to'g'ri qo'yilgan, boshqa hech narsa sozlash shart emas.

> GitHub parol so'rasa — parol o'rniga **Personal Access Token** kerak:
> GitHub → Settings → Developer settings → Personal access tokens →
> Tokens (classic) → Generate new token → `repo` huquqini belgilang.
>
> Git o'rnatilmagan bo'lsa: https://git-scm.com/download/win

---

## 2. Vercel'ga joylash (asosiy yo'l)

Loyiha **TanStack Start (SSR)** — sahifalar serverda chiziladi. Bu SEO
uchun shart: Google JavaScript ishga tushirmasdan ham to'liq matnni
ko'radi. Oddiy "static hosting" (aHOST'ning umumiy hostingi, GitHub
Pages) **to'g'ri kelmaydi**.

Vercel SSR'ni qo'llaydi, bepul rejasi shaxsiy loyihalar uchun yetarli va
**uxlab qolmaydi** — Render/Fly'ning bepul rejalaridan farqi shu.

Repo ichida `vercel.json` bor, shuning uchun Vercel hamma sozlamani o'zi
o'qiydi.

### 2.1. Loyihani import qilish

1. https://vercel.com/signup → **Continue with GitHub**
2. Panelda: **Add New…** → **Project**
3. `Mcity_siyt` repo'sini toping → **Import**
   > Repo ko'rinmasa: **Adjust GitHub App Permissions** → repo'ni
   > ruxsat etilganlar ro'yxatiga qo'shing
4. **Framework Preset:** `Other` (yoki bo'sh qoldiring)
5. Build/Output sozlamalariga **tegmang** — `vercel.json` dan o'qiladi:

   ```
   Install Command:  npm ci
   Build Command:    npm run build
   ```

### 2.2. Environment Variables

**Deploy bosishdan OLDIN** import ekranidagi **Environment Variables**
bo'limini oching va 1-bo'limdagi to'rtta o'zgaruvchini kiriting:

| Name | Value |
|---|---|
| `VITE_SITE_URL` | `https://mcity.uz` |
| `CANONICAL_HOST` | `mcity.uz` |
| `VITE_SUPABASE_URL` | `https://zmagamwoupmmufxwgbcp.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` |

Har birini **Production, Preview, Development** — uchalasiga ham
belgilang.

> ⚠️ **Muhim:** `VITE_` bilan boshlanadigan o'zgaruvchilar **build
> paytida** kodga yoziladi. Keyin o'zgartirsangiz, saqlash yetmaydi —
> **Deployments → … → Redeploy** qilish kerak.
>
> ⚠️ Supabase'ning `service_role` kalitini bu yerga **hech qachon**
> qo'ymang. Faqat ANON (publishable) kalit.

### 2.3. Deploy

**Deploy** tugmasini bosing. 2–4 daqiqa davom etadi.

Loglarda oxirida shu ko'rinsa — hammasi joyida:

```
Generated .vercel/output/nitro.json
Build Completed
```

Keyin Vercel bergan vaqtinchalik manzilni oching:
`https://mcity-siyt-xxxx.vercel.app`

**Domenni ulashdan oldin shu manzilda hammasini tekshiring:**
bosh sahifa, katalog, texnika sahifasi, bog'lanish, `/admin` ga kirish
(logoni tez 2 marta bosib).

---

## 3. Domenni ulash (Vercel + Cloudflare)

DNS `mcity.uz` uchun **Cloudflare**da, shuning uchun yozuvlar
Cloudflare panelida qo'shiladi (aHOST'da emas — u yerda faqat NS
yozuvlari turadi, ularga tegilmaydi).

### 3.1. Vercel tomonda

1. Loyiha → **Settings** → **Domains** → **Add Domain**
2. `mcity.uz` deb yozing → **Add**
3. Vercel `www.mcity.uz` ni ham qo'shishni taklif qiladi — **rozi bo'ling**
4. Vercel ekranda **aniq DNS qiymatlarini ko'rsatadi** — ularni ko'chirib
   oling

### 3.2. Cloudflare tomonda — DNS yozuvlari

Cloudflare → `mcity.uz` → **DNS** → **Records**.

Avval **eski yozuvlarni o'chiring** — Timeweb'ning parking sahifasiga
olib boradigan `A` yozuvlari va hamma `AAAA` yozuvlari.

Keyin ikkitasini qo'shing:

| Turi | Nomi | Qiymati | Proxy holati |
|---|---|---|---|
| A | `@` | **Vercel ko'rsatgan IP** (odatda `76.76.21.21`) | **DNS only** (kulrang) |
| CNAME | `www` | **Vercel ko'rsatgan manzil** | **DNS only** (kulrang) |

> ⚠️ **Qiymatlarni bu jadvaldan emas, Vercel panelidan ko'chiring.**
> Vercel har bir loyihaga alohida CNAME beradi (masalan
> `d1d4fc829fe7bc7c.vercel-dns-017.com`) va yangi loyihalarga boshqa IP
> berishi mumkin. Panel — yagona to'g'ri manba.

**Kulrang bulut (DNS only) — hozircha majburiy.** To'q sariq (Proxied)
qoldirilsa Vercel domenni tasdiqlay olmaydi va SSL sertifikat bermaydi:
Cloudflare javobi Vercel kutgan yozuvni to'sib qo'yadi.

### 3.3. Tasdiqlash va sertifikat

1. DNS tarqalishini kuting (odatda 5–30 daqiqa)
2. Vercel → Settings → Domains — holat **Valid Configuration** bo'ladi
3. SSL sertifikat avtomatik chiqadi (yana 5–15 daqiqa)
4. `https://mcity.uz` ni oching

### 3.4. Cloudflare SSL sozlamasi

Sertifikat chiqqandan **keyin**:

Cloudflare → **SSL/TLS** → **Overview** → **Full** (yoki **Full
(strict)**).

"Flexible" qo'yilsa cheksiz yo'naltirish (`err_too_many_redirects`)
bo'ladi — sayt umuman ochilmaydi.

Endi xohlasangiz proxy'ni to'q sariqqa (Proxied) o'tkazishingiz mumkin —
kesh va DDoS himoyasi qo'shiladi. **Lekin sertifikat chiqmaguncha
tegmang.**

### 3.5. CAA yozuvi bo'lsa

Cloudflare DNS'da `CAA` yozuvi bo'lsa, u **Let's Encrypt**ga ruxsat
berishi kerak, aks holda sertifikat chiqmaydi:

```
CAA  @  0 issue "letsencrypt.org"
```

CAA yozuvi umuman bo'lmasa — hech narsa qilish shart emas.

### 3.6. Pochta yozuvlari — TEGMANG

Pochta hozir Timeweb'da. Bu yozuvlar o'chirilsa `info@mcity.uz`
ishlamay qoladi:

```
MX   @   10 mx1.timeweb.ru
MX   @   20 mx2.timeweb.ru
TXT  @   "v=spf1 include:_spf.timeweb.ru ~all"
```

`A` va `AAAA` yozuvlarini o'chirganda bularni saqlab qoling.

---

## 3A. Keyinchalik kodni yangilash

Bu Vercel'ning eng qulay tomoni — **qo'lda hech narsa qilinmaydi**:

```bash
git add .
git commit -m "nima o'zgardi"
git push
```

Vercel push'ni o'zi sezadi, yangi versiyani yig'adi va ~2 daqiqada
saytga chiqaradi. Build yiqilsa — **eski versiya ishlashda davom
etadi**, sayt o'chib qolmaydi.

Har bir push uchun alohida "Preview" manzili ham beriladi — domenga
chiqarishdan oldin tekshirib ko'rish mumkin.

### Boshqa hosting kerak bo'lsa

Kodni o'zgartirish shart emas — faqat `NITRO_PRESET` o'zgaruvchisi:

| Hosting | Buyruq | Natija |
|---|---|---|
| Vercel (hozirgi) | `npm run build` | `.vercel/output` |
| VPS / Oracle Cloud | `NITRO_PRESET=node-server npm run build` | `.output/server/index.mjs` |
| Cloudflare Pages | `NITRO_PRESET=cloudflare-module npm run build` | `dist` |

---

## 4. Timeweb va eski hosting

Timeweb'dagi 10 kunlik sinov muddati tugagach, domen o'sha yerdan
uzilishi kerak. Yangi hosting ishga tushgach:

1. Cloudflare DNS'dagi eski `A` va `AAAA` yozuvlari (Timeweb serveriga
   qaragan) o'chiriladi va o'rniga 3.2-bo'limdagi Vercel yozuvlari
   qo'yiladi
2. Timeweb akkauntini yopish mumkin (pochta o'sha yerda qolsa, faqat
   hosting qismini)

---

## 5. Google Search Console

Bu qadamlarni **o'zingiz** bajarasiz — akkauntga kirish talab qilinadi.

### 5.1. Saytni qo'shish

1. https://search.google.com/search-console ga kiring
2. **Add property → Domain** ni tanlang (URL prefix emas — Domain
   varianti barcha subdomen va protokollarni bir joyda qamrab oladi)
3. `mcity.uz` deb yozing

### 5.2. Domenni tasdiqlash (verification)

Google sizga `google-site-verification=...` bilan boshlanadigan TXT
yozuvini beradi.

1. Cloudflare → DNS → **Add record**
2. Type: `TXT`, Name: `@`, Content: Google bergan qiymat
3. Saqlang va Search Console'da **Verify** bosing (5–30 daqiqa kutish
   kerak bo'lishi mumkin)

> Agar HTML fayl bilan tasdiqlashni tanlasangiz, faylni loyihaning
> `public/` papkasiga qo'ying — u avtomatik `https://mcity.uz/<fayl>`
> manzilida ochiladi.

### 5.3. Sitemap yuborish

Search Console → **Sitemaps** → quyidagini kiriting va **Submit**:

```
sitemap.xml
```

To'liq manzil: `https://mcity.uz/sitemap.xml`

### 5.4. URL Inspection va indekslash so'rovi

Eng muhim sahifalarni qo'lda tekshiring va indekslashga yuboring:

```
https://mcity.uz/uz
https://mcity.uz/ru
https://mcity.uz/en
https://mcity.uz/uz/maxsus-texnika
https://mcity.uz/ru/specztehnika
https://mcity.uz/en/special-equipment
```

Har biri uchun: **URL Inspection** → manzilni kiriting →
**Test live URL** → "Page is available to Google" chiqsa →
**Request indexing**.

Kuniga ~10 tadan ortiq so'rov yuborib bo'lmaydi, shuning uchun avval
bosh sahifalar va katalogni yuboring — mahsulotlarni sitemap orqali
Google o'zi topadi.

### 5.5. Monitoring

Birinchi 4 hafta davomida haftada bir marta tekshiring:

- **Pages** → nechta sahifa indekslangan, qaysi biri chetlatilgan va nega
- **Performance** → qaysi so'rovlar bo'yicha ko'rsatilyapti
- **Enhancements → Products / Breadcrumbs** → structured data xatolari
- **Core Web Vitals** → LCP / CLS / INP ko'rsatkichlari

### 5.6. Yandex uchun

Yandex O'zbekistonda ham ishlatiladi, alohida qo'shish kerak:

1. https://webmaster.yandex.com → **Add site** → `mcity.uz`
2. Tasdiqlash: DNS TXT yoki `public/` ga meta-fayl
3. **Indexing → Sitemap files** → `https://mcity.uz/sitemap.xml`
4. `robots.txt` da Yandex uchun `Host: mcity.uz` allaqachon yozilgan

---

## 6. Ishga tushirgandan keyin tekshirish ro'yxati

Saytni ochgandan keyin quyidagilarni bittalab tekshiring:

| Tekshiruv | Kutilgan natija |
|---|---|
| `http://mcity.uz` | `https://mcity.uz/uz` ga 301 |
| `https://www.mcity.uz` | `https://mcity.uz` ga 301 |
| `https://mcity.uz` | `https://mcity.uz/uz` ga 301 |
| `https://mcity.uz/products/fuel-tanker` | `/uz/maxsus-texnika/fuel-tanker` ga 301 |
| `https://mcity.uz/robots.txt` | matn ochiladi, ichida `Sitemap:` bor |
| `https://mcity.uz/sitemap.xml` | XML ochiladi, ichida 4 til bor |
| `https://mcity.uz/uz/about/` | `/uz/about` ga 301 (oxirgi `/` siz) |
| `https://mcity.uz/admin` | kirmagan odam bosh sahifaga qaytariladi |
| Vercel → Settings → Domains | `mcity.uz` — **Valid Configuration** |
| Vercel → Deployments | oxirgi deploy **Ready** (qizil emas) |
| `git push` qilib ko'ring | 2 daqiqada saytda ko'rinadi |

Foydali asboblar:

- **Rich Results Test** — https://search.google.com/test/rich-results
  (Product va BreadcrumbList schema'larini tekshiradi)
- **PageSpeed Insights** — https://pagespeed.web.dev
- **hreflang tekshiruvi** — https://technicalseo.com/tools/hreflang/

---

## 7. Bilib qo'yish kerak bo'lgan cheklovlar

- **Google birinchi o'ringa chiqishni hech kim kafolatlay olmaydi.**
  Bu yerda qilingan ish — texnik tayyorgarlik: Google saytni to'g'ri
  o'qiy oladi, indekslay oladi va tillarni ajrata oladi. Reyting esa
  kontent, havolalar va vaqtga bog'liq.
- **Indekslash darhol bo'lmaydi.** Odatda 3 kundan 3 haftagacha vaqt
  ketadi. Sitemap yuborilgani indekslash kafolati emas.
- **Yangiliklar, loyihalar, sertifikatlar va hamkorlar sahifalaridagi
  matnlar hozircha namuna.** Ular kodda qattiq yozilgan va haqiqiy
  ma'lumot emas. SEO nuqtai nazaridan ularni haqiqiy ma'lumot bilan
  almashtirish kerak — aks holda Google "thin content" deb baholaydi.
- **PDF katalog** admin paneldan yuklanadi (`/admin` → «PDF katalog»).
  Buning uchun `20260907140000_catalog_pdf.sql` migratsiyasi ishga
  tushirilgan bo'lishi shart — u Supabase Storage'da `catalog` papkasini
  yaratadi. Fayl yuklanmaguncha saytda yuklab olish tugmasi ko'rinmaydi.
- **Vercel bepul ("Hobby") rejasi faqat tijoriy bo'lmagan loyihalar
  uchun.** MCITY — biznes sayti, shuning uchun qat'iy qoidaga ko'ra Pro
  reja (oyiga $20) talab qilinishi mumkin. Amalda kichik saytlar Hobby'da
  ishlab turadi, lekin Vercel ogohlantirsa — bu kutilgan holat, xato
  emas.
- **`VITE_` o'zgaruvchilari build paytida kodga yoziladi.** Vercel'da
  ularni o'zgartirgandan keyin **Redeploy** qilish shart.
- **Zaxira nusxa.** Ma'lumot Supabase'da, kod GitHub'da — Vercel'da
  yo'qoladigan narsa yo'q. Akkaunt o'chsa ham, kodni boshqa hostingga
  ko'chirish 10 daqiqalik ish (3A-bo'lim oxiridagi jadval).
- **Mahsulotlarda narx yo'q**, shuning uchun `Product` schema ichida
  `offers` yozilmagan. Narx qo'shsangiz, u avtomatik paydo bo'ladi.
  Soxta narx yozish Google jazosiga olib keladi.
