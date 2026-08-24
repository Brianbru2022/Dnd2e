"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CLASSES, type ClassId } from "./rules";

type BardSkill = "Pick Pockets" | "Detect Noise" | "Climb Walls" | "Read Languages";
const BARD_BASE: Record<BardSkill, number> = { "Pick Pockets":10, "Detect Noise":20, "Climb Walls":50, "Read Languages":5 };
const RANGER_ENEMIES = ["Giants","Orcs","Goblins","Gnolls","Lizardfolk","Ogres","Trolls","Ghouls","Bugbears","Hobgoblins","Kobolds","Other (campaign-approved)"];

function selectedClasses(): ClassId[] {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return CLASSES.filter((c) => text.includes(c.name)).map((c) => c.id);
}
function stageName(){ return document.querySelector(".stage-copy h2")?.textContent?.trim() ?? ""; }

export default function AuditedClassChoices(){
  const [mounted,setMounted]=useState(false);
  const [version,setVersion]=useState(0);
  const [enemy,setEnemy]=useState<string>("");
  const [bard,setBard]=useState<Record<BardSkill,number>>({"Pick Pockets":0,"Detect Noise":0,"Climb Walls":0,"Read Languages":0});

  useEffect(()=>{
    setMounted(true);
    const savedEnemy=localStorage.getItem("forge-ranger-species-enemy"); if(savedEnemy) setEnemy(savedEnemy);
    const savedBard=localStorage.getItem("forge-bard-skills"); if(savedBard){try{setBard(JSON.parse(savedBard))}catch{}}
    const obs=new MutationObserver(()=>setVersion(v=>v+1)); obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true}); return()=>obs.disconnect();
  },[]);
  useEffect(()=>{ if(enemy) localStorage.setItem("forge-ranger-species-enemy",enemy); },[enemy]);
  useEffect(()=>{ localStorage.setItem("forge-bard-skills",JSON.stringify(bard)); },[bard]);

  const classes=useMemo(()=>mounted?selectedClasses():[],[mounted,version]);
  const target=mounted&&stageName()==="Shape Your Starting Talents"?document.querySelector(".feature-stack"):null;
  const bardSpent=Object.values(bard).reduce((a,b)=>a+b,0);
  const adjust=(skill:BardSkill,delta:number)=>setBard(cur=>{const next=Math.max(0,cur[skill]+delta);const total=bardSpent-cur[skill]+next;if(total>20)return cur;return{...cur,[skill]:next};});

  useEffect(()=>{
    if(!mounted) return;
    const isIllusionist=classes.includes("illusionist");
    if(!isIllusionist) return;
    const forbidden=new Set(["Armor","Burning Hands","Shield"]);
    document.querySelectorAll(".spell-grid button").forEach((el)=>{
      const b=el as HTMLButtonElement;
      if(forbidden.has(b.textContent?.trim()??"")){b.disabled=true;b.title="Opposition-school spell: unavailable to an Illusionist in this rules profile";b.classList.add("audited-blocked");}
    });
  },[mounted,version,classes]);

  if(!target)return null;
  return createPortal(<>
    {classes.includes("ranger")?<section className="feature-card audited-choice-card"><h3>Ranger Species Enemy</h3><p>Choose the creature type your Ranger has studied and opposed. This choice is permanent for the character.</p><div className="audited-choice-grid">{RANGER_ENEMIES.map(x=><button type="button" key={x} className={enemy===x?"selected":""} onClick={()=>setEnemy(x)}>{x}</button>)}</div>{enemy?<div className="audited-note"><strong>{enemy}</strong><span>+4 attack bonus against this enemy; −4 reaction adjustment when dealing with that type.</span></div>:<div className="audited-warning">Choose a species enemy before sealing the character.</div>}</section>:null}

    {classes.includes("bard")?<section className="feature-card audited-choice-card"><h3>Bard Rogue Skills</h3><p>Allocate 20 percentage points among the Bard’s four rogue abilities. These values are before later racial, Dexterity and armour adjustments.</p><div className="bard-skill-grid">{(Object.keys(BARD_BASE) as BardSkill[]).map(skill=><div key={skill}><span>{skill}</span><strong>{BARD_BASE[skill]+bard[skill]}%</strong><small>+{bard[skill]} training</small><div><button type="button" disabled={bard[skill]===0} onClick={()=>adjust(skill,-1)}>−</button><button type="button" disabled={bardSpent>=20} onClick={()=>adjust(skill,1)}>+</button></div></div>)}</div><div className={bardSpent===20?"audited-note":"audited-warning"}><strong>{bardSpent}/20 allocated</strong><span>{bardSpent===20?"Bard rogue-skill allocation complete.":"Spend all 20 points before sealing the character."}</span></div></section>:null}

    {classes.includes("illusionist")?<section className="feature-card audited-choice-card"><h3>Illusionist Specialist Rules</h3><p>Requires INT 9 and DEX 16. The specialist gains one extra memorised spell at each spell level, which must be an illusion/phantasm spell, and receives +1 on saves against illusions. Opposition-school spells are unavailable.</p></section>:null}
    {classes.includes("cleric")?<section className="feature-card audited-choice-card"><h3>Cleric Starting Abilities</h3><p>Priest spell access and Turn Undead are active from 1st level. The current Forge uses a generic faith profile; deity-specific granted powers will be a later campaign choice.</p></section>:null}
    {classes.includes("druid")?<section className="feature-card audited-choice-card"><h3>Druid Starting Abilities</h3><p>Druidic language, nature lore and restricted arms/armour apply from 1st level. Priest spell selection remains player-controlled in the spell section above.</p></section>:null}
  </>,target);
}
