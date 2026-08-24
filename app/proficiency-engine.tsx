"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ABILITIES, CLASSES, type AbilityKey, type ClassGroup, type ClassId } from "./rules";

type ProficiencyRule = {
  name: string;
  groups: Array<ClassGroup | "General">;
  slots: number;
  ability: AbilityKey;
  modifier: number;
};

type SelectedProficiency = ProficiencyRule & {
  effectiveCost: number;
  checkTarget: number | null;
  crossGroup: boolean;
};

const RULES: ProficiencyRule[] = [
  { name:"Ancient History", groups:["Priest","Wizard"], slots:1, ability:"int", modifier:-1 },
  { name:"Animal Handling", groups:["Warrior"], slots:1, ability:"wis", modifier:-1 },
  { name:"Direction Sense", groups:["General"], slots:1, ability:"wis", modifier:1 },
  { name:"Endurance", groups:["Warrior"], slots:2, ability:"con", modifier:0 },
  { name:"Healing", groups:["Priest"], slots:2, ability:"wis", modifier:-2 },
  { name:"Herbalism", groups:["Priest","Wizard"], slots:2, ability:"int", modifier:-2 },
  { name:"Local History", groups:["Rogue","Wizard"], slots:1, ability:"cha", modifier:0 },
  { name:"Navigation", groups:["Priest","Rogue","Warrior"], slots:1, ability:"int", modifier:-2 },
  { name:"Reading/Writing", groups:["Priest","Wizard"], slots:1, ability:"int", modifier:1 },
  { name:"Riding", groups:["General"], slots:1, ability:"wis", modifier:3 },
  { name:"Survival", groups:["Warrior"], slots:2, ability:"int", modifier:0 },
  { name:"Swimming", groups:["General"], slots:1, ability:"str", modifier:0 },
];

function readClassIds(): ClassId[] {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return CLASSES.filter((item) => text.includes(item.name)).map((item) => item.id);
}

function readScores(): Partial<Record<AbilityKey, number>> {
  const result: Partial<Record<AbilityKey, number>> = {};
  for (const row of Array.from(document.querySelectorAll(".record-abilities > div"))) {
    const key = row.querySelector(".ability-token")?.textContent?.trim().toLowerCase() as AbilityKey | undefined;
    const value = Number.parseInt(row.querySelector("strong")?.textContent ?? "", 10);
    if (key && ABILITIES.some((a) => a.id === key) && Number.isFinite(value)) result[key] = value;
  }
  return result;
}

function effectiveRule(rule: ProficiencyRule, groups: ClassGroup[], scores: Partial<Record<AbilityKey,number>>): SelectedProficiency {
  const inGroup = rule.groups.includes("General") || rule.groups.some((group) => group !== "General" && groups.includes(group));
  const effectiveCost = rule.slots + (inGroup ? 0 : 1);
  const score = scores[rule.ability];
  return {
    ...rule,
    effectiveCost,
    crossGroup: !inGroup,
    checkTarget: score === undefined ? null : Math.max(1, Math.min(20, score + rule.modifier)),
  };
}

function syncLegacyGate(complete: boolean, budget: number) {
  const training = document.querySelector(".training-stage");
  if (!training) return;
  const sections = training.querySelectorAll(".training-game-grid > section");
  const legacy = sections[1];
  if (!legacy) return;
  const buttons = Array.from(legacy.querySelectorAll<HTMLButtonElement>(".choice-chip-grid > button"));
  if (!buttons.length) return;
  const selected = buttons.filter((button) => button.classList.contains("selected"));
  const target = complete ? budget : Math.min(Math.max(0, budget - 1), buttons.length);
  if (selected.length === target) return;
  if (selected.length > target) {
    selected.slice(target).forEach((button) => button.click());
    return;
  }
  buttons.filter((button) => !button.classList.contains("selected")).slice(0, target - selected.length).forEach((button) => button.click());
}

