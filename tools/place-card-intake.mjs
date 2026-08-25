/**
 * Intake for DESTINATION place cards — the `.place-card` sibling of
 * tools/exp-card-intake.mjs, and the node replacement for
 * tools/place-card-intake.py.
 *
 *   node tools/place-card-intake.mjs <srcdir> <page> <file>:<card> ...
 *
 * e.g.
 *   node tools/place-card-intake.mjs /tmp/frames jordan \
 *     petra.png:Petra  wadi-rum.png:"Wadi Rum"  dead-sea.png:"The Dead Sea" ...
 *
 * `<card>` is the card's visible name, or its slugified form — both
 * `"Alta & the Finnmark Plateau"` and `alta-and-the-finnmark-plateau` match the
 * same card. **Order does not matter.** Every placeholder card on the page must
 * be named exactly once; a name that matches no card, or a card no spec names,
 * is a hard failure before anything is written.
 *
 * ── Why this replaces the Python one ──
 *
 * `place-card-intake.py` imports PIL, which is not installed on this machine —
 * every run of it dies at `import PIL`. `sharp` already ships as a build
 * dependency, so the experience half was ported in 2026-08-24 and this is the
 * destination half following it. Behaviour is deliberately the same shape as
 * the Python tool where that tool was right, with three changes:
 *
 *   - cards are matched by NAME, not by position, so a mis-ordered argument
 *     list cannot put Petra's photograph on the Dead Sea card
 *   - the slug is DERIVED (`<page>-<slugified name>`) rather than passed, so
 *     the markup and the filename cannot disagree at all
 *   - the 3:2 ratio guard below, which the Python tool never had
 *
 * ── The ratio guard, and the mistake that earned it ──
 *
 * `.places-grid--photo .place-card__img` is `aspect-ratio:3/2;object-fit:cover`
 * (src/styles/destination.css). `cover` never distorts — it crops, silently.
 * `e-11-elephant-herd-aerial.jpg` is 1024×1405, and shipped into a 3:2 panel it
 * kept 1024/1.5 = 682.7 of 1405 px: **48.6% of the frame**, cutting the lead
 * elephants and the sky. That sat live on the africa hub until it was re-cropped
 * to `pc-e-11-…` at 1024×683.
 *
 * So: a source keeps `min(r/1.5, 1.5/r)` of itself, where r is its own width
 * over height. Below KEEP_FLOOR this refuses; below KEEP_WARN it says so and
 * continues. The fix for a refusal is to pre-crop the source to 3:2 — which is
 * what the `pc-` crop family is for — not to loosen the floor.
 *
 * ── Why the four-step intake ──
 *
 * `public/assets/img/` is gitignored, so a JPEG on disk does NOT survive a
 * clone. Every image needs all four of:
 *
 *   - `public/assets/img/<slug>.jpg`   — capped at 1600px, the widest
 *     Hostinger's CDN ever delivers. Pixels above that are repo weight nobody
 *     is served. A source that is already JPEG and already within the cap is
 *     copied byte for byte rather than re-encoded, so an approved frame does
 *     not lose a generation to this tool.
 *   - `images-b64/assets__img__<slug>.jpg.b64` — ONE line, NO trailing newline
 *   - a `MANIFEST.json` entry — indent 1, CRLF, trailing newline, which is the
 *     committed file's exact format. Do NOT switch this to cap-image-width.py's
 *     indent 2.
 *   - the markup
 *
 * ── The --photo gate is not negotiable ──
 *
 * `.places-grid--photo` undarkens the panel, which is exactly what makes a
 * missing photograph the loudest thing on the page. The modifier goes on only
 * when EVERY card in the grid has a real image. This script refuses otherwise,
 * and `photoGridDefects` in tools/verify-deployment.mjs refuses again.
 *
 * Afterwards, always: `npm run build`, then measure in the browser.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CAP = 1600;
const QUALITY = 85;
const PANEL = 3 / 2;
const KEEP_FLOOR = 0.65; // refuse below this
const KEEP_WARN = 0.8; // mention between floor and this

const [srcdir, page, ...specs] = process.argv.slice(2);
if (!srcdir || !page || !specs.length) {
  console.error("usage: node tools/place-card-intake.mjs <srcdir> <page> <file>:<card> ...");
  process.exit(2);
}

const PAGE = `src/content-pages/destinations__${page}.html`;
const MANIFEST = "images-b64/MANIFEST.json";

/* Card name -> slug. Three layers, and all three are load-bearing on the pages
   still waiting: named entities (`Alta &amp; the Finnmark Plateau`), combining
   accents (`Bogotá`, `Iguaçu`, `Península Valdés`), and the handful of Latin
   letters that NFKD does NOT decompose because they are strokes rather than
   marks. `ø` is the one that bites here: without the table below `Tromsø`
   slugifies to `troms`. */
