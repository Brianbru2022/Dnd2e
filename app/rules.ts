export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type AbilityScores = Record<AbilityKey, number>;

export type RaceId = "human" | "dwarf" | "elf" | "gnome" | "half-elf" | "halfling";
export type ClassId = "fighter" | "ranger" | "paladin" | "mage" | "illusionist" | "cleric" | "druid" | "thief" | "bard";
export type ClassGroup = "Warrior" | "Wizard" | "Priest" | "Rogue";
export type WeaponId = "longsword" | "shortsword" | "battleaxe" | "warhammer" | "mace" | "quarterstaff" | "dagger" | "spear" | "shortbow" | "longbow" | "sling";
export type ArmorId = "none" | "leather" | "studded" | "scale" | "chain" | "splint" | "plate";
export type ShieldId = "none" | "shield";

export const ABILITIES: { id: AbilityKey; name: string; short: string }[] = [
  { id: "str", name: "Strength", short: "STR" },
  { id: "dex", name: "Dexterity", short: "DEX" },
  { id: "con", name: "Constitution", short: "CON" },
  { id: "int", name: "Intelligence", short: "INT" },
  { id: "wis", name: "Wisdom", short: "WIS" },
  { id: "cha", name: "Charisma", short: "CHA" },
];

export const RACES: {
  id: RaceId;
  name: string;
  summary: string;
  adjustments: Partial<Record<AbilityKey, number>>;
  availableClasses: ClassId[];
  multiclass: ClassId[][];
}[] = [
  {
    id: "human", name: "Human", summary: "Flexible and unrestricted in class choice.", adjustments: {},
    availableClasses: ["fighter", "ranger", "paladin", "mage", "illusionist", "cleric", "druid", "thief", "bard"], multiclass: [],
  },
  {
    id: "dwarf", name: "Dwarf", summary: "Hardy and resilient, with a traditional warrior bent.", adjustments: { con: 1, cha: -1 },
    availableClasses: ["fighter", "cleric", "thief"], multiclass: [["fighter", "cleric"], ["fighter", "thief"]],
  },
  {
    id: "elf", name: "Elf", summary: "Agile and perceptive, with strong martial and magical traditions.", adjustments: { dex: 1, con: -1 },
    availableClasses: ["fighter", "ranger", "mage", "cleric", "thief"], multiclass: [["fighter", "mage"], ["fighter", "thief"], ["mage", "thief"], ["fighter", "mage", "thief"]],
  },
  {
    id: "gnome", name: "Gnome", summary: "Clever and curious, with a traditional affinity for illusion magic.", adjustments: { int: 1, wis: -1 },
    availableClasses: ["fighter", "illusionist", "cleric", "thief"], multiclass: [["fighter", "illusionist"], ["fighter", "thief"], ["illusionist", "thief"]],
  },
  {
    id: "half-elf", name: "Half-Elf", summary: "Adaptable, with access to a broad range of professions.", adjustments: {},
    availableClasses: ["fighter", "ranger", "mage", "cleric", "druid", "thief", "bard"],
    multiclass: [["fighter", "mage"], ["fighter", "cleric"], ["fighter", "thief"], ["mage", "cleric"], ["mage", "thief"], ["cleric", "ranger"], ["fighter", "mage", "cleric"], ["fighter", "mage", "thief"]],
  },
  {
    id: "halfling", name: "Halfling", summary: "Quick and light-footed, favouring stealth and practical combat.", adjustments: { dex: 1, str: -1 },
    availableClasses: ["fighter", "cleric", "thief"], multiclass: [["fighter", "thief"]],
  },
];