export default function ProficiencyEngine() {
  const [version, setVersion] = useState(0);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("character-forge-proficiencies-v2");
    if (stored) {
      try { setSelectedNames(JSON.parse(stored)); } catch { /* ignore stale data */ }
    }
    const observer = new MutationObserver(() => setVersion((value) => value + 1));
    observer.observe(document.body, { subtree:true, childList:true, characterData:true, attributes:true });
    return () => observer.disconnect();
  }, []);

  const target = typeof document !== "undefined" ? document.querySelector(".training-stage .training-game-grid > section:nth-child(2)") : null;
  const classIds = useMemo(() => typeof document === "undefined" ? [] : readClassIds(), [version]);
  const scores = useMemo(() => typeof document === "undefined" ? {} : readScores(), [version]);
  const groups = classIds.map((id) => CLASSES.find((item) => item.id === id)!.group);
  const budget = classIds.length ? Math.max(...classIds.map((id) => CLASSES.find((item) => item.id === id)!.nonWeaponSlots)) : 0;
  const computed = RULES.map((rule) => effectiveRule(rule, groups, scores));
  const selected = computed.filter((rule) => selectedNames.includes(rule.name));
  const spent = selected.reduce((sum, rule) => sum + rule.effectiveCost, 0);
  const complete = budget > 0 && spent === budget;

  useEffect(() => {
    if (!target || !budget) return;
    window.localStorage.setItem("character-forge-proficiencies-v2", JSON.stringify(selectedNames));
    const payload = selected.map(({name,effectiveCost,ability,modifier,checkTarget,crossGroup}) => ({name,slots:effectiveCost,ability,modifier,checkTarget,crossGroup}));
    (window as Window & { __characterProficiencies?: unknown }).__characterProficiencies = payload;
    document.documentElement.dataset.proficiencyV2Complete = complete ? "true" : "false";
    const timer = window.setTimeout(() => syncLegacyGate(complete, budget), 0);
    return () => window.clearTimeout(timer);
  }, [selectedNames, complete, budget, target, selected]);

  if (!target || !budget) return null;

  function toggle(rule: SelectedProficiency) {
    const already = selectedNames.includes(rule.name);
    if (already) {
      setSelectedNames((current) => current.filter((name) => name !== rule.name));
      return;
    }
    if (spent + rule.effectiveCost > budget) return;
    setSelectedNames((current) => [...current, rule.name]);
  }

  return createPortal(
    <div className="proficiency-v2">
      <div className="proficiency-v2-head">
        <div><span>NON-WEAPON PROFICIENCIES</span><h3>Spend Training Slots</h3></div>
        <strong className={complete ? "complete" : ""}>{spent}/{budget} slots</strong>
      </div>
      <p className="proficiency-v2-note">Proficiencies from your class group use their listed cost. Training outside your class groups costs one additional slot. Checks are made on d20 against the governing ability after the listed modifier.</p>
      <div className="proficiency-v2-grid">
        {computed.map((rule) => {
          const active = selectedNames.includes(rule.name);
          const unaffordable = !active && spent + rule.effectiveCost > budget;
          return <button type="button" key={rule.name} className={`${active ? "selected" : ""} ${rule.crossGroup ? "cross-group" : ""}`} disabled={unaffordable} onClick={() => toggle(rule)}>
            <div><strong>{rule.name}</strong><small>{rule.crossGroup ? "Cross-group training" : rule.groups.join(" / ")}</small></div>
            <div className="proficiency-meta"><span>{rule.effectiveCost} slot{rule.effectiveCost === 1 ? "" : "s"}</span><span>{rule.ability.toUpperCase()} {rule.modifier >= 0 ? "+" : ""}{rule.modifier}</span><b>Check {rule.checkTarget ?? "—"}</b></div>
          </button>;
        })}
      </div>
      <div className={`proficiency-v2-status ${complete ? "complete" : ""}`}>
        {complete ? "Training allocation complete." : `${budget - spent} slot${budget - spent === 1 ? "" : "s"} still to spend.`}
      </div>
    </div>, target
  );
}

declare global { interface Window { __characterProficiencies?: unknown } }
