"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CLASSES, RACES, type ClassId, type RaceId } from "./rules";

type Appearance = {
  hair: string | null;
  eyes: string | null;
  complexion: string | null;
  build: string | null;
  face: string | null;
  feature: string | null;
  style: string | null;
};

type PortraitState = {
  appearance: Appearance;
  customDescription: string;
  generatedPrompt: string;
  endpoint: string;
  workflowEndpoint: string;
  status: "idle" | "ready" | "sending" | "success" | "error";
  error?: string;
  lastResponse?: unknown;
};

const EMPTY_APPEARANCE: Appearance = { hair:null, eyes:null, complexion:null, build:null, face:null, feature:null, style:null };
const DEFAULT_ENDPOINT = "http://127.0.0.1:8188";

const TRAITS = {
  hair: ["short dark hair","long dark hair","auburn hair","chestnut hair","fair hair","silver-grey hair","curly brown hair","close-cropped hair","braided hair","wavy black hair"],
  eyes: ["grey eyes","green eyes","hazel eyes","blue eyes","dark brown eyes","amber eyes","pale blue eyes"],
  complexion: ["fair complexion","warm complexion","olive complexion","weathered complexion","freckled complexion","ruddy complexion","deep brown complexion"],
  build: ["lean build","athletic build","slender build","broad-shouldered build","compact build","powerful build","wiry build"],
  face: ["fine angular features","strong jaw","soft rounded features","high cheekbones","weathered face","sharp observant features","open friendly face"],
  feature: ["a faint scar above one eyebrow","a small scar on the cheek","a broken-nose set","a distinctive birthmark","a few visible freckles","a narrow facial tattoo","no obvious distinguishing mark"],
  style: ["calm and watchful expression","confident expression","reserved expression","wry half-smile","stern expression","curious expression","quietly determined expression"],
} as const;

type TraitKey = keyof typeof TRAITS;

function readRace(): RaceId | null {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return RACES.find((r)=>text.includes(r.name))?.id ?? null;
}
function readClasses(): ClassId[] {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return CLASSES.filter((c)=>text.includes(c.name)).map((c)=>c.id);
}
function readName(){ return document.querySelector(".character-record h2")?.textContent?.trim() ?? "Unnamed adventurer"; }
function currentStage(){ return document.querySelector(".stage-copy h2")?.textContent?.trim() ?? ""; }
function pick<T>(values: readonly T[]): T { return values[Math.floor(Math.random()*values.length)]; }
function readEquipment(){
  const armour = document.querySelector(".record-details > div:first-child strong")?.textContent?.trim() ?? "";
  const weapons = Array.from(document.querySelectorAll(".training-game-grid section:first-child button.selected")).map((b)=>b.querySelector("strong")?.textContent?.trim() ?? "").filter(Boolean);
  return { armour, weapons };
}
function sexLabel(){
  const value = typeof window !== "undefined" ? localStorage.getItem("character-forge-sex") : null;
  return value === "female" ? "female" : value === "male" ? "male" : "adult";
}
function buildPrompt(race: RaceId|null, classes: ClassId[], appearance: Appearance, custom: string){
  const { armour, weapons } = readEquipment();
  const raceName = race ? RACES.find((r)=>r.id===race)?.name ?? race : "fantasy";
  const classNames = classes.map((id)=>CLASSES.find((c)=>c.id===id)?.name ?? id).join(" / ") || "adventurer";
  const traits = Object.values(appearance).filter(Boolean).join(", ");
  const gear = [armour, ...weapons].filter(Boolean).join(", ");
  return [
    `Old-school fantasy RPG character portrait of a ${sexLabel()} ${raceName} ${classNames}`,
    traits,
    gear ? `wearing or carrying ${gear}` : "",
    custom.trim(),
    "painted dark-fantasy portrait, carved-gold and parchment character-forge aesthetic, waist-up composition, dramatic but natural lighting, detailed face, no text, no logos, no modern clothing",
  ].filter(Boolean).join(", ");
}

