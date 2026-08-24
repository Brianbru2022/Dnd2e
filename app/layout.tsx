import type { Metadata } from "next";
import "./globals.css";
import "./dice.css";

export const metadata: Metadata = {
  title: "Old School Character Forge",
  description: "Character creation for an old-school interactive fiction RPG.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
