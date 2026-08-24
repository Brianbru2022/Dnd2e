import type { ArmorId, RaceId, WeaponId } from "./rules";

export type EncumbranceCategory = "Unencumbered" | "Light" | "Moderate" | "Heavy" | "Severe";

export const WEAPON_WEIGHT: Record<WeaponId, number> = {
  longsword: 4,
  shortsword: 3,
  battleaxe: 7,
  warhammer: 6,
  mace: 10,
  quarterstaff: 4,
  dagger: 1,
  spear: 5,
  shortbow: 2,
  longbow: 3,
  sling: 0.1,
};

export const ARMOR_WEIGHT: Record<ArmorId, number> = {
  none: 0,
  leather: 15,
  studded: 25,
  scale: 40,
  chain: 40,
  splint: 40,
  plate: 50,
};

export const SHIELD_WEIGHT = 10;

export const GEAR_WEIGHT: Record<string, number> = {
  backpack: 2,
  bedroll: 5,
  rope: 20,
  lantern: 2,
  oil: 1,
  rations: 7,
  waterskin: 2,
};

export const BASE_MOVEMENT: Record<RaceId, number> = {
  human: 12,
  dwarf: 6,
  elf: 12,
  gnome: 6,
  "half-elf": 12,
  halfling: 6,
};

// Uses the Strength-derived weight allowance already exposed by the Forge.
// Thresholds intentionally model the classic stepped movement feel while
// remaining simple enough for transparent computer-game play.
export function encumbranceFor(load: number, allowance: number): {
  category: EncumbranceCategory;
  movementFactor: number;
  checkPenalty: number;
} {
  if (allowance <= 0) return { category: "Severe", movementFactor: 0.25, checkPenalty: -4 };
  const ratio = load / allowance;
  if (ratio <= 1) return { category: "Unencumbered", movementFactor: 1, checkPenalty: 0 };
  if (ratio <= 1.25) return { category: "Light", movementFactor: 0.83, checkPenalty: -1 };
  if (ratio <= 1.5) return { category: "Moderate", movementFactor: 0.67, checkPenalty: -2 };
  if (ratio <= 2) return { category: "Heavy", movementFactor: 0.5, checkPenalty: -3 };
  return { category: "Severe", movementFactor: 0.25, checkPenalty: -4 };
}

export function movementRate(base: number, factor: number) {
  const raw = Math.max(1, Math.floor(base * factor));
  // Classic movement values are easiest to read in 3-point steps.
  if (raw >= 12) return 12;
  if (raw >= 9) return 9;
  if (raw >= 6) return 6;
  if (raw >= 3) return 3;
  return 1;
}

export function armorInterference(classIds: string[], armorId: ArmorId | null) {
  const notes: string[] = [];
  if (!armorId || armorId === "none") return notes;
  const wizard = classIds.includes("mage") || classIds.includes("illusionist");
  const thief = classIds.includes("thief");
  const ranger = classIds.includes("ranger");

  if (wizard) notes.push("Arcane spellcasting is unavailable while wearing ordinary armour in this rules profile.");
  if (thief && !["leather", "studded"].includes(armorId)) notes.push("Thief skills are blocked in armour heavier than studded leather.");
  if (thief && armorId === "studded") notes.push("Some stealth-oriented thief actions may suffer armour penalties.");
  if (ranger && !["leather", "studded"].includes(armorId)) notes.push("Ranger stealth and two-weapon benefits are restricted by heavier armour.");
  return notes;
}
