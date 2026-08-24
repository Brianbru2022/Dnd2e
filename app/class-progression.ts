import type { ClassGroup, ClassId, SavingThrows } from "./rules";

export type SpellSlots = number[];
export type XpTable = number[];

const LEVELS = Array.from({ length: 20 }, (_, i) => i + 1);

export const GROUP_THAC0: Record<ClassGroup, number[]> = {
  Warrior: LEVELS.map((level) => 21 - level),
  Priest: LEVELS.map((level) => 20 - Math.floor((level - 1) / 3) * 2),
  Rogue: LEVELS.map((level) => 20 - Math.floor((level - 1) / 2)),
  Wizard: LEVELS.map((level) => 20 - Math.floor((level - 1) / 3)),
};

export type SaveBand = { min: number; max: number; saves: SavingThrows };
export const GROUP_SAVES: Record<ClassGroup, SaveBand[]> = {
  Warrior: [
    {min:1,max:2,saves:{paralyzationPoisonDeath:14,rodStaffWand:16,petrificationPolymorph:15,breathWeapon:17,spell:17}},
    {min:3,max:4,saves:{paralyzationPoisonDeath:13,rodStaffWand:15,petrificationPolymorph:14,breathWeapon:16,spell:16}},
    {min:5,max:6,saves:{paralyzationPoisonDeath:11,rodStaffWand:13,petrificationPolymorph:12,breathWeapon:13,spell:14}},
    {min:7,max:8,saves:{paralyzationPoisonDeath:10,rodStaffWand:12,petrificationPolymorph:11,breathWeapon:12,spell:13}},
    {min:9,max:10,saves:{paralyzationPoisonDeath:8,rodStaffWand:10,petrificationPolymorph:9,breathWeapon:9,spell:11}},
    {min:11,max:12,saves:{paralyzationPoisonDeath:7,rodStaffWand:9,petrificationPolymorph:8,breathWeapon:8,spell:10}},
    {min:13,max:14,saves:{paralyzationPoisonDeath:5,rodStaffWand:7,petrificationPolymorph:6,breathWeapon:5,spell:8}},
    {min:15,max:16,saves:{paralyzationPoisonDeath:4,rodStaffWand:6,petrificationPolymorph:5,breathWeapon:4,spell:7}},
    {min:17,max:20,saves:{paralyzationPoisonDeath:3,rodStaffWand:5,petrificationPolymorph:4,breathWeapon:4,spell:6}},
  ],
  Wizard: [
    {min:1,max:5,saves:{paralyzationPoisonDeath:14,rodStaffWand:11,petrificationPolymorph:13,breathWeapon:15,spell:12}},
    {min:6,max:10,saves:{paralyzationPoisonDeath:13,rodStaffWand:9,petrificationPolymorph:11,breathWeapon:13,spell:10}},
    {min:11,max:15,saves:{paralyzationPoisonDeath:11,rodStaffWand:7,petrificationPolymorph:9,breathWeapon:11,spell:8}},
    {min:16,max:20,saves:{paralyzationPoisonDeath:10,rodStaffWand:5,petrificationPolymorph:7,breathWeapon:9,spell:6}},
  ],
  Priest: [
    {min:1,max:3,saves:{paralyzationPoisonDeath:10,rodStaffWand:14,petrificationPolymorph:13,breathWeapon:16,spell:15}},
    {min:4,max:6,saves:{paralyzationPoisonDeath:9,rodStaffWand:13,petrificationPolymorph:12,breathWeapon:15,spell:14}},
    {min:7,max:9,saves:{paralyzationPoisonDeath:7,rodStaffWand:11,petrificationPolymorph:10,breathWeapon:13,spell:12}},
    {min:10,max:12,saves:{paralyzationPoisonDeath:6,rodStaffWand:10,petrificationPolymorph:9,breathWeapon:12,spell:11}},
    {min:13,max:15,saves:{paralyzationPoisonDeath:5,rodStaffWand:9,petrificationPolymorph:8,breathWeapon:11,spell:10}},
    {min:16,max:18,saves:{paralyzationPoisonDeath:4,rodStaffWand:8,petrificationPolymorph:7,breathWeapon:10,spell:9}},
    {min:19,max:20,saves:{paralyzationPoisonDeath:2,rodStaffWand:6,petrificationPolymorph:5,breathWeapon:8,spell:7}},
  ],
  Rogue: [
    {min:1,max:4,saves:{paralyzationPoisonDeath:13,rodStaffWand:14,petrificationPolymorph:12,breathWeapon:16,spell:15}},
    {min:5,max:8,saves:{paralyzationPoisonDeath:12,rodStaffWand:12,petrificationPolymorph:11,breathWeapon:15,spell:13}},
    {min:9,max:12,saves:{paralyzationPoisonDeath:11,rodStaffWand:10,petrificationPolymorph:10,breathWeapon:14,spell:11}},
    {min:13,max:16,saves:{paralyzationPoisonDeath:10,rodStaffWand:8,petrificationPolymorph:9,breathWeapon:13,spell:9}},
    {min:17,max:20,saves:{paralyzationPoisonDeath:9,rodStaffWand:6,petrificationPolymorph:8,breathWeapon:12,spell:7}},
  ],
};

