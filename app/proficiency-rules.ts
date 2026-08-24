import type { AbilityKey, ClassGroup, WeaponId } from "./rules";

export type NwpRule={id:string;name:string;groups:Array<ClassGroup|"General">;slots:number;ability:AbilityKey;modifier:number;description:string};
export const NWP_RULES:NwpRule[]=[
{id:"agriculture",name:"Agriculture",groups:["General"],slots:1,ability:"int",modifier:0,description:"Farming, crops, livestock and agricultural practice."},
{id:"ancient-history",name:"Ancient History",groups:["Priest","Wizard"],slots:1,ability:"int",modifier:-1,description:"Recall significant people, places and events from a chosen ancient field."},
{id:"animal-handling",name:"Animal Handling",groups:["Warrior"],slots:1,ability:"wis",modifier:-1,description:"Calm, control and manage domesticated animals."},
{id:"animal-lore",name:"Animal Lore",groups:["Warrior"],slots:1,ability:"int",modifier:0,description:"Identify animals and interpret their behaviour, tracks and habits."},
{id:"animal-training",name:"Animal Training",groups:["Warrior"],slots:1,ability:"wis",modifier:0,description:"Train a chosen type of animal to perform useful tasks."},
{id:"appraising",name:"Appraising",groups:["Rogue"],slots:1,ability:"int",modifier:0,description:"Estimate the value and authenticity of goods and valuables."},
{id:"armorer",name:"Armorer",groups:["Warrior"],slots:2,ability:"int",modifier:-2,description:"Make, maintain and repair armour and shields."},
{id:"artistic-ability",name:"Artistic Ability",groups:["General"],slots:1,ability:"wis",modifier:0,description:"Create competent work in a chosen artistic discipline."},
{id:"astrology",name:"Astrology",groups:["Priest","Wizard"],slots:2,ability:"int",modifier:0,description:"Interpret celestial movements and traditional astrological signs."},
{id:"blacksmithing",name:"Blacksmithing",groups:["General"],slots:1,ability:"str",modifier:0,description:"Forge and repair common iron goods."},
{id:"blind-fighting",name:"Blind-Fighting",groups:["Warrior","Rogue"],slots:2,ability:"wis",modifier:0,description:"Reduce penalties when fighting opponents that cannot be seen."},
{id:"brewing",name:"Brewing",groups:["General"],slots:1,ability:"int",modifier:0,description:"Brew beers, ales and similar fermented drinks."},
{id:"carpentry",name:"Carpentry",groups:["General"],slots:1,ability:"str",modifier:0,description:"Construct and repair wooden structures and objects."},
{id:"cobbling",name:"Cobbling",groups:["General"],slots:1,ability:"dex",modifier:0,description:"Make and repair footwear."},
{id:"cooking",name:"Cooking",groups:["General"],slots:1,ability:"int",modifier:0,description:"Prepare wholesome meals from available ingredients."},
{id:"dancing",name:"Dancing",groups:["General"],slots:1,ability:"dex",modifier:0,description:"Perform and recognize formal and folk dances."},
{id:"direction-sense",name:"Direction Sense",groups:["General"],slots:1,ability:"wis",modifier:1,description:"Maintain a reliable sense of direction when travelling."},
{id:"disguise",name:"Disguise",groups:["Rogue"],slots:1,ability:"cha",modifier:-1,description:"Alter appearance and mannerisms to impersonate another identity."},
{id:"endurance",name:"Endurance",groups:["Warrior"],slots:2,ability:"con",modifier:0,description:"Sustain strenuous activity beyond ordinary limits."},
{id:"engineering",name:"Engineering",groups:["Wizard"],slots:2,ability:"int",modifier:-3,description:"Understand construction, fortification and mechanical works."},
{id:"etiquette",name:"Etiquette",groups:["Rogue"],slots:1,ability:"cha",modifier:0,description:"Know expected conduct in courts, guilds and formal society."},
{id:"fire-building",name:"Fire-Building",groups:["General"],slots:1,ability:"wis",modifier:-1,description:"Start and maintain fires in difficult conditions."},
{id:"fishing",name:"Fishing",groups:["General"],slots:1,ability:"wis",modifier:-1,description:"Catch fish using common lines, nets and traps."},
{id:"forgery",name:"Forgery",groups:["Rogue"],slots:1,ability:"dex",modifier:-1,description:"Create or detect convincing forged documents."},
{id:"gaming",name:"Gaming",groups:["General"],slots:1,ability:"cha",modifier:0,description:"Know common games of chance and skill and recognize suspicious play."},
{id:"gem-cutting",name:"Gem Cutting",groups:["Rogue","Wizard"],slots:2,ability:"dex",modifier:-2,description:"Cut, polish and assess gemstones."},
{id:"healing",name:"Healing",groups:["Priest"],slots:2,ability:"wis",modifier:-2,description:"Provide competent mundane first aid and long-term care."},
{id:"heraldry",name:"Heraldry",groups:["General"],slots:1,ability:"int",modifier:0,description:"Recognize coats of arms, banners and noble insignia."},
{id:"herbalism",name:"Herbalism",groups:["Priest","Wizard"],slots:2,ability:"int",modifier:-2,description:"Identify and prepare useful medicinal and unusual plants."},
{id:"hunting",name:"Hunting",groups:["Warrior"],slots:1,ability:"wis",modifier:-1,description:"Find, stalk and take game in the wilderness."},
{id:"juggling",name:"Juggling",groups:["Rogue"],slots:1,ability:"dex",modifier:-1,description:"Juggle objects and perform related feats of manual dexterity."},
{id:"jumping",name:"Jumping",groups:["Rogue","Warrior"],slots:1,ability:"str",modifier:0,description:"Make controlled standing and running jumps."},
{id:"languages-ancient",name:"Languages, Ancient",groups:["Priest","Wizard"],slots:1,ability:"int",modifier:0,description:"Read or understand a chosen ancient language."},
{id:"languages-modern",name:"Languages, Modern",groups:["General"],slots:1,ability:"int",modifier:0,description:"Speak a chosen modern language."},
{id:"leatherworking",name:"Leatherworking",groups:["General"],slots:1,ability:"int",modifier:0,description:"Make and repair common leather goods."},
{id:"local-history",name:"Local History",groups:["Rogue","Wizard"],slots:1,ability:"cha",modifier:0,description:"Know stories, families, landmarks and events of a chosen locality."},
{id:"mining",name:"Mining",groups:["General"],slots:2,ability:"wis",modifier:-3,description:"Assess mines, veins, underground works and mining hazards."},
{id:"mountaineering",name:"Mountaineering",groups:["Warrior"],slots:1,ability:"na" as AbilityKey,modifier:0,description:"Use ropes and climbing equipment for difficult ascents; handled as a special proficiency."},
{id:"musical-instrument",name:"Musical Instrument",groups:["General"],slots:1,ability:"dex",modifier:-1,description:"Play a chosen musical instrument competently."},
{id:"navigation",name:"Navigation",groups:["Priest","Rogue","Warrior"],slots:1,ability:"int",modifier:-2,description:"Navigate over long distances using landmarks, charts and celestial cues."},
{id:"pottery",name:"Pottery",groups:["General"],slots:1,ability:"dex",modifier:-2,description:"Make fired clay vessels and similar goods."},
{id:"reading-lips",name:"Reading Lips",groups:["Rogue"],slots:2,ability:"int",modifier:-2,description:"Understand speech by observing a speaker's mouth."},
{id:"reading-writing",name:"Reading/Writing",groups:["Priest","Wizard"],slots:1,ability:"int",modifier:1,description:"Read and write languages the character can speak where a script is known."},
{id:"religion",name:"Religion",groups:["Priest"],slots:1,ability:"wis",modifier:0,description:"Know theology, rites, symbols and religious institutions."},
{id:"riding-airborne",name:"Riding, Airborne",groups:["Warrior"],slots:2,ability:"wis",modifier:-2,description:"Ride and control a suitable flying mount."},
{id:"riding-land",name:"Riding, Land-Based",groups:["General"],slots:1,ability:"wis",modifier:3,description:"Ride and control a chosen type of land mount."},
{id:"rope-use",name:"Rope Use",groups:["Rogue"],slots:1,ability:"dex",modifier:0,description:"Tie reliable knots, secure loads and perform advanced rope work."},
{id:"running",name:"Running",groups:["Warrior"],slots:1,ability:"con",modifier:-6,description:"Maintain an enhanced running pace over distance."},
{id:"seamanship",name:"Seamanship",groups:["General"],slots:1,ability:"dex",modifier:1,description:"Work effectively aboard sailing vessels and small boats."},
{id:"seamstress-tailor",name:"Seamstress/Tailor",groups:["General"],slots:1,ability:"dex",modifier:-1,description:"Make and repair clothing and cloth goods."},
{id:"set-snares",name:"Set Snares",groups:["Rogue","Warrior"],slots:1,ability:"dex",modifier:-1,description:"Construct and conceal simple traps and snares."},
{id:"singing",name:"Singing",groups:["General"],slots:1,ability:"cha",modifier:0,description:"Perform songs competently and control the voice."},
{id:"spellcraft",name:"Spellcraft",groups:["Priest","Wizard"],slots:1,ability:"int",modifier:-2,description:"Recognize spells, magical techniques and related arcane or priestly phenomena."},
{id:"stonemasonry",name:"Stonemasonry",groups:["General"],slots:1,ability:"str",modifier:-2,description:"Cut, shape and construct with stone."},
{id:"survival",name:"Survival",groups:["Warrior"],slots:2,ability:"int",modifier:0,description:"Survive and find necessities in a chosen terrain type."},
{id:"swimming",name:"Swimming",groups:["General"],slots:1,ability:"str",modifier:0,description:"Swim safely and perform strenuous movement in water."},
{id:"tightrope-walking",name:"Tightrope Walking",groups:["Rogue"],slots:1,ability:"dex",modifier:0,description:"Balance and move along narrow ropes and similar surfaces."},
{id:"tracking",name:"Tracking",groups:["Warrior"],slots:2,ability:"wis",modifier:0,description:"Follow creatures by signs and tracks; terrain and circumstances modify checks."},
{id:"tumbling",name:"Tumbling",groups:["Rogue"],slots:1,ability:"dex",modifier:0,description:"Perform acrobatic manoeuvres, falls and evasive movement."},
{id:"ventriloquism",name:"Ventriloquism",groups:["Rogue"],slots:1,ability:"int",modifier:-2,description:"Throw the voice and imitate sounds convincingly."},
{id:"weaponsmithing",name:"Weaponsmithing",groups:["Warrior"],slots:3,ability:"int",modifier:-3,description:"Forge, maintain and repair weapons."},
{id:"weather-sense",name:"Weather Sense",groups:["General"],slots:1,ability:"wis",modifier:-1,description:"Anticipate ordinary changes in local weather."},
{id:"weaving",name:"Weaving",groups:["General"],slots:1,ability:"int",modifier:-1,description:"Produce and repair woven cloth."}
];

