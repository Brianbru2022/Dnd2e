"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ABILITIES,
  ALIGNMENTS,
  ARMOR,
  CLASSES,
  GENERAL_GEAR,
  NON_WEAPON_PROFICIENCIES,
  RACES,
  WEAPONS,
  type AbilityKey,
  type AbilityScores,
  type ArmorId,
  type ClassId,
  type RaceId,
  type WeaponId,
  applyRaceAdjustments,
  classById,
  constitutionHpBonus,
  dexterityAcAdjustment,
  qualifiesForClass,
  raceById,
  startingGoldDice,
} from "./rules";

type RollMethod = "classic" | "heroic" | "manual";
type ForgeMode = "guided" | "manual";

const BASE_TENS: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
const SHIELD_COST = 10;

const NAMES: Record<RaceId, string[]> = {
  human: ["Aldren Vale", "Mira Thorne", "Corin Ash", "Elara Venn"],
  dwarf: ["Brom Ironvein", "Dagna Flint", "Torra Deepdelve", "Keld Stonehand"],
  elf: ["Aelar Vael", "Lethiel Aerwyn", "Caelen Thir", "Seris Moonfall"],
  gnome: ["Perrin Nackle", "Tavi Wizzle", "Nim Fenwick", "Orra Tink"],
  "half-elf": ["Kaelen Aerwyn", "Mara Vey", "Theron Vale", "Selene Ash"],
  halfling: ["Pip Underbough", "Merrin Greenhill", "Tessa Bramble", "Odo Quickstep"],
};

function rollDie(sides: number) { return Math.floor(Math.random() * sides) + 1; }
function rollDice(count: number, sides: number) { return Array.from({ length: count }, () => rollDie(sides)); }
function roll3d6() { return rollDice(3, 6).reduce((a, b) => a + b, 0); }
function roll4d6DropLowest() { const d = rollDice(4, 6).sort((a, b) => a - b); return d[1] + d[2] + d[3]; }
function signed(value: number) { return value > 0 ? `+${value}` : `${value}`; }

function generateScores(method: RollMethod): AbilityScores {
  if (method === "manual") return { ...BASE_TENS };
  const roller = method === "classic" ? roll3d6 : roll4d6DropLowest;
  return { str: roller(), dex: roller(), con: roller(), int: roller(), wis: roller(), cha: roller() };
}

function scoreClass(scores: AbilityScores, id: ClassId) {
  const c = classById(id);
  if (!qualifiesForClass(scores, id)) return -999;
  const keys = Object.keys(c.minimums) as AbilityKey[];
  return keys.reduce((total, key) => total + scores[key] * 3, 0) + (c.group === "Warrior" ? scores.str : 0) + (c.group === "Wizard" ? scores.int : 0) + (c.group === "Priest" ? scores.wis : 0) + (c.group === "Rogue" ? scores.dex : 0);
}

function recommendedAlignment(classIds: ClassId[]) {
  const restrictions = classIds.map((id) => classById(id).allowedAlignments).filter(Boolean) as string[][];
  if (restrictions.length === 0) return "Neutral Good";
  return ALIGNMENTS.find((a) => restrictions.every((list) => list.includes(a))) ?? restrictions[0][0];
}

function autoWeapons(classIds: ClassId[], slots: number): WeaponId[] {
  const priority: WeaponId[] = ["longsword","warhammer","mace","shortsword","battleaxe","shortbow","spear","quarterstaff","dagger","sling","longbow"];
  const allowed = WEAPONS.filter((w) => classIds.every((id) => classById(id).allowedWeapons.includes(w.id))).map((w) => w.id);
  return priority.filter((id) => allowed.includes(id)).slice(0, Math.max(1, slots));
}

function autoArmor(classIds: ClassId[], gold: number): ArmorId {
  const legal = ARMOR.filter((a) => classIds.every((id) => classById(id).allowedArmor.includes(a.id))).filter((a) => a.cost <= gold * 0.58);
  return legal.sort((a, b) => a.ac - b.ac)[0]?.id ?? "none";
}

