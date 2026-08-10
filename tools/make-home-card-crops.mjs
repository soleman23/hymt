/**
 * Card-sized crops for the homepage grids (#72).
 *
 * The homepage shipped 5.72 MB on initial load — 22 full-size heroes, every
 * one of them a CSS background-image, which cannot carry loading="lazy". The
 * worst offenders were the six Instagram tiles: 2.05 MB of full heroes
 * rendering into 191x191 squares.
 *
 * This is the same two-part fix as the related-destinations cards on #69
 * (0bc0035, tools/make-related-card-crops.mjs): the markup moves to a real
 * lazy <img>, and the bytes behind it shrink to what the box actually needs.
 * That tool is fixed at one 760x435 profile because its grid has one card
 * shape; the homepage mosaic has five, so profiles are a table here.
 *
 * Sizes are measured, not guessed — rendered boxes at a 1280 viewport were
 * standard 288x260, wide 579x260, large 579x523, featured 633x705, ig
 * 191x191. Each profile covers 1x at a 1920 viewport, where the fluid grid
 * grows those boxes by ~1.57x, and is comfortably above 1x everywhere else.
 * Quality 72 matches the related-card tool and for the same reason: every
 * cat-card sits under a linear-gradient(rgba(8,15,26,.88)) overlay with text
 * on top, so fine detail is not what these images are doing.
 *
 * Writes the crop, its base64 twin in images-b64/, and the MANIFEST entry —
 * public/assets/img/ is gitignored, so an image that skips the base64 step
 * survives locally and vanishes for everyone else.
 *
 *   node tools/make-home-card-crops.mjs
 *
 * Idempotent: a crop that already exists and is newer than its source is left
 * alone. Pass --force to rebuild every one.
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMG = path.join(ROOT, "public", "assets", "img");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");
const FORCE = process.argv.includes("--force");

const QUALITY = 72;

/* prefix -> [width, height]. The prefix also namespaces the output file, so
   one source used at two sizes (e-17 is both the featured image and an
   Instagram tile) produces two crops that cannot collide. */
export const PROFILES = {
  hc: [760, 620],   // standard cat-card, 1x1 of the mosaic
  hw: [1200, 620],  // cat-card--wide / --wide-start, 2x1
  hl: [1100, 1000], // cat-card--large / --large-end, 2x2
  hf: [1100, 1250], // featured__image, the tall half-width panel
  hi: [460, 460],   // ig-post, square
};

/* Source -> profile. Mirrors the markup in src/content-pages/home.html;
   the cat-card variants were read straight off the class names there. */
export const SOURCES = [
  ["e-26-augusta-gallery-dusk.jpg", "hl"],        // cat-card--large
  ["x-01-serengeti-elephants.jpg", "hl"],         // cat-card--large-end
  ["e-18-mediterranean-terrace-dinner.jpg", "hw"],// cat-card--wide
  ["e-04-swim-up-bar.jpg", "hw"],                 // cat-card--wide-start
  ["e-02-beach-golden-hour.jpg", "hc"],
  ["e-16-safari-vehicle-sunrise.jpg", "hc"],
  ["e-06-tuscan-landscape.jpg", "hc"],
  ["e-08-river-cruise-dawn.jpg", "hc"],
  ["e-14-private-beach-dinner.jpg", "hc"],
  ["e-10-thermal-pool-mountains.jpg", "hc"],
  ["e-20-remote-village-dawn.jpg", "hc"],
  ["e-12-patagonia-trek.jpg", "hc"],
  ["e-17-tuscan-wine-tasting.jpg", "hf"],         // featured journey panel
  ["d-01-maldives-bento.jpg", "hi"],
  ["e-01-private-sandbar.jpg", "hi"],
  ["e-03-grand-resort-dusk.jpg", "hi"],
  ["e-05-positano-alley.jpg", "hi"],
  ["e-09-jungle-yoga-pavilion.jpg", "hi"],
  ["e-17-tuscan-wine-tasting.jpg", "hi"],         // same source, square tile
];

export const cropName = (src, prefix) =>
  `${prefix}-${src.replace(/\.(jpe?g|png|webp)$/i, "")}.jpg`;

/* PROFILES/SOURCES/cropName are exported so the markup rewrite imports the
   same table rather than keeping a second copy that can drift. Only the CLI
   path builds anything. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  const byTarget = new Map(manifest.map((m) => [m.target, m]));

  let built = 0, skipped = 0, before = 0, after = 0;
  const seenSources = new Set();

  for (const [src, prefix] of SOURCES) {
    const [w, h] = PROFILES[prefix];
    const srcPath = path.join(IMG, src);
    const out = cropName(src, prefix);
    const outPath = path.join(IMG, out);

    const srcStat = await stat(srcPath);
    /* One source used twice must not be counted twice in the before total. */
    if (!seenSources.has(src)) { before += srcStat.size; seenSources.add(src); }

    const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
    if (fresh && !FORCE) {
      after += (await stat(outPath)).size;
      skipped++;
      continue;
    }

    await sharp(srcPath)
      .resize(w, h, { fit: "cover", position: "attention" })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath);

    const buf = await readFile(outPath);
    after += buf.length;
    await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");

    /* Same key order and the same `bytes` field the existing entries use. */
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
    console.log(`  ${out.padEnd(44)} ${(buf.length / 1024).toFixed(0).padStart(4)} KB  (from ${(srcStat.size / 1024).toFixed(0)} KB)`);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

  console.log(`\nbuilt ${built}, skipped ${skipped} (already fresh)`);
  console.log(`source heroes: ${(before / 1024 / 1024).toFixed(2)} MB  ->  card crops: ${(after / 1024).toFixed(0)} KB`);
  console.log(`MANIFEST.json now has ${manifest.length} entries`);
}
