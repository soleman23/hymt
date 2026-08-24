/**
 * Intake for EXPERIENCE place cards — the `.exp-card` sibling of
 * tools/place-card-intake.py.
 *
 *   node tools/exp-card-intake.mjs <srcdir> <page> <file>:<slug>:<alt> ...
 *
 * e.g.
 *   node tools/exp-card-intake.mjs /tmp/safari safari-wildlife-travel \
 *     botswana.png:e-33-okavango-channel-golden:"Golden-hour channels…" ...
 *
 * ── Why this exists alongside the Python one ──
 *
 * Two reasons, both real:
 *
 *   1. `place-card-intake.py` converts `.place-card__ph` divs inside a
 *      `.places-grid`. Experience pages use `.exp-card__ph` inside
 *      `.exp-cards`, with a different photo modifier and a different gate.
 *      It was never going to do this half.
 *   2. That script imports PIL, which is not installed on the machine this
 *      was written on, while `sharp` already ships as a build dependency.
 *      Anyone reaching for the Python tool here will hit ModuleNotFoundError.
 *
 * ── What it does, and why each step matters ──
 *
 * `public/assets/img/` is gitignored, so a JPEG on disk does NOT survive a
 * clone. Every image needs all four of:
 *
 *   - `public/assets/img/<slug>.jpg`   — capped at 1600px, the widest
 *     Hostinger's CDN ever delivers (see tools/cap-image-width.py). Pixels
 *     above that are repo weight nobody is served.
 *   - `images-b64/assets__img__<slug>.jpg.b64` — ONE line, NO trailing newline
 *   - a `MANIFEST.json` entry — indent 1, CRLF, trailing newline, verified
 *     byte-identical against the committed file
 *   - the markup
 *
 * ── The --photo gate is not negotiable ──
 *
 * `.exp-cards--photo` undarkens the panel, which is exactly what makes a
 * missing photograph the loudest thing on the page. The modifier is added
 * only when EVERY card in the grid has a real image. This script refuses
 * otherwise, and `photoGridDefects` in the verifier refuses again.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [srcdir, page, ...specs] = process.argv.slice(2);
if (!srcdir || !page || !specs.length) {
  console.error("usage: node tools/exp-card-intake.mjs <srcdir> <page> <file>:<slug>:<alt> ...");
  process.exit(2);
}

const PAGE = `src/content-pages/experiences__${page}.html`;
const MANIFEST = "images-b64/MANIFEST.json";

/* Parse on the FIRST two colons only — alt text contains punctuation. */
const items = specs.map((s) => {
  const i = s.indexOf(":"), j = s.indexOf(":", i + 1);
  if (i < 0 || j < 0) throw new Error(`bad spec (need file:slug:alt): ${s}`);
  return { file: s.slice(0, i), slug: s.slice(i + 1, j), alt: s.slice(j + 1) };
});

let html = await readFile(PAGE, "utf8");
const phCount = (html.match(/exp-card__ph/g) || []).length;
if (phCount !== items.length) {
  throw new Error(`${page} has ${phCount} placeholder cards but ${items.length} images were given — ` +
    `the --photo gate needs every card, so this is refused rather than half-applied`);
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const done = [];

for (const { file, slug, alt } of items) {
  const target = `public/assets/img/${slug}.jpg`;
  const b64path = `images-b64/assets__img__${slug}.jpg.b64`;

  const buf = await sharp(path.join(srcdir, file))
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true, mozjpeg: false })
    .toBuffer();
  const { width, height } = await sharp(buf).metadata();

  await writeFile(target, buf);
  await writeFile(b64path, buf.toString("base64"), "utf8"); // one line, no trailing newline

  if (manifest.some((m) => m.target === target)) {
    throw new Error(`${target} is already in MANIFEST.json — refusing to duplicate the entry`);
  }
  manifest.push({ b64: b64path, target, bytes: buf.length });

  /* Replace this card's __ph div and drop its sibling __overlay. Anchored to
     the specific placeholder text so the cards are matched in page order and
     one card cannot silently take another's image. */
  const re = new RegExp(
    `<div class="exp-card__ph"[^>]*>[\\s\\S]*?</div>\\s*<div class="exp-card__overlay"></div>`);
  if (!re.test(html)) throw new Error(`${page}: no unconverted exp-card__ph + __overlay pair left for ${slug}`);
  const img = `<img class="exp-card__img" src="/assets/img/${slug}.jpg" alt="${alt.replace(/"/g, "&quot;")}" ` +
    `width="${width}" height="${height}" loading="lazy" decoding="async">`;
  html = html.replace(re, img);
  done.push({ slug, width, height, kb: Math.round(buf.length / 1024) });
}

if (/exp-card__ph/.test(html)) throw new Error(`${page}: placeholders remain after conversion`);

/* Only now is the modifier safe. */
html = html.replace(/<div class="exp-cards">/, '<div class="exp-cards exp-cards--photo">');
if (!/exp-cards--photo/.test(html)) throw new Error(`${page}: could not add the --photo modifier`);

await writeFile(PAGE, html, "utf8");

/* indent 1 + CRLF + trailing newline — matches the committed file byte for byte. */
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1).replace(/\n/g, "\r\n") + "\r\n", "utf8");

for (const d of done) console.log(`  ${d.slug.padEnd(34)} ${d.width}x${d.height}  ${d.kb} KB`);
console.log(`${done.length} cards intaken, ${page} converted to .exp-cards--photo, MANIFEST now ${manifest.length} entries`);