const STROKES = { ø: "o", æ: "ae", œ: "oe", å: "a", ð: "d", þ: "th", ł: "l", đ: "d", ß: "ss" };
const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&apos;": "'", "&nbsp;": " ", "&rsquo;": "'", "&lsquo;": "'", "&ndash;": "-",
  "&mdash;": "-", "&aacute;": "á", "&eacute;": "é", "&iacute;": "í",
  "&oacute;": "ó", "&uacute;": "ú", "&yacute;": "ý", "&ntilde;": "ñ",
  "&ccedil;": "ç", "&agrave;": "à", "&egrave;": "è", "&ouml;": "ö",
  "&auml;": "ä", "&uuml;": "ü", "&oslash;": "ø", "&aring;": "å",
};
const unescapeHtml = (s) =>
  s.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|[a-zA-Z]+);/g, (m, dec, hex) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return ENTITIES[m.toLowerCase()] ?? m;
  });

const slugify = (name) =>
  unescapeHtml(name)
    .toLowerCase()
    .replace(/[øæœåðþłđß]/g, (c) => STROKES[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/* Parse on the FIRST colon only — a card name may contain one. */
const items = specs.map((s) => {
  const i = s.indexOf(":");
  if (i < 0) throw new Error(`bad spec (need file:card): ${s}`);
  return { file: s.slice(0, i), card: s.slice(i + 1), key: slugify(s.slice(i + 1)) };
});

let html = await readFile(PAGE, "utf8");

if (/places-grid--photo/.test(html)) {
  throw new Error(`${page} is already on .places-grid--photo — nothing to convert. ` +
    `To replace a single image on a converted page, edit the img src directly and ` +
    `run tools/cap-image-width.py for the intake.`);
}

/* The content pages are CRLF — every one of them, and `cat -A` will hide it
   from you if the line is long enough to be truncated first. Match `\r?\n` and
   write the inserted line back with whatever the file already uses, or the
   conversion lands one LF line in a CRLF file and the diff turns into noise. */
const EOL = html.includes("\r\n") ? "\r\n" : "\n";

/* Placeholder card + its scrim, with the head of the body block held in a
   lookahead so the region and name survive the replacement. Anchored line by
   line rather than with a lazy `.*?` across newlines: the placeholder text sits
   on one line, and a greedy-enough pattern would happily swallow a whole card. */
const CARD_RE = new RegExp(
  '([ \\t]*)<div class="place-card__ph"[^>]*>[^\\r\\n]*</div>\\r?\\n' +
  '[ \\t]*<div class="place-card__overlay"></div>\\r?\\n' +
  '(?=\\s*<div class="place-card__body">\\s*' +
  '<div class="place-card__region">([^<]+)</div>\\s*' +
  '<div class="place-card__name">([^<]+)</div>)',
  "g");

const cards = [...html.matchAll(CARD_RE)].map((m) => ({
  indent: m[1], region: m[2], name: m[3], key: slugify(m[3]),
}));

const phCount = (html.match(/place-card__ph/g) || []).length;
if (cards.length !== phCount) {
  throw new Error(`${page}: matched ${cards.length} placeholder cards but the page has ` +
    `${phCount} place-card__ph divs — the markup is not the shape this tool understands. ` +
    `Check it by hand rather than letting a partial match through.`);
}

/* Pair up before touching a single byte. Both directions are failures: an
   unmatched spec is a typo, an unmatched card is the --photo gate. */
const byKey = new Map(cards.map((c) => [c.key, c]));
const unknown = items.filter((i) => !byKey.has(i.key));
if (unknown.length) {
  throw new Error(`${page}: no card named ${unknown.map((i) => JSON.stringify(i.card)).join(", ")}. ` +
    `Cards on this page: ${cards.map((c) => c.key).join(", ")}`);
}
const dupes = items.map((i) => i.key).filter((k, n, a) => a.indexOf(k) !== n);
if (dupes.length) throw new Error(`${page}: ${dupes.join(", ")} named more than once`);
const uncovered = cards.filter((c) => !items.some((i) => i.key === c.key));
if (uncovered.length) {
  throw new Error(`${page}: ${uncovered.length} card(s) have no image — ${uncovered.map((c) => c.key).join(", ")}. ` +
    `--photo needs every card, so this is refused rather than half-applied.`);
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const done = [];

/* Every image is decoded, capped and ratio-checked BEFORE anything is written.
   A failure on the sixth frame otherwise leaves five orphan `.b64` twins with
   no MANIFEST entry to explain them, on a page still showing placeholders. */
for (const { file, key } of items) {
  const card = byKey.get(key);
  const slug = `${page}-${key}`;
  const target = `public/assets/img/${slug}.jpg`;
  const b64path = `images-b64/assets__img__${slug}.jpg.b64`;
  const srcPath = path.join(srcdir, file);

  const raw = await readFile(srcPath);
  const meta = await sharp(raw).metadata();

  /* Keep approved bytes when they already fit — re-encoding a frame that is
     already a JPEG within the cap only costs it a generation. */
  let buf, how;
  if (meta.format === "jpeg" && meta.width <= CAP) {
    buf = raw;
    how = "kept approved bytes";
  } else {
    buf = await sharp(raw)
      .resize({ width: CAP, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true })
      .toBuffer();
    how = `re-encoded from ${meta.width}x${meta.height} ${meta.format}`;
  }
  const { width, height } = await sharp(buf).metadata();

  const r = width / height;
  const keep = Math.min(r / PANEL, PANEL / r);
  if (keep < KEEP_FLOOR) {
    throw new Error(`${file} is ${width}x${height} (ratio ${r.toFixed(2)}). In the 3:2 panel ` +
      `object-fit:cover would keep only ${(keep * 100).toFixed(1)}% of it. ` +
      `Pre-crop the source to 3:2 and re-run — do not lower the floor. ` +
      `This is the check e-11-elephant-herd-aerial.jpg was shipped without.`);
  }
  const warn = keep < KEEP_WARN ? `  ⚠ crops to ${(keep * 100).toFixed(0)}%` : "";

  /* Region and name go into the alt text in their ESCAPED source form —
     `alt="Alta &amp; the Finnmark Plateau, Northern Norway"` is what every
     converted page already carries.

     Unless they are the same string. Some cards are named for their own
     region — Musandam Peninsula, Tuscany, Brooklyn, Crete — and the naive
     join reads "Musandam Peninsula, Musandam Peninsula" to a screen reader.
     The Python tool did exactly that and eleven such alts are already live;
     this at least stops the twelfth. */
  const alt = card.name.trim() === card.region.trim()
    ? card.name
    : `${card.name}, ${card.region}`;
  card.img = `${card.indent}<img class="place-card__img" src="/assets/img/${slug}.jpg" ` +
    `alt="${alt}" width="${width}" height="${height}" ` +
    `loading="lazy" decoding="async">${EOL}`;
  done.push({ slug, target, b64path, buf, width, height, kb: Math.round(buf.length / 1024), how, warn });
}

for (const d of done) {
  await writeFile(d.target, d.buf);
  await writeFile(d.b64path, d.buf.toString("base64"), "utf8"); // one line, no trailing newline
  const entry = manifest.find((m) => m.target === d.target);
  if (entry) entry.bytes = d.buf.length;
  else manifest.push({ b64: d.b64path, target: d.target, bytes: d.buf.length });
}

/* Replace in document order, each card taking its OWN image — the regex runs
   again over the same text and every match is looked up by name. */
let n = 0;
html = html.replace(CARD_RE, (_m, _indent, _region, name) => {
  const card = byKey.get(slugify(name));
  if (!card?.img) throw new Error(`${page}: ${name} lost its image between pairing and writing`);
  n++;
  return card.img;
});
if (n !== cards.length) throw new Error(`${page}: replaced ${n} of ${cards.length} cards`);
if (/place-card__ph/.test(html)) throw new Error(`${page}: placeholders remain after conversion`);
if (/place-card__overlay/.test(html)) {
  throw new Error(`${page}: a place-card__overlay survived — under --photo the copy sits in a ` +
    `panel BELOW the image, so a bottom-anchored scrim would darken a photograph nothing is ` +
    `written over`);
}

/* Only now is the modifier safe. `--card-desc-lines` goes with it: it reserves
   a description floor so the pill rows line up, and --photo pins the footer
   instead (destination.css sets min-height:0 on .place-card__desc), so leaving
   it in only opens dead space between the copy and the tags. */
html = html.replace(
  /<div class="places-grid places-grid--even"(?:\s+style="[^"]*")?>/,
  '<div class="places-grid places-grid--even places-grid--photo">');
if (!/places-grid--photo/.test(html)) {
  throw new Error(`${page}: could not add the --photo modifier — check the grid opening tag with ` +
    `grep -o '<div class="places-grid[^>]*>' ${PAGE}`);
}
if (/card-desc-lines/.test(html)) throw new Error(`${page}: a --card-desc-lines style survived`);

await writeFile(PAGE, html, "utf8");

/* indent 1 + CRLF + trailing newline — matches the committed file byte for byte. */
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1).replace(/\n/g, "\r\n") + "\r\n", "utf8");

for (const d of done) {
  console.log(`  ${d.slug.padEnd(46)} ${d.width}x${d.height}  ${String(d.kb).padStart(4)} KB  ${d.how}${d.warn}`);
}
console.log(`${done.length} cards intaken, ${page} converted to .places-grid--photo, ` +
  `MANIFEST now ${manifest.length} entries`);
console.log("Now run:  npm run build");
