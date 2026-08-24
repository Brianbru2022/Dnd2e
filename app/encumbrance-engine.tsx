"use client";

import { useEffect, useMemo, useState } from "react";
import { ARMOR, GENERAL_GEAR, RACES, WEAPONS, type ArmorId, type RaceId, type WeaponId } from "./rules";
import { ARMOR_WEIGHT, BASE_MOVEMENT, GEAR_WEIGHT, SHIELD_WEIGHT, WEAPON_WEIGHT, armorInterference, encumbranceFor, movementRate } from "./equipment-rules";

function readNumber(text: string | null | undefined) {
  if (!text) return null;
  const value = Number.parseFloat(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? value : null;
}

function readRace(): RaceId | null {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  return RACES.find((race) => text.includes(race.name))?.id ?? null;
}

function readClasses() {
  const text = document.querySelector(".record-subtitle")?.textContent ?? "";
  const names = ["Fighter","Ranger","Paladin","Mage","Illusionist","Cleric","Druid","Thief","Bard"];
  return names.filter((name) => text.includes(name)).map((name) => name.toLowerCase());
}

function readStrengthAllowance() {
  const rows = Array.from(document.querySelectorAll(".derived-grid > div"));
  const row = rows.find((item) => item.querySelector("span")?.textContent?.trim() === "Weight");
  return readNumber(row?.querySelector("strong")?.textContent) ?? 0;
}

function readSelectedWeaponIds(): WeaponId[] {
  const section = Array.from(document.querySelectorAll(".training-game-grid section")).find((node) => node.querySelector("h3")?.textContent?.includes("Weapon"));
  if (!section) return [];
  const selected = Array.from(section.querySelectorAll("button.selected"));
  return selected.map((button) => {
    const label = button.querySelector("strong")?.textContent?.trim() ?? button.textContent?.trim() ?? "";
    return WEAPONS.find((weapon) => weapon.name === label)?.id ?? null;
  }).filter((id): id is WeaponId => Boolean(id));
}

function readArmorId(): ArmorId | null {
  const buttons = Array.from(document.querySelectorAll(".equipment-sections section:first-child .equipment-choice-grid button.selected"));
  const label = buttons[0]?.querySelector("strong")?.textContent?.trim();
  return ARMOR.find((armor) => armor.name === label)?.id ?? null;
}

function readShield() {
  return Boolean(document.querySelector(".shield-choice.selected"));
}

function readGearIds() {
  const selected = Array.from(document.querySelectorAll(".equipment-choice-grid.gear button.selected"));
  return selected.map((button) => {
    const label = button.querySelector("strong")?.textContent?.trim() ?? "";
    return GENERAL_GEAR.find((item) => item.name === label)?.id ?? null;
  }).filter((id): id is string => Boolean(id));
}

export default function EncumbranceEngine() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((value) => value + 1));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  const state = useMemo(() => {
    if (typeof document === "undefined") return null;
    const raceId = readRace();
    const classIds = readClasses();
    const allowance = readStrengthAllowance();
    const weapons = readSelectedWeaponIds();
    const armorId = readArmorId();
    const shield = readShield();
    const gear = readGearIds();
    const weaponWeight = weapons.reduce((sum, id) => sum + WEAPON_WEIGHT[id], 0);
    const armorWeight = armorId ? ARMOR_WEIGHT[armorId] : 0;
    const gearWeight = gear.reduce((sum, id) => sum + (GEAR_WEIGHT[id] ?? 0), 0);
    const total = weaponWeight + armorWeight + gearWeight + (shield ? SHIELD_WEIGHT : 0);
    const enc = encumbranceFor(total, allowance || 1);
    const base = raceId ? BASE_MOVEMENT[raceId] : 12;
    const movement = movementRate(base, enc.movementFactor);
    const interference = armorInterference(classIds, armorId);
    return { raceId, classIds, allowance, weapons, armorId, shield, gear, total, enc, base, movement, interference };
  }, [version]);

  if (!state) return null;
  return <aside className="encumbrance-hud" aria-live="polite">
    <div className="encumbrance-title"><span>LOAD & MOVEMENT</span><strong>{state.enc.category}</strong></div>
    <div className="encumbrance-grid">
      <div><span>Carried</span><strong>{state.total.toFixed(1)} lb</strong></div>
      <div><span>Allowance</span><strong>{state.allowance ? `${state.allowance} lb` : "—"}</strong></div>
      <div><span>Base Move</span><strong>{state.base}</strong></div>
      <div><span>Current Move</span><strong>{state.movement}</strong></div>
    </div>
    <div className="load-meter" aria-label={`Carrying ${state.total.toFixed(1)} of ${state.allowance || 0} pounds`}><span style={{ width: `${Math.min(100, state.allowance ? state.total / state.allowance * 100 : 0)}%` }} /></div>
    {state.enc.checkPenalty ? <p className="encumbrance-penalty">Physical checks: {state.enc.checkPenalty}</p> : null}
    {state.interference.length ? <div className="armor-interference">{state.interference.map((note) => <p key={note}>⚠ {note}</p>)}</div> : <p className="encumbrance-ok">No class abilities are currently obstructed by armour.</p>}
  </aside>;
}
