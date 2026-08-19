/**
 * Card-sized crops for the /destinations/ grid (the `dc-` family).
 *
 *   node tools/make-dest-card-crops.mjs [--force]
 *
 * The grid's `.dest-card__img` is a real lazy <img> at 780x650, and every
 * card but one already had a matching `dc-` crop — those were generated
 * before this tool existed and are left exactly as they are. The gap was
 * Aspen: its card was pulled from the grid because it was the last
 * north-america card still on a placeholder plate rather than a photograph
 * (see the comment it left behind in destinations.html). The photograph now
 * exists as dh-26-aspen-maroon-bells.jpg, so the card can come back, and the
 * crop it needs is this one.
 *
 * 780x650 is the card's own box at 1.2, so nothing is cropped twice: shipping
 * the 1600x900 hero into it would send 365 KB to render 780 CSS pixels AND
 * hand the browser's centre-crop a 1.78 source for a 1.2 box, which slices
 * 33% off each side with no say in which 33%. `position:"attention"` picks
 * the window, the same way the rc- and og- tools do.
 *
 * Quality 72 with mozjpeg, the house value shared with rc-/dc-/jc-/og-.
 *
 * Writes the crop, its base64 twin in images-b64/, and the MANIFEST entry —
 * public/assets/img is gitignored, so a crop that skips the base64 step works
 * on this machine and 404s for everyone else.
 *
 * Idempotent: a crop newer than its source is left alone. --force rebuilds.
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

const WIDTH = 780;
const HEIGHT = 650;
const QUALITY = 72;

/* Sources whose dc- crop this tool owns. The pre-existing dc- crops are not
   listed: they are already in MANIFEST.json and re-deriving them here would
   change bytes that nothing asked to change. */
const SOURCES = [
  "dh-26-aspen-maroon-bells.jpg",
];

const cropName = (src) => "dc-" + src.replace(/\.(jpe?g|png|webp)$/i, "") + ".jpg";

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

let built = 0, skipped = 0;

for (const src of SOURCES) {
  const srcPath = path.join(IMG, src);
  const out = cropName(src);
  const outPath = path.join(IMG, out);

  const srcStat = await stat(srcPath);
  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
  if (fresh && !FORCE) { skipped++; continue; }

  await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath);

  const buf = await readFile(outPath);
  await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");

  /* Same key order and the same `bytes` field every existing entry uses. */
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
  console.log(`  ${out}  ${(buf.length / 1024).toFixed(0)} KB  (from ${(srcStat.size / 1024).toFixed(0)} KB)`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");
console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh)`);
console.log(`MANIFEST.json now has ${manifest.length} entries`);
