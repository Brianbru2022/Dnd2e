"use client";

import Image from "next/image";
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
type StageId = "name" | "abilities" | "ancestry" | "class" | "alignment" | "training" | "vitals" | "equipment" | "record";
type ManualScores = Record<AbilityKey, string>;

const SHIELD_COST = 10;
const EMPTY_SCORES: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
const EMPTY_MANUAL: ManualScores = { str: "", dex: "", con: "", int: "", wis: "", cha: "" };

const STAGES: { id: StageId; number: number; label: string; hint: string; icon: string }[] = [
  { id: "name", number: 1, label: "Name", hint: "Define who you are", icon: "/assets/forge/icons/icon-record.png" },
  { id: "abilities", number: 2, label: "Abilities", hint: "Roll your potential", icon: "/assets/forge/icons/icon-dice.png" },
  { id: "ancestry", number: 3, label: "Ancestry", hint: "Choose your heritage", icon: "/assets/forge/icons/icon-ancestry.png" },
  { id: "class", number: 4, label: "Class Path", hint: "Choose your calling", icon: "/assets/forge/icons/icon-class.png" },
  { id: "alignment", number: 5, label: "Alignment", hint: "Shape your nature", icon: "/assets/forge/icons/icon-alignment.png" },
  { id: "training", number: 6, label: "Training", hint: "Learn your skills", icon: "/assets/forge/icons/icon-training.png" },
  { id: "vitals", number: 7, label: "Vitals & Purse", hint: "Life and resources", icon: "/assets/forge/icons/icon-vitals.png" },
  { id: "equipment", number: 8, label: "Equipment", hint: "Gear for adventure", icon: "/assets/forge/icons/icon-equipment.png" },
  { id: "record", number: 9, label: "Final Record", hint: "Review your hero", icon: "/assets/forge/icons/icon-record.png" },
];

const RACE_ART: Record<RaceId, string> = {
  human: "/assets/forge/races/race-human.png",
  dwarf: "/assets/forge/races/race-dwarf.png",
  elf: "/assets/forge/races/race-elf.png",
  gnome: "/assets/forge/races/race-gnome.png",
  "half-elf": "/assets/forge/races/race-half-elf.png",
  halfling: "/assets/forge/races/race-halfling.png",
};

const CLASS_ART: Record<ClassId, string> = {
  fighter: "/assets/forge/classes/class-fighter.png",
  ranger: "/assets/forge/classes/class-ranger.png",
  paladin: "/assets/forge/classes/class-paladin.png",
  mage: "/assets/forge/classes/class-mage.png",
  illusionist: "/assets/forge/classes/class-illusionist.png",
  cleric: "/assets/forge/classes/class-cleric.png",
  druid: "/assets/forge/classes/class-druid.png",
  thief: "/assets/forge/classes/class-thief.png",
  bard: "/assets/forge/classes/class-bard.png",
};

const STAT_ART = {
  hp: "/assets/forge/icons/badge-hp.png",
  ac: "/assets/forge/icons/badge-ac.png",
  thac0: "/assets/forge/icons/badge-thac0.png",
  gold: "/assets/forge/icons/badge-gold.png",
};

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
  return ids.length ? ids.map((id) => classById(id).name).join(" / ") : "Unchosen";
}

function stageIndex(id: StageId) {
  return STAGES.findIndex((stage) => stage.id === id);
}

