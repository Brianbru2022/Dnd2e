"use client";

import { useMemo, useState } from "react";
import {
  ABILITIES,
  ALIGNMENTS,
  CLASSES,
  EMPTY_SCORES,
  RACES,
  type AbilityKey,
  type AbilityScores,
  type ClassId,
  type RaceId,
  applyRaceAdjustments,
  qualifiesForClass,
} from "./rules";

type RollMethod = "classic" | "heroic" | "manual";

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function roll3d6() {
  return rollDie(6) + rollDie(6) + rollDie(6);
}

function roll4d6DropLowest() {
  const dice = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
  return dice[1] + dice[2] + dice[3];
}

function generateScores(method: RollMethod): AbilityScores {
  if (method === "manual") return { ...EMPTY_SCORES };
  const roller = method === "classic" ? roll3d6 : roll4d6DropLowest;
  return {
    str: roller(),
    dex: roller(),
    con: roller(),
    int: roller(),
    wis: roller(),
    cha: roller(),
  };
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export default function CharacterForge() {
  const [name, setName] = useState("");
  const [rollMethod, setRollMethod] = useState<RollMethod>("classic");
  const [baseScores, setBaseScores] = useState<AbilityScores>(() => generateScores("classic"));
  const [raceId, setRaceId] = useState<RaceId>("human");
  const [classId, setClassId] = useState<ClassId>("fighter");
  const [alignment, setAlignment] = useState<string>("Neutral Good");
  const [exceptionalStrength, setExceptionalStrength] = useState<number | null>(null);

  const race = RACES.find((item) => item.id === raceId)!;
  const characterClass = CLASSES.find((item) => item.id === classId)!;
  const finalScores = useMemo(() => applyRaceAdjustments(baseScores, raceId), [baseScores, raceId]);
  const classQualified = qualifiesForClass(finalScores, classId);
  const raceAllowsClass = race.availableClasses.includes(classId);
  const alignmentAllowed = !characterClass.allowedAlignments || characterClass.allowedAlignments.includes(alignment);
  const canRollExceptional = characterClass.exceptionalStrength && finalScores.str === 18;

  function reroll() {
    const next = generateScores(rollMethod);
    setBaseScores(next);
    setExceptionalStrength(null);
  }

  function changeScore(key: AbilityKey, value: string) {
    const parsed = Number.parseInt(value, 10);
    const safe = Number.isFinite(parsed) ? Math.max(3, Math.min(18, parsed)) : 3;
    setBaseScores((current) => ({ ...current, [key]: safe }));
    if (key === "str") setExceptionalStrength(null);
  }

  function chooseRace(id: RaceId) {
    setRaceId(id);
    const selected = RACES.find((item) => item.id === id)!;
    if (!selected.availableClasses.includes(classId)) {
      setClassId(selected.availableClasses[0]);
    }
    setExceptionalStrength(null);
  }

  function chooseClass(id: ClassId) {
    setClassId(id);
    const selected = CLASSES.find((item) => item.id === id)!;
    if (selected.allowedAlignments && !selected.allowedAlignments.includes(alignment)) {
      setAlignment(selected.allowedAlignments[0]);
    }
    setExceptionalStrength(null);
  }

  function rollExceptionalStrength() {
    setExceptionalStrength(rollDie(100));
  }

  const warnings = [
    !raceAllowsClass ? `${race.name}s cannot select ${characterClass.name} in the current classic rules profile.` : null,
    !classQualified ? `Ability scores do not meet the minimum requirements for ${characterClass.name}.` : null,
    !alignmentAllowed ? `${characterClass.name} is incompatible with ${alignment} in the current classic rules profile.` : null,
  ].filter(Boolean) as string[];

  const ready = Boolean(name.trim()) && warnings.length === 0 && (!canRollExceptional || exceptionalStrength !== null);

  return (
    <main className="forge-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">OLD SCHOOL INTERACTIVE RPG</p>
          <h1>Character Forge</h1>
          <p className="hero-copy">
            Create a first-level adventurer using a deterministic, classic rules-inspired character model.
          </p>
        </div>
        <div className="step-rune" aria-label="Step one of six">
          <span>01</span>
          <small>OF 06</small>
        </div>
      </header>

      <div className="forge-grid">
        <section className="forge-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">I. ORIGIN</p>
              <h2>Name your adventurer</h2>
            </div>
          </div>
          <label className="field-label" htmlFor="character-name">Character name</label>
          <input
            id="character-name"
            className="text-field"
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 32))}
            placeholder="e.g. Kaelen Aerwyn"
          />
        </section>

        <section className="forge-panel">
          <div className="section-heading split-heading">
            <div>
              <p className="section-kicker">II. ABILITIES</p>
              <h2>Generate ability scores</h2>
            </div>
            {rollMethod !== "manual" && (
              <button className="ghost-button" type="button" onClick={reroll}>Roll again</button>
            )}
          </div>

          <div className="method-tabs" role="group" aria-label="Ability generation method">
            <button className={rollMethod === "classic" ? "active" : ""} type="button" onClick={() => { setRollMethod("classic"); setBaseScores(generateScores("classic")); setExceptionalStrength(null); }}>
              3d6 in order
              <small>Severe & traditional</small>
            </button>
            <button className={rollMethod === "heroic" ? "active" : ""} type="button" onClick={() => { setRollMethod("heroic"); setBaseScores(generateScores("heroic")); setExceptionalStrength(null); }}>
              4d6, drop lowest
              <small>Stronger adventurers</small>
            </button>
            <button className={rollMethod === "manual" ? "active" : ""} type="button" onClick={() => { setRollMethod("manual"); setBaseScores({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }); setExceptionalStrength(null); }}>
              Assign manually
              <small>For testing & custom play</small>
            </button>
          </div>

          <div className="ability-grid">
            {ABILITIES.map((ability) => {
              const adjustment = race.adjustments[ability.id] ?? 0;
              return (
                <div className="ability-card" key={ability.id}>
                  <span className="ability-short">{ability.short}</span>
                  {rollMethod === "manual" ? (
                    <input
                      aria-label={ability.name}
                      className="ability-input"
                      type="number"
                      min={3}
                      max={18}
                      value={baseScores[ability.id]}
                      onChange={(event) => changeScore(ability.id, event.target.value)}
                    />
                  ) : (
                    <strong>{finalScores[ability.id]}</strong>
                  )}
                  <span className="ability-name">{ability.name}</span>
                  {adjustment !== 0 && <span className="race-adjustment">Race {signed(adjustment)}</span>}
                  {rollMethod === "manual" && adjustment !== 0 && <span className="final-score">Final {finalScores[ability.id]}</span>}
                </div>
              );
            })}
          </div>

          {canRollExceptional && (
            <div className="exceptional-box">
              <div>
                <strong>Exceptional Strength</strong>
                <p>This warrior has Strength 18 and may receive an exceptional percentile score.</p>
              </div>
              <button className="gold-button" type="button" onClick={rollExceptionalStrength}>
                {exceptionalStrength === null ? "Roll d100" : `18/${String(exceptionalStrength).padStart(2, "0")}`}
              </button>
            </div>
          )}
        </section>

        <section className="forge-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">III. ANCESTRY</p>
              <h2>Choose a people</h2>
            </div>
          </div>
          <div className="choice-grid race-grid">
            {RACES.map((item) => (
              <button
                type="button"
                className={`choice-card ${raceId === item.id ? "selected" : ""}`}
                key={item.id}
                onClick={() => chooseRace(item.id)}
              >
                <span className="choice-title">{item.name}</span>
                <span className="choice-copy">{item.summary}</span>
                <span className="choice-meta">
                  {Object.keys(item.adjustments).length === 0
                    ? "No ability adjustment"
                    : Object.entries(item.adjustments).map(([key, value]) => `${key.toUpperCase()} ${signed(value)}`).join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="forge-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">IV. VOCATION</p>
              <h2>Choose a class</h2>
            </div>
          </div>
          <div className="choice-grid class-grid">
            {CLASSES.map((item) => {
              const available = race.availableClasses.includes(item.id);
              const qualified = qualifiesForClass(finalScores, item.id);
              return (
                <button
                  type="button"
                  className={`choice-card ${classId === item.id ? "selected" : ""} ${!available ? "disabled-choice" : ""}`}
                  key={item.id}
                  onClick={() => available && chooseClass(item.id)}
                  disabled={!available}
                >
                  <span className="choice-title-line">
                    <span className="choice-title">{item.name}</span>
                    <span className="class-group">{item.group}</span>
                  </span>
                  <span className="choice-copy">{item.description}</span>
                  <span className={`choice-meta ${qualified ? "qualified" : "not-qualified"}`}>
                    {!available ? `Unavailable to ${race.name}` : qualified ? "Requirements met" : "Requirements not met"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="forge-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">V. ETHOS</p>
              <h2>Choose an alignment</h2>
            </div>
          </div>
          <div className="alignment-grid">
            {ALIGNMENTS.map((item) => {
              const permitted = !characterClass.allowedAlignments || characterClass.allowedAlignments.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  disabled={!permitted}
                  onClick={() => setAlignment(item)}
                  className={alignment === item ? "selected" : ""}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="sheet-preview" aria-live="polite">
        <div className="sheet-heading">
          <div>
            <p className="section-kicker">LIVE CHARACTER RECORD</p>
            <h2>{name.trim() || "Unnamed Adventurer"}</h2>
            <p>{race.name} · {characterClass.name} · {alignment}</p>
          </div>
          <span className={`status-seal ${ready ? "ready" : "incomplete"}`}>{ready ? "READY" : "INCOMPLETE"}</span>
        </div>

        <div className="mini-stats">
          {ABILITIES.map((ability) => (
            <div key={ability.id}>
              <span>{ability.short}</span>
              <strong>
                {finalScores[ability.id]}
                {ability.id === "str" && exceptionalStrength !== null ? `/${String(exceptionalStrength).padStart(2, "0")}` : ""}
              </strong>
            </div>
          ))}
        </div>

        <div className="record-row">
          <span>Class group</span>
          <strong>{characterClass.group}</strong>
        </div>
        <div className="record-row">
          <span>Generation</span>
          <strong>{rollMethod === "classic" ? "3d6 in order" : rollMethod === "heroic" ? "4d6 drop lowest" : "Manual"}</strong>
        </div>
        <div className="record-row">
          <span>Level</span>
          <strong>1</strong>
        </div>

        {warnings.length > 0 ? (
          <div className="warning-list">
            {warnings.map((warning) => <p key={warning}>{warning}</p>)}
          </div>
        ) : (
          <div className="success-note">All current ancestry, class, ability and alignment gates are satisfied.</div>
        )}

        <button className="primary-button" type="button" disabled={!ready}>
          Continue to proficiencies →
        </button>
        <p className="footnote">The next stage will add weapon/non-weapon proficiencies, starting funds, equipment, hit points and derived combat values.</p>
      </aside>
    </main>
  );
}