export const CLASS_XP: Record<ClassId, XpTable> = {
  fighter:[0,2000,4000,8000,16000,32000,64000,125000,250000,500000,750000,1000000,1250000,1500000,1750000,2000000,2250000,2500000,2750000,3000000],
  ranger:[0,2250,4500,9000,18000,36000,75000,150000,300000,600000,900000,1200000,1500000,1800000,2100000,2400000,2700000,3000000,3300000,3600000],
  paladin:[0,2250,4500,9000,18000,36000,75000,150000,300000,600000,900000,1200000,1500000,1800000,2100000,2400000,2700000,3000000,3300000,3600000],
  mage:[0,2500,5000,10000,20000,40000,60000,90000,135000,250000,375000,750000,1125000,1500000,1875000,2250000,2625000,3000000,3375000,3750000],
  illusionist:[0,2500,5000,10000,20000,40000,60000,90000,135000,250000,375000,750000,1125000,1500000,1875000,2250000,2625000,3000000,3375000,3750000],
  cleric:[0,1500,3000,6000,13000,27500,55000,110000,225000,450000,675000,900000,1125000,1350000,1575000,1800000,2025000,2250000,2475000,2700000],
  druid:[0,2000,4000,7500,12500,20000,35000,60000,90000,125000,200000,300000,750000,1500000,3000000,3500000,500000,1000000,1500000,2000000],
  thief:[0,1250,2500,5000,10000,20000,40000,70000,110000,160000,220000,440000,660000,880000,1100000,1320000,1540000,1760000,1980000,2200000],
  bard:[0,1250,2500,5000,10000,20000,40000,70000,110000,160000,220000,440000,660000,880000,1100000,1320000,1540000,1760000,1980000,2200000],
};

export const WIZARD_SPELL_SLOTS: SpellSlots[] = [
  [1],[2],[2,1],[3,2],[4,2,1],[4,2,2],[4,3,2,1],[4,3,3,2],[4,3,3,2,1],[4,4,3,2,2],[4,4,4,3,3],[4,4,4,4,4,1],[5,5,5,4,4,2],[5,5,5,4,4,2,1],[5,5,5,5,5,2,1],[5,5,5,5,5,3,2,1],[5,5,5,5,5,3,3,2],[5,5,5,5,5,3,3,2,1],[5,5,5,5,5,3,3,3,1],[5,5,5,5,5,4,3,3,2],
];

export const PRIEST_SPELL_SLOTS: SpellSlots[] = [
  [1],[2],[2,1],[3,2],[3,3,1],[3,3,2],[3,3,2,1],[3,3,3,2],[4,4,3,2,1],[4,4,3,3,2],[5,4,4,3,2,1],[6,5,5,3,2,2],[6,6,6,4,2,2],[6,6,6,5,3,2,1],[6,6,6,6,4,2,1],[7,7,7,6,4,3,1],[7,7,7,7,5,3,2],[8,8,8,8,6,4,2],[9,9,8,8,6,4,2],[9,9,9,8,7,5,2],
];

