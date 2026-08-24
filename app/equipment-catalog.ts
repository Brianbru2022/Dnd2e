import type { ArmorId, WeaponId } from "./rules";

export type CoinId="cp"|"sp"|"ep"|"gp"|"pp";
export const COINAGE:Record<CoinId,{name:string;gpValue:number;coinsPerLb:number}>={
 cp:{name:"Copper piece",gpValue:0.01,coinsPerLb:50},
 sp:{name:"Silver piece",gpValue:0.1,coinsPerLb:50},
 ep:{name:"Electrum piece",gpValue:0.5,coinsPerLb:50},
 gp:{name:"Gold piece",gpValue:1,coinsPerLb:50},
 pp:{name:"Platinum piece",gpValue:5,coinsPerLb:50},
};
export function convertCoins(amount:number,from:CoinId,to:CoinId){return amount*COINAGE[from].gpValue/COINAGE[to].gpValue;}
export function coinWeight(count:number){return count/50;}

export type DamageType="B"|"P"|"S";
export type WeaponSize="S"|"M"|"L";
export type RangeBands={short:number;medium:number;long:number};
export type WeaponRecord={id:string;legacyId?:WeaponId;name:string;costGp:number;weightLb:number;size:WeaponSize;type:DamageType|`${DamageType}/${DamageType}`|`${DamageType}/${DamageType}/${DamageType}`;speed:number;damageSM:string;damageL:string;rof?:string;range?:RangeBands;ammoId?:string;twoHanded?:boolean;notes?:string};

