/**
 * #87: the four pages the eager-image-budget check found over the 1.5 MB
 * launch gate, all carrying the same defect #72 fixed on the homepage.
 *
 *   node tools/p87-page-lazy-images.mjs          crop + rewrite
 *   node tools/p87-page-lazy-images.mjs --force  rebuild every crop
 *
 *   /destinations/                8.55 MB  41 dest-card backgrounds
 *   /travel-journal/              7.87 MB  31 article-card + 1 featured
 *   /about/                       2.90 MB  a 2.6 MB PNG below the fold
 *   /destinations/north-america/  1.95 MB  5 photo panels
 *
 * #72 split this across two scripts, one to crop and one to rewrite, which
 * left the crop table and the markup free to drift apart. Here both halves
 * read the same JOBS table: whatever a job's `find` regex matches is what
 * gets cropped AND what gets rewritten, so the source list cannot go stale.
 *
 * Every profile is 2x-ish the box measured on the live layout at a 1280
 * viewport, which keeps it above 1x at 1920 where these fluid grids grow:
 *   dest-card 385x320 · article-card 383x200 · na intro 633x1072
 *   na itinerary 289x484 · about story photo 533x680
 *
 * Quality 72 matches the card crops from #69 and #72. The about portrait is
 * the exception at 82 — it is a photograph of people at the top of the page,
 * not a tile under a gradient.
 *
 * Idempotent on both halves: fresh crops are skipped, and a page already
 * rewritten matches nothing.
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMG = path.join(ROOT, "public", "assets", "img");
const PUB = path.join(ROOT, "public");
const B64 = path.join(ROOT, "images-b64");
const MANIFEST = path.join(B64, "MANIFEST.json");
const FORCE = process.argv.includes("--force");

/* The trailing background properties every one of these carries. */
const BG = String.raw`background-image:url\('([^']+)'\)(?:;background-size:cover;background-position:center)?`;

const attrs = (crop, w, h, alt, cls) =>
  `<img class="${cls}" src="${crop}" alt="${alt}" ${alt === "" ? 'aria-hidden="true" ' : ""}` +
  `width="${w}" height="${h}" loading="lazy" decoding="async">`;

/** @type {{name:string,file:string,find:RegExp,prefix:string,w:number,h:number,quality?:number,build:Function}[]} */
const JOBS = [
  {
    name: "about story portrait",
    file: "src/content-pages/about.html",
    find: new RegExp(String.raw`<div class="story__photo" style="${BG}">`, "g"),
    prefix: "sp", w: 900, h: 1150, quality: 82,
    /* alt is the caption that already sits on the photo — asserted below, so
       this cannot silently describe the wrong person. */
    build: (crop, j) => `<div class="story__photo">${attrs(crop, j.w, j.h, "Mark Sole", "story__photo-img")}`,
  },
  {
    name: "north america intro panel",
    file: "src/content-pages/destinations__north-america.html",
    find: new RegExp(String.raw`<div class="intro-image intro-image--photo" style="${BG}" role="img" aria-label="([^"]*)">`, "g"),
    prefix: "np", w: 900, h: 1520,
    /* role="img" + aria-label was standing in for alt; a real <img> can just
       carry the same sentence, which is strictly better markup. */
    build: (crop, j, m) => `<div class="intro-image intro-image--photo">${attrs(crop, j.w, j.h, m[2], "intro-image__img")}`,
  },
  {
    name: "north america itinerary panels",
    file: "src/content-pages/destinations__north-america.html",
    find: new RegExp(String.raw`<div class="itin-image itin-image--photo" style="${BG}" role="img" aria-label="([^"]*)">`, "g"),
    prefix: "ni", w: 600, h: 1000,
    build: (crop, j, m) => `<div class="itin-image itin-image--photo">${attrs(crop, j.w, j.h, m[2], "itin-image__img")}`,
  },
  {
    name: "destinations hub cards",
    file: "src/content-pages/destinations.html",
    find: new RegExp(String.raw`<div class="dest-card__ph" style="${BG}"></div>`, "g"),
    prefix: "dc", w: 780, h: 650,
    /* Decorative: the card's own .dest-card__name carries the destination. */
    build: (crop, j) => attrs(crop, j.w, j.h, "", "dest-card__img"),
  },
  {
    name: "journal hub featured",
    file: "src/content-pages/travel-journal.html",
    find: new RegExp(String.raw`<div class="journal-featured__image-inner" style="${BG}"></div>`, "g"),
    prefix: "jf", w: 1200, h: 800,
    build: (crop, j) => attrs(crop, j.w, j.h, "", "journal-featured__img"),
  },
  {
    name: "journal hub cards",
    file: "src/content-pages/travel-journal.html",
    find: new RegExp(String.raw`<div class="article-card__image-inner" style="${BG}"></div>`, "g"),
    prefix: "jc", w: 780, h: 410,
    build: (crop, j) => attrs(crop, j.w, j.h, "", "article-card__img"),
  },
];

