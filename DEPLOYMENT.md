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
| Hosting | **Oracle Cloud Always Free** — `deploy/` papkasida hammasi tayyor |
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

## 2. Oracle Cloud serveriga joylash (asosiy yo'l)

Loyiha **TanStack Start (SSR)** — sahifalar serverda chiziladi. Bu SEO
uchun shart: Google JavaScript ishga tushirmasdan ham to'liq matnni
ko'radi. Shuning uchun oddiy "static hosting" (aHOST'ning umumiy
hostingi, GitHub Pages) **to'g'ri kelmaydi** — Node server kerak.

Oracle Cloud "Always Free" aynan shuni beradi: doim bepul, doim yoqiq
virtual server. Bepul PaaS'lardan farqi — **uxlab qolmaydi**.

Repo ichida `deploy/` papkasi bor, hamma narsa avtomatlashtirilgan.

### 2.1. Virtual mashina yaratish

Oracle Cloud panelida: **Compute → Instances → Create Instance**

| Maydon | Tanlov |
|---|---|
| Image | **Ubuntu 24.04** (yoki 22.04) |
| Shape | **VM.Standard.A1.Flex** — ARM Ampere |
| OCPU / Memory | **2 OCPU / 12 GB** (Always Free chegarasi: 4 OCPU / 24 GB) |
| Boot volume | 50 GB (bepul chegara 200 GB) |
| SSH key | **Kalitni saqlab oling** — serverga faqat shu bilan kirasiz |

> **Nega A1.Flex:** ikkinchi bepul variant — `VM.Standard.E2.1.Micro`
> da atigi **1 GB** operativ xotira bor va build paytida yiqilishi
> mumkin. Skript 2 GB swap yaratadi, shuning uchun E2.1.Micro da ham
> ishlaydi, lekin sekin. Imkon bo'lsa A1 oling.
>
> A1 shape ba'zan "Out of capacity" beradi — bu Oracle'ning odatiy
> holati. Boshqa "Availability Domain" ni tanlab ko'ring yoki bir necha
> soatdan keyin qayta urinib ko'ring.

Yaratilgandan keyin **Public IP** manzilini yozib oling.

### 2.2. Portlarni ochish (Oracle paneli)

Bu qadamni **o'tkazib yubormang** — Oracle'da tashqi portlar
sukut bo'yicha yopiq va sayt ochilmaydi.

**Networking → Virtual Cloud Networks → <VCN nomi> → Security Lists →
Default Security List → Add Ingress Rules**

| Source CIDR | IP Protocol | Destination Port |
|---|---|---|
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

### 2.3. Serverga kirish

```bash
ssh -i <saqlangan-kalit.key> ubuntu@<PUBLIC_IP>
```

Windows'da PowerShell yoki PuTTY orqali. Kalit faylining huquqini
to'g'rilash kerak bo'lishi mumkin:

```bash
chmod 600 <saqlangan-kalit.key>
```

### 2.4. Bitta buyruq bilan o'rnatish

Serverda:

```bash
curl -fsSL https://raw.githubusercontent.com/Farhod383/Mcity_siyt/main/deploy/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

Skript nima qiladi:

1. Node.js 22 ni o'rnatadi
2. 2 GB swap yaratadi (build yiqilmasligi uchun)
3. `mcity` foydalanuvchisini yaratadi, kodni `/opt/mcity/app` ga klonlaydi
4. Supabase kalitlarini **so'raydi** va `.env.production` ga yozadi
5. Loyihani yig'adi
6. **systemd xizmatini o'rnatadi** — sayt uxlab qolmaydi
7. nginx'ni sozlaydi va portlarni ochadi

Oxirida `TAYYOR.` chiqsa — sayt serverda ishlayapti.

Tekshirish:

```bash
curl -I http://127.0.0.1:3000/uz    # 200 bo'lishi kerak
sudo systemctl status mcity
sudo journalctl -u mcity -f          # jonli loglar
```

### 2.5. Nega sayt uxlab qolmaydi

`deploy/mcity.service` faylidagi ikki qator shuni ta'minlaydi:

```
Restart=always              # jarayon o'lsa, 3 soniyada qayta ko'tariladi
WantedBy=multi-user.target  # server qayta yuklansa, o'zi ishga tushadi
```

Render/Vercel/Fly'ning bepul rejalaridan farqi shu: bu yerda hech qanday
"uyquga ketish" yo'q, server doim yoqiq turadi. Trafik nolga tushsa ham
sayt bir zumda javob beradi.

---

## 3. Domenni ulash (Oracle IP + Cloudflare)

DNS `mcity.uz` uchun **Cloudflare**da, shuning uchun yozuvlar
Cloudflare panelida qo'shiladi (aHOST'da emas — u yerda faqat NS
yozuvlari turadi, ularga tegilmaydi).

### 3.1. DNS yozuvlari

Cloudflare → `mcity.uz` → **DNS** → **Records**.

Avval **eski yozuvlarni o'chiring** — Timeweb'ning parking sahifasiga
olib boradigan `A` yozuvlari va hamma `AAAA` yozuvlari.

Keyin ikkitasini qo'shing (`<PUBLIC_IP>` — Oracle bergan IP):

| Turi | Nomi | Qiymati | Proxy holati |
|---|---|---|---|
| A | `@` | `<PUBLIC_IP>` | **DNS only** (kulrang bulut) |
| A | `www` | `<PUBLIC_IP>` | **DNS only** (kulrang bulut) |

**Kulrang bulut (DNS only) — hozircha majburiy.** To'q sariq (Proxied)
qoldirilsa Let's Encrypt sertifikat bera olmaydi: tekshiruv serveringizga
yetib bormaydi.

### 3.2. HTTPS sertifikat olish

DNS tarqalishini kuting (5–30 daqiqa). Tekshirish:

```bash
nslookup mcity.uz
```

IP to'g'ri chiqsa, serverda:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mcity.uz -d www.mcity.uz
```