export const WEAPON_CATALOG:WeaponRecord[]=[
{id:"battleaxe",legacyId:"battleaxe",name:"Battle axe",costGp:5,weightLb:7,size:"M",type:"S",speed:7,damageSM:"1d8",damageL:"1d8",notes:"Can be used one-handed."},
{id:"bow-composite-long",name:"Composite long bow",costGp:100,weightLb:3,size:"L",type:"P",speed:7,damageSM:"1d6",damageL:"1d6",rof:"2/1",range:{short:70,medium:140,long:210},ammoId:"arrow"},
{id:"bow-composite-short",name:"Composite short bow",costGp:75,weightLb:2,size:"M",type:"P",speed:6,damageSM:"1d6",damageL:"1d6",rof:"2/1",range:{short:60,medium:120,long:180},ammoId:"arrow"},
{id:"longbow",legacyId:"longbow",name:"Long bow",costGp:75,weightLb:3,size:"L",type:"P",speed:8,damageSM:"1d6",damageL:"1d6",rof:"2/1",range:{short:70,medium:140,long:210},ammoId:"arrow"},
{id:"shortbow",legacyId:"shortbow",name:"Short bow",costGp:30,weightLb:2,size:"M",type:"P",speed:7,damageSM:"1d6",damageL:"1d6",rof:"2/1",range:{short:50,medium:100,long:150},ammoId:"arrow"},
{id:"club",name:"Club",costGp:0,weightLb:3,size:"M",type:"B",speed:4,damageSM:"1d6",damageL:"1d3"},
{id:"crossbow-hand",name:"Hand crossbow",costGp:300,weightLb:3,size:"S",type:"P",speed:5,damageSM:"1d3",damageL:"1d2",rof:"1/1",range:{short:20,medium:40,long:60},ammoId:"bolt"},
{id:"crossbow-heavy",name:"Heavy crossbow",costGp:50,weightLb:14,size:"M",type:"P",speed:10,damageSM:"1d4+1",damageL:"1d6+1",rof:"1/2",range:{short:80,medium:160,long:240},ammoId:"bolt",twoHanded:true},
{id:"crossbow-light",name:"Light crossbow",costGp:35,weightLb:7,size:"M",type:"P",speed:7,damageSM:"1d4",damageL:"1d4",rof:"1/1",range:{short:60,medium:120,long:180},ammoId:"bolt",twoHanded:true},
{id:"dagger",legacyId:"dagger",name:"Dagger",costGp:2,weightLb:1,size:"S",type:"P/S",speed:2,damageSM:"1d4",damageL:"1d3",rof:"2/1",range:{short:10,medium:20,long:30}},
{id:"dart",name:"Dart",costGp:0.05,weightLb:0.5,size:"S",type:"P",speed:2,damageSM:"1d3",damageL:"1d2",rof:"3/1",range:{short:10,medium:20,long:40}},
{id:"flail-footmans",name:"Footman's flail",costGp:15,weightLb:15,size:"L",type:"B",speed:7,damageSM:"1d6+1",damageL:"2d4",twoHanded:true},
{id:"flail-horsemans",name:"Horseman's flail",costGp:8,weightLb:3,size:"M",type:"B",speed:6,damageSM:"1d4+1",damageL:"1d4+1"},
{id:"halberd",name:"Halberd",costGp:10,weightLb:15,size:"L",type:"P/S",speed:9,damageSM:"1d10",damageL:"2d6",twoHanded:true},
{id:"hammer-light",name:"Light hammer",costGp:1,weightLb:2,size:"S",type:"B",speed:3,damageSM:"1d4",damageL:"1d3",rof:"1/1",range:{short:10,medium:20,long:30}},
{id:"warhammer",legacyId:"warhammer",name:"Warhammer",costGp:2,weightLb:6,size:"M",type:"B",speed:4,damageSM:"1d4+1",damageL:"1d4"},
{id:"javelin",name:"Javelin",costGp:0.5,weightLb:2,size:"M",type:"P",speed:4,damageSM:"1d6",damageL:"1d6",rof:"1/1",range:{short:20,medium:40,long:60}},
{id:"lance-heavy",name:"Heavy horse lance",costGp:15,weightLb:15,size:"L",type:"P",speed:8,damageSM:"1d8+1",damageL:"3d6",notes:"Mounted use."},
{id:"mace",legacyId:"mace",name:"Footman's mace",costGp:8,weightLb:10,size:"M",type:"B",speed:7,damageSM:"1d6+1",damageL:"1d6"},
{id:"mace-horsemans",name:"Horseman's mace",costGp:5,weightLb:6,size:"M",type:"B",speed:6,damageSM:"1d6",damageL:"1d4"},
{id:"morning-star",name:"Morning star",costGp:10,weightLb:12,size:"M",type:"B/P",speed:7,damageSM:"2d4",damageL:"1d6+1"},
{id:"polearm-glaive",name:"Glaive",costGp:6,weightLb:8,size:"L",type:"S",speed:8,damageSM:"1d6",damageL:"1d10",twoHanded:true},
{id:"quarterstaff",legacyId:"quarterstaff",name:"Quarterstaff",costGp:0,weightLb:4,size:"L",type:"B",speed:4,damageSM:"1d6",damageL:"1d6",twoHanded:true},
{id:"sling",legacyId:"sling",name:"Sling",costGp:0.1,weightLb:0.1,size:"S",type:"B",speed:6,damageSM:"1d4+1",damageL:"1d6+1",rof:"1/1",range:{short:50,medium:100,long:200},ammoId:"sling-bullet"},
{id:"spear",legacyId:"spear",name:"Spear",costGp:0.8,weightLb:5,size:"M",type:"P",speed:6,damageSM:"1d6",damageL:"1d8",rof:"1/1",range:{short:10,medium:20,long:30}},
{id:"shortsword",legacyId:"shortsword",name:"Short sword",costGp:10,weightLb:3,size:"S",type:"P",speed:3,damageSM:"1d6",damageL:"1d8"},
{id:"longsword",legacyId:"longsword",name:"Long sword",costGp:15,weightLb:4,size:"M",type:"S",speed:5,damageSM:"1d8",damageL:"1d12"},
{id:"sword-bastard",name:"Bastard sword",costGp:25,weightLb:10,size:"M",type:"S",speed:6,damageSM:"1d8",damageL:"1d12",notes:"Can be used one- or two-handed; two-handed damage can be handled by the combat profile."},
{id:"sword-two-handed",name:"Two-handed sword",costGp:50,weightLb:15,size:"L",type:"S",speed:10,damageSM:"1d10",damageL:"3d6",twoHanded:true},
{id:"trident",name:"Trident",costGp:15,weightLb:5,size:"L",type:"P",speed:7,damageSM:"1d6+1",damageL:"3d4",twoHanded:true}
];