export default function CharacterForge() {
  const [stage, setStage] = useState<StageId>("name");
  const [name, setName] = useState("");
  const [rollMethod, setRollMethod] = useState<RollMethod | null>(null);
  const [baseScores, setBaseScores] = useState<AbilityScores>(EMPTY_SCORES);
  const [manualScores, setManualScores] = useState<ManualScores>(EMPTY_MANUAL);
  const [scoresGenerated, setScoresGenerated] = useState(false);
  const [raceId, setRaceId] = useState<RaceId | null>(null);
  const [classIds, setClassIds] = useState<ClassId[]>([]);
  const [alignment, setAlignment] = useState<string>("");
  const [exceptionalStrength, setExceptionalStrength] = useState<number | null>(null);
  const [hp, setHp] = useState<number | null>(null);
  const [startingGold, setStartingGold] = useState<number | null>(null);
  const [weaponProfs, setWeaponProfs] = useState<WeaponId[]>([]);
  const [nonWeaponProfs, setNonWeaponProfs] = useState<string[]>([]);
  const [armorId, setArmorId] = useState<ArmorId | null>(null);
  const [shield, setShield] = useState(false);
  const [gear, setGear] = useState<string[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [sealed, setSealed] = useState(false);

  const race = raceId ? raceById(raceId) : null;
  const finalScores = useMemo(
    () => (scoresGenerated && raceId ? applyRaceAdjustments(baseScores, raceId) : baseScores),
    [baseScores, raceId, scoresGenerated],
  );
  const classes = classIds.map(classById);
  const primaryClass = classes[0] ?? null;
  const isMulticlass = classIds.length > 1;
  const classesQualified = scoresGenerated && classIds.length > 0 && classIds.every((id) => qualifiesForClass(finalScores, id));
  const alignmentAllowed = alignment !== "" && classes.length > 0 && classes.every((item) => !item.allowedAlignments || item.allowedAlignments.includes(alignment));
  const raceAllowsPath = Boolean(
    race && classIds.length > 0 && (
      classIds.length === 1
        ? race.availableClasses.includes(classIds[0])
        : race.multiclass.some((path) => path.length === classIds.length && path.every((id, i) => id === classIds[i]))
    ),
  );
  const canExceptional = scoresGenerated && classes.some((item) => item.exceptionalStrength) && finalScores.str === 18;
  const weaponSlots = classes.length ? Math.min(...classes.map((item) => item.weaponSlots)) : 0;
  const nonWeaponSlots = classes.length ? Math.max(...classes.map((item) => item.nonWeaponSlots)) : 0;
  const allowedWeapons = classes.length
    ? WEAPONS.filter((weapon) => classIds.every((id) => classById(id).allowedWeapons.includes(weapon.id)))
    : [];
  const allowedArmor = classes.length
    ? ARMOR.filter((armor) => classIds.every((id) => classById(id).allowedArmor.includes(armor.id)))
    : [];
  const shieldAllowed = classes.length > 0 && classes.every((item) => item.shield);
  const armor = armorId ? ARMOR.find((item) => item.id === armorId) ?? null : null;
  const dexAc = scoresGenerated ? dexterityAcAdjustment(finalScores.dex) : 0;
  const ac = scoresGenerated && classes.length ? Math.max(-10, (armor?.ac ?? 10) + dexAc - (shield ? 1 : 0)) : null;
  const thac0 = classes.length ? 20 : null;

  const spent = useMemo(() => {
    const weaponCost = weaponProfs.reduce((sum, id) => sum + (WEAPONS.find((weapon) => weapon.id === id)?.cost ?? 0), 0);
    const gearCost = gear.reduce((sum, id) => sum + (GENERAL_GEAR.find((item) => item.id === id)?.cost ?? 0), 0);
    return weaponCost + (armor?.cost ?? 0) + (shield ? SHIELD_COST : 0) + gearCost;
  }, [weaponProfs, armor, shield, gear]);

  const goldRemaining = startingGold === null ? null : startingGold - spent;
  const trainingComplete = classes.length > 0 && weaponProfs.length === weaponSlots && nonWeaponProfs.length === nonWeaponSlots;
  const vitalsComplete = hp !== null && startingGold !== null && (!canExceptional || exceptionalStrength !== null);
  const equipmentComplete = startingGold !== null && armorId !== null && goldRemaining !== null && goldRemaining >= 0;

  function log(text: string) {
    setEventLog((current) => [text, ...current].slice(0, 5));
  }

  function clearAfterAbilityChange() {
    setClassIds([]);
    setAlignment("");
    setExceptionalStrength(null);
    setHp(null);
    setStartingGold(null);
    setWeaponProfs([]);
    setNonWeaponProfs([]);
    setArmorId(null);
    setShield(false);
    setGear([]);
    setSealed(false);
  }

  function chooseRollMethod(method: RollMethod) {
    setRollMethod(method);
    setScoresGenerated(false);
    setBaseScores(EMPTY_SCORES);
    setManualScores(EMPTY_MANUAL);
    clearAfterAbilityChange();
    log(`${method === "classic" ? "3d6 in order" : method === "heroic" ? "4d6 drop lowest" : "Manual assignment"} selected.`);
  }

  function rollAbilities() {
    if (!rollMethod || rollMethod === "manual") return;
    const roller = rollMethod === "classic" ? roll3d6 : roll4d6DropLowest;
    setBaseScores({ str: roller(), dex: roller(), con: roller(), int: roller(), wis: roller(), cha: roller() });
    setScoresGenerated(true);
    clearAfterAbilityChange();
    log("The dice have spoken. Your six abilities are set.");
  }

  function changeManualScore(key: AbilityKey, value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    const next = { ...manualScores, [key]: digits };
    setManualScores(next);
    const complete = ABILITIES.every((ability) => {
      const score = Number.parseInt(next[ability.id], 10);
      return Number.isFinite(score) && score >= 3 && score <= 18;
    });
    if (complete) {
      const converted = ABILITIES.reduce((scores, ability) => {
        scores[ability.id] = Number.parseInt(next[ability.id], 10);
        return scores;
      }, { ...EMPTY_SCORES });
      setBaseScores(converted);
      setScoresGenerated(true);
      clearAfterAbilityChange();
      log("All six manually assigned abilities are valid.");
    } else {
      setScoresGenerated(false);
    }
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
    setArmorId(null);
    setShield(false);
    setGear([]);
    setSealed(false);
    log(`${raceById(id).name} ancestry chosen.`);
  }

  function choosePath(ids: ClassId[]) {
    setClassIds(ids);
    setAlignment("");
    setExceptionalStrength(null);
    setHp(null);
    setStartingGold(null);
    setWeaponProfs([]);
    setNonWeaponProfs([]);
    setArmorId(null);
    setShield(false);
    setGear([]);
    setSealed(false);
    log(`${classPathLabel(ids)} chosen.`);
  }

  function rollExceptionalStrength() {
    const result = rollDie(100);
    setExceptionalStrength(result);
    log(`Exceptional Strength: 18/${String(result).padStart(2, "0")}.`);
  }

  function rollHp() {
    if (!classes.length) return;
    const results = classes.map((characterClass) =>
      Math.max(1, rollDie(characterClass.hitDie) + constitutionHpBonus(finalScores.con, characterClass.group === "Warrior")),
    );
    const result = Math.max(1, Math.floor(results.reduce((a, b) => a + b, 0) / results.length));
    setHp(result);
    log(`Starting hit points rolled: ${result}.`);
  }

  function rollGold() {
    if (!primaryClass) return;
    const spec = startingGoldDice(primaryClass.group);
    const result = (rollDice(spec.count, spec.sides).reduce((a, b) => a + b, 0) + spec.bonus) * spec.multiplier;
    setStartingGold(result);
    setArmorId(null);
    setShield(false);
    setGear([]);
    setWeaponProfs((current) => current);
    log(`Starting purse rolled: ${result} gp.`);
  }

  function toggleWeapon(id: WeaponId) {
    setWeaponProfs((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < weaponSlots
          ? [...current, id]
          : current,
    );
  }

  function toggleNwp(nameValue: string) {
    setNonWeaponProfs((current) =>
      current.includes(nameValue)
        ? current.filter((value) => value !== nameValue)
        : current.length < nonWeaponSlots
          ? [...current, nameValue]
          : current,
    );
  }

  function toggleGear(id: string) {
    setGear((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function canEnter(target: StageId) {
    const targetIndex = stageIndex(target);
    if (targetIndex === 0) return true;
    if (targetIndex >= 1 && !name.trim()) return false;
    if (targetIndex >= 2 && !scoresGenerated) return false;
    if (targetIndex >= 3 && !raceId) return false;
    if (targetIndex >= 4 && (!classIds.length || !classesQualified || !raceAllowsPath)) return false;
    if (targetIndex >= 5 && (!alignment || !alignmentAllowed)) return false;
    if (targetIndex >= 6 && !trainingComplete) return false;
    if (targetIndex >= 7 && !vitalsComplete) return false;
    if (targetIndex >= 8 && !equipmentComplete) return false;
    return true;
  }

  function stageComplete(id: StageId) {
    if (id === "name") return Boolean(name.trim());
    if (id === "abilities") return scoresGenerated;
    if (id === "ancestry") return Boolean(raceId);
    if (id === "class") return classIds.length > 0 && classesQualified && raceAllowsPath;
    if (id === "alignment") return Boolean(alignment) && alignmentAllowed;
    if (id === "training") return trainingComplete;
    if (id === "vitals") return vitalsComplete;
    if (id === "equipment") return equipmentComplete;
    return sealed;
  }

  function goNext() {
    const currentIndex = stageIndex(stage);
    const next = STAGES[currentIndex + 1];
    if (next && canEnter(next.id)) setStage(next.id);
  }

  function goBack() {
    const currentIndex = stageIndex(stage);
    if (currentIndex > 0) setStage(STAGES[currentIndex - 1].id);
  }

  const nextStage = STAGES[stageIndex(stage) + 1];
  const currentComplete = stageComplete(stage);

  function renderStage() {
    if (stage === "name") {
      return (
        <div className="stage-content name-stage">
          <div className="stage-copy">
            <p className="stage-kicker">BEGIN YOUR LEGEND</p>
            <h2>Name Your Adventurer</h2>
            <p>Your character begins with a name. Nothing is generated for you.</p>
          </div>
          <div className="name-altar">
            <Image src="/assets/forge/icons/icon-record.png" alt="" width={118} height={118} className="altar-icon" />
            <label htmlFor="character-name">Character name</label>
            <input id="character-name" value={name} onChange={(event) => setName(event.target.value.slice(0, 32))} placeholder="Enter a name..." autoComplete="off" />
            <small>{name.trim() ? `${name.trim()} will be written into the chronicle.` : "The chronicle awaits its first name."}</small>
          </div>
        </div>
      );
    }

    if (stage === "abilities") {
      return (
        <div className="stage-content abilities-stage">
          <div className="stage-copy">
            <p className="stage-kicker">LET THE DICE SPEAK</p>
            <h2>Generate Ability Scores</h2>
            <p>Choose the method yourself, then make the roll.</p>
          </div>
          <div className="method-card-grid">
            <button type="button" className={rollMethod === "classic" ? "selected" : ""} onClick={() => chooseRollMethod("classic")}>
              <Image src="/assets/forge/icons/icon-dice.png" alt="" width={76} height={76} />
              <strong>3d6 in order</strong><span>Traditional and unforgiving</span>
            </button>
            <button type="button" className={rollMethod === "heroic" ? "selected" : ""} onClick={() => chooseRollMethod("heroic")}>
              <Image src="/assets/forge/icons/icon-random.png" alt="" width={76} height={76} />
              <strong>4d6 drop lowest</strong><span>Stronger adventurers</span>
            </button>
            <button type="button" className={rollMethod === "manual" ? "selected" : ""} onClick={() => chooseRollMethod("manual")}>
              <Image src="/assets/forge/icons/icon-record.png" alt="" width={76} height={76} />
              <strong>Assign manually</strong><span>Enter every score yourself</span>
            </button>
          </div>
          {rollMethod && rollMethod !== "manual" ? <button type="button" className="rpg-button primary" onClick={rollAbilities}>Roll all six abilities</button> : null}
          {rollMethod === "manual" ? (
            <div className="manual-score-grid">
              {ABILITIES.map((ability) => <label key={ability.id}><span>{ability.short}</span><input inputMode="numeric" value={manualScores[ability.id]} onChange={(event) => changeManualScore(ability.id, event.target.value)} placeholder="3–18" /></label>)}
            </div>
          ) : null}
          <div className="ability-dice-row">
            {ABILITIES.map((ability) => <div className={scoresGenerated ? "rolled" : ""} key={ability.id}><span>{ability.short}</span><strong>{scoresGenerated ? finalScores[ability.id] : "—"}</strong><small>{ability.name}</small></div>)}
          </div>
        </div>
      );
    }

    if (stage === "ancestry") {
      return (
        <div className="stage-content ancestry-stage">
          <div className="stage-copy"><p className="stage-kicker">CHOOSE YOUR HERITAGE</p><h2>Ancestry</h2><p>Your ancestry modifies the rolled scores and opens its permitted class paths.</p></div>
          <div className="art-card-grid race-art-grid">
            {RACES.map((item) => {
              const selected = raceId === item.id;
              return <button key={item.id} type="button" className={`art-choice ${selected ? "selected" : ""}`} onClick={() => chooseRace(item.id)}>
                <div className="art-choice-image"><Image src={RACE_ART[item.id]} alt="" fill sizes="(max-width: 900px) 40vw, 180px" /></div>
                <strong>{item.name}</strong><span>{item.summary}</span>
                <small>{Object.keys(item.adjustments).length ? Object.entries(item.adjustments).map(([key, value]) => `${key.toUpperCase()} ${signed(value)}`).join(" · ") : "No ability adjustment"}</small>
              </button>;
            })}
          </div>
        </div>
      );
    }

    if (stage === "class") {
      if (!race) return null;
      const paths = [
        ...race.availableClasses.map((id) => [id] as ClassId[]),
        ...race.multiclass,
      ];
      return (
        <div className="stage-content class-stage">
          <div className="stage-copy"><p className="stage-kicker">CHOOSE YOUR CALLING</p><h2>Class Path</h2><p>Unavailable paths remain visible so you can see what your rolled abilities permit.</p></div>
          <div className="class-path-grid">
            {paths.map((ids) => {
              const qualified = ids.every((id) => qualifiesForClass(finalScores, id));
              const selected = classIds.length === ids.length && ids.every((id, index) => classIds[index] === id);
              return <button key={ids.join("-")} type="button" disabled={!qualified} className={`class-path-card ${selected ? "selected" : ""}`} onClick={() => choosePath(ids)}>
                <div className="class-crests">{ids.map((id) => <div key={id}><Image src={CLASS_ART[id]} alt="" fill sizes="120px" /></div>)}</div>
                <strong>{classPathLabel(ids)}</strong>
                <span>{ids.length > 1 ? "Multi-class path" : classById(ids[0]).description}</span>
                <small>{qualified ? "AVAILABLE" : "ABILITY REQUIREMENTS NOT MET"}</small>
              </button>;
            })}
          </div>
        </div>
      );
    }

    if (stage === "alignment") {
      return (
        <div className="stage-content alignment-stage">
          <div className="stage-copy"><p className="stage-kicker">SHAPE YOUR NATURE</p><h2>Alignment</h2><p>Your selected class path determines which alignments remain available.</p></div>
          <div className="alignment-board">
            <Image src="/assets/forge/icons/icon-alignment.png" alt="" width={110} height={110} className="alignment-emblem" />
            <div className="alignment-grid-game">{ALIGNMENTS.map((item) => {
              const permitted = classes.every((characterClass) => !characterClass.allowedAlignments || characterClass.allowedAlignments.includes(item));
              return <button key={item} type="button" disabled={!permitted} className={alignment === item ? "selected" : ""} onClick={() => { setAlignment(item); log(`${item} chosen.`); }}>{item}</button>;
            })}</div>
          </div>
        </div>
      );
    }

    if (stage === "training") {
      return (
        <div className="stage-content training-stage">
          <div className="stage-copy"><p className="stage-kicker">LEARN YOUR CRAFT</p><h2>Training</h2><p>Spend every available proficiency slot. The forge will not choose your training.</p></div>
          <div className="training-game-grid">
            <section><div className="training-heading"><Image src="/assets/forge/icons/icon-class.png" alt="" width={58} height={58} /><div><h3>Weapon Proficiencies</h3><span>{weaponProfs.length} / {weaponSlots} slots</span></div></div><div className="choice-chip-grid">{allowedWeapons.map((weapon) => <button type="button" key={weapon.id} className={weaponProfs.includes(weapon.id) ? "selected" : ""} onClick={() => toggleWeapon(weapon.id)}><strong>{weapon.name}</strong><small>{weapon.damage}</small></button>)}</div></section>
            <section><div className="training-heading"><Image src="/assets/forge/icons/icon-training.png" alt="" width={58} height={58} /><div><h3>Non-Weapon Proficiencies</h3><span>{nonWeaponProfs.length} / {nonWeaponSlots} slots</span></div></div><div className="choice-chip-grid">{NON_WEAPON_PROFICIENCIES.map((proficiency) => <button type="button" key={proficiency} className={nonWeaponProfs.includes(proficiency) ? "selected" : ""} onClick={() => toggleNwp(proficiency)}>{proficiency}</button>)}</div></section>
          </div>
        </div>
      );
    }

    if (stage === "vitals") {
      return (
        <div className="stage-content vitals-stage">
          <div className="stage-copy"><p className="stage-kicker">FATE'S LAST ROLLS</p><h2>Vitals & Starting Purse</h2><p>These values only appear when you choose to roll them.</p></div>
          <div className="vital-roll-grid">
            <div><Image src={STAT_ART.hp} alt="" width={120} height={120} /><h3>Starting Hit Points</h3><strong>{hp ?? "—"}</strong><small>{primaryClass ? (isMulticlass ? "Average the class hit-die results" : `1d${primaryClass.hitDie} plus Constitution adjustment`) : ""}</small><button type="button" className="rpg-button" onClick={rollHp}>Roll HP</button></div>
            <div><Image src={STAT_ART.gold} alt="" width={120} height={120} /><h3>Starting Gold</h3><strong>{startingGold === null ? "—" : `${startingGold} gp`}</strong><small>{primaryClass ? `${primaryClass.group} starting funds` : ""}</small><button type="button" className="rpg-button" onClick={rollGold}>Roll Gold</button></div>
            {canExceptional ? <div><Image src="/assets/forge/icons/icon-dice.png" alt="" width={120} height={120} /><h3>Exceptional Strength</h3><strong>{exceptionalStrength === null ? "18/—" : `18/${String(exceptionalStrength).padStart(2, "0")}`}</strong><small>Warrior Strength 18 percentile</small><button type="button" className="rpg-button" onClick={rollExceptionalStrength}>Roll d100</button></div> : null}
          </div>
        </div>
      );
    }

    if (stage === "equipment") {
      return (
        <div className="stage-content equipment-stage">
          <div className="stage-copy"><p className="stage-kicker">PREPARE FOR THE ROAD</p><h2>Equipment</h2><p>Your purse updates immediately. Nothing is purchased unless you select it.</p></div>
          <div className="purse-banner"><Image src={STAT_ART.gold} alt="" width={62} height={62} /><div><span>Remaining purse</span><strong>{goldRemaining === null ? "—" : `${goldRemaining.toFixed(1)} gp`}</strong></div><small>{spent.toFixed(1)} gp selected</small></div>
          <div className="equipment-sections">
            <section><h3>Armour</h3><div className="equipment-choice-grid">{allowedArmor.map((item) => <button key={item.id} type="button" className={armorId === item.id ? "selected" : ""} onClick={() => setArmorId(item.id)}><strong>{item.name}</strong><span>AC {item.ac}</span><small>{item.cost} gp</small></button>)}</div>{shieldAllowed ? <button type="button" className={`shield-choice ${shield ? "selected" : ""}`} onClick={() => setShield((value) => !value)}><Image src="/assets/forge/icons/badge-ac.png" alt="" width={54} height={54} /><span>{shield ? "Shield equipped" : "Add shield"}</span><small>{SHIELD_COST} gp</small></button> : null}</section>
            <section><h3>General Gear</h3><div className="equipment-choice-grid gear">{GENERAL_GEAR.map((item) => <button key={item.id} type="button" className={gear.includes(item.id) ? "selected" : ""} onClick={() => toggleGear(item.id)}><strong>{item.name}</strong><small>{item.cost} gp</small></button>)}</div></section>
          </div>
        </div>
      );
    }

    return (
      <div className="stage-content record-stage">
        <div className="stage-copy"><p className="stage-kicker">THE CHRONICLE AWAITS</p><h2>Final Character Record</h2><p>Review the complete level-one record before sealing it for the adventure engine.</p></div>
        <div className="final-hero">
          <div className="final-art">{raceId ? <Image src={RACE_ART[raceId]} alt="" fill sizes="260px" /> : null}</div>
          <div><span>{race?.name}</span><h3>{name}</h3><p>{classPathLabel(classIds)} · {alignment}</p><div className="final-score-line">{ABILITIES.map((ability) => <span key={ability.id}><small>{ability.short}</small><strong>{finalScores[ability.id]}{ability.id === "str" && exceptionalStrength !== null ? `/${String(exceptionalStrength).padStart(2, "0")}` : ""}</strong></span>)}</div></div>
        </div>
        <button type="button" className={`seal-button ${sealed ? "sealed" : ""}`} onClick={() => { setSealed(true); log("Character record sealed for adventure."); }}>{sealed ? "Character Sealed" : "Seal Character Record"}</button>
      </div>
    );
  }

  return (
    <main className="game-forge-shell">
      <header className="game-header">
        <div className="brand-mark"><Image src="/assets/forge/icons/icon-star.png" alt="" width={58} height={58} /><div><h1>Character Forge</h1><p>Forge your legend. The realm awaits.</p></div></div>
        <div className="header-actions"><button type="button" aria-label="Help"><Image src="/assets/forge/icons/icon-help.png" alt="" width={34} height={34} /></button><button type="button" aria-label="Settings"><Image src="/assets/forge/icons/icon-settings.png" alt="" width={34} height={34} /></button></div>
      </header>

      <div className="game-workspace">
        <nav className="stage-rail" aria-label="Character creation stages">
          {STAGES.map((item) => {
            const active = stage === item.id;
            const complete = stageComplete(item.id);
            const unlocked = canEnter(item.id);
            return <button key={item.id} type="button" disabled={!unlocked} className={`${active ? "active" : ""} ${complete ? "complete" : ""}`} onClick={() => unlocked && setStage(item.id)}>
              <span className="rail-icon"><Image src={item.icon} alt="" width={42} height={42} /></span>
              <span className="rail-text"><strong>{item.number}. {item.label}</strong><small>{item.hint}</small></span>
              {complete ? <span className="rail-check">✓</span> : null}
            </button>;
          })}
          <div className="rail-event"><span>Latest</span><p>{eventLog[0] ?? "The forge is waiting for your first choice."}</p></div>
        </nav>

        <section className="main-stage-panel">
          {renderStage()}
          <div className="stage-navigation">
            <button type="button" className="nav-back" disabled={stageIndex(stage) === 0} onClick={goBack}>‹ Back</button>
            <div className="stage-dots">{STAGES.map((item) => <span key={item.id} className={stage === item.id ? "active" : stageComplete(item.id) ? "complete" : ""} />)}</div>
            {nextStage ? <button type="button" className="nav-next" disabled={!currentComplete || !canEnter(nextStage.id)} onClick={goNext}>Continue to {nextStage.label} ›</button> : <span className="nav-finished">{sealed ? "Ready for Adventure" : "Seal the record to finish"}</span>}
          </div>
        </section>

        <aside className="character-record">
          <div className="record-crest"><Image src={raceId ? RACE_ART[raceId] : "/assets/forge/icons/icon-record.png"} alt="" width={92} height={92} /></div>
          <p className="record-kicker">CHARACTER RECORD</p>
          <h2>{name.trim() || "Unnamed Adventurer"}</h2>
          <p className="record-subtitle">{race?.name ?? "Ancestry unchosen"} · {classPathLabel(classIds)}</p>
          <p className="record-alignment">{alignment || "Alignment unchosen"}</p>

          <div className="record-badges">
            <div><Image src={STAT_ART.hp} alt="" width={60} height={60} /><span>HP</span><strong>{hp ?? "—"}</strong></div>
            <div><Image src={STAT_ART.ac} alt="" width={60} height={60} /><span>AC</span><strong>{ac ?? "—"}</strong></div>
            <div><Image src={STAT_ART.thac0} alt="" width={60} height={60} /><span>THAC0</span><strong>{thac0 ?? "—"}</strong></div>
            <div><Image src={STAT_ART.gold} alt="" width={60} height={60} /><span>GOLD</span><strong>{goldRemaining === null ? "—" : goldRemaining.toFixed(1)}</strong></div>
          </div>

          <div className="record-abilities">
            {ABILITIES.map((ability) => <div key={ability.id}><span className="ability-token">{ability.short}</span><span>{ability.name}</span><strong>{scoresGenerated ? finalScores[ability.id] : "—"}{ability.id === "str" && exceptionalStrength !== null ? `/${String(exceptionalStrength).padStart(2, "0")}` : ""}</strong></div>)}
          </div>

          <div className="record-details">
            <div><span>Armour</span><strong>{armor?.name ?? "Unchosen"}{shield ? " + shield" : ""}</strong></div>
            <div><span>Weapon Training</span><strong>{classes.length ? `${weaponProfs.length}/${weaponSlots}` : "—"}</strong></div>
            <div><span>Other Training</span><strong>{classes.length ? `${nonWeaponProfs.length}/${nonWeaponSlots}` : "—"}</strong></div>
            <div><span>DEX Defence</span><strong>{scoresGenerated ? signed(dexAc) : "—"}</strong></div>
          </div>

          <div className="record-status"><Image src={sealed ? "/assets/forge/icons/icon-star.png" : "/assets/forge/icons/icon-info.png"} alt="" width={34} height={34} /><p>{sealed ? "This character is sealed and ready for the adventure engine." : `Stage ${stageIndex(stage) + 1} of ${STAGES.length}: ${STAGES[stageIndex(stage)].label}`}</p></div>
        </aside>
      </div>
    </main>
  );
}
