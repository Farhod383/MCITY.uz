#!/usr/bin/env node
/**
 * Bazani bir buyruq bilan sozlaydi.
 *
 *   npm run db:setup
 *
 * `supabase/migrations/` papkasidagi barcha SQL fayllarni nom tartibida
 * ketma-ket bajaradi. Supabase panelini ochish, nusxalash-joylashtirish
 * kerak emas.
 *
 * ULANISH MA'LUMOTI
 * -----------------
 * Skript `DATABASE_URL` muhit o'zgaruvchisidan foydalanadi. Uni
 * `.env.local` fayliga o'zingiz yozasiz — u `.gitignore` da, ya'ni
 * GitHub'ga hech qachon tushmaydi.
 *
 * Qayerdan olinadi:
 *   Supabase → yuqoridagi "Connect" tugmasi → "ORMs" yoki
 *   "Connection string" → "Session pooler" → URI ni nusxalang
 *
 * Ko'rinishi:
 *   DATABASE_URL=postgresql://postgres.xxxx:PAROL@aws-0-...pooler.supabase.com:5432/postgres
 *
 * ⚠️ Bu qatorda bazangizning PAROLI bor. Uni hech kimga bermang,
 *    chatga tashlamang va kodga yozmang — faqat `.env.local` da tursin.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

/* ---------- .env.local / .env dan DATABASE_URL ni o'qiymiz ---------- */

function readEnvFile(name) {
  const path = join(ROOT, name);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };
const DATABASE_URL = env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(`
╔════════════════════════════════════════════════════════════════════╗
║  DATABASE_URL topilmadi                                            ║
╚════════════════════════════════════════════════════════════════════╝

Bazaga ulanish qatorini '.env.local' fayliga qo'shing:

  DATABASE_URL=postgresql://postgres.xxxx:PAROL@...pooler.supabase.com:5432/postgres

Qayerdan olinadi:
  1. Supabase panelida loyihangizni oching
  2. Yuqorida yashil "Connect" tugmasini bosing
  3. "Connection string" -> "Session pooler" -> URI ni nusxalang
  4. [YOUR-PASSWORD] o'rniga baza parolini qo'ying
     (parolni unutgan bo'lsangiz: Settings -> Database -> Reset password)

Bu qator '.env.local' da qoladi va GitHub'ga tushmaydi.
`);
  process.exit(1);
}

/* ----------------------- Migratsiyalarni bajarish ------------------- */

function migrationFiles() {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`Papka topilmadi: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    // HAMMASI-BIRGA.sql — qolganlarining nusxasi, ikki marta bajarilmasin
    .filter((f) => !f.startsWith("HAMMASI-BIRGA"))
    .sort();
}

async function main() {
  const files = migrationFiles();
  if (files.length === 0) {
    console.error("Migratsiya fayllari topilmadi.");
    process.exit(1);
  }

  console.log(`\nBazaga ulanmoqda...`);

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Katta seed fayli uchun vaqt zaxirasi
    statement_timeout: 120_000,
  });

  try {
    await client.connect();
  } catch (err) {
    console.error(`\n❌ Bazaga ulanib bo'lmadi: ${err.message}`);
    console.error(`
Tekshiring:
  - DATABASE_URL dagi parol to'g'rimi?
  - "Session pooler" (yoki "Direct connection") URI'sidan foydalanyapsizmi?
  - Internet aloqasi bormi?
`);
    process.exit(1);
  }

  console.log(`Ulandi. ${files.length} ta migratsiya bajariladi.\n`);

  let failed = false;

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`  → ${basename(file)} ... `);
    try {
      // Butun fayl bitta so'rov sifatida yuboriladi — shunda
      // funksiya ichidagi $$ ... $$ bloklari buzilmaydi.
      await client.query(sql);
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`\n❌ Xato (${file}):\n   ${err.message}\n`);
      failed = true;
      break;
    }
  }

  // PostgREST sxema keshini yangilaymiz — aks holda yangi jadvallar
  // darrov ko'rinmasligi mumkin
  if (!failed) {
    try {
      await client.query("notify pgrst, 'reload schema'");
    } catch {
      /* muhim emas */
    }
  }

  await client.end();

  if (failed) {
    console.error("Migratsiya to'xtatildi. Yuqoridagi xatoni tuzatib, qayta ishga tushiring.\n");
    process.exit(1);
  }

  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  ✓ Baza tayyor                                                     ║
╚════════════════════════════════════════════════════════════════════╝

Keyingi qadam — admin akkaunt (agar hali yaratilmagan bo'lsa):
  Supabase → Authentication → Users → Add user → Create new user
  "Auto Confirm User" belgilansin.

So'ng saytda logotipni tez ikki marta bosing.
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
