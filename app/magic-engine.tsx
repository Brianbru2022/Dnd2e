"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ABILITIES, CLASSES, type AbilityKey, type ClassId } from "./rules";
import { PRIEST_SPELL_DATA, WIZARD_SPELL_DATA, priestLevelOneSlots, priestSpellAllowed, wizardLearnChance, wizardLevelOneSlots, wizardSpellAllowed } from "./magic-rules";

type LearnAttempt={spell:string;roll:number;target:number;success:boolean};

type MagicSave={ learned:string[]; memorizedWizard:string[]; memorizedPriest:string[]; attempts:LearnAttempt[] };
const EMPTY:MagicSave={learned:["Read Magic","Detect Magic"],memorizedWizard:[],memorizedPriest:[],attempts:[]};

function selectedClasses():ClassId[]{
 const text=document.querySelector(".record-subtitle")?.textContent??"";
 return CLASSES.filter(c=>text.includes(c.name)).map(c=>c.id);
}
function readScores(){
 const result:Partial<Record<AbilityKey,number>>={};
 document.querySelectorAll(".record-abilities > div").forEach(row=>{
  const key=row.querySelector(".ability-token")?.textContent?.trim().toLowerCase() as AbilityKey|undefined;
  const value=Number.parseInt(row.querySelector("strong")?.textContent??"",10);
  if(key&&ABILITIES.some(a=>a.id===key)&&Number.isFinite(value))result[key]=value;
 });
 return result;
}
function currentStage(){return document.querySelector(".stage-copy h2")?.textContent?.trim()??"";}
function rollPercentile(){const tens=Math.floor(Math.random()*10),ones=Math.floor(Math.random()*10);return tens===0&&ones===0?100:tens*10+ones;}