export type AmmoRecord={id:string;name:string;costGp:number;quantity:number;weightLb:number;damageOverrideSM?:string;damageOverrideL?:string};
export const AMMUNITION:AmmoRecord[]=[
{id:"arrow",name:"Flight arrows (12)",costGp:0.3,quantity:12,weightLb:1},
{id:"arrow-sheaf",name:"Sheaf arrows (6)",costGp:0.3,quantity:6,weightLb:1},
{id:"bolt",name:"Crossbow bolts (10)",costGp:1,quantity:10,weightLb:1},
{id:"sling-bullet",name:"Sling bullets (10)",costGp:0.1,quantity:10,weightLb:1},
{id:"sling-stone",name:"Sling stones (10)",costGp:0,quantity:10,weightLb:5}
];

export type ArmorRecord={id:string;legacyId?:ArmorId;name:string;costGp:number;weightLb:number;baseAc:number;movementNote?:string;notes?:string};
export const ARMOR_CATALOG:ArmorRecord[]=[
{id:"none",legacyId:"none",name:"No armour",costGp:0,weightLb:0,baseAc:10},
{id:"padded",name:"Padded armour",costGp:4,weightLb:10,baseAc:8},
{id:"leather",legacyId:"leather",name:"Leather armour",costGp:5,weightLb:15,baseAc:8},
{id:"studded",legacyId:"studded",name:"Studded leather",costGp:20,weightLb:25,baseAc:7},
{id:"hide",name:"Hide armour",costGp:15,weightLb:30,baseAc:6},
{id:"scale",legacyId:"scale",name:"Scale mail",costGp:120,weightLb:40,baseAc:6},
{id:"brigandine",name:"Brigandine",costGp:120,weightLb:35,baseAc:6},
{id:"chain",legacyId:"chain",name:"Chain mail",costGp:75,weightLb:40,baseAc:5},
{id:"splint",legacyId:"splint",name:"Splint mail",costGp:80,weightLb:40,baseAc:4},
{id:"banded",name:"Banded mail",costGp:200,weightLb:35,baseAc:4},
{id:"plate",legacyId:"plate",name:"Plate mail",costGp:600,weightLb:50,baseAc:3},
{id:"field-plate",name:"Field plate",costGp:2000,weightLb:60,baseAc:2},
{id:"full-plate",name:"Full plate",costGp:4000,weightLb:70,baseAc:1}
];
export const SHIELDS=[
{id:"buckler",name:"Buckler",costGp:1,weightLb:3,acBonus:1,notes:"Applies against a limited number of attacks per round in the detailed combat profile."},
{id:"small",name:"Small shield",costGp:3,weightLb:5,acBonus:1},
{id:"medium",name:"Medium shield",costGp:7,weightLb:10,acBonus:1},
{id:"body",name:"Body shield",costGp:15,weightLb:15,acBonus:1,notes:"Can provide greater missile protection when the combat profile uses facing/cover."}
] as const;

