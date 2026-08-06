/**
 * Post-build checks. Runs as part of `npm run build`.
 *
 *   node tools/verify-deployment.mjs
 *   node tools/verify-deployment.mjs --update-baseline
 *   node tools/verify-deployment.mjs --remote https://www.hymtravel.com
 *
 * Each check exists because the matching mistake has actually been made in
 * this repo. Add to them rather than relying on remembering the convention.
 */
import { readFile, writeFile, readdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(ROOT, "dist");
const PAGES = path.join(ROOT, "src", "pages");
const BASELINE = path.join(ROOT, "tools", "head-baseline.json");

const UPDATE = process.argv.includes("--update-baseline");
const REMOTE = (() => {
  const i = process.argv.indexOf("--remote");
  return i === -1 ? null : process.argv[i + 1]?.replace(/\/$/, "");
})();

const failures = [];
const notes = [];
const hints = [];
const fail = (check, detail) => failures.push({ check, detail });

async function walk(dir, filter) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, filter)));
    else if (filter(full)) out.push(full);
  }
  return out;
}

const exists = async (p) => access(p, constants.R_OK).then(() => true, () => false);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

/* ── 0. The build produced something ── */
if (!(await exists(path.join(DIST, "index.html")))) {
  fail("build", "dist/index.html was not generated — the build did not complete.");
  report();
}

const htmlFiles = await walk(DIST, (f) => f.endsWith(".html"));
const urlOf = (f) => "/" + rel(f).replace(/^dist\//, "").replace(/index\.html$/, "");

/* ── 1. Templated sections stay on their shared template ──
   Each page must render through its section layout and must not carry a
   pageCss string of its own; pages doing either is how one stylesheet turned
   into 8 copies under destinations and 11 under experiences. Each section's
   hub (/destinations/, /experiences/) is a different page type with its own
   hero and grid, and is exempt until it gets a template of its own. */
const TEMPLATED = [
  { dir: "destinations", layout: "DestinationLayout", css: "styles/destination.css" },
  { dir: "experiences", layout: "ExperienceLayout", css: "styles/experience.css" },
  { dir: "travel-journal", layout: "JournalLayout", css: "styles/journal.css" },
];
for (const { dir, layout, css } of TEMPLATED) {
  const hub = path.join(PAGES, dir, "index.astro");
  const pages = (await walk(path.join(PAGES, dir), (f) => f.endsWith(".astro")))
    .filter((f) => f !== hub);
  for (const file of pages) {
    const src = await readFile(file, "utf8");
    if (/\bpageCss\b/.test(src)) {
      fail("shared-template",
        `${rel(file)} defines pageCss. ${dir} pages share ${css} — ` +
          `add a modifier class there instead of a per-page stylesheet.`);
    }
    if (!new RegExp(`from\\s+["'][^"']*${layout}\\.astro["']`).test(src)) {
      fail("shared-template", `${rel(file)} does not use ${layout}.`);
    }
  }
  notes.push(`${pages.length} ${dir} pages on the shared template`);
}

/* ── 2. No double-escaped HTML entities ──
   Page copy contains literal entities (&#39;, &amp;). Passing that copy to an
   Astro prop as a JS string instead of a template attribute escapes it twice,
   so `&#39;` ships as `&amp;#39;` and renders visibly as text. */
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const hits = html.match(/&amp;(?:#\d+|#x[0-9a-f]+|[a-z]+);/gi) ?? [];
  if (hits.length) {
    const uniq = [...new Set(hits)].slice(0, 4).join(", ");
    fail("double-escaped", `${urlOf(file)} contains double-escaped entities (${uniq})`);
  }
}

/* ── 3. Every local asset a page references exists in dist ──
   Catches a stylesheet, script or image that the build did not emit. Page
   links are deliberately not checked here; this is about assets only. */
const assetRefs = new Map(); // asset path -> first page referencing it
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const refs = [
    ...[...html.matchAll(/<link[^>]+href="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<(?:script|img)[^>]+src="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/url\(['"]?(\/[^'")]+)['"]?\)/gi)].map((m) => m[1]),
  ];
  for (const ref of refs) {
    if (!ref.startsWith("/") || ref.startsWith("//")) continue;
    const clean = ref.split(/[?#]/)[0];
    if (!assetRefs.has(clean)) assetRefs.set(clean, urlOf(file));
  }
}
const missingAssets = [];
for (const [asset, page] of assetRefs) {
  if (!(await exists(path.join(DIST, asset)))) {
    missingAssets.push(asset);
    fail("missing-asset", `${asset} is referenced by ${page} but is not in dist/`);
  }
}
if (!missingAssets.length) {
  notes.push(`${assetRefs.size} distinct local assets referenced, all present`);
} else if (missingAssets.every((a) => a.startsWith("/assets/"))) {
  // astro build wipes dist/assets/, including the aliased images that only
  // restore_images.py writes. Nothing else warns about this.
  hints.push("Every missing file is under /assets/ — run `python tools/restore_images.py` (python3 on mac/linux). astro build wipes these on every run.");
}

/* ── 4. Head tags match the committed baseline ──
   Title, description and canonical are what search engines consume, and a
   generated-page change can alter them invisibly. Intentional edits are
   accepted with --update-baseline. */
const pick = (html, re) => (html.match(re)?.[1] ?? "").trim();
const heads = {};
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  heads[urlOf(file)] = {
    title: pick(html, /<title>([\s\S]*?)<\/title>/i),
    description: pick(html, /<meta name="description" content="([^"]*)"/i),
    canonical: pick(html, /<link rel="canonical" href="([^"]*)"/i),
  };
}