function classPathLabel(ids: ClassId[]) { return ids.map((id) => classById(id).name).join(" / "); }

export default function CharacterForge() {
  const [mode, setMode] = useState<ForgeMode>("guided");
  const [name, setName] = useState("");
  const [rollMethod, setRollMethod] = useState<RollMethod>("classic");
  const [baseScores, setBaseScores] = useState<AbilityScores>(BASE_TENS);
  const [raceId, setRaceId] = useState<RaceId>("human");
  const [classIds, setClassIds] = useState<ClassId[]>(["fighter"]);
  const [alignment, setAlignment] = useState<string>("Neutral Good");
  const [exceptionalStrength, setExceptionalStrength] = useState<number | null>(null);
  const [hp, setHp] = useState<number | null>(null);
  const [startingGold, setStartingGold] = useState<number | null>(null);
  const [weaponProfs, setWeaponProfs] = useState<WeaponId[]>([]);
  const [nonWeaponProfs, setNonWeaponProfs] = useState<string[]>([]);
  const [armorId, setArmorId] = useState<ArmorId>("none");
  const [shield, setShield] = useState(false);
  const [gear, setGear] = useState<string[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const race = raceById(raceId);
  const finalScores = useMemo(() => applyRaceAdjustments(baseScores, raceId), [baseScores, raceId]);
  const classes = classIds.map(classById);
  const primaryClass = classes[0];
  const isMulticlass = classIds.length > 1;
  const alignmentAllowed = classes.every((c) => !c.allowedAlignments || c.allowedAlignments.includes(alignment));
  const classesQualified = classIds.every((id) => qualifiesForClass(finalScores, id));
  const raceAllowsPath = classIds.length === 1 ? race.availableClasses.includes(classIds[0]) : race.multiclass.some((path) => path.length === classIds.length && path.every((id, i) => id === classIds[i]));
  const canExceptional = classes.some((c) => c.exceptionalStrength) && finalScores.str === 18;
  const weaponSlots = Math.min(...classes.map((c) => c.weaponSlots));
  const nonWeaponSlots = Math.max(...classes.map((c) => c.nonWeaponSlots));
  const allowedWeapons = WEAPONS.filter((w) => classIds.every((id) => classById(id).allowedWeapons.includes(w.id)));
  const allowedArmor = ARMOR.filter((a) => classIds.every((id) => classById(id).allowedArmor.includes(a.id)));
  const shieldAllowed = classes.every((c) => c.shield);
  const armor = ARMOR.find((a) => a.id === armorId)!;
  const dexAc = dexterityAcAdjustment(finalScores.dex);
  const ac = Math.max(-10, armor.ac + dexAc - (shield ? 1 : 0));
  const thac0 = 20;

  const spent = useMemo(() => {
    const weaponCost = weaponProfs.reduce((sum, id) => sum + (WEAPONS.find((w) => w.id === id)?.cost ?? 0), 0);
    const gearCost = gear.reduce((sum, id) => sum + (GENERAL_GEAR.find((g) => g.id === id)?.cost ?? 0), 0);
    return weaponCost + armor.cost + (shield ? SHIELD_COST : 0) + gearCost;
  }, [weaponProfs, armor.cost, shield, gear]);

  const goldRemaining = Math.max(0, (startingGold ?? 0) - spent);

  const strongest = useMemo(() => [...ABILITIES].sort((a, b) => finalScores[b.id] - finalScores[a.id])[0], [finalScores]);
  const weakest = useMemo(() => [...ABILITIES].sort((a, b) => finalScores[a.id] - finalScores[b.id])[0], [finalScores]);
  const personality = `${strongest.name} is the character's clearest natural advantage, while ${weakest.name} is the most obvious limitation.`;

  function log(text: string) { setEventLog((current) => [text, ...current].slice(0, 6)); }

  function chooseBestClass(scores: AbilityScores, raceChoice: RaceId) {
    const r = raceById(raceChoice);
    const legal = r.availableClasses.filter((id) => qualifiesForClass(scores, id));
    return [...legal].sort((a, b) => scoreClass(scores, b) - scoreClass(scores, a))[0] ?? r.availableClasses[0];
  }

  function rollHp(ids: ClassId[], scores: AbilityScores) {
    const rolls = ids.map((id) => {
      const c = classById(id);
      return Math.max(1, rollDie(c.hitDie) + constitutionHpBonus(scores.con, c.group === "Warrior"));
    });
    return Math.max(1, Math.floor(rolls.reduce((a, b) => a + b, 0) / rolls.length));
  }

  function rollGold(id: ClassId) {
    const spec = startingGoldDice(classById(id).group);
    return (rollDice(spec.count, spec.sides).reduce((a, b) => a + b, 0) + spec.bonus) * spec.multiplier;
  }

  function buildAutoKit(ids: ClassId[], gold: number) {
    const slots = Math.min(...ids.map((id) => classById(id).weaponSlots));
    const weapons = autoWeapons(ids, slots);
    const chosenArmor = autoArmor(ids, gold);
    const canShield = ids.every((id) => classById(id).shield);
    const baseGear = ["backpack", "rope", "rations", "waterskin"];
    setWeaponProfs(weapons);
    setArmorId(chosenArmor);
    const roughCost = weapons.reduce((sum, id) => sum + (WEAPONS.find((w) => w.id === id)?.cost ?? 0), 0) + (ARMOR.find((a) => a.id === chosenArmor)?.cost ?? 0);
    setShield(canShield && roughCost + SHIELD_COST <= gold * 0.8);
    setGear(baseGear);
    setNonWeaponProfs(NON_WEAPON_PROFICIENCIES.slice(0, Math.max(...ids.map((id) => classById(id).nonWeaponSlots))));
  }

  function completeDerived(ids: ClassId[], scores: AbilityScores) {
    const h = rollHp(ids, scores);
    const g = rollGold(ids[0]);
    setHp(h);
    setStartingGold(g);
    if (ids.some((id) => classById(id).exceptionalStrength) && scores.str === 18) setExceptionalStrength(rollDie(100));
    else setExceptionalStrength(null);
    buildAutoKit(ids, g);
    log(`Fate supplied ${h} starting hit points and ${g} gp for equipment.`);
  }

  function forgeFresh(method: RollMethod = rollMethod, chosenRace: RaceId = raceId) {
    const scores = generateScores(method);
    const adjusted = applyRaceAdjustments(scores, chosenRace);
    setBaseScores(scores);
    let ids = classIds;
    if (mode === "guided") {
      const best = chooseBestClass(adjusted, chosenRace);
      ids = [best];
      setClassIds(ids);
      setAlignment(recommendedAlignment(ids));
      if (!name.trim()) setName(NAMES[chosenRace][rollDie(NAMES[chosenRace].length) - 1]);
    }
    completeDerived(ids, adjusted);
    log(`Six abilities rolled by ${method === "classic" ? "3d6 in order" : method === "heroic" ? "4d6, discard lowest" : "manual assignment"}.`);
  }

  useEffect(() => {
    if (mounted) return;
    setMounted(true);
    const scores = generateScores("classic");
    const best = chooseBestClass(scores, "human");
    setBaseScores(scores);
    setClassIds([best]);
    setAlignment(recommendedAlignment([best]));
    setName(NAMES.human[rollDie(NAMES.human.length) - 1]);
    completeDerived([best], scores);
    log("The guided forge has begun shaping a first-level adventurer.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function changeScore(key: AbilityKey, value: string) {
    const parsed = Number.parseInt(value, 10);
    const safe = Number.isFinite(parsed) ? Math.max(3, Math.min(18, parsed)) : 3;
    const next = { ...baseScores, [key]: safe };
    setBaseScores(next);
    const adjusted = applyRaceAdjustments(next, raceId);
    if (mode === "guided") {
      const best = chooseBestClass(adjusted, raceId);
      setClassIds([best]);
      setAlignment(recommendedAlignment([best]));
      completeDerived([best], adjusted);
    }
  }

  function chooseRace(id: RaceId) {
    setRaceId(id);
    const adjusted = applyRaceAdjustments(baseScores, id);
    const next = mode === "guided" ? [chooseBestClass(adjusted, id)] : [raceById(id).availableClasses[0]];
    setClassIds(next);
    setAlignment(recommendedAlignment(next));
    if (mode === "guided") setName(NAMES[id][rollDie(NAMES[id].length) - 1]);
    completeDerived(next, adjusted);
    log(`${raceById(id).name} ancestry reshaped the available paths and derived scores.`);
  }

  function choosePath(ids: ClassId[]) {
    setClassIds(ids);
    setAlignment(recommendedAlignment(ids));
    completeDerived(ids, finalScores);
    log(`${classPathLabel(ids)} selected; proficiencies, hit points and equipment were recalculated.`);
  }

  function toggleWeapon(id: WeaponId) {
    setWeaponProfs((current) => current.includes(id) ? current.filter((x) => x !== id) : current.length < weaponSlots ? [...current, id] : current);
  }

  function toggleNwp(name: string) {
    setNonWeaponProfs((current) => current.includes(name) ? current.filter((x) => x !== name) : current.length < nonWeaponSlots ? [...current, name] : current);
  }

  function toggleGear(id: string) { setGear((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]); }

  const warnings = [
    !raceAllowsPath ? `${classPathLabel(classIds)} is not available to ${race.name} in this rules profile.` : null,
    !classesQualified ? `The current abilities do not meet every class minimum for ${classPathLabel(classIds)}.` : null,
    !alignmentAllowed ? `${alignment} conflicts with the selected class path.` : null,
    weaponProfs.length > weaponSlots ? `Too many weapon proficiency slots are in use.` : null,
    spent > (startingGold ?? 0) ? `Equipment exceeds starting funds by ${(spent - (startingGold ?? 0)).toFixed(1)} gp.` : null,
  ].filter(Boolean) as string[];

  const ready = Boolean(name.trim()) && warnings.length === 0 && hp !== null && startingGold !== null && (!canExceptional || exceptionalStrength !== null);

  return (
    <main className="forge-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">OLD SCHOOL INTERACTIVE RPG</p>
          <h1>Character Forge</h1>
          <p className="hero-copy">A living first-level character builder: the forge can make sensible decisions on its own, while every choice remains yours to override.</p>
        </div>
        <div className="forge-mode">
          <span>FORGE WILL</span>
          <button type="button" className={mode === "guided" ? "active" : ""} onClick={() => { setMode("guided"); log("Guided Forge enabled: sensible defaults will be chosen automatically."); }}>Guide me</button>
          <button type="button" className={mode === "manual" ? "active" : ""} onClick={() => { setMode("manual"); log("Manual control enabled: the forge will stop changing major choices automatically."); }}>I decide</button>
        </div>
      </header>

      <div className="activity-strip" aria-live="polite">
        <strong>FORGE ACTIVITY</strong>
        <span>{eventLog[0] ?? "Awaiting the first roll..."}</span>
      </div>

      <div className="forge-layout">
        <div className="forge-grid">
          <section className="forge-panel origin-panel">
            <div className="section-heading"><div><p className="section-kicker">I. ORIGIN</p><h2>The adventurer takes shape</h2></div><button className="ghost-button" type="button" onClick={() => { setName(NAMES[raceId][rollDie(NAMES[raceId].length)-1]); log("A new name was drawn from the forge."); }}>Suggest name</button></div>
            <label className="field-label" htmlFor="character-name">Character name</label>
            <input id="character-name" className="text-field" value={name} onChange={(e) => setName(e.target.value.slice(0, 32))} placeholder="Name your adventurer" />
            <p className="reactive-copy">{personality}</p>
          </section>

          <section className="forge-panel ability-panel">
            <div className="section-heading split-heading"><div><p className="section-kicker">II. ABILITIES</p><h2>Let the dice speak</h2></div><button className="gold-button dice-button" type="button" onClick={() => forgeFresh()}>✦ Roll the character</button></div>
            <div className="method-tabs" role="group" aria-label="Ability generation method">
              {([['classic','3d6 in order','Severe & traditional'],['heroic','4d6 drop lowest','Stronger adventurers'],['manual','Assign manually','Direct control']] as const).map(([id,label,small]) => <button key={id} className={rollMethod === id ? "active" : ""} type="button" onClick={() => { setRollMethod(id); if (id === "manual") setBaseScores(BASE_TENS); else forgeFresh(id); }}><span>{label}</span><small>{small}</small></button>)}
            </div>
            <div className="ability-grid">
              {ABILITIES.map((ability) => {
                const adjustment = race.adjustments[ability.id] ?? 0;
                return <div className={`ability-card ${ability.id === strongest.id ? "strongest" : ""}`} key={ability.id}>
                  <span className="ability-short">{ability.short}</span>
                  {rollMethod === "manual" ? <input aria-label={ability.name} className="ability-input" type="number" min={3} max={18} value={baseScores[ability.id]} onChange={(e) => changeScore(ability.id, e.target.value)} /> : <strong>{finalScores[ability.id]}{ability.id === "str" && exceptionalStrength !== null ? <small>/{String(exceptionalStrength).padStart(2,"0")}</small> : null}</strong>}
                  <span className="ability-name">{ability.name}</span>
                  {adjustment !== 0 ? <span className="race-adjustment">Ancestry {signed(adjustment)}</span> : <span className="race-adjustment quiet">Unmodified</span>}
                </div>;
              })}
            </div>
            {canExceptional ? <div className="exceptional-box"><div><strong>Exceptional Strength</strong><p>A qualifying warrior with Strength 18 receives a percentile result.</p></div><button className="gold-button" type="button" onClick={() => { const roll = rollDie(100); setExceptionalStrength(roll); log(`Exceptional Strength rolled: 18/${String(roll).padStart(2,"0")}.`); }}>{exceptionalStrength === null ? "Roll d100" : `18/${String(exceptionalStrength).padStart(2,"0")}`}</button></div> : null}
          </section>

          <section className="forge-panel">
            <div className="section-heading"><div><p className="section-kicker">III. ANCESTRY</p><h2>Choose a people</h2></div></div>
            <div className="choice-grid race-grid">{RACES.map((item) => <button type="button" className={`choice-card ${raceId === item.id ? "selected" : ""}`} key={item.id} onClick={() => chooseRace(item.id)}><span className="choice-title">{item.name}</span><span className="choice-copy">{item.summary}</span><span className="choice-meta">{Object.keys(item.adjustments).length === 0 ? "No ability adjustment" : Object.entries(item.adjustments).map(([key,value]) => `${key.toUpperCase()} ${signed(value)}`).join(" · ")}</span></button>)}</div>
          </section>

          <section className="forge-panel">
            <div className="section-heading"><div><p className="section-kicker">IV. CLASS PATH</p><h2>Single or multi-class</h2></div><span className="slot-badge">{isMulticlass ? `${classIds.length} classes` : "single class"}</span></div>
            <div className="path-list">
              {race.availableClasses.map((id) => { const c = classById(id); const qualified = qualifiesForClass(finalScores,id); return <button type="button" key={id} className={`path-card ${classIds.length===1 && classIds[0]===id ? "selected" : ""} ${!qualified ? "unqualified" : ""}`} onClick={() => choosePath([id])}><span><strong>{c.name}</strong><small>{c.group}</small></span><em>{qualified ? "QUALIFIES" : "BELOW MINIMUM"}</em></button>; })}
              {race.multiclass.map((ids) => { const qualified = ids.every((id) => qualifiesForClass(finalScores,id)); const selected = classIds.length===ids.length && ids.every((id,i)=>id===classIds[i]); return <button type="button" key={ids.join('-')} className={`path-card multiclass ${selected ? "selected" : ""} ${!qualified ? "unqualified" : ""}`} onClick={() => choosePath(ids)}><span><strong>{classPathLabel(ids)}</strong><small>Multi-class path</small></span><em>{qualified ? "QUALIFIES" : "CHECK SCORES"}</em></button>; })}
            </div>
            {raceId === "human" ? <p className="rule-note">Humans begin with one class. Dual-classing is a later advancement decision, so it will belong to the progression engine rather than level-1 creation.</p> : null}
          </section>

          <section className="forge-panel">
            <div className="section-heading"><div><p className="section-kicker">V. ETHOS</p><h2>Alignment</h2></div>{mode === "guided" ? <span className="auto-mark">AUTO-MATCHED</span> : null}</div>
            <div className="alignment-grid">{ALIGNMENTS.map((item) => { const permitted = classes.every((c) => !c.allowedAlignments || c.allowedAlignments.includes(item)); return <button type="button" key={item} disabled={!permitted} onClick={() => { setAlignment(item); log(`${item} alignment chosen.`); }} className={alignment === item ? "selected" : ""}>{item}</button>; })}</div>
          </section>

          <section className="forge-panel stage-two">
            <div className="section-heading"><div><p className="section-kicker">VI. TRAINING</p><h2>Proficiencies</h2></div><button className="ghost-button" type="button" onClick={() => { const ws = autoWeapons(classIds,weaponSlots); setWeaponProfs(ws); setNonWeaponProfs(NON_WEAPON_PROFICIENCIES.slice(0,nonWeaponSlots)); log("Training choices were filled automatically."); }}>Auto-fill training</button></div>
            <div className="training-columns">
              <div><h3>Weapon proficiencies <span>{weaponProfs.length}/{weaponSlots}</span></h3><div className="chip-grid">{allowedWeapons.map((w) => <button type="button" key={w.id} onClick={() => toggleWeapon(w.id)} className={weaponProfs.includes(w.id) ? "selected" : ""}>{w.name}<small>{w.damage}</small></button>)}</div></div>
              <div><h3>Non-weapon proficiencies <span>{nonWeaponProfs.length}/{nonWeaponSlots}</span></h3><div className="chip-grid">{NON_WEAPON_PROFICIENCIES.map((p) => <button type="button" key={p} onClick={() => toggleNwp(p)} className={nonWeaponProfs.includes(p) ? "selected" : ""}>{p}</button>)}</div></div>
            </div>
          </section>

          <section className="forge-panel stage-two">
            <div className="section-heading"><div><p className="section-kicker">VII. VITALS & PURSE</p><h2>The uncertain parts</h2></div><button className="gold-button" type="button" onClick={() => completeDerived(classIds,finalScores)}>Roll HP & gold</button></div>
            <div className="big-rolls">
              <div><span>HIT POINTS</span><strong>{hp ?? "—"}</strong><small>{isMulticlass ? "Averaged class hit-die results" : `1d${primaryClass.hitDie} + CON adjustment`}</small></div>
              <div><span>STARTING FUNDS</span><strong>{startingGold ?? "—"}<em> gp</em></strong><small>{primaryClass.group} starting purse</small></div>
              <div><span>REMAINING</span><strong>{goldRemaining.toFixed(1)}<em> gp</em></strong><small>{spent.toFixed(1)} gp equipped</small></div>
            </div>
          </section>

          <section className="forge-panel stage-two">
            <div className="section-heading"><div><p className="section-kicker">VIII. EQUIPMENT</p><h2>Prepare for the road</h2></div><button className="ghost-button" type="button" onClick={() => buildAutoKit(classIds,startingGold ?? 0)}>Rebuild suggested kit</button></div>
            <div className="equipment-grid">
              <div><label>Armour</label><select value={armorId} onChange={(e) => setArmorId(e.target.value as ArmorId)}>{allowedArmor.map((a) => <option key={a.id} value={a.id}>{a.name} — AC {a.ac} — {a.cost} gp</option>)}</select></div>
              <div><label>Shield</label><button className={`wide-choice ${shield ? "selected" : ""}`} type="button" disabled={!shieldAllowed} onClick={() => setShield((v)=>!v)}>{shieldAllowed ? shield ? `Equipped — ${SHIELD_COST} gp` : `Add shield — ${SHIELD_COST} gp` : "Not permitted by this class path"}</button></div>
            </div>
            <h3 className="subhead">General gear</h3>
            <div className="gear-grid">{GENERAL_GEAR.map((item) => <button type="button" key={item.id} className={gear.includes(item.id) ? "selected" : ""} onClick={() => toggleGear(item.id)}><span>{item.name}</span><small>{item.cost} gp</small></button>)}</div>
            <p className="rule-note">Weapons selected as proficiencies are provisionally purchased as starting weapons so the equipment budget stays live. Ammunition and specialist class kits will be added with the inventory engine.</p>
          </section>
        </div>

        <aside className="sheet-preview" aria-live="polite">
          <div className="sheet-heading"><div><p className="section-kicker">LIVE CHARACTER RECORD</p><h2>{name.trim() || "Unnamed Adventurer"}</h2><p>{race.name} · {classPathLabel(classIds)} · {alignment}</p></div><span className={`status-seal ${ready ? "ready" : "incomplete"}`}>{ready ? "READY" : "FORMING"}</span></div>
          <div className="combat-banner"><div><span>HP</span><strong>{hp ?? "—"}</strong></div><div><span>AC</span><strong>{ac}</strong></div><div><span>THAC0</span><strong>{thac0}</strong></div><div><span>GP</span><strong>{goldRemaining.toFixed(1)}</strong></div></div>
          <div className="mini-stats">{ABILITIES.map((ability) => <div key={ability.id}><span>{ability.short}</span><strong>{finalScores[ability.id]}{ability.id === "str" && exceptionalStrength !== null ? `/${String(exceptionalStrength).padStart(2,"0")}` : ""}</strong></div>)}</div>
          <div className="record-row"><span>Class path</span><strong>{classPathLabel(classIds)}</strong></div>
          <div className="record-row"><span>Armour</span><strong>{armor.name}{shield ? " + shield" : ""}</strong></div>
          <div className="record-row"><span>DEX defence</span><strong>{signed(dexAc)}</strong></div>
          <div className="record-row"><span>Weapon training</span><strong>{weaponProfs.length}/{weaponSlots}</strong></div>
          <div className="record-row"><span>Other training</span><strong>{nonWeaponProfs.length}/{nonWeaponSlots}</strong></div>
          <div className="character-reading"><span>THE FORGE READS</span><p>{personality} As a {classPathLabel(classIds)}, this suggests a {strongest.id === "str" || strongest.id === "con" ? "physical" : strongest.id === "int" || strongest.id === "wis" ? "thoughtful" : "nimble and social"} approach to early adventures.</p></div>
          {warnings.length > 0 ? <div className="warning-list">{warnings.map((warning) => <p key={warning}>{warning}</p>)}</div> : <div className="success-note">The current level-1 record is mechanically coherent and within its starting purse.</div>}
          <button className="primary-button" type="button" disabled={!ready} onClick={() => log("Character record sealed. Ready for the first adventure state." )}>Seal character record</button>
          <div className="event-history"><span>RECENT FORGE EVENTS</span>{eventLog.slice(0,4).map((event,i) => <p key={`${event}-${i}`}>{event}</p>)}</div>
        </aside>
      </div>
    </main>
  );
}