const cropName = (src, prefix) =>
  `${prefix}-${path.basename(src).replace(/\.(jpe?g|png|webp)$/i, "")}.jpg`;

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const byTarget = new Map(manifest.map((m) => [m.target, m]));

/** Register a crop that already exists as a file or .b64 twin but may be
 *  absent from MANIFEST — e.g. after an aborted run, or a re-run once the
 *  markup is already converted and `find` matches nothing. */
const ensureManifest = async (out) => {
  const target = `public/assets/img/${out}`;
  if (byTarget.has(target)) return false;
  const b64Path = path.join(B64, `assets__img__${out}.b64`);
  const outPath = path.join(IMG, out);
  let buf;
  try { buf = await readFile(outPath); }
  catch {
    try { buf = Buffer.from(await readFile(b64Path, "utf8"), "base64"); }
    catch { return false; }
  }
  await writeFile(b64Path, buf.toString("base64"), "utf8");
  const added = { b64: `images-b64/assets__img__${out}.b64`, target, bytes: buf.length };
  manifest.push(added);
  byTarget.set(target, added);
  return true;
};

let built = 0, skipped = 0, rewritten = 0, before = 0, after = 0, registered = 0;
const counted = new Set();

for (const job of JOBS) {
  const file = path.join(ROOT, job.file);
  let html = await readFile(file, "utf8");
  const hits = [...html.matchAll(job.find)];
  if (!hits.length) {
    /* Markup already converted — still register any existing crops so a
       re-run cannot leave .b64 twins orphaned from MANIFEST. */
    const cropRe = new RegExp(String.raw`/assets/img/${job.prefix}-[A-Za-z0-9._-]+\.jpg`, "g");
    let n = 0;
    for (const m of html.matchAll(cropRe)) {
      if (await ensureManifest(path.basename(m[0]))) n++;
    }
    registered += n;
    console.log(`  ${job.name}: nothing to do` + (n ? ` (registered ${n} orphan crops)` : ""));
    continue;
  }

  for (const m of hits) {
    /* Sources live under /assets/img/ except the about portrait, which sits
       at /assets/ — resolve against public/ either way. */
    const srcRel = m[1].replace(/^\//, "");
    const srcPath = path.join(PUB, srcRel);
    const out = cropName(srcRel, job.prefix);
    const outPath = path.join(IMG, out);

    const srcStat = await stat(srcPath).catch(() => null);
    if (!srcStat) {
      /* public/assets is gitignored, so a source missing here is missing for
         everyone. Run tools/adopt-orphan-assets.mjs before this. */
      throw new Error(
        `${job.name}: source ${m[1]} is not in public/ — it is outside the image pipeline. ` +
        `Run \`node tools/adopt-orphan-assets.mjs\` first.`);
    }
    if (!counted.has(srcRel)) { before += srcStat.size; counted.add(srcRel); }

    const fresh = await stat(outPath).then((s) => s.mtimeMs > srcStat.mtimeMs, () => false);
    if (fresh && !FORCE) {
      const buf = await readFile(outPath);
      after += buf.length;
      /* A crop can exist on disk from an aborted run without ever having been
         written to the MANIFEST. Skipping the resize must not skip that. */
      if (await ensureManifest(out)) registered++;
      skipped++;
    } else {
      await sharp(srcPath)
        .resize(job.w, job.h, { fit: "cover", position: "attention" })
        .jpeg({ quality: job.quality ?? 72, mozjpeg: true })
        .toFile(outPath);
      const buf = await readFile(outPath);
      after += buf.length;
      await writeFile(path.join(B64, `assets__img__${out}.b64`), buf.toString("base64"), "utf8");
      const target = `public/assets/img/${out}`;
      const entry = byTarget.get(target);
      if (entry) entry.bytes = buf.length;
      else {
        const added = { b64: `images-b64/assets__img__${out}.b64`, target, bytes: buf.length };
        manifest.push(added);
        byTarget.set(target, added);
      }
      built++;
    }

    const replacement = job.build(`/assets/img/${out}`, job, m);
    if (/alt="[^"]*NEEDS|undefined/.test(replacement)) {
      throw new Error(`${job.name}: replacement carries a bad alt — ${replacement.slice(0, 120)}`);
    }
    html = html.replace(m[0], () => replacement);
    rewritten++;
  }

  await writeFile(file, html, "utf8");
  console.log(`  ${job.name.padEnd(30)} ${String(hits.length).padStart(3)} converted`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

/* The about portrait's alt has to match the caption beside it. */
const about = await readFile(path.join(ROOT, "src/content-pages/about.html"), "utf8");
if (about.includes('class="story__photo-img"') && !about.includes("Mark Sole — Founder")) {
  throw new Error("about.html story caption changed — recheck the portrait's alt text");
}

console.log(`\ncrops built ${built}, skipped ${skipped}; markup rewritten ${rewritten}; orphans registered ${registered}`);
console.log(`sources: ${(before / 1024 / 1024).toFixed(2)} MB  ->  crops: ${(after / 1024 / 1024).toFixed(2)} MB`);
console.log(`MANIFEST.json now has ${manifest.length} entries`);
