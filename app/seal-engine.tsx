"use client";

import { useEffect, useMemo, useState } from "react";
import { ABILITIES, CLASSES, RACES, type AbilityKey, type AbilityScores, type ClassId, type RaceId } from "./rules";
import type { CharacterFinalDetails, CharacterRecord, CharacterSex, MagicRecord, PortraitForgeRecord, ClassProgressionSnapshot } from "./character-record";
import { validateCharacterRecord } from "./character-record";
import { deriveAllAbilities, raceTraits } from "./core-traits";
import { hpProgression, proficiencyGains, savesFor, spellSlotsFor, thac0For, thiefBackstabMultiplier, warriorAttacksPerRound, xpFor } from "./class-progression";

function num(text:string|undefined|null){const n=Number.parseFloat((text??"").replace(/[^0-9.-]/g,""));return Number.isFinite(n)?n:0;}
function text(selector:string){return document.querySelector(selector)?.textContent?.trim()??"";}
function readRace():RaceId|null{const t=text(".record-subtitle");return RACES.find(r=>t.includes(r.name))?.id??null;}
function readClasses():ClassId[]{const t=text(".record-subtitle");return CLASSES.filter(c=>t.includes(c.name)).map(c=>c.id);}
function readScores():AbilityScores{const out={} as AbilityScores;document.querySelectorAll(".record-abilities > div").forEach(row=>{const k=row.querySelector(".ability-token")?.textContent?.trim().toLowerCase() as AbilityKey|undefined;const v=Number.parseInt(row.querySelector("strong")?.textContent??"",10);if(k&&ABILITIES.some(a=>a.id===k)&&Number.isFinite(v))out[k]=v;});return out;}
function readSave(label:string){const rows=Array.from(document.querySelectorAll(".save-grid > div"));const row=rows.find(r=>r.querySelector("span")?.textContent?.includes(label));return Number.parseInt(row?.querySelector("strong")?.textContent??"0",10)||0;}
function readSelectedButtons(selector:string){return Array.from(document.querySelectorAll(selector)).map(b=>b.querySelector("strong")?.textContent?.trim()??b.textContent?.trim()??"").filter(Boolean);}
function safeJson<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)??"") as T}catch{return fallback;}}
function exceptionalFromDom(){const t=text(".record-subtitle");const m=t.match(/18\/(\d{1,2}|00)/);if(!m)return null;return m[1]==="00"?100:Number.parseInt(m[1],10);}
function progressionSnapshot(classId:ClassId):ClassProgressionSnapshot{
 const c=CLASSES.find(item=>item.id===classId)!;
 const level=1;
 const gains=proficiencyGains(c.group,level);
 return {
  classId,
  level,
  xp:0,
  nextLevelXp:xpFor(classId,2),
  thac0:thac0For(c.group,level),
  savingThrows:savesFor(c.group,level),
  hpProgression:hpProgression(classId,level),
  spellSlots:spellSlotsFor(classId,level),
  attacksPerRound:c.group==="Warrior"?warriorAttacksPerRound(level):undefined,
  backstabMultiplier:classId==="thief"?thiefBackstabMultiplier(level):undefined,
  weaponBonusSlots:gains.weaponBonusSlots,
  nonweaponBonusSlots:gains.nonweaponBonusSlots,
 };
}