export const CLASSES: {
  id: ClassId;
  name: string;
  group: ClassGroup;
  description: string;
  minimums: Partial<Record<AbilityKey, number>>;
  exceptionalStrength: boolean;
  allowedAlignments?: string[];
  hitDie: number;
  weaponSlots: number;
  nonWeaponSlots: number;
  allowedWeapons: WeaponId[];
  allowedArmor: ArmorId[];
  shield: boolean;
}[] = [
  { id: "fighter", name: "Fighter", group: "Warrior", description: "A dedicated combatant with broad weapon and armour access.", minimums: { str: 9 }, exceptionalStrength: true, hitDie: 10, weaponSlots: 4, nonWeaponSlots: 3, allowedWeapons: ["longsword","shortsword","battleaxe","warhammer","mace","quarterstaff","dagger","spear","shortbow","longbow","sling"], allowedArmor: ["none","leather","studded","scale","chain","splint","plate"], shield: true },
  { id: "ranger", name: "Ranger", group: "Warrior", description: "A wilderness warrior requiring exceptional physical and spiritual aptitude.", minimums: { str: 13, dex: 13, con: 14, wis: 14 }, exceptionalStrength: true, allowedAlignments: ["Lawful Good","Neutral Good","Chaotic Good"], hitDie: 10, weaponSlots: 4, nonWeaponSlots: 3, allowedWeapons: ["longsword","shortsword","battleaxe","warhammer","mace","quarterstaff","dagger","spear","shortbow","longbow","sling"], allowedArmor: ["none","leather","studded","scale","chain"], shield: true },
  { id: "paladin", name: "Paladin", group: "Warrior", description: "A highly demanding holy warrior vocation.", minimums: { str: 12, con: 9, wis: 13, cha: 17 }, exceptionalStrength: true, allowedAlignments: ["Lawful Good"], hitDie: 10, weaponSlots: 4, nonWeaponSlots: 3, allowedWeapons: ["longsword","shortsword","battleaxe","warhammer","mace","quarterstaff","dagger","spear","shortbow","longbow","sling"], allowedArmor: ["none","leather","studded","scale","chain","splint","plate"], shield: true },
  { id: "mage", name: "Mage", group: "Wizard", description: "A generalist scholar of arcane magic who relies on Intelligence.", minimums: { int: 9 }, exceptionalStrength: false, hitDie: 4, weaponSlots: 1, nonWeaponSlots: 4, allowedWeapons: ["quarterstaff","dagger"], allowedArmor: ["none"], shield: false },
  { id: "illusionist", name: "Illusionist", group: "Wizard", description: "A specialist wizard focused on deception, perception, and phantasmal magic.", minimums: { int: 9 }, exceptionalStrength: false, hitDie: 4, weaponSlots: 1, nonWeaponSlots: 4, allowedWeapons: ["quarterstaff","dagger"], allowedArmor: ["none"], shield: false },
  { id: "cleric", name: "Cleric", group: "Priest", description: "A priestly adventurer whose powers are rooted in Wisdom.", minimums: { wis: 9 }, exceptionalStrength: false, hitDie: 8, weaponSlots: 2, nonWeaponSlots: 4, allowedWeapons: ["warhammer","mace","quarterstaff","sling"], allowedArmor: ["none","leather","studded","scale","chain","splint","plate"], shield: true },
  { id: "druid", name: "Druid", group: "Priest", description: "A guardian of the natural order with demanding spiritual requirements.", minimums: { wis: 12, cha: 15 }, exceptionalStrength: false, allowedAlignments: ["True Neutral"], hitDie: 8, weaponSlots: 2, nonWeaponSlots: 4, allowedWeapons: ["quarterstaff","dagger","spear","sling"], allowedArmor: ["none","leather"], shield: true },
  { id: "thief", name: "Thief", group: "Rogue", description: "A specialist in stealth, locks, traps, and opportunistic combat.", minimums: { dex: 9 }, exceptionalStrength: false, hitDie: 6, weaponSlots: 2, nonWeaponSlots: 3, allowedWeapons: ["longsword","shortsword","quarterstaff","dagger","shortbow","sling"], allowedArmor: ["none","leather","studded"], shield: false },
  { id: "bard", name: "Bard", group: "Rogue", description: "A versatile performer, traveller, and dabbler in many skills.", minimums: { dex: 12, int: 13, cha: 15 }, exceptionalStrength: false, allowedAlignments: ["Neutral Good","Lawful Neutral","True Neutral","Chaotic Neutral","Neutral Evil"], hitDie: 6, weaponSlots: 2, nonWeaponSlots: 3, allowedWeapons: ["longsword","shortsword","quarterstaff","dagger","spear","shortbow","sling"], allowedArmor: ["none","leather","studded","chain"], shield: false },
];

export const ALIGNMENTS = ["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil"] as const;

