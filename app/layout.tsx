import type { Metadata } from "next";
import ForgeCounsel from "./forge-counsel";
import "./globals.css";
import "./dice.css";
import "./derived.css";
import "./features.css";
import "./counsel.css";

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
      </body>
    </html>
  );
}
