# Pseudo-2e Character Creation Rules Audit

This project follows classic AD&D 2e character-creation mechanics as closely as practical without copying protected rulebook prose or branding. Mechanics are implemented in code; explanatory text is original.

Status legend:
- ✅ Faithful: implemented and intended to match the classic mechanic closely.
- 🟡 Adapted: intentionally simplified or modernised for this game.
- ⏳ Pending: identified but not yet fully wired into the Forge.
- ❌ Excluded: deliberately not used.

## Ability generation
- ✅ Six abilities: STR, DEX, CON, INT, WIS, CHA.
- ✅ Player-triggered 3d6 in order.
- ✅ Player-triggered 4d6 drop lowest as an optional enhanced method.
- ✅ Individual visual dice rolls.
- ✅ Exceptional Strength percentile roll for eligible warriors.
- ⏳ Explicitly block exceptional Strength for halfling fighters.

## Race
- ✅ Core six races used by the project.
- ✅ Racial ability adjustments.
- ⏳ Enforce pre-adjustment racial ability minimums/maximums.
- ⏳ Display racial languages and special abilities.
- ⏳ Base movement by race.
- ⏳ Racial class level limits and prime-requisite extensions.
- ⏳ Full racial saving-throw/resistance audit.

## Class eligibility
- ✅ Core class minimum ability requirements.
- ✅ Alignment restrictions for Paladin, Ranger, Druid and Bard.
- ✅ Demihuman multiclass concept.
- ✅ Human dual-classing excluded from level-one creation.
- ⏳ Replace legacy multiclass list with audited combinations (notably gnome combinations).
- ⏳ Specialist wizard race/ability/opposition-school requirements.

## Class-specific creation
- ✅ Fighter weapon specialization choice.
- ✅ Thief first-level discretionary skill allocation.
- 🟡 Wizard starting spellbook flow currently simplified.
- 🟡 Priest memorisation currently simplified.
- ⏳ Ranger species enemy choice and level-one special abilities.
- ⏳ Paladin save bonus and level-one special abilities.
- ⏳ Bard rogue abilities and starting class features.
- ⏳ Specialist wizard bonus/opposition-school mechanics.
- ⏳ Cleric turning and faith-profile hooks.
- ⏳ Druid nature abilities/language/equipment detail.

## Hit points / saving throws
- ✅ Player-triggered hit point rolls.
- ✅ Multiclass hit dice are rolled and averaged.
- ✅ Five level-one saving throw categories.
- ✅ Best applicable multiclass saving throw used.
- ⏳ Paladin +2 save bonus.
- ⏳ Complete racial and ability save modifier audit.

## Proficiencies
- ✅ Weapon and nonweapon proficiency stages enabled by default.
- ✅ Starting slot counts by class group.
- ⏳ Use proper nonweapon proficiency slot costs.
- ⏳ Use governing abilities and check modifiers.
- ⏳ Intelligence bonus languages/proficiency interaction.
- ⏳ Class-group crossovers and extra slot cost.
- ⏳ Nonproficiency attack penalties.

## Equipment / movement / encumbrance
- ✅ Starting funds rolled by player.
- ✅ Basic equipment purchase flow.
- ✅ Descending AC and Dexterity defence adjustment.
- ⏳ Expand weapon data: size, speed, type, S/M damage, Large damage, rate of fire, ranges, weight.
- ⏳ Expand armour and general equipment data with weights.
- ⏳ Encumbrance categories and Strength allowance.
- ⏳ Base and encumbered movement.
- ⏳ Armour interference with wizard/thief/ranger abilities.

## Spells
- 🟡 Initial wizard/priest spell selection exists but is not yet certified as fully faithful.
- ⏳ Chance-to-learn rolls where used by the project rules profile.
- ⏳ Memorised spell slots.
- ⏳ Specialist bonus spell.
- ⏳ Opposition-school enforcement.
- ⏳ Priest spheres/access profile.

## Character details
- ✅ Name.
- ✅ Male/Female identity choice; no mechanical difference.
- ⏳ Languages.
- ⏳ Starting age.
- ⏳ Height and weight (optional player-triggered rolls if retained).
- ⏳ Portrait selection.

## Final record / persistence
- ✅ Live derived character record.
- ⏳ Canonical CharacterRecord schema.
- ⏳ Seal-time validation: no illegal race/class/stat combinations.
- ⏳ Save/load multiple characters.
- ⏳ Full roll history retained in CharacterRecord.

## Deliberate project decisions
- ✅ All rolls and selections are initiated by the player.
- ✅ Forge Counsel may advise but never chooses or rolls.
- ✅ Nonweapon proficiencies are enabled by default even though they were optional in the classic rules.
- ✅ Modern visual presentation and original explanatory text are intentionally used rather than reproducing rulebook expression.
