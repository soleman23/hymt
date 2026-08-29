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
 *  3. PORTRAIT SOURCES CANNOT BE CROPPED, SO THEY BORROW. Three heroes are
 *     1024x1405. Cropping 1200x630 out of those discards 62% of the frame AND
 *     enlarges it 17%, so the result is soft and badly framed — and on one of
 *     them sharp's "attention" gravity lands on the background and slices the
 *     subject off. A share card that looks broken is worse than the brand
 *     plate. Rather than leave those three pages on the plate, each names a
 *     landscape stand-in in HERO_FALLBACK below and crops that instead.
 *     The choice is editorial and cannot be inferred, which is why it is a
 *     hand-written table and not a rule.
 *
 *  4. og:image WANTS ABSOLUTE URLs and a real file. Base.astro already
 *     prefixes the site origin; the og-image verifier check then confirms
 *     the target exists in dist/. Because restore_images.py writes every
 *     MANIFEST entry to BOTH public/ and dist/, a crop with a MANIFEST entry
 *     satisfies that check on a fresh clone too.
 *
 * Quality 72 with mozjpeg, matching rc-/dc-/jc-. Measured 2026-08-26 at that
 * setting the full set is 98 crops, ~7.9 MB binary and ~10.5 MB base64 —
 * 4.5% of images-b64. (It read ~5.4 MB when first written, before the 25 M7
 * pages and the stand-ins below.) Do not iterate on quality in-tree: every
 * --force rebuild writes new blobs that stay in .git forever.
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

/* Landscape stand-ins for the three portrait heroes, keyed by the CANONICAL
   hero path (post-alias). Each of these heroes belongs to exactly one page,
   so keying by the picture cannot leak a stand-in onto a second page — check
   that again before adding a fourth entry.

   Why each one, since none of this is derivable:
     e-09 (bali) — e-45 is the SAME subject in landscape. Both alts read
       "yoga pavilion above misted rice terraces at dawn, Ubud, Bali"; e-45
       just names Bali outright. Already ships on the wellness-retreat page.
     e-11 (botswana) — the hero is an elephant herd from the air, which is
       Okavango; the page's own first place card is that delta at 1600x900.
     e-17 (willamette) — the page is Oregon Pinot and already borrows a
       Tuscan tasting for its hero, but that hero is a generic tasting
       interior: it never asserts a place. Its landscape sibling e-06 does —
       cypresses and an Italian villa — which is a loud thing to put on the
       share card of "Oregon's Answer to Burgundy", louder than the page
       itself ever was. napa-sonoma-the-valley-floor is still borrowed, but
       fog over vineyard rows under conifer ridges is the Willamette's own
       look and nothing in frame contradicts Oregon. Prefer a stand-in that
       asserts LESS than the hero, never more. */
const HERO_FALLBACK = {
  "/assets/img/e-09-jungle-yoga-pavilion.jpg": "e-45-ubud-yoga-pavilion.jpg",
  "/assets/img/e-11-elephant-herd-aerial.jpg": "botswana-okavango-delta.jpg",
  "/assets/img/e-17-tuscan-wine-tasting.jpg": "napa-sonoma-the-valley-floor.jpg",
};

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

/* The keying assumption behind HERO_FALLBACK, checked rather than trusted:
   the table maps a PICTURE to a crop, so a stand-in named for a hero that
   two pages share would silently reach both. Today all three are unshared.
   Left as a hard exit because the wrong share card is the one failure this
   whole file exists to avoid, and it would otherwise ship green. */
for (const hero of Object.keys(HERO_FALLBACK)) {
  const routes = heroes.get(hero);
  if (!routes) {
    console.error(`HERO_FALLBACK names ${hero}, which no page heroes any more — drop the entry.`);
    process.exit(1);
  }
  if (routes.length > 1) {
    console.error(`HERO_FALLBACK names ${hero}, shared by ${routes.length} pages (${routes.join(", ")}). Keying by picture would give all of them the same stand-in — give those pages their own heroes first.`);
    process.exit(1);
  }
}

const table = {};           // hero path (as declared) -> crop path
const counted = new Set();  // crop names already tallied, see alreadyCounted
let built = 0, skipped = 0, excluded = 0, bytes = 0;

for (const [canonical, routes] of [...heroes].sort()) {
  let base = path.basename(canonical);
  let srcPath = path.join(IMG, base);
  let meta;
  try {
    meta = await sharp(srcPath).metadata();
  } catch {
    console.log(`  SKIP ${base} — not readable under public/assets/img`);
    excluded++;
    continue;
  }
  let ratio = meta.width / meta.height;

  /* Too tall to crop. Swap in the page's landscape stand-in if it named one;
     the table stays keyed by the hero, so the layouts need no change. */
  if (ratio < MIN_SOURCE_RATIO && HERO_FALLBACK[canonical]) {
    const stand = HERO_FALLBACK[canonical];
    const standPath = path.join(IMG, stand);
    let standMeta;
    try {
      standMeta = await sharp(standPath).metadata();
    } catch {
      console.log(`  EXCLUDE ${base} — stand-in ${stand} is not readable under public/assets/img`);
      excluded++;
      continue;
    }
    const standRatio = standMeta.width / standMeta.height;
    if (standRatio < MIN_SOURCE_RATIO) {
      /* A portrait stand-in fixes nothing. Fail loudly rather than ship the
         soft, badly-framed card this whole rule exists to prevent. */
      console.log(`  EXCLUDE ${base} — stand-in ${stand} is itself ${standMeta.width}x${standMeta.height} (ratio ${standRatio.toFixed(2)})`);
      excluded++;
      continue;
    }
    console.log(`  FALLBACK ${base} (ratio ${ratio.toFixed(2)}) -> ${stand} (${standMeta.width}x${standMeta.height}) for ${routes.join(", ")}`);
    base = stand;
    srcPath = standPath;
    meta = standMeta;
    ratio = standRatio;
  }

  if (ratio < MIN_SOURCE_RATIO) {
    console.log(`  EXCLUDE ${base} (${meta.width}x${meta.height}, ratio ${ratio.toFixed(2)}) — ${routes.join(", ")} keep the default plate`);
    excluded++;
    continue;
  }

  const out = cropName(base);
  const outPath = path.join(IMG, out);
  const srcStat = await stat(srcPath);
  const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);

  /* One picture can reach this loop twice — once as its own page's hero and
     again as another page's HERO_FALLBACK stand-in. It is the same crop both
     times, so count its bytes once or the totals overstate the set. */
  const alreadyCounted = counted.has(out);
  counted.add(out);

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
    if (!alreadyCounted) { bytes += buf.length; built++; }
  } else if (!alreadyCounted) {
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
