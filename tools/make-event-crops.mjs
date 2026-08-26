/**
 * Crops for the two placeholder families the intro-panel pass did not cover:
 * `.event-image` inside `.event-card`, and `.exp-featured__image` on
 * /experiences/.
 *
 * Both were flat `--bg-card` plates carrying their own caption as text
 * ("Experience Photography / …"), and in both the caption is the element's
 * only child — so a photograph replaces the label rather than sitting under
 * one. There is nothing to keep in sync; only the alt has to describe the
 * frame.
 *
 * Measured at 1280px:
 *   .event-image          289x334  (0.86) — .event-card is a 1fr 1fr grid
 *                                  inside a 1fr 1fr .events-grid, and the
 *                                  height comes from the copy beside it.
 *                                  Identical on both pages that use it.
 *   .exp-featured__image  633x596  (1.06) — half of a 1265px grid whose
 *                                  min-height is 560px.
 * Neither is the 0.59 portrait the intro panel wants, which is why these need
 * their own crops instead of reusing the np- family.
 *
 * `ev-` is ~2x the event box; `xf-` is ~1.7x the featured box, the same
 * density np- runs at (900 for a 633px panel). Quality 80 matches np- and for
 * the same reason: no scrim over either one.
 *
 *   node tools/make-event-crops.mjs
 *
 * Idempotent; --force rebuilds.
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMG = path.join(ROOT, "public", "assets", "img");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");
const FORCE = process.argv.includes("--force");
const QUALITY = 80;

const BOX = {
  ev: { w: 600, h: 700 },   // .event-image, 289x334
  xf: { w: 1100, h: 1040 }, // .exp-featured__image, 633x596
};

const SOURCES = [
  /* /experiences/cruises/ */
  ["ev", "jh-12-mediterranean-october-coast.jpg"],          // Dalmatian coast by small ship
  ["ev", "antarctica-the-ross-sea-and-east-antarctica.jpg"], // Antarctica, done properly
  ["ev", "france-bordeaux-and-wine-country.jpg"],           // the Rhone for wine people
  ["ev", "france-french-riviera.jpg"],                      // a gulet of your own
  /* /experiences/romance-celebration-travel/ */
  ["ev", "p-03-four-seasons-bora-bora.jpg"],                // the honeymoon
  ["ev", "i-02-anniversary-table.jpg"],                     // the anniversary return
  ["ev", "e-19-secret-sea-cave.jpg"],                       // the proposal
  ["ev", "p-02-north-island.jpg"],                          // the milestone birthday
  /* /experiences/sports-event-travel/ — already photographed, but as CSS
     background-images, which cannot lazy-load. Converted to <img> for the
     eager-image budget, same four frames. */
  ["ev", "e-27-wimbledon-pimms-terrace.jpg"],
  ["ev", "e-24-augusta-masters-flag.jpg"],
  ["ev", "e-32-monaco-harbour-dusk.jpg"],
  ["ev", "e-22-heli-ski-landing.jpg"],
  /* /experiences/ featured block */
  ["xf", "e-16-safari-vehicle-sunrise.jpg"],
];

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

let built = 0, skipped = 0;

for (const [kind, src] of SOURCES) {
  const { w, h } = BOX[kind];
  const srcPath = path.join(IMG, src);
  const out = `${kind}-` + src.replace(/\.(jpe?g|png|webp)$/i, "") + ".jpg";
  const outPath = path.join(IMG, out);

  const srcStat = await stat(srcPath);
  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
  if (fresh && !FORCE) { skipped++; continue; }

  const meta = await sharp(srcPath).metadata();
  await sharp(srcPath)
    .resize(w, h, { fit: "cover", position: "attention" })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath);

  const buf = await readFile(outPath);
  await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");

  const target = `public/assets/img/${out}`;
  const entry = byTarget.get(target);
  if (entry) {
    entry.bytes = buf.length;
  } else {
    const added = { b64: `images-b64/assets__img__${out}.b64`, target, bytes: buf.length };
    manifest.push(added);
    byTarget.set(target, added);
  }
  built++;
  const kept = Math.round(meta.height * (w / h));
  console.log(
    `  ${out}  ${(buf.length / 1024).toFixed(0)} KB` +
    `  (${meta.width}x${meta.height} -> ${kept}px of width kept` +
    `${kept < w ? `, upscaled ${(w / kept).toFixed(2)}x` : ""})`
  );
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");
console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh)`);
console.log(`MANIFEST.json now has ${manifest.length} entries`);
