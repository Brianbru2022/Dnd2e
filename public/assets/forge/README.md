# Character Forge – UI Asset Pack

Place this folder inside your Next.js project's:

public/assets/forge/

Recommended resulting structure:

public/assets/forge/
  races/
  classes/
  icons/
  atlas/

## Usage

Normal image:
<img src="/assets/forge/races/race-human.png" alt="" />

Next.js:
<Image
  src="/assets/forge/races/race-human.png"
  alt=""
  width={280}
  height={280}
/>

Keep all labels and values as HTML/React text rather than baking text into the artwork.

The atlas folder contains a combined PNG and JSON coordinate map if sprite-atlas rendering is preferred.