export const WEAPONS: { id: WeaponId; name: string; cost: number; damage: string }[] = [
  { id: "longsword", name: "Long sword", cost: 15, damage: "1d8" },
  { id: "shortsword", name: "Short sword", cost: 10, damage: "1d6" },
  { id: "battleaxe", name: "Battle axe", cost: 5, damage: "1d8" },
  { id: "warhammer", name: "Warhammer", cost: 2, damage: "1d4+1" },
  { id: "mace", name: "Mace", cost: 8, damage: "1d6+1" },
  { id: "quarterstaff", name: "Quarterstaff", cost: 0, damage: "1d6" },
  { id: "dagger", name: "Dagger", cost: 2, damage: "1d4" },
  { id: "spear", name: "Spear", cost: 1, damage: "1d6" },
  { id: "shortbow", name: "Short bow", cost: 30, damage: "1d6" },
  { id: "longbow", name: "Long bow", cost: 75, damage: "1d6" },
  { id: "sling", name: "Sling", cost: 0, damage: "1d4+1" },
];

export const ARMOR: { id: ArmorId; name: string; ac: number; cost: number }[] = [
  { id: "none", name: "No armour", ac: 10, cost: 0 },
  { id: "leather", name: "Leather", ac: 8, cost: 5 },
  { id: "studded", name: "Studded leather", ac: 7, cost: 20 },
  { id: "scale", name: "Scale mail", ac: 6, cost: 120 },
  { id: "chain", name: "Chain mail", ac: 5, cost: 75 },
  { id: "splint", name: "Splint mail", ac: 4, cost: 80 },
  { id: "plate", name: "Plate mail", ac: 3, cost: 600 },
];

export const GENERAL_GEAR = [
  { id: "backpack", name: "Backpack", cost: 2 },
  { id: "bedroll", name: "Bedroll", cost: 0.2 },
  { id: "rope", name: "50 ft rope", cost: 1 },
  { id: "lantern", name: "Lantern", cost: 7 },
  { id: "oil", name: "Oil flask", cost: 0.1 },
  { id: "rations", name: "Trail rations (1 week)", cost: 10 },
  { id: "waterskin", name: "Waterskin", cost: 0.8 },
] as const;

export const NON_WEAPON_PROFICIENCIES = ["Ancient History","Animal Handling","Direction Sense","Endurance","Healing","Herbalism","Local History","Navigation","Reading/Writing","Riding","Survival","Swimming"] as const;

export const EMPTY_SCORES: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

export function applyRaceAdjustments(scores: AbilityScores, raceId: RaceId): AbilityScores {
  const race = RACES.find((item) => item.id === raceId);
  const next = { ...scores };
  if (!race) return next;
  for (const ability of ABILITIES) next[ability.id] = Math.max(3, Math.min(19, next[ability.id] + (race.adjustments[ability.id] ?? 0)));
  return next;
}

export function qualifiesForClass(scores: AbilityScores, classId: ClassId) {
  const characterClass = CLASSES.find((item) => item.id === classId);
  if (!characterClass) return false;
  return Object.entries(characterClass.minimums).every(([key, value]) => scores[key as AbilityKey] >= (value ?? 0));
}

export function constitutionHpBonus(score: number, warrior: boolean) {
  if (score <= 3) return -2;
  if (score <= 6) return -1;
  if (score <= 14) return 0;
  if (score === 15) return 1;
  if (score === 16) return 2;
  if (!warrior) return 2;
  if (score === 17) return 3;
  if (score === 18) return 4;
  return 5;
}

export function dexterityAcAdjustment(score: number) {
  if (score <= 3) return 4;
  if (score === 4) return 3;
  if (score === 5) return 2;
  if (score === 6) return 1;
  if (score <= 14) return 0;
  if (score === 15) return -1;
  if (score === 16) return -2;
  if (score === 17) return -3;
  return -4;
}

export function startingGoldDice(group: ClassGroup) {
  if (group === "Warrior") return { count: 5, sides: 4, multiplier: 10, bonus: 0 };
  if (group === "Wizard") return { count: 1, sides: 4, multiplier: 10, bonus: 1 };
  if (group === "Priest") return { count: 3, sides: 6, multiplier: 10, bonus: 0 };
  return { count: 2, sides: 6, multiplier: 10, bonus: 0 };
}

export function classById(id: ClassId) { return CLASSES.find((item) => item.id === id)!; }
export function raceById(id: RaceId) { return RACES.find((item) => item.id === id)!; }
