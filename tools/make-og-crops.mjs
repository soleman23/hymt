/**
 * Per-page og:image crops, 1200x630, from the hero each page already ships.
 *
 *   node tools/make-og-crops.mjs [--force]
 *
 * Every page emitted the same og:image — /assets/og-default.jpg, the gold
 * crest on a dark plate — so every social and AI-assistant share of any
 * destination, experience or article looked identical. The plumbing to fix
 * that was already complete and unused: Base.astro emits og:image and
 * twitter:image from an `ogImage` prop, and all three section layouts
 * already forward it. No page passed one.
 *
 * This writes the crops. The layouts derive the path from hero.image via the
 * generated table in src/lib/og-crops.ts, so no page file changes.
 *
 * Writes the crop, its base64 twin in images-b64/, and the MANIFEST entry —
 * public/assets/img is gitignored, so an image that skips the base64 step
 * works on this machine and 404s for everyone else.
 *
 * FOUR THINGS THIS HANDLES THAT A NAIVE VERSION DOES NOT:
 *
 *  1. ALIASES. Eleven journal heroes are declared as /assets/<name>.jpg and
 *     resolved through images-b64/ALIASES.json to a canonical /assets/img/
 *     file. Cropping the declared path would emit eleven byte-identical
 *     duplicates with eleven redundant MANIFEST entries. Aliases are
 *     resolved first, so 80 declared paths collapse to 73 pictures.
 *
 *  2. SHARED HEROES. Nine pictures hero more than one page, so the site ends
 *     up at 64 pages with a unique card plus 22 sharing 9 — not 98 unique.
 *     Worth stating accurately rather than claiming per-page uniqueness.
 *
 *  3. PORTRAIT SOURCES ARE EXCLUDED. Three heroes are 1024x1405. Cropping
 *     1200x630 out of those discards 62% of the frame AND enlarges it 17%,
 *     so the result is soft and badly framed — and on one of them sharp's
 *     "attention" gravity lands on the background and slices the subject
 *     off. A share card that looks broken is worse than the brand plate,
 *     which is what those pages keep.
 *
 *  4. og:image WANTS ABSOLUTE URLs and a real file. Base.astro already
 *     prefixes the site origin; the og-image verifier check then confirms
 *     the target exists in dist/. Because restore_images.py writes every
 *     MANIFEST entry to BOTH public/ and dist/, a crop with a MANIFEST entry
 *     satisfies that check on a fresh clone too.
 *
 * Quality 72 with mozjpeg, matching rc-/dc-/jc-. Measured at that setting
 * the full set is ~5.4 MB binary, ~7.2 MB base64 — about 5% on images-b64.
 * Do not iterate on quality in-tree: every --force rebuild writes new blobs
 * that stay in .git forever.
 */
import { readFile, writeFile, stat, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const IMG = path.join(PUBLIC, "assets", "img");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");
const PAGES = path.join(ROOT, "src", "pages");
const FORCE = process.argv.includes("--force");

const WIDTH = 1200;
const HEIGHT = 630;
const QUALITY = 72;

/* A source shaped like this cannot yield a decent 1200x630 card. Anything
   this wide-to-tall loses most of the frame and has to be enlarged. */
const MIN_SOURCE_RATIO = 1.2;

const cropName = (src) => "og-" + src.replace(/\.(jpe?g|png|webp)$/i, "") + ".jpg";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name === "index.astro") out.push(p);
  }
  return out;
}

const aliases = JSON.parse(await readFile(path.join(B64, "ALIASES.json"), "utf8"));
const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

/* declared hero path -> canonical /assets/img/<file> */
const resolveAlias = (declared) => {
  const base = declared.replace(/^\/assets\//, "");
  return aliases[base] ? "/" + aliases[base] : declared;
};

/* Collect every page's hero. */
const heroes = new Map();   // canonical path -> [routes]
for (const file of await walk(PAGES)) {
  const src = await readFile(file, "utf8");
  const m = /hero=\{\{[\s\S]*?image:\s*"([^"]+)"/.exec(src);
  if (!m) continue;
  const route = "/" + path.relative(PAGES, path.dirname(file)).replace(/\\/g, "/") + "/";
  const canonical = resolveAlias(m[1]);
  if (!heroes.has(canonical)) heroes.set(canonical, []);
  heroes.get(canonical).push(route);
}

console.log(`${[...heroes.values()].flat().length} pages declare a hero; ${heroes.size} distinct pictures after alias resolution`);

const table = {};           // hero path (as declared) -> crop path
let built = 0, skipped = 0, excluded = 0, bytes = 0;

for (const [canonical, routes] of [...heroes].sort()) {
  const base = path.basename(canonical);
  const srcPath = path.join(IMG, base);
  let meta;
  try {
    meta = await sharp(srcPath).metadata();
  } catch {
    console.log(`  SKIP ${base} — not readable under public/assets/img`);
    excluded++;
    continue;
  }
  const ratio = meta.width / meta.height;
  if (ratio < MIN_SOURCE_RATIO) {
    console.log(`  EXCLUDE ${base} (${meta.width}x${meta.height}, ratio ${ratio.toFixed(2)}) — ${routes.join(", ")} keep the default plate`);
    excluded++;
    continue;
  }

  const out = cropName(base);
  const outPath = path.join(IMG, out);
  const srcStat = await stat(srcPath);
  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);

  if (!fresh || FORCE) {
    await sharp(srcPath)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: sharp.strategy.attention })
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
    bytes += buf.length;
    built++;
  } else {
    bytes += (await stat(outPath)).size;
    skipped++;
  }

  /* The table is keyed by what the PAGE declares, aliases included, so the
     layout can look up hero.image directly without resolving anything. */
  for (const [declared, target] of Object.entries(aliases)) {
    if ("/" + target === canonical) table[`/assets/${declared}`] = `/assets/img/${out}`;
  }
  table[canonical] = `/assets/img/${out}`;
}

if (built) await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

/* Generated, not hand-maintained: the same reason make-home-card-crops.mjs
   exports its table. Lives under src/ so the layouts import it without
   reaching into tools/. */
const ts = `/**
 * GENERATED by tools/make-og-crops.mjs — do not edit by hand.
 *
 * Maps a page's declared hero image to its 1200x630 og:image crop. Keyed by
 * the path the page declares, aliases included, so a layout can look up
 * hero.image with no resolution step. A hero with no entry falls back to
 * /assets/og-default.jpg in Base.astro — that is the case for the portrait
 * sources, which cannot yield a decent card.
 */
export const OG_CROPS: Record<string, string> = ${JSON.stringify(table, null, 2)};
`;
await writeFile(path.join(ROOT, "src", "lib", "og-crops.ts"), ts, "utf8");

const covered = [...heroes].filter(([c]) => table[c]).flatMap(([, r]) => r).length;
console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh), excluded ${excluded}`);
console.log(`crops total ${(bytes / 1024 / 1024).toFixed(2)} MB binary (~${(bytes * 1.333 / 1024 / 1024).toFixed(2)} MB base64)`);
console.log(`${covered} pages get a per-page og:image; MANIFEST.json has ${manifest.length} entries`);
console.log(`wrote src/lib/og-crops.ts with ${Object.keys(table).length} keys`);
