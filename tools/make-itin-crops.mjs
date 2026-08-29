/**
 * Crops for every placeholder plate this change fills.
 *
 * The name is historical: 280 of the 295 are the "Trips We Plan Often" tiles,
 * described below. The remaining 15 are the last plates anywhere on the site,
 * in four unrelated components, and they ride along here rather than in four
 * more tools — see "The stragglers" at the foot of this comment.
 *
 * That section renders through TWO card families, and a sweep that greps for
 * one finds 87% of the problem. Destination pages use `.itin-card` /
 * `.itin-image`; the nine experiences pages use `.event-card` /
 * `.event-image` under the identical heading. Both shipped as flat placeholder
 * plates. Which box a row gets is the row's own `w`/`h`, defaulting to the
 * `.itin-image` one:
 *
 *   ni-*  600x1000 (0.60)  .itin-image--photo   — measured 289x484-623
 *   ev-*  600x700  (0.857) .event-image--photo  — measured 289x334
 *
 * `.itin-card` is a `1fr 1fr` grid inside a `1fr 1fr` `.itineraries-grid`, so
 * its panel is a quarter of the section's width and its height comes from the
 * itinerary copy beside it — never landscape, and only half the width of the
 * `.intro-image` panel that make-intro-crops.mjs feeds. The `.event-card`
 * panel is nearly square, which is why its masters are generated at 3:4 and
 * the itinerary ones at 9:16.
 *
 * Masters live in tools/itin-masters/ at the aspect their box wants, so each
 * crop keeps full width and loses ~6% (ni-) or ~12% (ev-) of height. Nothing
 * here is upscaled and nothing arrives landscape, because these frames were
 * generated for these slots rather than borrowed from the destination library.
 *
 * WHY GENERATED AND NOT REUSED. The 280 plates this fills needed 280 frames at
 * two shapes the library does not hold. Of 884 tracked images, 18 were
 * referenced nowhere and all 18 are landscape `rc-`/`e-` tiles. Reusing
 * place-card frames would have put every photograph on the page twice, four
 * times over. Both prefixes and both boxes follow the tiles that shipped in
 * these slots first — `ni-` from /destinations/north-america/, `ev-` from
 * /experiences/cruises/.
 *
 * Quality is 80, matching make-intro-crops.mjs. These are clean photographs
 * with no scrim and no text over them, and the subjects run to sky, water and
 * haze — what mozjpeg bands first.
 *
 * THE STRAGGLERS. Fifteen plates in four other components, all of them found
 * by counting `<Noun> Photography` rather than by grepping nouns already known:
 *
 *   jc-  780x410   .article-card__img   8 related-article cards. Six of these
 *                                       needed no new frame at all: a related
 *                                       card should show the post it links to,
 *                                       and jc-jh-03/14/17 were already built.
 *   sc-  780x410   .stay-card__img      2 Maldives stay cards.
 *   pi- 1440x810   .post-image img      3 in-article images, 16:9.
 *   pi- 1600x686   .post-image--wide    1 in-article image, 21:9.
 *   jh- 1600x900   journal hero         1, /travel-journal/aspen-book-early/.
 *
 * ONE PLATE IS DELIBERATELY LEFT, AND ONE THING IS NOT A PLATE. `/contact/`
 * shows "Portrait Photography / Mark Sole" — a real, named person, and a
 * generated likeness of someone is not a photograph of them. That slot needs a
 * real headshot from Mark; add `Portrait` to PLACEHOLDER_PATTERNS the day it
 * lands. Separately, `<span class="dest-tag">Iceberg Photography</span>` on
 * /destinations/ is not a plate at all: it is a Greenland activity tag sitting
 * beside "Icefjord" and "Dog Sledding". That one is why the check matches a
 * fixed list of caption nouns and not /\w+ Photography/ — the general form
 * would fail that page forever over correct copy.
 *
 * A POSITIONAL MATCH IS NOT SAFE HERE. /destinations/maldives/ has three
 * .stay-card__image elements and only two are plates; the first already
 * carried p-01-soneva-jani.jpg as a CSS background-image. Replacing "the first
 * .stay-card__image" overwrote a real photograph and shifted every image one
 * card down, so the plate's own caption is what the patch anchors on.
 *
 * The prompt and alt text behind every frame are in tools/itin-brief.json,
 * which is tracked; the PNG masters are not, the same rule tools/hero-masters/
 * follows. Regenerating a frame means re-running its prompt and dropping the
 * PNG back into tools/itin-masters/<file>.png.
 *
 *   node tools/make-itin-crops.mjs
 *
 * Idempotent: a crop that already exists and is newer than its master is left
 * alone. Pass --force to rebuild every one.
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMG = path.join(ROOT, "public", "assets", "img");
const MASTERS = path.join(ROOT, "tools", "itin-masters");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");
const BRIEF = path.join(ROOT, "tools", "itin-brief.json");
const FORCE = process.argv.includes("--force");

const WIDTH = 600;
const HEIGHT = 1000;
const QUALITY = 80;

const brief = JSON.parse(await readFile(BRIEF, "utf8"));
const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

let built = 0, skipped = 0, missing = 0;

for (const row of brief) {
  const out = row.file;
  const outPath = path.join(IMG, out);
  /* `master` lets two crops share one generation — the Aspen journal hero is
     both a 1600x900 jh- and a 780x410 jc- thumbnail of itself, and generating
     that frame twice would spend a credit to get a different photograph. */
  const srcPath = path.join(MASTERS, (row.master ?? out).replace(/\.jpg$/, ".png"));

  const srcStat = await stat(srcPath).catch(() => null);
  if (!srcStat) {
    console.warn(`  MISSING MASTER  ${path.relative(ROOT, srcPath)}`);
    missing++;
    continue;
  }

  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
  if (fresh && !FORCE) { skipped++; continue; }

  const meta = await sharp(srcPath).metadata();
  const w = row.w ?? WIDTH;
  const h = row.h ?? HEIGHT;
  /* Centre, not "attention". The masters are composed for the box they serve
     and the crop only trims height; letting the saliency pass choose which
     slice moved a laid table off the bottom edge for no gain. */
  await sharp(srcPath)
    .resize(w, h, { fit: "cover", position: "centre" })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
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
  console.log(
    `  ${out.padEnd(52)} ${(buf.length / 1024).toFixed(0).padStart(4)} KB` +
    `  ${meta.width}x${meta.height} -> ${w}x${h}`
  );
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh)` +
  (missing ? `, ${missing} MISSING MASTERS` : ""));
console.log(`MANIFEST.json now has ${manifest.length} entries`);
if (missing) process.exitCode = 1;
