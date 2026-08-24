import type { AbilityKey, AbilityScores, ClassGroup, ClassId, RaceId } from "./rules";

export type AbilityRange = { min: number; max: number };
export type RaceRequirement = Record<AbilityKey, AbilityRange>;

export const RACIAL_ABILITY_REQUIREMENTS: Record<RaceId, RaceRequirement> = {
  human: {
    str:{min:3,max:18}, dex:{min:3,max:18}, con:{min:3,max:18}, int:{min:3,max:18}, wis:{min:3,max:18}, cha:{min:3,max:18},
  },
  dwarf: {
    str:{min:8,max:18}, dex:{min:3,max:17}, con:{min:11,max:18}, int:{min:3,max:18}, wis:{min:3,max:18}, cha:{min:3,max:17},
  },
  elf: {
    str:{min:3,max:18}, dex:{min:6,max:18}, con:{min:7,max:18}, int:{min:8,max:18}, wis:{min:3,max:18}, cha:{min:8,max:18},
  },
  gnome: {
    str:{min:6,max:18}, dex:{min:3,max:18}, con:{min:8,max:18}, int:{min:6,max:18}, wis:{min:3,max:18}, cha:{min:3,max:18},
  },
  "half-elf": {
    str:{min:3,max:18}, dex:{min:6,max:18}, con:{min:6,max:18}, int:{min:4,max:18}, wis:{min:3,max:18}, cha:{min:3,max:18},
  },
  halfling: {
    str:{min:7,max:18}, dex:{min:7,max:18}, con:{min:10,max:18}, int:{min:6,max:18}, wis:{min:3,max:17}, cha:{min:3,max:18},
  },
};

export function qualifiesForRace(scores: AbilityScores, raceId: RaceId) {
  const req = RACIAL_ABILITY_REQUIREMENTS[raceId];
  return (Object.keys(req) as AbilityKey[]).every((key) => scores[key] >= req[key].min && scores[key] <= req[key].max);
}

export function raceQualificationReasons(scores: AbilityScores, raceId: RaceId) {
  const req = RACIAL_ABILITY_REQUIREMENTS[raceId];
  return (Object.keys(req) as AbilityKey[])
    .filter((key) => scores[key] < req[key].min || scores[key] > req[key].max)
    .map((key) => `${key.toUpperCase()} must be ${req[key].min}–${req[key].max}; rolled ${scores[key]}`);
}

export const MULTICLASS_PATHS: Record<Exclude<RaceId,"human">, ClassId[][]> = {
  dwarf: [["fighter","thief"],["fighter","cleric"]],
  elf: [["fighter","mage"],["fighter","thief"],["mage","thief"],["fighter","mage","thief"]],
  gnome: [["fighter","cleric"],["fighter","illusionist"],["fighter","thief"],["cleric","illusionist"],["cleric","thief"],["illusionist","thief"]],
  "half-elf": [["fighter","cleric"],["fighter","thief"],["fighter","mage"],["cleric","ranger"],["cleric","mage"],["mage","thief"],["fighter","mage","cleric"],["fighter","mage","thief"]],
  halfling: [["fighter","thief"]],
};

export const RACE_CLASS_LEVEL_LIMITS: Record<RaceId, Partial<Record<ClassId, number | "U">>> = {
  human: { fighter:"U", ranger:"U", paladin:"U", mage:"U", illusionist:"U", cleric:"U", druid:"U", thief:"U", bard:"U" },
  dwarf: { fighter:15, cleric:10, thief:12 },
  elf: { fighter:12, ranger:15, mage:15, cleric:12, thief:12 },
  gnome: { fighter:11, illusionist:15, cleric:9, thief:13 },
  "half-elf": { fighter:14, ranger:16, mage:12, cleric:14, druid:9, thief:12, bard:"U" },
  halfling: { fighter:9, cleric:8, thief:15 },
};

export function primeRequisiteLevelBonus(score: number) {
  if (score >= 19) return 4;
  if (score >= 18) return 3;
  if (score >= 16) return 2;
  if (score >= 14) return 1;
  return 0;
}

export const BASE_MOVEMENT: Record<RaceId, number> = {
  human: 12,
  dwarf: 6,
  elf: 12,
  gnome: 6,
  "half-elf": 12,
  halfling: 6,
};