export type GearRecord={id:string;name:string;category:"adventuring"|"container"|"clothing"|"food"|"lodging"|"service"|"transport"|"animal"|"spell";costGp:number;weightLb:number;capacityLb?:number;notes?:string};
export const EQUIPMENT_CATALOG:GearRecord[]=[
{id:"backpack",name:"Backpack",category:"container",costGp:2,weightLb:2,capacityLb:50},
{id:"belt-pouch-large",name:"Belt pouch, large",category:"container",costGp:1,weightLb:1,capacityLb:10},
{id:"belt-pouch-small",name:"Belt pouch, small",category:"container",costGp:0.5,weightLb:0.5,capacityLb:5},
{id:"sack-large",name:"Sack, large",category:"container",costGp:0.2,weightLb:0.5,capacityLb:30},
{id:"sack-small",name:"Sack, small",category:"container",costGp:0.1,weightLb:0.25,capacityLb:10},
{id:"chest-small",name:"Chest, small",category:"container",costGp:2,weightLb:15,capacityLb:50},
{id:"bedroll",name:"Bedroll/blanket",category:"adventuring",costGp:0.2,weightLb:5},
{id:"rope-hemp",name:"Rope, hemp 50 ft",category:"adventuring",costGp:1,weightLb:20},
{id:"rope-silk",name:"Rope, silk 50 ft",category:"adventuring",costGp:10,weightLb:8},
{id:"lantern-bullseye",name:"Lantern, bullseye",category:"adventuring",costGp:12,weightLb:3},
{id:"lantern-hooded",name:"Lantern, hooded",category:"adventuring",costGp:7,weightLb:2},
{id:"oil",name:"Oil flask",category:"adventuring",costGp:0.1,weightLb:1},
{id:"torch",name:"Torch",category:"adventuring",costGp:0.01,weightLb:1},
{id:"tinderbox",name:"Tinderbox",category:"adventuring",costGp:0.5,weightLb:0.5},
{id:"crowbar",name:"Crowbar",category:"adventuring",costGp:2,weightLb:5},
{id:"hammer",name:"Small hammer",category:"adventuring",costGp:0.5,weightLb:2},
{id:"pitons",name:"Iron spikes/pitons (10)",category:"adventuring",costGp:1,weightLb:5},
{id:"grappling-hook",name:"Grappling hook",category:"adventuring",costGp:0.8,weightLb:4},
{id:"mirror-small",name:"Small steel mirror",category:"adventuring",costGp:10,weightLb:0.5},
{id:"pole-10",name:"10-foot pole",category:"adventuring",costGp:0.2,weightLb:8},
{id:"waterskin",name:"Waterskin",category:"container",costGp:0.8,weightLb:1,capacityLb:4},
{id:"rations-dry",name:"Dry rations, 1 week",category:"food",costGp:10,weightLb:7},
{id:"rations-standard",name:"Standard rations, 1 week",category:"food",costGp:3,weightLb:14},
{id:"meal-common",name:"Common meal",category:"food",costGp:0.3,weightLb:0},
{id:"ale-gallon",name:"Ale, gallon",category:"food",costGp:0.2,weightLb:8},
{id:"wine-common",name:"Wine, common pitcher",category:"food",costGp:0.2,weightLb:4},
{id:"lodging-common",name:"Inn lodging, common/night",category:"lodging",costGp:0.2,weightLb:0},
{id:"lodging-private",name:"Inn lodging, private/night",category:"lodging",costGp:2,weightLb:0},
{id:"stable",name:"Stabling, per day",category:"service",costGp:0.5,weightLb:0},
{id:"bath",name:"Bath",category:"service",costGp:0.2,weightLb:0},
{id:"cart",name:"Cart",category:"transport",costGp:50,weightLb:0,notes:"Vehicle; carried weight handled by transport capacity rather than personal encumbrance."},
{id:"wagon",name:"Wagon",category:"transport",costGp:150,weightLb:0,notes:"Vehicle."},
{id:"horse-riding",name:"Riding horse",category:"animal",costGp:75,weightLb:0},
{id:"horse-war-light",name:"Light warhorse",category:"animal",costGp:150,weightLb:0},
{id:"horse-war-heavy",name:"Heavy warhorse",category:"animal",costGp:400,weightLb:0},
{id:"pony",name:"Pony",category:"animal",costGp:30,weightLb:0},
{id:"mule",name:"Mule",category:"animal",costGp:8,weightLb:0},
{id:"saddle-riding",name:"Riding saddle",category:"transport",costGp:10,weightLb:35},
{id:"saddle-war",name:"War saddle",category:"transport",costGp:20,weightLb:40},
{id:"spellbook",name:"Blank spellbook",category:"spell",costGp:50,weightLb:3},
{id:"holy-symbol-wood",name:"Wooden holy symbol",category:"spell",costGp:1,weightLb:0.1},
{id:"holy-symbol-silver",name:"Silver holy symbol",category:"spell",costGp:25,weightLb:0.5},
{id:"spell-component-pouch",name:"Spell component pouch",category:"spell",costGp:5,weightLb:1}
];

export function weaponById(id:string){return WEAPON_CATALOG.find(w=>w.id===id||w.legacyId===id);}
export function armourById(id:string){return ARMOR_CATALOG.find(a=>a.id===id||a.legacyId===id);}
export function gearById(id:string){return EQUIPMENT_CATALOG.find(g=>g.id===id);}
