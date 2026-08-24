"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ABILITIES, RACES, type AbilityKey, type RaceId } from "./rules";

type Sex="female"|"male";
type Details={languages:string[];age:number|null;heightIn:number|null;weightLb:number|null;portrait:string|null};
const LANGUAGE_POOLS:Record<RaceId,string[]>={
 human:["Common","Dwarven","Elven","Gnome","Goblin","Halfling","Orc"],
 dwarf:["Common","Dwarven","Gnome","Goblin","Kobold","Orc"],
 elf:["Common","Elven","Gnome","Goblin","Halfling","Orc"],
 gnome:["Common","Gnome","Dwarven","Goblin","Halfling","Kobold"],
 "half-elf":["Common","Elven","Dwarven","Gnome","Goblin","Halfling","Orc"],
 halfling:["Common","Halfling","Dwarven","Elven","Gnome","Goblin"]
};
const AGE_BASE:Record<RaceId,[number,number]>={human:[15,4],dwarf:[40,20],elf:[100,20],gnome:[60,30],"half-elf":[15,6],halfling:[20,10]};
const HEIGHT_BASE:Record<RaceId,[number,number]>={human:[60,12],dwarf:[42,8],elf:[55,10],gnome:[38,6],"half-elf":[58,10],halfling:[32,6]};
const WEIGHT_BASE:Record<RaceId,[number,number]>={human:[105,80],dwarf:[130,70],elf:[90,50],gnome:[72,35],"half-elf":[100,65],halfling:[52,30]};
function readRace():RaceId|null{const text=document.querySelector(".record-subtitle")?.textContent??"";return RACES.find(r=>text.includes(r.name))?.id??null;}
function readScores(){const out:Partial<Record<AbilityKey,number>>={};document.querySelectorAll(".record-abilities > div").forEach(row=>{const key=row.querySelector(".ability-token")?.textContent?.trim().toLowerCase() as AbilityKey|undefined;const value=Number.parseInt(row.querySelector("strong")?.textContent??"",10);if(key&&ABILITIES.some(a=>a.id===key)&&Number.isFinite(value))out[key]=value;});return out;}
function currentStage(){return document.querySelector(".stage-copy h2")?.textContent?.trim()??"";}
function die(s:number){return Math.floor(Math.random()*s)+1;}

export default function FinalDetails(){
 const [mounted,setMounted]=useState(false);const [version,setVersion]=useState(0);const [details,setDetails]=useState<Details>({languages:[],age:null,heightIn:null,weightLb:null,portrait:null});
 useEffect(()=>{setMounted(true);const raw=localStorage.getItem("forge-final-details");if(raw){try{setDetails(JSON.parse(raw))}catch{}}const o=new MutationObserver(()=>setVersion(v=>v+1));o.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});return()=>o.disconnect();},[]);
 useEffect(()=>{if(mounted)localStorage.setItem("forge-final-details",JSON.stringify(details));},[mounted,details]);
 const race=useMemo(()=>mounted?readRace():null,[mounted,version]);const scores=useMemo(()=>mounted?readScores():{},[mounted,version]);
 const sex=(typeof window!=="undefined"?window.localStorage.getItem("character-forge-sex"):null) as Sex|null;
 const languageAllowance=Math.max(1,(scores.int??9)>=19?8:(scores.int??9)>=18?7:(scores.int??9)>=17?6:(scores.int??9)>=16?5:(scores.int??9)>=14?4:(scores.int??9)>=12?3:2);
 const target=mounted&&currentStage()==="Final Character Record"?document.querySelector(".record-stage"):null;
 if(!target||!race)return null;
 const pool=LANGUAGE_POOLS[race];
 function toggleLanguage(lang:string){setDetails(cur=>cur.languages.includes(lang)?{...cur,languages:cur.languages.filter(x=>x!==lang)}:cur.languages.length<languageAllowance?{...cur,languages:[...cur.languages,lang]}:cur);}
 function rollAge(){const [base,span]=AGE_BASE[race];setDetails(cur=>({...cur,age:base+die(span)}));}
 function rollHeight(){const [base,span]=HEIGHT_BASE[race];setDetails(cur=>({...cur,heightIn:base+die(span)}));}
 function rollWeight(){const [base,span]=WEIGHT_BASE[race];setDetails(cur=>({...cur,weightLb:base+die(span)}));}
 const portraits=[1,2,3].map(n=>`/assets/forge/races/race-${race}.png#${sex??"neutral"}-${n}`);
 return createPortal(<section className="final-details-panel"><div className="final-details-title"><span>FINAL DETAILS</span><h3>Languages, Portrait & Physical Details</h3></div><p>These choices personalise the character only. Any random detail is rolled only when you press its button.</p><div className="final-details-grid"><div className="detail-block"><h4>Languages</h4><p>Choose up to {languageAllowance} languages allowed by your Intelligence.</p><div className="language-grid">{pool.map(lang=><button key={lang} type="button" className={details.languages.includes(lang)?"selected":""} onClick={()=>toggleLanguage(lang)}>{lang}</button>)}</div><small>{details.languages.length}/{languageAllowance} chosen</small></div><div className="detail-block"><h4>Portrait</h4><p>{sex?`Character identity: ${sex}. `:""}Choose the portrait presentation for the record.</p><div className="portrait-grid">{portraits.map((p,i)=><button key={p} type="button" className={details.portrait===p?"selected":""} onClick={()=>setDetails(cur=>({...cur,portrait:p}))}><img src={`/assets/forge/races/race-${race}.png`} alt=""/><span>Portrait {i+1}</span></button>)}</div></div><div className="detail-block physical"><h4>Optional Physical Details</h4><div><span>Age</span><strong>{details.age??"—"}</strong><button type="button" onClick={rollAge}>Roll Age</button><input inputMode="numeric" value={details.age??""} onChange={e=>setDetails(cur=>({...cur,age:e.target.value?Number(e.target.value):null}))} placeholder="or enter"/></div><div><span>Height</span><strong>{details.heightIn?`${Math.floor(details.heightIn/12)}′ ${details.heightIn%12}″`:"—"}</strong><button type="button" onClick={rollHeight}>Roll Height</button><input inputMode="numeric" value={details.heightIn??""} onChange={e=>setDetails(cur=>({...cur,heightIn:e.target.value?Number(e.target.value):null}))} placeholder="inches"/></div><div><span>Weight</span><strong>{details.weightLb?`${details.weightLb} lb`:"—"}</strong><button type="button" onClick={rollWeight}>Roll Weight</button><input inputMode="numeric" value={details.weightLb??""} onChange={e=>setDetails(cur=>({...cur,weightLb:e.target.value?Number(e.target.value):null}))} placeholder="lb"/></div></div></div></section>,target);
}