export type NwpDefinition = {
  name: string;
  groups: Array<ClassGroup | "General">;
  slots: number;
  ability: AbilityKey;
  modifier: number;
};

export const NONWEAPON_PROFICIENCY_RULES: NwpDefinition[] = [
  { name:"Ancient History", groups:["Priest","Wizard"], slots:1, ability:"int", modifier:-1 },
  { name:"Animal Handling", groups:["Warrior"], slots:1, ability:"wis", modifier:-1 },
  { name:"Direction Sense", groups:["General"], slots:1, ability:"wis", modifier:1 },
  { name:"Endurance", groups:["Warrior"], slots:2, ability:"con", modifier:0 },
  { name:"Healing", groups:["Priest"], slots:2, ability:"wis", modifier:-2 },
  { name:"Herbalism", groups:["Priest","Wizard"], slots:2, ability:"int", modifier:-2 },
  { name:"Local History", groups:["Rogue","Wizard"], slots:1, ability:"cha", modifier:0 },
  { name:"Navigation", groups:["Priest","Rogue","Warrior"], slots:1, ability:"int", modifier:-2 },
  { name:"Reading/Writing", groups:["Priest","Wizard"], slots:1, ability:"int", modifier:1 },
  { name:"Riding", groups:["General"], slots:1, ability:"wis", modifier:3 },
  { name:"Survival", groups:["Warrior"], slots:2, ability:"int", modifier:0 },
  { name:"Swimming", groups:["General"], slots:1, ability:"str", modifier:0 },
];

export type ClassCreationHook = {
  classId: ClassId;
  levelOneFeatures: string[];
  characterCreationChoices: string[];
  saveAdjustment?: { amount: number; categories: "all" | string[] };
};

export const CLASS_CREATION_HOOKS: ClassCreationHook[] = [
  { classId:"fighter", levelOneFeatures:["Warrior combat progression","Exceptional Strength when eligible","Weapon specialization option"], characterCreationChoices:["Weapon proficiencies","Optional specialization"] },
  { classId:"ranger", levelOneFeatures:["Tracking","Two-weapon fighting benefits in suitable armour","Species enemy bonus"], characterCreationChoices:["Species enemy","Weapon proficiencies"] },
  { classId:"paladin", levelOneFeatures:["Detect evil intent","Lay on hands","Disease resistance","Protective aura"], characterCreationChoices:["Weapon proficiencies"], saveAdjustment:{amount:2,categories:"all"} },
  { classId:"mage", levelOneFeatures:["Arcane spellbook","Spell memorization","Wizard item restrictions"], characterCreationChoices:["Starting spellbook","Memorized spell"] },
  { classId:"illusionist", levelOneFeatures:["Specialist bonus spell","School save modifiers","Opposition-school restrictions"], characterCreationChoices:["Starting spellbook","Specialist spell","Memorized spells"] },
  { classId:"cleric", levelOneFeatures:["Priest spells","Turn undead","Granted powers by faith profile"], characterCreationChoices:["Memorized prayers","Faith profile when enabled"] },
  { classId:"druid", levelOneFeatures:["Druidic priest spells","Nature lore","Druidic language","Restricted equipment"], characterCreationChoices:["Memorized prayers"] },
  { classId:"thief", levelOneFeatures:["Eight thief abilities","Backstab","Thieves’ cant"], characterCreationChoices:["Allocate 60 thief-skill points"] },
  { classId:"bard", levelOneFeatures:["Rogue skills","Bardic knowledge","Performance influence","Arcane casting at later levels"], characterCreationChoices:["Weapon and nonweapon proficiencies"] },
];

export const AUDITED_RULE_NOTES = {
  exceptionalStrength: "Halfling fighters never receive exceptional Strength; other eligible warrior classes with STR 18 do.",
  multiclass: "Only demihumans multiclass at character creation. Human dual-classing is a later-career progression rule.",
  specialistWizard: "Specialist wizards are normally single-classed; gnome illusionists are the core multiclass exception.",
  proficiencies: "Weapon proficiencies are tournament-level rules and nonweapon proficiencies are optional; this project intentionally enables both by default.",
};
