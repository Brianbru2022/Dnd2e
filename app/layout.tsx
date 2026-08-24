import type { Metadata } from "next";
import ForgeCounsel from "./forge-counsel";
import RulesGuardian from "./rules-guardian";
import AuditedClassChoices from "./audited-class-choices";
import ProficiencyEngine from "./proficiency-engine";
import EncumbranceEngine from "./encumbrance-engine";
import MagicEngine from "./magic-engine";
import SealEngine from "./seal-engine";
import FinalDetails from "./final-details";
import "./globals.css";
import "./dice.css";
import "./derived.css";
import "./features.css";
import "./counsel.css";
import "./audit-guardian.css";
import "./audited-class-choices.css";
import "./proficiency-engine.css";
import "./encumbrance-engine.css";
import "./magic-engine.css";
import "./seal-engine.css";
import "./final-details.css";

export const metadata: Metadata = {
  title: "Old School Character Forge",
  description: "Character creation for an old-school interactive fiction RPG.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ForgeCounsel />
        <RulesGuardian />
        <AuditedClassChoices />
        <ProficiencyEngine />
        <EncumbranceEngine />
        <MagicEngine />
        <FinalDetails />
        <SealEngine />
      </body>
    </html>
  );
}
