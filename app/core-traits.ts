import type { AbilityScores, RaceId } from "./rules";
import { charismaDerived, constitutionDerived, dexterityDerived, intelligenceDerived, strengthDerived, wisdomDerived } from "./rules";

export type AbilityDerivedRecord = {
  strength: Record<string, unknown>;
  dexterity: Record<string, unknown>;
  constitution: Record<string, unknown>;
  intelligence: Record<string, unknown>;
  wisdom: Record<string, unknown>;
  charisma: Record<string, unknown>;
};

function asRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export function deriveAllAbilities(scores: AbilityScores, exceptionalStrength: number | null = null, warrior = false): AbilityDerivedRecord {
  return {
    strength: asRecord(strengthDerived(scores.str, exceptionalStrength)),
    dexterity: asRecord(dexterityDerived(scores.dex)),
    constitution: asRecord(constitutionDerived(scores.con, warrior)),
    intelligence: asRecord(intelligenceDerived(scores.int)),
    wisdom: asRecord(wisdomDerived(scores.wis)),
    charisma: asRecord(charismaDerived(scores.cha)),
  };
}

export type RacialDetectionRule = {
  id: string;
  label: string;
  chancePercent?: number;
  roll?: string;
  condition?: string;
};

export type RacialCombatModifier = {
  label: string;
  attack?: number;
  ac?: number;
  save?: number;
  reaction?: number;
  condition?: string;
};

export type RaceTraits = {
  race: RaceId;
  movement: number;
  infravisionFt: number | null;
  automaticLanguages: string[];
  bonusLanguagePool: string[];
  detections: RacialDetectionRule[];
  combatModifiers: RacialCombatModifier[];
  saveTraits: string[];
  stealthTraits: string[];
  otherTraits: string[];
};

export const RACE_TRAITS: Record<RaceId, RaceTraits> = {
  human: {
    race:"human", movement:12, infravisionFt:null,
    automaticLanguages:["Common"],
    bonusLanguagePool:["Dwarven","Elven","Gnome","Goblin","Halfling","Orc"],
    detections:[], combatModifiers:[], saveTraits:[], stealthTraits:[],
    otherTraits:["No racial class level limit in this rules profile."],
  },
  dwarf: {
    race:"dwarf", movement:6, infravisionFt:60,
    automaticLanguages:["Common","Dwarven"],
    bonusLanguagePool:["Gnome","Goblin","Kobold","Orc"],
    detections:[
      {id:"grade",label:"Detect grade/slope in passage",chancePercent:75},
      {id:"newwork",label:"Detect new tunnel/passage construction",chancePercent:75},
      {id:"sliding",label:"Detect sliding/shifting walls or rooms",chancePercent:66},
      {id:"stonework",label:"Detect stonework traps/pits/deadfalls",chancePercent:50},
      {id:"depth",label:"Determine approximate depth underground",chancePercent:50},
    ],
    combatModifiers:[
      {label:"Traditional combat training vs goblinoids",attack:1,condition:"Against common goblinoid foes in campaign-approved encounters"},
      {label:"Defensive training vs giant-class foes",ac:-4,condition:"Against traditional giant-class opponents where the campaign profile applies"},
    ],
    saveTraits:["Constitution-based bonus on saves vs poison and magic where the classic demihuman resistance rule applies."],
    stealthTraits:[],
    otherTraits:["Stonecunning-style underground detection requires deliberate examination; the adventure engine should roll only when the player searches or the DM calls for it."],
  },
  elf: {
    race:"elf", movement:12, infravisionFt:60,
    automaticLanguages:["Common","Elven"],
    bonusLanguagePool:["Gnome","Goblin","Halfling","Orc"],
    detections:[
      {id:"secret-passive",label:"Notice concealed/secret doors when passing",roll:"1-in-6",condition:"Passive opportunity determined by the adventure engine"},
      {id:"secret-search",label:"Find concealed door when actively searching",roll:"1-in-3"},
      {id:"secret-search-secret",label:"Find secret door when actively searching",roll:"1-in-6"},
    ],
    combatModifiers:[
      {label:"Traditional bow/sword aptitude",attack:1,condition:"With the campaign-approved elven bow/sword weapon list"},
    ],
    saveTraits:["High resistance to sleep/charm magic in the classic rules profile."],
    stealthTraits:["When moving alone and unarmoured or lightly armoured, elves can impose a surprise disadvantage on observers in suitable natural conditions."],
    otherTraits:["Sleep/charm resistance should be resolved mechanically by the adventure engine rather than represented as flavour only."],
  },
  gnome: {
    race:"gnome", movement:6, infravisionFt:60,
    automaticLanguages:["Common","Gnome"],
    bonusLanguagePool:["Dwarven","Goblin","Halfling","Kobold"],
    detections:[
      {id:"grade",label:"Detect grade/slope in passage",chancePercent:80},
      {id:"unsafe",label:"Detect unsafe walls/ceilings/floors",chancePercent:70},
      {id:"depth",label:"Determine approximate depth underground",chancePercent:60},
      {id:"direction",label:"Determine direction underground",chancePercent:50},
    ],
    combatModifiers:[
      {label:"Traditional combat training vs kobolds/goblinoids",attack:1,condition:"Against campaign-approved traditional foes"},
      {label:"Defensive training vs giant-class foes",ac:-4,condition:"Against traditional giant-class opponents where the campaign profile applies"},
    ],
    saveTraits:["Constitution-based bonus on saves vs magic where the classic demihuman resistance rule applies."],
    stealthTraits:[],
    otherTraits:["Gnomes use the specialist Illusionist path as their core wizard tradition in this rules profile."],
  },
  "half-elf": {
    race:"half-elf", movement:12, infravisionFt:60,
    automaticLanguages:["Common","Elven"],
    bonusLanguagePool:["Dwarven","Gnome","Goblin","Halfling","Orc"],
    detections:[
      {id:"secret-search",label:"Find concealed door when actively searching",roll:"1-in-3"},
      {id:"secret-search-secret",label:"Find secret door when actively searching",roll:"1-in-6"},
    ],
    combatModifiers:[],
    saveTraits:["Partial resistance to sleep/charm magic in the classic rules profile."],
    stealthTraits:[],
    otherTraits:["Broad multiclass access is a defining mechanical trait."],
  },
  halfling: {
    race:"halfling", movement:6, infravisionFt:60,
    automaticLanguages:["Common","Halfling"],
    bonusLanguagePool:["Dwarven","Elven","Gnome","Goblin"],
    detections:[
      {id:"slope",label:"Detect grade/slope underground",chancePercent:75},
      {id:"direction",label:"Determine direction underground",chancePercent:50},
    ],
    combatModifiers:[
      {label:"Missile-weapon aptitude",attack:1,condition:"With thrown weapons/slings where the campaign profile applies"},
    ],
    saveTraits:["Constitution-based bonus on saves vs poison and magic where the classic demihuman resistance rule applies."],
    stealthTraits:["Naturally quiet movement can improve surprise chances when conditions permit and the character is not heavily burdened."],
    otherTraits:["Halfling fighters do not receive exceptional Strength in this rules profile."],
  },
};

export function raceTraits(raceId: RaceId) {
  return RACE_TRAITS[raceId];
}
