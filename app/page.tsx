"use client";

import { useMemo, useState } from "react";
import {
  ABILITIES,
  ALIGNMENTS,
  ARMOR,
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

const BASE_TENS: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
const SHIELD_COST = 10;

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(count: number, sides: number) {
  return Array.from({ length: count }, () => rollDie(sides));
}

function roll3d6() {
  return rollDice(3, 6).reduce((a, b) => a + b, 0);
}

function roll4d6DropLowest() {
  const dice = rollDice(4, 6).sort((a, b) => a - b);
  return dice[1] + dice[2] + dice[3];
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function classPathLabel(ids: ClassId[]) {
  return ids.length ? ids.map((id) => classById(id).name).join(" / ") : "Not selected";
}

export default function CharacterForge() {
  const [name, setName] = useState("");
  const [rollMethod, setRollMethod] = useState<RollMethod>("classic");
  const [baseScores, setBaseScores] = useState<AbilityScores>(BASE_TENS);
  const [scoresGenerated, setScoresGenerated] = useState(false);
  const [raceId, setRaceId] = useState<RaceId | null>(null);
  const [classIds, setClassIds] = useState<ClassId[]>([]);
  const [alignment, setAlignment] = useState<string>("");
  const [exceptionalStrength, setExceptionalStrength] = useState<number | null>(null);
  const [hp, setHp] = useState<number | null>(null);
  const [startingGold, setStartingGold] = useState<number | null>(null);
  const [weaponProfs, setWeaponProfs] = useState<WeaponId[]>([]);
  const [nonWeaponProfs, setNonWeaponProfs] = useState<string[]>([]);
  const [armorId, setArmorId] = useState<ArmorId>("none");
  const [shield, setShield] = useState(false);
  const [gear, setGear] = useState<string[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const race = raceId ? raceById(raceId) : null;
  const finalScores = useMemo(
    () => (scoresGenerated && raceId ? applyRaceAdjustments(baseScores, raceId) : baseScores),
    [baseScores, raceId, scoresGenerated],
  );
  const classes = classIds.map(classById);
  const primaryClass = classes[0] ?? null;
  const isMulticlass = classIds.length > 1;
  const classesQualified = scoresGenerated && classIds.length > 0 && classIds.every((id) => qualifiesForClass(finalScores, id));
  const alignmentAllowed = alignment !== "" && classes.length > 0 && classes.every((c) => !c.allowedAlignments || c.allowedAlignments.includes(alignment));
  const raceAllowsPath = Boolean(
    race && classIds.length > 0 && (
      classIds.length === 1
        ? race.availableClasses.includes(classIds[0])
        : race.multiclass.some((path) => path.length === classIds.length && path.every((id, i) => id === classIds[i]))
    ),
  );
  const canExceptional = scoresGenerated && classes.some((c) => c.exceptionalStrength) && finalScores.str === 18;
  const weaponSlots = classes.length ? Math.min(...classes.map((c) => c.weaponSlots)) : 0;
  const nonWeaponSlots = classes.length ? Math.max(...classes.map((c) => c.nonWeaponSlots)) : 0;
  const allowedWeapons = classes.length
    ? WEAPONS.filter((weapon) => classIds.every((id) => classById(id).allowedWeapons.includes(weapon.id)))
    : [];
  const allowedArmor = classes.length
    ? ARMOR.filter((armor) => classIds.every((id) => classById(id).allowedArmor.includes(armor.id)))
    : [ARMOR[0]];
  const shieldAllowed = classes.length > 0 && classes.every((c) => c.shield);
  const armor = ARMOR.find((item) => item.id === armorId) ?? ARMOR[0];
  const dexAc = scoresGenerated ? dexterityAcAdjustment(finalScores.dex) : 0;
  const ac = scoresGenerated && classes.length ? Math.max(-10, armor.ac + dexAc - (shield ? 1 : 0)) : null;
  const thac0 = classes.length ? 20 : null;

  const spent = useMemo(() => {
    const weaponCost = weaponProfs.reduce((sum, id) => sum + (WEAPONS.find((w) => w.id === id)?.cost ?? 0), 0);
    const gearCost = gear.reduce((sum, id) => sum + (GENERAL_GEAR.find((g) => g.id === id)?.cost ?? 0), 0);
    return weaponCost + armor.cost + (shield ? SHIELD_COST : 0) + gearCost;
  }, [weaponProfs, armor.cost, shield, gear]);

  const goldRemaining = startingGold === null ? null : startingGold - spent;
  const strongest = scoresGenerated
    ? [...ABILITIES].sort((a, b) => finalScores[b.id] - finalScores[a.id])[0]
    : null;
  const weakest = scoresGenerated
    ? [...ABILITIES].sort((a, b) => finalScores[a.id] - finalScores[b.id])[0]
    : null;

  function log(text: string) {
    setEventLog((current) => [text, ...current].slice(0, 6));
  }

  function clearAfterAbilityChange() {
    setClassIds([]);
    setAlignment("");
    setExceptionalStrength(null);
    setHp(null);
    setStartingGold(null);
    setWeaponProfs([]);
    setNonWeaponProfs([]);
    setArmorId("none");
    setShield(false);
    setGear([]);
  }

  function rollAbilities() {
    if (rollMethod === "manual") return;
    const roller = rollMethod === "classic" ? roll3d6 : roll4d6DropLowest;
    setBaseScores({
      str: roller(), dex: roller(), con: roller(), int: roller(), wis: roller(), cha: roller(),
    });
    setScoresGenerated(true);
    clearAfterAbilityChange();
    log(`You rolled all six abilities using ${rollMethod === "classic" ? "3d6 in order" : "4d6, discard lowest"}.`);
  }

  function chooseRollMethod(method: RollMethod) {
    setRollMethod(method);
    if (method === "manual") {
      setBaseScores(BASE_TENS);
      setScoresGenerated(true);
      clearAfterAbilityChange();
      log("Manual ability assignment selected. Enter each score yourself.");
    } else {
      setScoresGenerated(false);
      clearAfterAbilityChange();
      log(`${method === "classic" ? "3d6 in order" : "4d6, discard lowest"} selected. Press Roll abilities when ready.`);
    }
  }

  function changeScore(key: AbilityKey, value: string) {
    const parsed = Number.parseInt(value, 10);
    const safe = Number.isFinite(parsed) ? Math.max(3, Math.min(18, parsed)) : 3;
    setBaseScores((current) => ({ ...current, [key]: safe }));
    setScoresGenerated(true);
    clearAfterAbilityChange();
  }

  function chooseRace(id: RaceId) {
    setRaceId(id);
    setClassIds([]);
    setAlignment("");
    setExceptionalStrength(null);
    setHp(null);
    setStartingGold(null);
    setWeaponProfs([]);
    setNonWeaponProfs([]);
    setArmorId("none");
    setShield(false);
    setGear([]);
    log(`You chose ${raceById(id).name}. Class paths and derived ability scores have been refreshed.`);
  }

  function choosePath(ids: ClassId[]) {
    setClassIds(ids);
    setAlignment("");
    setExceptionalStrength(null);
    setHp(null);
    setStartingGold(null);
    setWeaponProfs([]);
    setNonWeaponProfs([]);
    setArmorId("none");
    setShield(false);
    setGear([]);
    log(`You chose ${classPathLabel(ids)}. Dependent rolls and training choices are now waiting for you.`);
  }

  function rollExceptionalStrength() {
    const result = rollDie(100);
    setExceptionalStrength(result);
    log(`You rolled exceptional Strength: 18/${String(result).padStart(2, "0")}.`);
  }

  function rollHp() {
    if (!classes.length) return;
    const results = classes.map((characterClass) =>
      Math.max(1, rollDie(characterClass.hitDie) + constitutionHpBonus(finalScores.con, characterClass.group === "Warrior")),
    );
    const result = Math.max(1, Math.floor(results.reduce((a, b) => a + b, 0) / results.length));
    setHp(result);
    log(`You rolled starting hit points: ${result}.`);
  }

  function rollGold() {
    if (!primaryClass) return;
    const spec = startingGoldDice(primaryClass.group);
    const result = (rollDice(spec.count, spec.sides).reduce((a, b) => a + b, 0) + spec.bonus) * spec.multiplier;
    setStartingGold(result);
    setArmorId("none");
    setShield(false);
    setGear([]);
    setWeaponProfs([]);
    log(`You rolled starting funds: ${result} gp.`);
  }

  function toggleWeapon(id: WeaponId) {
    setWeaponProfs((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < weaponSlots
          ? [...current, id]
          : current,
    );
  }

  function toggleNwp(name: string) {
    setNonWeaponProfs((current) =>
      current.includes(name)
        ? current.filter((x) => x !== name)
        : current.length < nonWeaponSlots
          ? [...current, name]
          : current,
    );
  }

  function toggleGear(id: string) {
    setGear((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  const warnings = [
    !scoresGenerated ? "Ability scores have not been rolled or assigned yet." : null,
    !race ? "Choose an ancestry." : null,
    race && classIds.length === 0 ? "Choose a class path." : null,
    classIds.length > 0 && !raceAllowsPath ? `${classPathLabel(classIds)} is not available to this ancestry.` : null,
    classIds.length > 0 && !classesQualified ? `The current abilities do not meet every class minimum for ${classPathLabel(classIds)}.` : null,
    classes.length > 0 && !alignment ? "Choose an alignment." : null,
    alignment && !alignmentAllowed ? `${alignment} conflicts with the selected class path.` : null,
    canExceptional && exceptionalStrength === null ? "Roll exceptional Strength before sealing the character." : null,
    classes.length > 0 && hp === null ? "Roll starting hit points." : null,
    classes.length > 0 && startingGold === null ? "Roll starting funds before buying equipment." : null,
    goldRemaining !== null && goldRemaining < 0 ? `Equipment exceeds starting funds by ${Math.abs(goldRemaining).toFixed(1)} gp.` : null,
  ].filter(Boolean) as string[];

  const ready = Boolean(name.trim()) && warnings.length === 0;

  return (
    <main className="forge-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">OLD SCHOOL INTERACTIVE RPG</p>
          <h1>Character Forge</h1>
          <p className="hero-copy">Every roll and every rules choice belongs to the player. The forge reacts, calculates and explains — but it never decides for you.</p>
        </div>
        <div className="step-rune" aria-label="Character creation">
          <span>01</span>
          <small>FORGE</small>
        </div>
      </header>

      <div className="activity-strip" aria-live="polite">
        <strong>FORGE ACTIVITY</strong>
        <span>{eventLog[0] ?? "Choose how you want to create your adventurer."}</span>
      </div>

      <div className="forge-layout">
        <div className="forge-grid">
          <section className="forge-panel origin-panel">
            <div className="section-heading"><div><p className="section-kicker">I. ORIGIN</p><h2>Name your adventurer</h2></div></div>
            <label className="field-label" htmlFor="character-name">Character name</label>
            <input id="character-name" className="text-field" value={name} onChange={(e) => setName(e.target.value.slice(0, 32))} placeholder="Enter a name" />
            <p className="reactive-copy">Names are never generated automatically. This is your character from the first decision.</p>
          </section>

          <section className="forge-panel ability-panel">
            <div className="section-heading split-heading">
              <div><p className="section-kicker">II. ABILITIES</p><h2>Choose a method, then roll</h2></div>
              {rollMethod !== "manual" ? <button className="gold-button dice-button" type="button" onClick={rollAbilities}>✦ Roll abilities</button> : null}
            </div>
            <div className="method-tabs" role="group" aria-label="Ability generation method">
              <button className={rollMethod === "classic" ? "active" : ""} type="button" onClick={() => chooseRollMethod("classic")}><span>3d6 in order</span><small>Severe & traditional</small></button>
              <button className={rollMethod === "heroic" ? "active" : ""} type="button" onClick={() => chooseRollMethod("heroic")}><span>4d6 drop lowest</span><small>Stronger adventurers</small></button>
              <button className={rollMethod === "manual" ? "active" : ""} type="button" onClick={() => chooseRollMethod("manual")}><span>Assign manually</span><small>Direct control</small></button>
            </div>
            <div className="ability-grid">
              {ABILITIES.map((ability) => {
                const adjustment = race?.adjustments[ability.id] ?? 0;
                const shown = scoresGenerated ? finalScores[ability.id] : null;
                return <div className="ability-card" key={ability.id}>
                  <span className="ability-short">{ability.short}</span>
                  {rollMethod === "manual" ? (
                    <input aria-label={ability.name} className="ability-input" type="number" min={3} max={18} value={baseScores[ability.id]} onChange={(e) => changeScore(ability.id, e.target.value)} />
                  ) : (
                    <strong>{shown ?? "—"}{ability.id === "str" && exceptionalStrength !== null ? <small>/{String(exceptionalStrength).padStart(2, "0")}</small> : null}</strong>
                  )}
                  <span className="ability-name">{ability.name}</span>
                  {race && adjustment !== 0 ? <span className="race-adjustment">Ancestry {signed(adjustment)}</span> : <span className="race-adjustment quiet">{race ? "Unmodified" : "Choose ancestry"}</span>}
                </div>;
              })}
            </div>
            {canExceptional ? <div className="exceptional-box"><div><strong>Exceptional Strength</strong><p>Your selected class path qualifies. The percentile is not rolled until you press the button.</p></div><button className="gold-button" type="button" onClick={rollExceptionalStrength}>{exceptionalStrength === null ? "Roll d100" : `18/${String(exceptionalStrength).padStart(2, "0")}`}</button></div> : null}
          </section>

          <section className="forge-panel">
            <div className="section-heading"><div><p className="section-kicker">III. ANCESTRY</p><h2>Choose a people</h2></div></div>
            <div className="choice-grid race-grid">{RACES.map((item) => <button type="button" className={`choice-card ${raceId === item.id ? "selected" : ""}`} key={item.id} onClick={() => chooseRace(item.id)}><span className="choice-title">{item.name}</span><span className="choice-copy">{item.summary}</span><span className="choice-meta">{Object.keys(item.adjustments).length === 0 ? "No ability adjustment" : Object.entries(item.adjustments).map(([key, value]) => `${key.toUpperCase()} ${signed(value)}`).join(" · ")}</span></button>)}</div>
          </section>

          <section className="forge-panel">
            <div className="section-heading"><div><p className="section-kicker">IV. CLASS PATH</p><h2>Choose your vocation</h2></div>{classIds.length ? <span className="slot-badge">{isMulticlass ? `${classIds.length} classes` : "single class"}</span> : null}</div>
            {!race ? <p className="rule-note">Choose an ancestry first. The forge will then show every permitted single- and multi-class path.</p> : !scoresGenerated ? <p className="rule-note">Roll or assign the six abilities before selecting a class path.</p> : <div className="path-list">
              {race.availableClasses.map((id) => { const c = classById(id); const qualified = qualifiesForClass(finalScores, id); return <button type="button" key={id} className={`path-card ${classIds.length === 1 && classIds[0] === id ? "selected" : ""} ${!qualified ? "unqualified" : ""}`} disabled={!qualified} onClick={() => choosePath([id])}><span><strong>{c.name}</strong><small>{c.group}</small></span><em>{qualified ? "AVAILABLE" : "BELOW MINIMUM"}</em></button>; })}
              {race.multiclass.map((ids) => { const qualified = ids.every((id) => qualifiesForClass(finalScores, id)); const selected = classIds.length === ids.length && ids.every((id, i) => id === classIds[i]); return <button type="button" key={ids.join("-")} className={`path-card multiclass ${selected ? "selected" : ""} ${!qualified ? "unqualified" : ""}`} disabled={!qualified} onClick={() => choosePath(ids)}><span><strong>{classPathLabel(ids)}</strong><small>Multi-class path</small></span><em>{qualified ? "AVAILABLE" : "CHECK SCORES"}</em></button>; })}
            </div>}
            {raceId === "human" ? <p className="rule-note">Humans begin with one class. Dual-classing is reserved for later advancement and will be handled by the progression engine.</p> : null}
          </section>

          <section className="forge-panel">
            <div className="section-heading"><div><p className="section-kicker">V. ETHOS</p><h2>Choose an alignment</h2></div></div>
            {classes.length === 0 ? <p className="rule-note">Choose a class path first. Illegal alignments will then be disabled, but none will be selected for you.</p> : <div className="alignment-grid">{ALIGNMENTS.map((item) => { const permitted = classes.every((c) => !c.allowedAlignments || c.allowedAlignments.includes(item)); return <button type="button" key={item} disabled={!permitted} onClick={() => { setAlignment(item); log(`You chose ${item}.`); }} className={alignment === item ? "selected" : ""}>{item}</button>; })}</div>}
          </section>

          <section className="forge-panel stage-two">
            <div className="section-heading"><div><p className="section-kicker">VI. TRAINING</p><h2>Choose proficiencies</h2></div></div>
            {classes.length === 0 ? <p className="rule-note">Choose a class path before selecting training.</p> : <div className="training-columns">
              <div><h3>Weapon proficiencies <span>{weaponProfs.length}/{weaponSlots}</span></h3><div className="chip-grid">{allowedWeapons.map((w) => <button type="button" key={w.id} onClick={() => toggleWeapon(w.id)} className={weaponProfs.includes(w.id) ? "selected" : ""}>{w.name}<small>{w.damage}</small></button>)}</div></div>
              <div><h3>Non-weapon proficiencies <span>{nonWeaponProfs.length}/{nonWeaponSlots}</span></h3><div className="chip-grid">{NON_WEAPON_PROFICIENCIES.map((p) => <button type="button" key={p} onClick={() => toggleNwp(p)} className={nonWeaponProfs.includes(p) ? "selected" : ""}>{p}</button>)}</div></div>
            </div>}
          </section>

          <section className="forge-panel stage-two">
            <div className="section-heading"><div><p className="section-kicker">VII. VITALS & PURSE</p><h2>Make each roll yourself</h2></div></div>
            <div className="big-rolls">
              <div><span>HIT POINTS</span><strong>{hp ?? "—"}</strong><small>{primaryClass ? (isMulticlass ? "Averaged class hit-die results" : `1d${primaryClass.hitDie} + CON adjustment`) : "Choose class first"}</small>{classes.length ? <button className="ghost-button" type="button" onClick={rollHp}>Roll HP</button> : null}</div>
              <div><span>STARTING FUNDS</span><strong>{startingGold ?? "—"}{startingGold !== null ? <em> gp</em> : null}</strong><small>{primaryClass ? `${primaryClass.group} starting purse` : "Choose class first"}</small>{primaryClass ? <button className="ghost-button" type="button" onClick={rollGold}>Roll gold</button> : null}</div>
              <div><span>REMAINING</span><strong>{goldRemaining === null ? "—" : goldRemaining.toFixed(1)}{goldRemaining !== null ? <em> gp</em> : null}</strong><small>{startingGold === null ? "Roll starting funds first" : `${spent.toFixed(1)} gp equipped`}</small></div>
            </div>
          </section>

          <section className="forge-panel stage-two">
            <div className="section-heading"><div><p className="section-kicker">VIII. EQUIPMENT</p><h2>Choose every item</h2></div></div>
            {classes.length === 0 ? <p className="rule-note">Choose a class path first.</p> : startingGold === null ? <p className="rule-note">Roll starting funds before purchasing equipment.</p> : <>
              <div className="equipment-grid">
                <div><label>Armour</label><select value={armorId} onChange={(e) => setArmorId(e.target.value as ArmorId)}>{allowedArmor.map((a) => <option key={a.id} value={a.id}>{a.name} — AC {a.ac} — {a.cost} gp</option>)}</select></div>
                <div><label>Shield</label><button className={`wide-choice ${shield ? "selected" : ""}`} type="button" disabled={!shieldAllowed} onClick={() => setShield((value) => !value)}>{shieldAllowed ? shield ? `Equipped — ${SHIELD_COST} gp` : `Add shield — ${SHIELD_COST} gp` : "Not permitted by this class path"}</button></div>
              </div>
              <h3 className="subhead">General gear</h3>
              <div className="gear-grid">{GENERAL_GEAR.map((item) => <button type="button" key={item.id} className={gear.includes(item.id) ? "selected" : ""} onClick={() => toggleGear(item.id)}><span>{item.name}</span><small>{item.cost} gp</small></button>)}</div>
              <p className="rule-note">Selecting a weapon proficiency currently also places one copy of that weapon in the provisional starting equipment budget. Ammunition and specialist class kits come next.</p>
            </>}
          </section>
        </div>

        <aside className="sheet-preview" aria-live="polite">
          <div className="sheet-heading"><div><p className="section-kicker">LIVE CHARACTER RECORD</p><h2>{name.trim() || "Unnamed Adventurer"}</h2><p>{race?.name ?? "Ancestry unchosen"} · {classPathLabel(classIds)} · {alignment || "Alignment unchosen"}</p></div><span className={`status-seal ${ready ? "ready" : "incomplete"}`}>{ready ? "READY" : "FORMING"}</span></div>
          <div className="combat-banner"><div><span>HP</span><strong>{hp ?? "—"}</strong></div><div><span>AC</span><strong>{ac ?? "—"}</strong></div><div><span>THAC0</span><strong>{thac0 ?? "—"}</strong></div><div><span>GP</span><strong>{goldRemaining === null ? "—" : goldRemaining.toFixed(1)}</strong></div></div>
          <div className="mini-stats">{ABILITIES.map((ability) => <div key={ability.id}><span>{ability.short}</span><strong>{scoresGenerated ? finalScores[ability.id] : "—"}{ability.id === "str" && exceptionalStrength !== null ? `/${String(exceptionalStrength).padStart(2, "0")}` : ""}</strong></div>)}</div>
          <div className="record-row"><span>Class path</span><strong>{classPathLabel(classIds)}</strong></div>
          <div className="record-row"><span>Armour</span><strong>{classes.length ? `${armor.name}${shield ? " + shield" : ""}` : "—"}</strong></div>
          <div className="record-row"><span>DEX defence</span><strong>{scoresGenerated ? signed(dexAc) : "—"}</strong></div>
          <div className="record-row"><span>Weapon training</span><strong>{classes.length ? `${weaponProfs.length}/${weaponSlots}` : "—"}</strong></div>
          <div className="record-row"><span>Other training</span><strong>{classes.length ? `${nonWeaponProfs.length}/${nonWeaponSlots}` : "—"}</strong></div>
          <div className="character-reading"><span>THE FORGE READS</span><p>{strongest && weakest ? `${strongest.name} is currently the strongest natural ability, while ${weakest.name} is the weakest. This is descriptive only; the forge will not choose a class or action from it.` : "Once your abilities are rolled or assigned, the forge will describe their mechanical consequences without choosing anything for you."}</p></div>
          {warnings.length > 0 ? <div className="warning-list">{warnings.map((warning) => <p key={warning}>{warning}</p>)}</div> : <div className="success-note">Every required roll and selection has been made by the player, and the current level-1 record is mechanically coherent.</div>}
          <button className="primary-button" type="button" disabled={!ready} onClick={() => log("You sealed the character record. No remaining creation decision was made automatically.")}>Seal character record</button>
          <div className="event-history"><span>RECENT FORGE EVENTS</span>{eventLog.slice(0, 4).map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}</div>
        </aside>
      </div>
    </main>
  );
}
