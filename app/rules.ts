export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type AbilityScores = Record<AbilityKey, number>;

export type RaceId = "human" | "dwarf" | "elf" | "gnome" | "half-elf" | "halfling";
export type ClassId = "fighter" | "ranger" | "paladin" | "mage" | "cleric" | "druid" | "thief" | "bard";

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
}[] = [
  {
    id: "human",
    name: "Human",
    summary: "Flexible and unrestricted in class choice.",
    adjustments: {},
    availableClasses: ["fighter", "ranger", "paladin", "mage", "cleric", "druid", "thief", "bard"],
  },
  {
    id: "dwarf",
    name: "Dwarf",
    summary: "Hardy and resilient, with a traditional warrior bent.",
    adjustments: { con: 1, cha: -1 },
    availableClasses: ["fighter", "cleric", "thief"],
  },
  {
    id: "elf",
    name: "Elf",
    summary: "Agile and perceptive, with strong martial and magical traditions.",
    adjustments: { dex: 1, con: -1 },
    availableClasses: ["fighter", "ranger", "mage", "cleric", "thief"],
  },
  {
    id: "gnome",
    name: "Gnome",
    summary: "Clever and curious, suited to magic and subtle skills.",
    adjustments: { int: 1, wis: -1 },
    availableClasses: ["fighter", "mage", "cleric", "thief"],
  },
  {
    id: "half-elf",
    name: "Half-Elf",
    summary: "Adaptable, with access to a broad range of professions.",
    adjustments: {},
    availableClasses: ["fighter", "ranger", "mage", "cleric", "druid", "thief", "bard"],
  },
  {
    id: "halfling",
    name: "Halfling",
    summary: "Quick and light-footed, favouring stealth and practical combat.",
    adjustments: { dex: 1, str: -1 },
    availableClasses: ["fighter", "cleric", "thief"],
  },
];

export const CLASSES: {
  id: ClassId;
  name: string;
  group: "Warrior" | "Wizard" | "Priest" | "Rogue";
  description: string;
  minimums: Partial<Record<AbilityKey, number>>;
  exceptionalStrength: boolean;
  allowedAlignments?: string[];
}[] = [
  {
    id: "fighter",
    name: "Fighter",
    group: "Warrior",
    description: "A dedicated combatant with broad weapon and armour access.",
    minimums: { str: 9 },
    exceptionalStrength: true,
  },
  {
    id: "ranger",
    name: "Ranger",
    group: "Warrior",
    description: "A wilderness warrior requiring exceptional physical and spiritual aptitude.",
    minimums: { str: 13, dex: 13, con: 14, wis: 14 },
    exceptionalStrength: true,
    allowedAlignments: ["Lawful Good", "Neutral Good", "Chaotic Good"],
  },
  {
    id: "paladin",
    name: "Paladin",
    group: "Warrior",
    description: "A highly demanding holy warrior vocation.",
    minimums: { str: 12, con: 9, wis: 13, cha: 17 },
    exceptionalStrength: true,
    allowedAlignments: ["Lawful Good"],
  },
  {
    id: "mage",
    name: "Mage",
    group: "Wizard",
    description: "A scholar of arcane magic who relies on Intelligence.",
    minimums: { int: 9 },
    exceptionalStrength: false,
  },
  {
    id: "cleric",
    name: "Cleric",
    group: "Priest",
    description: "A priestly adventurer whose powers are rooted in Wisdom.",
    minimums: { wis: 9 },
    exceptionalStrength: false,
  },
  {
    id: "druid",
    name: "Druid",
    group: "Priest",
    description: "A guardian of the natural order with demanding spiritual requirements.",
    minimums: { wis: 12, cha: 15 },
    exceptionalStrength: false,
    allowedAlignments: ["True Neutral"],
  },
  {
    id: "thief",
    name: "Thief",
    group: "Rogue",
    description: "A specialist in stealth, locks, traps, and opportunistic combat.",
    minimums: { dex: 9 },
    exceptionalStrength: false,
  },
  {
    id: "bard",
    name: "Bard",
    group: "Rogue",
    description: "A versatile performer, traveller, and dabbler in many skills.",
    minimums: { dex: 12, int: 13, cha: 15 },
    exceptionalStrength: false,
    allowedAlignments: ["Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Neutral Evil"],
  },
];

export const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
] as const;

export const EMPTY_SCORES: AbilityScores = {
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
  cha: 0,
};

export function applyRaceAdjustments(scores: AbilityScores, raceId: RaceId): AbilityScores {
  const race = RACES.find((item) => item.id === raceId);
  const next = { ...scores };
  if (!race) return next;

  for (const ability of ABILITIES) {
    const modifier = race.adjustments[ability.id] ?? 0;
    next[ability.id] = Math.max(3, Math.min(19, next[ability.id] + modifier));
  }
  return next;
}

export function qualifiesForClass(scores: AbilityScores, classId: ClassId) {
  const characterClass = CLASSES.find((item) => item.id === classId);
  if (!characterClass) return false;
  return Object.entries(characterClass.minimums).every(([key, value]) => scores[key as AbilityKey] >= (value ?? 0));
}