Certbot email so'raydi, shartlarga rozilik so'raydi va nginx
konfiguratsiyasiga HTTPS blokini **o'zi qo'shadi**. Sertifikat har
60 kunda avtomatik yangilanadi.

Tekshirish:

```bash
sudo certbot renew --dry-run
```

### 3.3. Cloudflare SSL sozlamasi

Sertifikat chiqqandan **keyin**:

Cloudflare → **SSL/TLS** → **Overview** → **Full (strict)**.

"Flexible" qo'yilsa cheksiz yo'naltirish (redirect loop) bo'ladi —
sayt umuman ochilmaydi.

Endi xohlasangiz proxy'ni to'q sariqqa (Proxied) o'tkazishingiz mumkin —
kesh, DDoS himoyasi va serveringizning haqiqiy IP'si yashiriladi.
Bu tavsiya etiladi, lekin **sertifikat chiqmaguncha tegmang**.

### 3.4. Pochta yozuvlari — TEGMANG

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

Kompyuteringizda o'zgarish qilib, GitHub'ga yuborasiz:

```bash
git add .
git commit -m "nima o'zgardi"
git push
```

Keyin serverda bitta buyruq:

```bash
sudo /opt/mcity/app/deploy/update.sh
```

Skript yangi kodni oladi, yig'adi va xizmatni qayta ishga tushiradi.
**Build yiqilsa — eski versiya ishlashda davom etadi**, sayt o'chib
qolmaydi.

### Foydali buyruqlar

| Buyruq | Nima qiladi |
|---|---|
| `sudo systemctl status mcity` | xizmat holati |
| `sudo systemctl restart mcity` | qayta ishga tushirish |
| `sudo journalctl -u mcity -f` | jonli loglar |
| `sudo journalctl -u mcity -n 100` | oxirgi 100 qator log |
| `sudo nginx -t && sudo systemctl reload nginx` | nginx sozlamasini tekshirib qayta o'qish |
| `free -h` | xotira holati |

### Boshqa hosting kerak bo'lsa

Kodni o'zgartirish shart emas — faqat `NITRO_PRESET` o'zgaruvchisi:

| Hosting | Buyruq | Natija |
|---|---|---|
| Oracle / VPS (hozirgi) | `npm run build` | `.output/server/index.mjs` |
| Vercel | `NITRO_PRESET=vercel npm run build` | `.vercel/output` |
| Cloudflare Pages | `NITRO_PRESET=cloudflare-module npm run build` | `dist` |

---

## 4. Timeweb va eski hosting

Timeweb'dagi 10 kunlik sinov muddati tugagach, domen o'sha yerdan
uzilishi kerak. Yangi hosting ishga tushgach:

1. Cloudflare DNS'dagi eski `A` va `AAAA` yozuvlari (Timeweb serveriga
   qaragan) o'chiriladi va o'rniga 3.1-bo'limdagi `A` yozuvlari
   (Oracle serveringizning IP'si) qo'yiladi
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
| `sudo systemctl status mcity` | `active (running)` |
| `sudo systemctl is-enabled mcity` | `enabled` (server qayta yuklansa o'zi ishga tushadi) |
| `sudo certbot certificates` | `mcity.uz`, `www.mcity.uz` — VALID |
| `sudo reboot` dan keyin sayt | o'zi ko'tariladi, qo'lda hech narsa qilinmaydi |

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
- **Oracle "Always Free" resurslari o'chirilishi mumkin.** Oracle 7 kun
  umuman ishlatilmagan bepul mashinalarni o'chirib qo'yish huquqini
  saqlaydi. Sayt doim ishlab turgani uchun bu xavf kichik, lekin Oracle
  akkauntingizga vaqti-vaqti bilan kirib turing.
- **`git push` o'zi deploy qilmaydi.** Serverda `sudo
  /opt/mcity/app/deploy/update.sh` ni ishga tushirish kerak (3A-bo'lim).
- **`VITE_` o'zgaruvchilari build paytida kodga yoziladi.**
  `.env.production` ni o'zgartirsangiz, qayta build qilish shart —
  `update.sh` buni o'zi qiladi.
- **Zaxira nusxa.** Server ma'lumoti Supabase'da, kod GitHub'da —
  serverning o'zida yo'qoladigan narsa yo'q. Server buzilsa,
  `setup-server.sh` ni yangi mashinada ishga tushirish kifoya.
- **Mahsulotlarda narx yo'q**, shuning uchun `Product` schema ichida
  `offers` yozilmagan. Narx qo'shsangiz, u avtomatik paydo bo'ladi.
  Soxta narx yozish Google jazosiga olib keladi.
