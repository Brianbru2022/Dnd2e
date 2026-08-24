"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ABILITIES, CLASSES, RACES, type AbilityKey, type ClassId, type RaceId, classById } from "./rules";

type CharacterSex = "female" | "male";
type PartialScores = Partial<Record<AbilityKey, number>>;

type PathAdvice = {
  ids: ClassId[];
  label: string;
  grade: "Excellent fit" | "Strong fit" | "Promising" | "Possible" | "Blocked";
  score: number;
  reason: string;
  blocked: boolean;
};

const PRIMARY: Record<ClassId, AbilityKey[]> = {
  fighter: ["str", "con"], ranger: ["str", "dex", "con", "wis"], paladin: ["cha", "wis", "str"],
  mage: ["int"], illusionist: ["int", "dex"], cleric: ["wis", "con"], druid: ["wis", "cha"],
  thief: ["dex", "int"], bard: ["cha", "int", "dex"],
};

function readScores(): PartialScores {
  const scores: PartialScores = {};
  const progress = Array.from(document.querySelectorAll(".ability-dice-row > div"));
  for (const row of progress) {
    const key = row.querySelector("span")?.textContent?.trim().toLowerCase() as AbilityKey | undefined;
    const value = Number.parseInt(row.querySelector("strong")?.textContent ?? "", 10);
    if (key && ABILITIES.some((ability) => ability.id === key) && Number.isFinite(value)) scores[key] = value;
  }
  if (Object.keys(scores).length) return scores;
  const recordRows = Array.from(document.querySelectorAll(".record-abilities > div"));
  for (const row of recordRows) {
    const key = row.querySelector(".ability-token")?.textContent?.trim().toLowerCase() as AbilityKey | undefined;
    const value = Number.parseInt(row.querySelector("strong")?.textContent ?? "", 10);
    if (key && ABILITIES.some((ability) => ability.id === key) && Number.isFinite(value)) scores[key] = value;
  }
  return scores;
}

function readRace(): RaceId | null {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return RACES.find((race) => text.includes(race.name))?.id ?? null;
}

function readSelectedClasses(): ClassId[] {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return CLASSES.filter((item) => text.includes(item.name)).map((item) => item.id);
}

function allPaths(raceId: RaceId | null): ClassId[][] {
  if (!raceId) return CLASSES.map((item) => [item.id]);
  const race = RACES.find((item) => item.id === raceId);
  if (!race) return CLASSES.map((item) => [item.id]);
  return [...race.availableClasses.map((id) => [id]), ...race.multiclass];
}

function scorePath(ids: ClassId[], scores: PartialScores): PathAdvice {
  const classes = ids.map(classById);
  let blocked = false;
  const blockers: string[] = [];
  for (const cls of classes) {
    for (const [key, minimum] of Object.entries(cls.minimums) as [AbilityKey, number][]) {
      if (scores[key] !== undefined && scores[key]! < minimum) {
        blocked = true;
        blockers.push(`${key.toUpperCase()} ${scores[key]} < ${minimum}`);
      }
    }
  }

  const primaryKeys = Array.from(new Set(ids.flatMap((id) => PRIMARY[id])));
  const rolledPrimaries = primaryKeys.filter((key) => scores[key] !== undefined);
  const avg = rolledPrimaries.length ? rolledPrimaries.reduce((sum, key) => sum + scores[key]!, 0) / rolledPrimaries.length : 10;
  const highs = rolledPrimaries.filter((key) => scores[key]! >= 15).length;
  const score = avg + highs * 1.25 - Math.max(0, ids.length - 1) * .4;
  const label = ids.map((id) => classById(id).name).join(" / ");

  if (blocked) return { ids, label, grade: "Blocked", score: -100, blocked: true, reason: `Current rolls miss ${blockers.slice(0, 2).join(" and ")}.` };

  const waiting = primaryKeys.filter((key) => scores[key] === undefined);
  const grade = score >= 16.5 ? "Excellent fit" : score >= 14.5 ? "Strong fit" : score >= 12.5 ? "Promising" : "Possible";
  const strengths = rolledPrimaries.filter((key) => scores[key]! >= 14).map((key) => `${key.toUpperCase()} ${scores[key]}`);
  const reason = strengths.length
    ? `${strengths.slice(0, 3).join(" · ")} support this path${waiting.length ? `; still waiting on ${waiting.map((key) => key.toUpperCase()).join(", ")}` : ""}.`
    : waiting.length ? `Still developing; ${waiting.map((key) => key.toUpperCase()).join(", ")} will matter most.` : "You qualify, but the rolled abilities do not particularly favour this path.";
  return { ids, label, grade, score, blocked: false, reason };
}