export const NONPROFICIENCY_PENALTY:Record<ClassGroup,number>={Warrior:-2,Wizard:-5,Priest:-3,Rogue:-3};
export type WeaponProficiencyState="unproficient"|"proficient"|"specialized";
export type WeaponCombatMods={attack:number;damage:number;attacksPerRoundBonus:string|null;nonproficiencyPenalty:number;state:WeaponProficiencyState};
export function weaponCombatModifiers(group:ClassGroup,weapon:WeaponId,proficientWeapons:WeaponId[],specializedWeapon:WeaponId|null):WeaponCombatMods{
 const specialized=group==="Warrior"&&specializedWeapon===weapon;
 const proficient=specialized||proficientWeapons.includes(weapon);
 if(!proficient)return{attack:NONPROFICIENCY_PENALTY[group],damage:0,attacksPerRoundBonus:null,nonproficiencyPenalty:NONPROFICIENCY_PENALTY[group],state:"unproficient"};
 if(specialized)return{attack:1,damage:2,attacksPerRoundBonus:"specialization rate applies",nonproficiencyPenalty:0,state:"specialized"};
 return{attack:0,damage:0,attacksPerRoundBonus:null,nonproficiencyPenalty:0,state:"proficient"};
}

export const SPECIALIZATION_RULES={
 eligibility:"Single-class Fighter in the core profile; campaign profiles may broaden this deliberately.",
 melee:{slotCost:2,attackBonus:1,damageBonus:2,note:"Specialized melee weapons improve attack rate according to the specialization attack-rate table."},
 bow:{slotCost:2,attackBonus:1,damageBonus:2,note:"Bow specialization includes the appropriate close-range/rate-of-fire benefits in the combat resolver."},
 crossbow:{slotCost:2,attackBonus:1,damageBonus:2,note:"Crossbow specialization uses its weapon-specific rate-of-fire benefit in the combat resolver."}
};

export function proficiencyCheckTarget(rule:NwpRule,abilityScore:number){if((rule.ability as string)==="na")return null;return Math.max(1,Math.min(20,abilityScore+rule.modifier));}
