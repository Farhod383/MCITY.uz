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
import factory from "@/assets/mcity-factory.jpg";
import hero from "@/assets/mcity-hero.jpg";

/**
 * Loyiha ichidagi rasmlar ro'yxati.
 *
 * Bazada rasm ikki xil yozilishi mumkin:
 *   "asset:veh-fuel-tanker"  -> shu ro'yxatdagi rasm (sayt bilan birga keladi)
 *   "https://..."            -> tashqi havola (Supabase Storage, CDN va h.k.)
 *
 * Admin panelda yangi rasm qo'shmoqchi bo'lsangiz, eng oson yo'l —
 * rasmni Supabase Storage'ga yuklab, uning to'liq havolasini qo'yish.
 */
export const ASSETS: Record<string, string> = {
  "veh-fuel-tanker": fuelTanker,
  "veh-water-tanker": waterTanker,
  "veh-sewer-truck": sewerTruck,
  "veh-sweeper": sweeper,
  "veh-garbage": garbage,
  "veh-aerial": aerial,
  "veh-crane": crane,
  "veh-manipulator": manipulator,
  "veh-tow": tow,
  "veh-fire": fire,
  "veh-ambulance": ambulance,
  "veh-ambulift": ambulift,
  "veh-workshop": workshop,
  "veh-roadmaint": roadmaint,
  "mcity-factory": factory,
  "mcity-hero": hero,
};

/** Admin panelda tanlash uchun ro'yxat */
export const ASSET_KEYS = Object.keys(ASSETS).filter((k) => k.startsWith("veh-"));

/** "asset:xxx" yoki oddiy URL ni haqiqiy rasm manziliga aylantiradi */
export function resolveImage(src?: string | null, fallback = ""): string {
  if (!src) return fallback;
  if (src.startsWith("asset:")) return ASSETS[src.slice("asset:".length)] ?? fallback;
  return src;
}