function nextStepCounsel(selected: ClassId[], scores: PartialScores): string {
  if (!selected.length) return "I will keep comparing class paths as every new ability lands.";
  if (selected.includes("thief")) return scores.dex && scores.dex >= 15 ? "Your Dexterity strongly favours stealth and locks; consider concentrating thief points in Move Silently, Hide in Shadows and Open Locks." : "Thief training is flexible: use the 60 discretionary points to shape the kind of rogue you want to play.";
  if (selected.includes("mage") || selected.includes("illusionist")) return scores.int && scores.int >= 15 ? "High Intelligence gives you strong arcane potential. Sleep, Magic Missile and defensive utility are useful early spellbook choices." : "Your spellbook choices matter more than raw combat ability; build around control, defence and utility.";
  if (selected.includes("cleric") || selected.includes("druid")) return scores.wis && scores.wis >= 13 ? "Your Wisdom grants useful priest potential and may provide bonus spell capacity. Healing and protective prayers are strong early choices." : "Choose prayers to suit the role you want: healing, protection, detection or battlefield support.";
  if (selected.length === 1 && selected[0] === "fighter") return scores.dex && scores.dex >= 15 ? "Your Dexterity makes missile combat attractive; specialization can make a focused weapon style especially strong." : "A single-class Fighter can specialise. Pick the weapon you genuinely want this character to be known for.";
  if (selected.includes("ranger")) return "Your class rewards a capable all-round physical profile. Keep an eye on ranged weapons, wilderness proficiencies and light enough equipment to stay mobile.";
  if (selected.includes("paladin")) return "Your high Charisma and martial scores support the Paladin path. Prioritise durable armour and a dependable primary weapon.";
  if (selected.includes("bard")) return "Bards reward versatility. Choose proficiencies that give you options in conversation, exploration and combat rather than over-specialising.";
  return "Your path is viable. The next choices should reinforce how you actually want the character to play.";
}

export default function ForgeCounsel() {
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [sex, setSex] = useState<CharacterSex | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem("character-forge-sex");
    if (stored === "female" || stored === "male") setSex(stored);
    const observer = new MutationObserver(() => setVersion((value) => value + 1));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sex) return;
    window.localStorage.setItem("character-forge-sex", sex);
    document.documentElement.dataset.characterSex = sex;
    (window as Window & { __characterSex?: CharacterSex }).__characterSex = sex;
  }, [sex]);

  const snapshot = useMemo(() => {
    if (!mounted) return { scores: {} as PartialScores, raceId: null as RaceId | null, selected: [] as ClassId[] };
    return { scores: readScores(), raceId: readRace(), selected: readSelectedClasses() };
  }, [mounted, version]);

  const advice = useMemo(() => allPaths(snapshot.raceId).map((ids) => scorePath(ids, snapshot.scores)).filter((item) => !item.blocked).sort((a, b) => b.score - a.score).slice(0, 4), [snapshot]);
  const rolled = Object.keys(snapshot.scores).length;
  const nameTarget = mounted ? document.querySelector(".name-altar") : null;
  const recordTarget = mounted ? document.querySelector(".character-record") : null;

  const identity = nameTarget ? createPortal(
    <div className="identity-choice">
      <span className="identity-label">PLAY CHARACTER AS</span>
      <div className="identity-buttons">
        <button type="button" className={sex === "female" ? "selected" : ""} onClick={() => setSex("female")}>Female</button>
        <button type="button" className={sex === "male" ? "selected" : ""} onClick={() => setSex("male")}>Male</button>
      </div>
      <small>This changes character identity and future portrait/narrative presentation. It does not alter ability scores or class rules.</small>
    </div>, nameTarget) : null;

  const counsel = recordTarget ? createPortal(
    <section className="forge-counsel" aria-live="polite">
      <div className="counsel-heading"><span>FORGE COUNSEL</span><strong>{rolled < 6 ? `${rolled}/6 abilities known` : snapshot.raceId ? "Ancestry-adjusted advice" : "Class advice"}</strong></div>
      {!rolled ? <p className="counsel-intro">Roll your first ability and I’ll start comparing the paths your character is growing toward.</p> : <>
        <div className="counsel-list">{advice.map((item, index) => <div className="counsel-item" key={item.label}><span className="counsel-rank">{index + 1}</span><div><strong>{item.label}</strong><em>{item.grade}</em><p>{item.reason}</p></div></div>)}</div>
        <p className="counsel-next">{nextStepCounsel(snapshot.selected, snapshot.scores)}</p>
      </>}
      {sex ? <div className="record-sex"><span>Character</span><strong>{sex === "female" ? "Female" : "Male"}</strong></div> : null}
      <small className="counsel-rule">Advice only — the Forge never selects a class, ancestry, spell, proficiency or item for you.</small>
    </section>, recordTarget) : null;

  return <>{identity}{counsel}</>;
}

declare global {
  interface Window { __characterSex?: CharacterSex }
}
