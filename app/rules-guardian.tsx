"use client";

import { useEffect, useMemo, useState } from "react";
import { ABILITIES, type AbilityScores, type ClassId, type RaceId } from "./rules";
import {
  BASE_MOVEMENT,
  CLASS_CREATION_HOOKS,
  MULTICLASS_PATHS,
  RACE_CLASS_LEVEL_LIMITS,
  qualifiesForRace,
  raceQualificationReasons,
} from "./audited-character-rules";

const RACE_NAME_TO_ID: Record<string, RaceId> = {
  Human: "human", Dwarf: "dwarf", Elf: "elf", Gnome: "gnome", "Half-Elf": "half-elf", Halfling: "halfling",
};

function readScores(): AbilityScores | null {
  const rows = Array.from(document.querySelectorAll(".record-abilities > div"));
  if (rows.length < 6) return null;
  const scores = { str:0,dex:0,con:0,int:0,wis:0,cha:0 } as AbilityScores;
  let found = 0;
  rows.forEach((row) => {
    const token = row.querySelector(".ability-token")?.textContent?.trim().toLowerCase();
    const raw = row.querySelector("strong")?.textContent?.trim() ?? "";
    const value = Number.parseInt(raw.split("/")[0], 10);
    const ability = ABILITIES.find((a) => a.short.toLowerCase() === token);
    if (ability && Number.isFinite(value)) { scores[ability.id] = value; found += 1; }
  });
  return found === 6 ? scores : null;
}

function selectedRace(): RaceId | null {
  const subtitle = document.querySelector(".record-subtitle")?.textContent ?? "";
  const name = subtitle.split("·")[0]?.trim();
  return RACE_NAME_TO_ID[name] ?? null;
}

function selectedClassIds(): ClassId[] {
  const subtitle = document.querySelector(".record-subtitle")?.textContent ?? "";
  const classPart = subtitle.split("·")[1]?.trim() ?? "";
  const map: Record<string,ClassId> = { Fighter:"fighter", Ranger:"ranger", Paladin:"paladin", Mage:"mage", Illusionist:"illusionist", Cleric:"cleric", Druid:"druid", Thief:"thief", Bard:"bard" };
  return classPart.split("/").map((x)=>map[x.trim()]).filter(Boolean) as ClassId[];
}

export default function RulesGuardian(){
  const [scores,setScores] = useState<AbilityScores|null>(null);
  const [race,setRace] = useState<RaceId|null>(null);
  const [classes,setClasses] = useState<ClassId[]>([]);
  const [tick,setTick] = useState(0);

  useEffect(()=>{
    const sync=()=>{ setScores(readScores()); setRace(selectedRace()); setClasses(selectedClassIds()); setTick((v)=>v+1); };
    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});
    const timer=window.setInterval(sync,900);
    return()=>{observer.disconnect();window.clearInterval(timer);};
  },[]);

  useEffect(()=>{
    if(!scores) return;
    document.querySelectorAll<HTMLButtonElement>(".race-art-grid .art-choice").forEach((button)=>{
      const name=button.querySelector("strong")?.textContent?.trim()??"";
      const id=RACE_NAME_TO_ID[name];
      if(!id) return;
      const legal=qualifiesForRace(scores,id);
      button.disabled=!legal;
      button.dataset.auditLegal=legal?"true":"false";
      const reasons=legal?"":raceQualificationReasons(scores,id).join(" · ");
      button.title=legal?`${name} is legal for these rolled abilities.`:reasons;
    });
  },[scores,tick]);

  const raceIssues=useMemo(()=>scores&&race?raceQualificationReasons(scores,race):[],[scores,race]);
  const hooks=useMemo(()=>classes.map((id)=>CLASS_CREATION_HOOKS.find((h)=>h.classId===id)).filter(Boolean),[classes]);
  const movement=race?BASE_MOVEMENT[race]:null;
  const limits=race?classes.map((id)=>({id,limit:RACE_CLASS_LEVEL_LIMITS[race][id]})):[];
  const auditedPaths=race&&race!=="human"?MULTICLASS_PATHS[race]:[];

  if(!scores) return null;
  return <aside className="audit-guardian" aria-live="polite">
    <div className="audit-guardian-head"><span>RULES AUDIT</span><strong>{raceIssues.length?"Legality issue":"Character legality active"}</strong></div>
    {raceIssues.length?<div className="audit-warning"><b>Selected ancestry is not legal for the original rolled scores.</b>{raceIssues.map((x)=><small key={x}>{x}</small>)}</div>:null}
    {race?<div className="audit-facts"><div><span>Base movement</span><strong>{movement}</strong></div>{limits.map(({id,limit})=><div key={id}><span>{id} level limit</span><strong>{limit??"—"}</strong></div>)}</div>:null}
    {race&&race!=="human"&&auditedPaths.length?<details><summary>Audited multiclass paths</summary><p>{auditedPaths.map((p)=>p.join(" / ")).join(" · ")}</p></details>:null}
    {hooks.length?<details open><summary>Level-one class abilities</summary>{hooks.map((hook)=><div className="audit-hook" key={hook!.classId}><strong>{hook!.classId}</strong><p>{hook!.levelOneFeatures.join(" · ")}</p>{hook!.characterCreationChoices.length?<small>Creation choices: {hook!.characterCreationChoices.join(", ")}</small>:null}</div>)}</details>:null}
  </aside>;
}