function buildRecord():Partial<CharacterRecord>{
 const race=readRace(); const classes=readClasses(); const scores=readScores();
 const magic=safeJson<MagicRecord>("forge-magic-ledger",{learned:[],memorizedWizard:[],memorizedPriest:[],attempts:[]});
 const finalDetails=safeJson<CharacterFinalDetails>("forge-final-details",{languages:[],age:null,heightIn:null,weightLb:null,portrait:null});
 const portraitForge=safeJson<PortraitForgeRecord|undefined>("forge-portrait-forge",undefined);
 const sex=(localStorage.getItem("character-forge-sex") as CharacterSex|null);
 const bard=safeJson<Record<string,number>>("forge-bard-skills",{});
 const ranger=localStorage.getItem("forge-ranger-species-enemy")??undefined;
 const profs=safeJson<unknown[]>("forge-proficiencies",[]);
 const encCarried=num(text(".encumbrance-grid > div:nth-child(1) strong"));
 const encAllowance=num(text(".encumbrance-grid > div:nth-child(2) strong"));
 const encMove=num(text(".encumbrance-grid > div:nth-child(4) strong"));
 const encCategory=text(".encumbrance-title strong");
 const exceptionalStrength=exceptionalFromDom();
 const warrior=classes.some(id=>["fighter","ranger","paladin"].includes(id));
 const record:Partial<CharacterRecord>={
  schemaVersion:1,
  sealedAt:new Date().toISOString(),
  identity:{name:text(".character-record h2"),sex},
  race:race??undefined,
  classes,
  classProgression:classes.map(progressionSnapshot),
  alignment:text(".record-alignment"),
  abilities:scores,
  derivedAbilities:deriveAllAbilities(scores,exceptionalStrength,warrior),
  racialTraits:race?raceTraits(race):undefined,
  hp:num(text(".record-badges > div:nth-child(1) strong")),
  ac:num(text(".record-badges > div:nth-child(2) strong")),
  thac0:num(text(".record-badges > div:nth-child(3) strong")),
  savingThrows:{
   paralyzationPoisonDeath:readSave("Poison"),
   rodStaffWand:readSave("Rod"),
   petrificationPolymorph:readSave("Petrify"),
   breathWeapon:readSave("Breath"),
   spell:readSave("Spell"),
  },
  gold:num(text(".record-badges > div:nth-child(4) strong")),
  proficiencies:profs,
  classChoices:{rangerSpeciesEnemy:ranger,bardSkills:bard},
  magic,
  finalDetails,
  portraitForge,
  equipment:{
   armour:text(".record-details > div:first-child strong")||null,
   shield:text(".record-details > div:first-child strong").includes("shield"),
   weapons:readSelectedButtons(".training-game-grid section:first-child button.selected"),
   gear:readSelectedButtons(".equipment-choice-grid.gear button.selected"),
  },
  encumbrance:{carriedLb:encCarried,allowanceLb:encAllowance,category:encCategory,movement:encMove},
  rollHistory:[...magic.attempts,{appearance:portraitForge?.appearance??{},portraitPrompt:portraitForge?.generatedPrompt??""}],
 };
 return record;
}

export default function SealEngine(){
 const [version,setVersion]=useState(0); const [errors,setErrors]=useState<string[]>([]); const [sealed,setSealed]=useState(false);
 useEffect(()=>{const obs=new MutationObserver(()=>setVersion(v=>v+1));obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});const handler=()=>setVersion(v=>v+1);window.addEventListener("forge-magic-updated",handler);window.addEventListener("forge-portrait-requested",handler);return()=>{obs.disconnect();window.removeEventListener("forge-magic-updated",handler);window.removeEventListener("forge-portrait-requested",handler);};},[]);
 const button=useMemo(()=>typeof document!=="undefined"?document.querySelector(".seal-button") as HTMLButtonElement|null:null,[version]);
 useEffect(()=>{if(!button)return;const onClick=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();const candidate=buildRecord();const result=validateCharacterRecord(candidate);setErrors(result.errors);if(!result.valid){setSealed(false);button.classList.remove("sealed");button.textContent="Resolve Character Errors";return;}const finalRecord={...candidate,sealedAt:new Date().toISOString()} as CharacterRecord;localStorage.setItem("forge-character-record",JSON.stringify(finalRecord));setSealed(true);button.classList.add("sealed");button.textContent="Character Sealed";window.dispatchEvent(new CustomEvent("forge-character-sealed",{detail:finalRecord}));};button.addEventListener("click",onClick,true);return()=>button.removeEventListener("click",onClick,true);},[button]);
 if(!errors.length&&!sealed)return null;
 return <aside className={`seal-validation ${sealed?"success":"failure"}`}><strong>{sealed?"Character record sealed":"Character cannot be sealed yet"}</strong>{sealed?<p>The canonical CharacterRecord has been saved and is ready for the adventure engine.</p>:<ul>{errors.map(e=><li key={e}>{e}</li>)}</ul>}</aside>;
}