if (UPDATE) {
  await writeFile(BASELINE, JSON.stringify(heads, null, 1) + "\n", "utf8");
  notes.push(`baseline rewritten for ${Object.keys(heads).length} pages`);
} else if (!(await exists(BASELINE))) {
  fail("head-baseline", "tools/head-baseline.json is missing. Run with --update-baseline to create it.");
} else {
  const base = JSON.parse(await readFile(BASELINE, "utf8"));
  const urls = new Set([...Object.keys(base), ...Object.keys(heads)]);
  for (const url of urls) {
    if (!base[url]) { fail("head-baseline", `${url} is new — run --update-baseline to accept it.`); continue; }
    if (!heads[url]) { fail("head-baseline", `${url} disappeared from the build.`); continue; }
    for (const field of ["title", "description", "canonical"]) {
      if (base[url][field] !== heads[url][field]) {
        fail("head-baseline",
          `${url} ${field} changed\n      was: ${base[url][field]}\n      now: ${heads[url][field]}`);
      }
    }
  }
  notes.push(`${Object.keys(heads).length} pages checked against the head baseline`);
}

/* ── 5. Optional: confirm a deploy actually landed ──
   The FTP account does not land in the web root, so an upload can report
   success while the live site is untouched. This fetches the assets a real
   page depends on — a deploy that skipped dist/_astro/ leaves every page
   unstyled while the HTML itself still looks fine. */
if (REMOTE) {
  const sample = ["/", "/destinations/st-barths/", "/destinations/maldives/"];
  for (const page of sample) {
    const res = await fetch(REMOTE + page).catch((e) => ({ ok: false, status: e.message }));
    if (!res.ok) { fail("remote", `${REMOTE}${page} returned ${res.status}`); continue; }
    const html = await res.text();
    for (const href of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/[^"]+)"/gi)].map((m) => m[1])) {
      const asset = await fetch(REMOTE + href, { method: "HEAD" }).catch((e) => ({ ok: false, status: e.message }));
      if (!asset.ok) fail("remote", `${page} links ${href} but it returns ${asset.status} on the server`);
    }
  }
  notes.push(`remote spot-check against ${REMOTE}`);
}

report();

function report() {
  for (const n of notes) console.log(`  ok  ${n}`);
  if (!failures.length) {
    console.log(`  ok  ${htmlFiles?.length ?? 0} pages verified`);
    return;
  }
  const byCheck = {};
  for (const f of failures) (byCheck[f.check] ??= []).push(f.detail);
  console.error("\nBuild verification failed:\n");
  for (const [check, details] of Object.entries(byCheck)) {
    console.error(`  [${check}] ${details.length} problem${details.length > 1 ? "s" : ""}`);
    for (const d of details.slice(0, 10)) console.error(`    - ${d}`);
    if (details.length > 10) console.error(`    ...and ${details.length - 10} more`);
  }
  for (const h of hints) console.error(`
  -> ${h}`);
  console.error("");
  process.exit(1);
}