export default function PortraitForge(){
  const [mounted,setMounted]=useState(false);
  const [version,setVersion]=useState(0);
  const [state,setState]=useState<PortraitState>({appearance:EMPTY_APPEARANCE,customDescription:"",generatedPrompt:"",endpoint:DEFAULT_ENDPOINT,workflowEndpoint:"/prompt",status:"idle"});

  useEffect(()=>{
    setMounted(true);
    const raw=localStorage.getItem("forge-portrait-forge");
    if(raw){try{setState((cur)=>({...cur,...JSON.parse(raw)}))}catch{}}
    const obs=new MutationObserver(()=>setVersion((v)=>v+1));
    obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});
    return()=>obs.disconnect();
  },[]);
  useEffect(()=>{if(mounted)localStorage.setItem("forge-portrait-forge",JSON.stringify(state));},[mounted,state]);

  const race=useMemo(()=>mounted?readRace():null,[mounted,version]);
  const classes=useMemo(()=>mounted?readClasses():[],[mounted,version]);
  const target=mounted&&currentStage()==="Final Character Record"?document.querySelector(".record-stage"):null;
  if(!target) return null;

  function rollTrait(key:TraitKey){
    setState((cur)=>({...cur,appearance:{...cur.appearance,[key]:pick(TRAITS[key])},status:"ready"}));
  }
  function rollAll(){
    const next = Object.keys(TRAITS).reduce((acc,key)=>({...acc,[key]:pick(TRAITS[key as TraitKey])}),{} as Appearance);
    setState((cur)=>({...cur,appearance:next,status:"ready"}));
  }
  function compose(){
    const prompt=buildPrompt(race,classes,state.appearance,state.customDescription);
    setState((cur)=>({...cur,generatedPrompt:prompt,status:"ready",error:undefined}));
  }
  async function sendToComfy(){
    const prompt=state.generatedPrompt || buildPrompt(race,classes,state.appearance,state.customDescription);
    setState((cur)=>({...cur,generatedPrompt:prompt,status:"sending",error:undefined}));
    try{
      const base=state.endpoint.replace(/\/$/,"");
      const response=await fetch(`${base}${state.workflowEndpoint||"/prompt"}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          client_id:"dnd2e-character-forge",
          prompt_text:prompt,
          character:{name:readName(),race,classes,sex:sexLabel(),appearance:state.appearance,description:state.customDescription}
        })
      });
      const body=await response.json().catch(()=>({status:response.status}));
      if(!response.ok) throw new Error(`ComfyUI returned ${response.status}`);
      setState((cur)=>({...cur,status:"success",lastResponse:body,error:undefined}));
      localStorage.setItem("forge-portrait-prompt",prompt);
      window.dispatchEvent(new CustomEvent("forge-portrait-requested",{detail:{prompt,response:body}}));
    }catch(err){
      setState((cur)=>({...cur,status:"error",error:err instanceof Error?err.message:"Could not reach local ComfyUI"}));
    }
  }

  return createPortal(<section className="portrait-forge-panel">
    <div className="portrait-forge-title"><span>PORTRAIT FORGE</span><h3>Roll or Describe Your Character's Look</h3></div>
    <p>Every appearance roll is initiated by you. You can reroll individual traits, edit the description freely, or ignore the rolls and describe the character yourself.</p>
    <div className="portrait-forge-actions"><button type="button" onClick={rollAll}>Roll All Appearance Traits</button><button type="button" onClick={compose}>Build Portrait Prompt</button></div>
    <div className="appearance-grid">{(Object.keys(TRAITS) as TraitKey[]).map((key)=><div key={key}><span>{key}</span><strong>{state.appearance[key]??"Unchosen"}</strong><button type="button" onClick={()=>rollTrait(key)}>Roll</button></div>)}</div>
    <label className="portrait-description"><span>Your Description / Overrides</span><textarea value={state.customDescription} onChange={(e)=>setState((cur)=>({...cur,customDescription:e.target.value,status:"ready"}))} placeholder="Example: long auburn hair, green eyes, scar above left eyebrow, forest-worn cloak, calm expression…"/></label>
    <div className="portrait-prompt"><span>Generated Prompt</span><textarea value={state.generatedPrompt} onChange={(e)=>setState((cur)=>({...cur,generatedPrompt:e.target.value,status:"ready"}))} placeholder="Press Build Portrait Prompt"/></div>
    <details className="comfy-settings"><summary>Local ComfyUI settings</summary><label>Endpoint<input value={state.endpoint} onChange={(e)=>setState((cur)=>({...cur,endpoint:e.target.value}))}/></label><label>Prompt route<input value={state.workflowEndpoint} onChange={(e)=>setState((cur)=>({...cur,workflowEndpoint:e.target.value}))}/></label><small>The Forge expects a local adapter/workflow endpoint that accepts JSON containing prompt_text and character data. If ComfyUI is not running, character creation still works normally.</small></details>
    <button type="button" className="portrait-generate" onClick={sendToComfy} disabled={state.status==="sending"}>{state.status==="sending"?"Sending to Local AI…":"Generate Portrait with Local AI"}</button>
    {state.status==="success"?<p className="portrait-status success">Portrait request sent successfully. The returned job data has been saved for the local workflow.</p>:null}
    {state.status==="error"?<p className="portrait-status error">Local AI unavailable: {state.error}. You can continue without generating a portrait.</p>:null}
  </section>,target);
}
