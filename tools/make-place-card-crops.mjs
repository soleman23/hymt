/**
 * Explicitly-framed 3:2 crops for place cards whose source is not 3:2 (#93).
 *
 *   node tools/make-place-card-crops.mjs [--force]
 *
 * `.places-grid--photo .place-card__img` is `aspect-ratio:3/2; object-fit:
 * cover` (destination.css:248), so a source that is not 3:2 gets centre-
 * cropped by the browser. For the 1600x900 sources that is 7.8% off each
 * side and nobody notices. For a PORTRAIT source it is a different thing
 * entirely, and the site has one: e-11-elephant-herd-aerial.jpg is
 * 1024x1405, so the card renders 683 of 1405 rows — 48.6% of the frame.
 *
 * The centre crop it gets today fails at BOTH edges at once. The top edge
 * lands just below the horizon, discarding all of the golden-hour sky, and
 * the bottom edge severs the lead elephant through the base of its skull,
 * above its tusks. It keeps neither the sky nor the subject.
 *
 * So the box here is explicit, not `position:"attention"` like the rc-/dc-
 * tools. The herd spans 732px of a 683px window — taller than the window —
 * so something must be sacrificed, and which end is a judgement a saliency
 * heuristic does not get to make. y 545-1228 keeps the lead elephant whole
 * with grass beneath its feet, keeps the large right-hand animal with
 * headroom, and clips only the small mid-distance animals at the top, which
 * at card size reads as the herd continuing past the frame.
 *
 * Native resolution, NOT upscaled to the 1600 cap. 1600x1067 from a 1024
 * source is 1.9x the bytes for invented detail; tools/cap-image-width.py
 * documents 1600 as a ceiling, not a target, and the two existing crops of
 * this same frame (rc- 760x435, dc- 780x650) are both sized to their box.
 *
 * WHY A NEW FILE AND NOT A RE-CROP OF THE ORIGINAL: the same portrait is
 * also the Botswana page's hero, where it is a full-bleed CSS background AND
 * the preloaded LCP image AND the JSON-LD Destination.image. The hero shows
 * a different slice of it (y 454-951 at 1440x700). Replacing the original
 * would silently change the hero and the LCP image as a side effect.
 *
 * Writes the crop, its base64 twin, and the MANIFEST entry — public/assets/
 * img is gitignored, so a crop that skips the base64 step works locally and
 * is missing for everyone else.
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

const QUALITY = 72;   // the house value, shared with rc-/dc-/jc-

/* left/top/width/height in SOURCE pixels. width/height must be 3:2 to within
   the rounding the container absorbs. */
const CROPS = [
  {
    src: "e-11-elephant-herd-aerial.jpg",
    box: { left: 0, top: 545, width: 1024, height: 683 },
    note: "keeps the lead elephant whole with grass under its feet; centre severed it above the tusks",
  },
];

const cropName = (src) => "pc-" + src.replace(/\.(jpe?g|png|webp)$/i, "") + ".jpg";

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

let built = 0, skipped = 0;

for (const { src, box, note } of CROPS) {
  const srcPath = path.join(IMG, src);
  const out = cropName(src);
  const outPath = path.join(IMG, out);

  const srcStat = await stat(srcPath);
  const meta = await sharp(srcPath).metadata();

  /* The box must be inside the source, and 3:2. Both have been wrong in this
     repo's image work before, and sharp's own error for an out-of-bounds
     extract does not say which number was wrong. */
  if (box.left + box.width > meta.width || box.top + box.height > meta.height) {
    throw new Error(`${src}: box ${JSON.stringify(box)} falls outside the ${meta.width}x${meta.height} source`);
  }
  const ratio = box.width / box.height;
  if (Math.abs(ratio - 1.5) > 0.005) {
    throw new Error(`${src}: box is ${ratio.toFixed(4)}:1, not 3:2 — the card container is aspect-ratio:3/2`);
  }

  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
  if (fresh && !FORCE) { skipped++; continue; }

  await sharp(srcPath)
    .extract(box)
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath);

  const buf = await readFile(outPath);
  await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");

  /* Same key order and the same `bytes` field the existing entries use. */
  const target = `public/assets/img/${out}`;
  const entry = byTarget.get(target);
  if (entry) {
    entry.bytes = buf.length;
  } else {
    const created = { b64: `images-b64/assets__img__${out}.b64`, target, bytes: buf.length };
    manifest.push(created);
    byTarget.set(target, created);
  }
  built++;
  console.log(`  ${out}  ${box.width}x${box.height}  ${(buf.length / 1024).toFixed(0)} KB  (from ${meta.width}x${meta.height}, ${(srcStat.size / 1024).toFixed(0)} KB)`);
  console.log(`    ${note}`);
}

if (built) await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");
console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh); MANIFEST.json has ${manifest.length} entries`);
