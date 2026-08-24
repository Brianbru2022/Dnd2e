import type { AbilityScores, ClassId, RaceId, SavingThrows } from "./rules";

export type CharacterSex = "female" | "male";

export type MagicRecord = {
  learned: string[];
  memorizedWizard: string[];
  memorizedPriest: string[];
  attempts: { spell:string; roll:number; target:number; success:boolean }[];
};

export type CharacterFinalDetails = {
  languages: string[];
  age: number | null;
  heightIn: number | null;
  weightLb: number | null;
  portrait: string | null;
};

export type PortraitForgeRecord = {
  appearance: Record<string,string|null>;
  customDescription: string;
  generatedPrompt: string;
  endpoint: string;
  workflowEndpoint: string;
  status?: string;
  lastResponse?: unknown;
};

export type CharacterRecord = {
  schemaVersion: 1;
  sealedAt: string;
  identity: { name:string; sex:CharacterSex|null };
  race: RaceId;
  classes: ClassId[];
  alignment: string;
  abilities: AbilityScores;
  hp: number;
  ac: number;
  thac0: number;
  savingThrows: SavingThrows;
  gold: number;
  proficiencies: unknown[];
  classChoices: {
    rangerSpeciesEnemy?: string;
    bardSkills?: Record<string,number>;
  };
  magic: MagicRecord;
  finalDetails: CharacterFinalDetails;
  portraitForge?: PortraitForgeRecord;
  equipment: {
    armour: string | null;
    shield: boolean;
    weapons: string[];
    gear: string[];
  };
  encumbrance: {
    carriedLb: number;
    allowanceLb: number;
    category: string;
    movement: number;
  };
  rollHistory: unknown[];
};

export type ValidationResult = { valid:boolean; errors:string[] };

export function validateCharacterRecord(record: Partial<CharacterRecord>): ValidationResult {
  const errors:string[]=[];
  if(!record.identity?.name?.trim()) errors.push("Character name is required.");
  if(!record.identity?.sex) errors.push("Choose Female or Male for the character identity.");
  if(!record.race) errors.push("Ancestry is incomplete.");
  if(!record.classes?.length) errors.push("Class path is incomplete.");
  if(!record.alignment) errors.push("Alignment is incomplete.");
  if(!record.abilities || Object.values(record.abilities).some(v=>!Number.isFinite(v)||v<3)) errors.push("Ability scores are incomplete.");
  if(!Number.isFinite(record.hp) || (record.hp??0)<1) errors.push("Starting hit points are incomplete.");
  if(!record.savingThrows) errors.push("Saving throws are incomplete.");
  if(!Number.isFinite(record.gold) || (record.gold??-1)<0) errors.push("Equipment spending exceeds available gold or starting gold is incomplete.");
  const classes=record.classes??[];
  if(classes.some(c=>c==="mage"||c==="illusionist")){
    const slots=classes.includes("illusionist")?2:1;
    if((record.magic?.memorizedWizard?.length??0)!==slots) errors.push(`Memorize exactly ${slots} wizard spell${slots===1?"":"s"}.`);
  }
  if(classes.some(c=>c==="cleric"||c==="druid") && !(record.magic?.memorizedPriest?.length)) errors.push("Memorize the required priest spells.");
  if(classes.includes("ranger") && !record.classChoices?.rangerSpeciesEnemy) errors.push("Choose the Ranger species enemy.");
  if(classes.includes("bard")){
    const total=Object.values(record.classChoices?.bardSkills??{}).reduce((a,b)=>a+(Number(b)||0),0);
    if(total!==20) errors.push("Allocate all 20 Bard rogue-skill points.");
  }
  if(!record.finalDetails?.portrait && !record.portraitForge?.generatedPrompt) errors.push("Choose a portrait presentation or prepare a Portrait Forge prompt.");
  return {valid:errors.length===0,errors};
}