export default function MagicEngine(){
 const [mounted,setMounted]=useState(false); const [version,setVersion]=useState(0); const [save,setSave]=useState<MagicSave>(EMPTY); const [candidate,setCandidate]=useState<string>(""); const [lastRoll,setLastRoll]=useState<LearnAttempt|null>(null);
 useEffect(()=>{setMounted(true);const raw=localStorage.getItem("forge-magic-ledger");if(raw){try{setSave({...EMPTY,...JSON.parse(raw)})}catch{}}const obs=new MutationObserver(()=>setVersion(v=>v+1));obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});return()=>obs.disconnect();},[]);
 useEffect(()=>{if(mounted)localStorage.setItem("forge-magic-ledger",JSON.stringify(save));},[mounted,save]);
 const classes=useMemo(()=>mounted?selectedClasses():[],[mounted,version]); const scores=useMemo(()=>mounted?readScores():{},[mounted,version]);
 const hasWizard=classes.includes("mage")||classes.includes("illusionist"); const hasPriest=classes.includes("cleric")||classes.includes("druid");
 const int=scores.int??9,wis=scores.wis??9; const learnTarget=wizardLearnChance(int); const wizardSlots=wizardLevelOneSlots(classes); const priestSlots=priestLevelOneSlots(classes,wis);
 const wizardList=WIZARD_SPELL_DATA.filter(s=>wizardSpellAllowed(classes,s.name)); const priestList=PRIEST_SPELL_DATA.filter(s=>priestSpellAllowed(classes,s.name));
 const target=mounted&&currentStage()==="Shape Your Starting Talents"?document.querySelector(".feature-stack"):null;
 if(!target||(!hasWizard&&!hasPriest))return null;
 function tryLearn(){if(!candidate)return;const roll=rollPercentile();const success=roll<=learnTarget;const attempt={spell:candidate,roll,target:learnTarget,success};setLastRoll(attempt);setSave(cur=>({...cur,attempts:[...cur.attempts,attempt],learned:success&&!cur.learned.includes(candidate)?[...cur.learned,candidate]:cur.learned}));}
 function toggleWizard(name:string){setSave(cur=>{const has=cur.memorizedWizard.includes(name);if(has)return{...cur,memorizedWizard:cur.memorizedWizard.filter(s=>s!==name)};if(cur.memorizedWizard.length>=wizardSlots)return cur;const school=WIZARD_SPELL_DATA.find(s=>s.name===name)?.school; if(classes.includes("illusionist")&&cur.memorizedWizard.length===wizardSlots-1&&!cur.memorizedWizard.some(s=>WIZARD_SPELL_DATA.find(x=>x.name===s)?.school==="Illusion")&&school!=="Illusion")return cur;return{...cur,memorizedWizard:[...cur.memorizedWizard,name]};});}
 function togglePriest(name:string){setSave(cur=>cur.memorizedPriest.includes(name)?{...cur,memorizedPriest:cur.memorizedPriest.filter(s=>s!==name)}:cur.memorizedPriest.length<priestSlots?{...cur,memorizedPriest:[...cur.memorizedPriest,name]}:cur);}
 return createPortal(<section className="feature-card magic-ledger"><div className="magic-ledger-title"><div><span>AUDITED MAGIC LEDGER</span><h3>{hasWizard&&hasPriest?"Arcane & Priest Magic":hasWizard?"Arcane Spellcraft":"Priest Prayers"}</h3></div><strong>{hasWizard?`INT ${int}`:`WIS ${wis}`}</strong></div>
 {hasWizard?<div className="magic-section"><h4>Learn Wizard Spells</h4><p>Read Magic and Detect Magic begin in the book for this rules profile. Every additional spell must be chosen by you and learned with a visible percentile check.</p><div className="learn-row"><select value={candidate} onChange={e=>setCandidate(e.target.value)}><option value="">Choose a spell to study…</option>{wizardList.filter(s=>!save.learned.includes(s.name)).map(s=><option key={s.name} value={s.name}>{s.name} · {s.school}</option>)}</select><button type="button" disabled={!candidate} onClick={tryLearn}>Roll d100 to Learn</button></div><div className="learn-chance">Chance to learn: <strong>{learnTarget}%</strong></div>{lastRoll?<div className={`magic-roll ${lastRoll.success?"success":"failure"}`}><div className="percentile-dice"><span>{String(lastRoll.roll).padStart(2,"0")}</span><small>d100</small></div><div><strong>{lastRoll.spell}</strong><p>Rolled {lastRoll.roll} vs {lastRoll.target}% — {lastRoll.success?"LEARNED":"FAILED"}</p></div></div>:null}<div className="known-spells"><span>Spellbook</span>{save.learned.map(s=><em key={s}>{s}</em>)}</div>
 <h4>Memorize 1st-level Spells</h4><p>{classes.includes("illusionist")?"Illusionists have 2 first-level slots here; at least one memorized spell must be from the Illusion school.":"A 1st-level Mage has 1 memorized spell slot."}</p><div className="magic-choice-grid">{save.learned.filter(n=>wizardSpellAllowed(classes,n)).map(name=>{const school=WIZARD_SPELL_DATA.find(s=>s.name===name)?.school??"Divination";return <button type="button" key={name} className={save.memorizedWizard.includes(name)?"selected":""} onClick={()=>toggleWizard(name)}><strong>{name}</strong><small>{school}</small></button>})}</div><div className="magic-budget">Memorized <strong>{save.memorizedWizard.length}/{wizardSlots}</strong></div></div>:null}
 {hasPriest?<div className="magic-section"><h4>Memorize Priest Spells</h4><p>{classes.includes("druid")?"The Druid list is filtered to the nature-oriented spheres available in this rules profile.":"The Cleric list is filtered to the major spheres available to the generic faith profile."} Wisdom grants {Math.max(0,priestSlots-1)} bonus first-level slot{priestSlots-1===1?"":"s"}.</p><div className="magic-choice-grid">{priestList.map(spell=><button type="button" key={spell.name} className={save.memorizedPriest.includes(spell.name)?"selected":""} onClick={()=>togglePriest(spell.name)}><strong>{spell.name}</strong><small>{spell.spheres.join(" · ")}</small></button>)}</div><div className="magic-budget">Memorized <strong>{save.memorizedPriest.length}/{priestSlots}</strong></div></div>:null}
 <p className="magic-rule-note">Every spell choice and every learning roll is initiated by the player. The rules engine only resolves the result.</p></section>,target);
}
