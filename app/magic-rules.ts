import type { ClassId } from "./rules";

export type WizardSpell = { name:string; school:"Abjuration"|"Alteration"|"Conjuration"|"Divination"|"Enchantment"|"Evocation"|"Illusion"|"Necromancy" };
export type PriestSphere = "All"|"Animal"|"Charm"|"Combat"|"Creation"|"Divination"|"Elemental"|"Guardian"|"Healing"|"Necromantic"|"Plant"|"Protection"|"Summoning"|"Sun"|"Weather";
export type PriestSpell = { name:string; spheres:PriestSphere[] };

export const WIZARD_SPELL_DATA:WizardSpell[] = [
 {name:"Armor",school:"Conjuration"},{name:"Burning Hands",school:"Alteration"},{name:"Charm Person",school:"Enchantment"},{name:"Color Spray",school:"Alteration"},
 {name:"Comprehend Languages",school:"Alteration"},{name:"Detect Magic",school:"Divination"},{name:"Feather Fall",school:"Alteration"},{name:"Grease",school:"Conjuration"},
 {name:"Identify",school:"Divination"},{name:"Light",school:"Alteration"},{name:"Magic Missile",school:"Evocation"},{name:"Phantasmal Force",school:"Illusion"},
 {name:"Protection from Evil",school:"Abjuration"},{name:"Read Magic",school:"Divination"},{name:"Shield",school:"Evocation"},{name:"Sleep",school:"Enchantment"},
 {name:"Spider Climb",school:"Alteration"},{name:"Unseen Servant",school:"Conjuration"},{name:"Ventriloquism",school:"Illusion"}
];

export const ILLUSIONIST_OPPOSITION_SCHOOLS = new Set<WizardSpell["school"]>(["Necromancy","Evocation","Abjuration"]);

export const PRIEST_SPELL_DATA:PriestSpell[] = [
 {name:"Bless",spheres:["All","Combat"]},{name:"Command",spheres:["Charm"]},{name:"Cure Light Wounds",spheres:["Healing"]},
 {name:"Detect Evil",spheres:["Divination"]},{name:"Detect Magic",spheres:["Divination"]},{name:"Light",spheres:["Sun"]},
 {name:"Protection from Evil",spheres:["Protection"]},{name:"Purify Food & Drink",spheres:["Creation"]},{name:"Sanctuary",spheres:["Protection"]},
 {name:"Animal Friendship",spheres:["Animal"]},{name:"Entangle",spheres:["Plant"]},{name:"Faerie Fire",spheres:["Sun"]},
 {name:"Pass without Trace",spheres:["Plant"]},{name:"Shillelagh",spheres:["Plant"]}
];

export const PRIEST_MAJOR_SPHERES:Record<"cleric"|"druid",PriestSphere[]> = {
 cleric:["All","Charm","Combat","Creation","Divination","Guardian","Healing","Necromantic","Protection","Summoning","Sun"],
 druid:["All","Animal","Elemental","Healing","Plant","Weather"]
};

export function wizardLearnChance(intelligence:number){
 if(intelligence<=9)return 35;if(intelligence===10)return 40;if(intelligence===11)return 45;if(intelligence===12)return 50;
 if(intelligence===13)return 55;if(intelligence===14)return 60;if(intelligence===15)return 65;if(intelligence===16)return 70;if(intelligence===17)return 75;
 if(intelligence===18)return 85;return 95;
}

export function wizardLevelOneSlots(classIds:ClassId[]){ return classIds.includes("illusionist")?2:classIds.includes("mage")?1:0; }

export function priestLevelOneSlots(classIds:ClassId[],wisdom:number){
 const hasPriest = classIds.includes("cleric")||classIds.includes("druid");
 if(!hasPriest)return 0;
 let slots=1;
 if(wisdom>=13)slots+=1;
 if(wisdom>=14)slots+=1;
 return slots;
}

export function priestSpellAllowed(classIds:ClassId[],spellName:string){
 const cls = classIds.includes("druid")?"druid":"cleric";
 const spell = PRIEST_SPELL_DATA.find(s=>s.name===spellName);
 if(!spell)return false;
 return spell.spheres.some(s=>PRIEST_MAJOR_SPHERES[cls].includes(s));
}

export function wizardSpellAllowed(classIds:ClassId[],spellName:string){
 const spell=WIZARD_SPELL_DATA.find(s=>s.name===spellName); if(!spell)return false;
 if(classIds.includes("illusionist") && ILLUSIONIST_OPPOSITION_SCHOOLS.has(spell.school)) return false;
 return true;
}
