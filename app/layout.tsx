import type { Metadata } from "next";
import ForgeCounsel from "./forge-counsel";
import RulesGuardian from "./rules-guardian";
import AuditedClassChoices from "./audited-class-choices";
import "./globals.css";
import "./dice.css";
import "./derived.css";
import "./features.css";
import "./counsel.css";
import "./audit-guardian.css";
import "./audited-class-choices.css";

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
      </body>
    </html>
  );
}
