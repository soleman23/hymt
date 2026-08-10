/**
 * Card-sized crops for the related-destinations grid (review finding on #69).
 *
 * The first version of the related-destinations block used each target's
 * full-size hero JPEG as a CSS background-image inside a 385x220 card. Three
 * of those is 699 KB on every destination page, and measurement showed all
 * three fetching ~56ms behind the LCP hero with zero scroll — CSS
 * background-images cannot carry loading="lazy", so there was no way to defer
 * them. That works directly against P1-2/P1-3, which exist to protect LCP.
 *
 * These crops are the other half of the fix (the markup switching to a real
 * lazy <img> is the first half). 760x435 is 2x the card's 385x220 CSS box at
 * its 1.75 aspect, so it stays sharp on a retina display. Quality 72 is
 * deliberately aggressive: every card sits under a
 * linear-gradient(rgba(8,15,26,.88)) overlay with text on top, so detail in
 * the image is not what the card is doing.
 *
 * Writes the crop, its base64 twin in images-b64/, and the MANIFEST entry —
 * public/assets/img/ is gitignored, so an image that skips the base64 step
 * survives locally and vanishes for everyone else.
 *
 *   node tools/make-related-card-crops.mjs
 *
 * Idempotent: a crop that already exists and is newer than its source is left
 * alone. Pass --force to rebuild every one.
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

const WIDTH = 760;
const HEIGHT = 435;
const QUALITY = 72;

/* The 33 destination heroes the related grid points at. Kept in sync with
   DEST in tools/p3-6-related-destinations.mjs — that file is the source of
   truth for which hero belongs to which destination. */
const SOURCES = [
  "na-alaska-brown-bear-salmon.jpg", "dh-01-antarctica-ice-cliffs.jpg",
  "e-09-jungle-yoga-pavilion.jpg", "e-11-elephant-herd-aerial.jpg",
  "na-canadian-rockies-glacial-lake.jpg", "dh-03-egypt-nile-dusk.jpg",
  "dh-04-fiji-lagoon-aerial.jpg", "dh-05-france-provence-dusk.jpg",
  "h-02-bora-bora-dawn.jpg", "dh-06-galapagos-volcanic-coast.jpg",
  "dh-07-greece-caldera-dusk.jpg", "dh-08-hawaii-napali-coast.jpg",
  "dh-09-iceland-glacial-lagoon.jpg", "h-04-amalfi-golden-hour.jpg",
  "dh-10-japan-kyoto-dawn.jpg", "x-03-petra-treasury.jpg",
  "x-01-serengeti-elephants.jpg", "h-01-maldives-aerial.jpg",
  "na-napa-sonoma-cellar-tasting.jpg", "dh-12-new-orleans-quarter-dusk.jpg",
  "dh-13-new-york-skyline-dusk.jpg", "dh-14-new-zealand-fiord-dawn.jpg",
  "dh-16-oman-wadi-fort.jpg", "e-12-patagonia-trek.jpg",
  "dh-17-peru-machu-picchu-dawn.jpg", "dh-19-portugal-douro-valley.jpg",
  "dh-20-riviera-maya-coast.jpg", "dh-21-rwanda-volcano-hills.jpg",
  "dh-23-spain-andalusia-dusk.jpg", "d-06-st-barts-harbour.jpg",
  "dh-24-thailand-limestone-bay.jpg", "d-02-grace-bay.jpg",
  "dh-25-uk-ireland-highland-loch.jpg",
];

const cropName = (src) => "rc-" + src.replace(/\.(jpe?g|png|webp)$/i, "") + ".jpg";

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

let built = 0, skipped = 0, before = 0, after = 0;

for (const src of SOURCES) {
  const srcPath = path.join(IMG, src);
  const out = cropName(src);
  const outPath = path.join(IMG, out);

  const srcStat = await stat(srcPath);
  before += srcStat.size;

  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
  if (fresh && !FORCE) {
    after += (await stat(outPath)).size;
    skipped++;
    continue;
  }

  await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath);

  const buf = await readFile(outPath);
  after += buf.length;
  await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");

  /* Same key order and the same `bytes` field the existing 127 entries use. */
  const target = `public/assets/img/${out}`;
  const entry = byTarget.get(target);
  if (entry) {
    entry.bytes = buf.length;
  } else {
    const fresh = { b64: `images-b64/assets__img__${out}.b64`, target, bytes: buf.length };
    manifest.push(fresh);
    byTarget.set(target, fresh);
  }
  built++;
  console.log(`  ${out}  ${(buf.length / 1024).toFixed(0)} KB  (from ${(srcStat.size / 1024).toFixed(0)} KB)`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh)`);
console.log(`source heroes: ${(before / 1024 / 1024).toFixed(2)} MB  ->  card crops: ${(after / 1024).toFixed(0)} KB`);
console.log(`MANIFEST.json now has ${manifest.length} entries`);