export const BARD_SPELL_SLOTS: SpellSlots[] = [
  [],[1],[2],[2,1],[3,1],[3,2],[3,2,1],[3,3,1],[3,3,2],[3,3,2,1],[3,3,3,1],[3,3,3,2],[3,3,3,2,1],[3,3,3,3,1],[3,3,3,3,2],[4,3,3,3,2,1],[4,4,3,3,3,1],[4,4,4,3,3,2],[4,4,4,4,3,2],[4,4,4,4,4,3],
];

export const PALADIN_SPELL_SLOTS: SpellSlots[] = [[],[],[],[],[],[],[],[],[1],[2],[2,1],[2,2],[2,2,1],[3,2,1],[3,2,1,1],[3,3,2,1],[3,3,3,1],[3,3,3,1],[3,3,3,2],[3,3,3,3]];
export const RANGER_PRIEST_SPELL_SLOTS: SpellSlots[] = [[],[],[],[],[],[],[],[1],[2],[2,1],[2,2],[2,2,1],[3,2,1],[3,2,2],[3,3,2],[3,3,2,1],[3,3,3,1],[3,3,3,2],[3,3,3,2],[3,3,3,3]];

export function thac0For(group:ClassGroup, level:number){return GROUP_THAC0[group][Math.max(1,Math.min(20,level))-1];}
export function savesFor(group:ClassGroup, level:number){return GROUP_SAVES[group].find(b=>level>=b.min&&level<=b.max)?.saves??GROUP_SAVES[group][GROUP_SAVES[group].length-1].saves;}
export function xpFor(classId:ClassId, level:number){return CLASS_XP[classId][Math.max(1,Math.min(20,level))-1];}
export function spellSlotsFor(classId:ClassId, level:number):SpellSlots{
  const i=Math.max(1,Math.min(20,level))-1;
  if(classId==="mage"||classId==="illusionist") return WIZARD_SPELL_SLOTS[i]??[];
  if(classId==="cleric"||classId==="druid") return PRIEST_SPELL_SLOTS[i]??[];
  if(classId==="bard") return BARD_SPELL_SLOTS[i]??[];
  if(classId==="paladin") return PALADIN_SPELL_SLOTS[i]??[];
  if(classId==="ranger") return RANGER_PRIEST_SPELL_SLOTS[i]??[];
  return [];
}

export function warriorAttacksPerRound(level:number){if(level>=13)return "2/1";if(level>=7)return "3/2";return "1/1";}
export function thiefBackstabMultiplier(level:number){if(level>=13)return 5;if(level>=9)return 4;if(level>=5)return 3;return 2;}
export function hpProgression(classId:ClassId, level:number){
  const l=Math.max(1,Math.min(20,level));
  if(["fighter","ranger","paladin"].includes(classId)) return l<=9?`${l}d10`:`9d10+${(l-9)*3}`;
  if(["mage","illusionist"].includes(classId)) return l<=10?`${l}d4`:`10d4+${l-10}`;
  if(["cleric","druid"].includes(classId)) return l<=9?`${l}d8`:`9d8+${(l-9)*2}`;
  return l<=10?`${l}d6`:`10d6+${(l-10)*2}`;
}

export function proficiencyGains(group:ClassGroup, level:number){
  const weaponEvery=group==="Warrior"?3:group==="Rogue"?4:group==="Priest"?4:6;
  const nonweaponEvery=group==="Warrior"?3:group==="Rogue"?4:group==="Priest"?3:3;
  return {
    weaponBonusSlots: Math.floor((Math.max(1,level)-1)/weaponEvery),
    nonweaponBonusSlots: Math.floor((Math.max(1,level)-1)/nonweaponEvery),
  };
}
