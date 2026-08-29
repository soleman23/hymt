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
import { readFile, writeFile, readdir, access, stat } from "node:fs/promises";
import { constants, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
/* Fixture-tested in tools/verify-checks.test.mjs. Both of these were written
   inline here first and both were wrong in ways a passing build could not
   show — see that file's header. */
import {
  linkFloor, testimonialAttribution, faqFirstSentenceOver,
  unsafeHrefs, inertCostSections, costFigureShape, futureLastmods, lastmodPairs, visibleText, PLACEHOLDER_PATTERNS,
  unsafeBlankLinks, eagerImageRefs, llmsClaimMismatches, heroStatLabels,
  undefinedInlineHandlers, linklessCards, inlineHandlers, uncappedFields, itemListDefects,
  imageDims, imgRatioMismatches, inlineScriptHashes, cspDirective, cspScriptSrcDrift,
  analyticsUngated, unscopedAccordionHides, web3formsKeys, hasHoneypot,
  htaccessGaps, HTACCESS_SECURITY_HEADERS, CSP_DIRECTIVES, photoGridDefects,
  nestedCardAnchors,
  bodyWords, crumbTrail, remoteRoutes, remoteMisses, remoteThrottled, isThrottled,
} from "./content-checks.mjs";
/* Toolchain checks, same import-do-not-copy rule as above. */
import {
  lockfileMetadataLoss, lockfileCheckState, crDefect, isBinaryDistFile,
} from "./repo-checks.mjs";
/* Same helper the sitemap dates are generated with, so "today" here cannot
   drift from the convention in tools/git-lastmod.mjs. */
import { localDay } from "./git-lastmod.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(ROOT, "dist");
const PAGES = path.join(ROOT, "src", "pages");
const BASELINE = path.join(ROOT, "tools", "head-baseline.json");

const UPDATE = process.argv.includes("--update-baseline");
const REMOTE = (() => {
  const i = process.argv.indexOf("--remote");
  return i === -1 ? null : process.argv[i + 1]?.replace(/\/$/, "");
})();

/* CONTENT-STANDARDS § 3.4, destination country pages. Measured against the
   built site: 34 such pages run 1,215–3,402 words of body copy. */
const DEST_MAX_WORDS = 3500;

const failures = [];
const notes = [];
const hints = [];
const fail = (check, detail) => failures.push({ check, detail });

/* Checks whose subject matter is built in a LATER phase register here as
   warnings until that phase lands, then flip to fail(). All have now
   flipped: schema-required at P2-4, title-length and desc-length at P3-1.
   The mechanism stays for future phases — call softFail(check, phase, detail)
   for a check whose subject matter does not exist yet. */
const softFailures = [];
const softFail = (check, phase, detail) => softFailures.push({ check, phase, detail });

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

/* ── 1b. All JSON-LD routes through Schema.astro (P2-1) ──
   No page or layout hand-writes a ld+json script tag; the component is the
   single emission point so the verifier can reason about every node. */
for (const file of await walk(path.join(ROOT, "src"), (f) => f.endsWith(".astro") || f.endsWith(".ts"))) {
  if (rel(file) === "src/components/Schema.astro") continue;
  const src = await readFile(file, "utf8");
  if (src.includes("application/ld+json")) {
    fail("schema-source", `${rel(file)} hand-writes a ld+json script — route it through src/components/Schema.astro`);
  }
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
  hints.push("Every missing file is under /assets/ — run `npm run restore`. astro build wipes these on every run; `npm run build` restores them automatically.");
}

/* ── 3a. Every asset the SOURCE references is in the image pipeline ──
   The dist check above cannot see this class: public/assets is gitignored, so
   an image only survives a fresh clone via its base64 twin and MANIFEST entry
   — but a stale copy left in this machine's dist/ makes the dist check pass
   anyway. Eleven images were shipping that way when #87 found them; a fresh
   clone would have built a site with eleven broken images. So check the
   source, not the artifact. */
{
  const manifest = JSON.parse(await readFile(path.join(ROOT, "images-b64", "MANIFEST.json"), "utf8"));
  const known = new Set(manifest.map((m) => m.target));
  const srcRefs = new Map(); // asset -> first source file referencing it
  for (const file of await walk(path.join(ROOT, "src"), (f) => /\.(html|astro)$/.test(f) && !f.includes(".bak"))) {
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(/\/assets\/[A-Za-z0-9._/-]+\.(?:jpe?g|png|webp|svg)/g)) {
      if (!srcRefs.has(m[0])) srcRefs.set(m[0], rel(file));
    }
  }
  let orphans = 0;
  for (const [asset, from] of srcRefs) {
    if (known.has(`public${asset}`)) continue;
    if (await exists(path.join(ROOT, "public", asset.replace(/^\//, "")))) continue;
    orphans++;
    fail("source-asset-coverage",
      `${asset} (referenced by ${from}) is in neither images-b64/MANIFEST.json nor public/ — ` +
        `it will 404 on a fresh clone. Run \`node tools/adopt-orphan-assets.mjs\`.`);
  }
  if (!orphans) notes.push(`${srcRefs.size} source-referenced assets all in the image pipeline`);

  /* The reverse direction, as a NOTE not a failure: tracked assets nothing
     references. Never a build error — an unused asset breaks nothing, and
     proposing deletions is not this check's job. It prints because the most
     expensive recorded lesson in this repo is "check the repo before
     generating, not just Drive": kenya-tanzania-serengeti.jpg sat unused at
     exactly the right slug and size while work went looking for it. Anyone
     about to spend a credit on a subject should see the free frames first.

     Scans by BASENAME across every text file in src/ and public/, not the
     srcRefs index above: that index reads only image URLs out of .html and
     .astro, so fonts (referenced from CSS) and anything named in llms.txt
     would be reported as unused. Restricted to images for the same reason —
     this is about photography, not about every tracked byte. */
  {
    const textFiles = [
      ...(await walk(path.join(ROOT, "src"), (f) => /\.(html|astro|ts|js|mjs|css|json|txt|md)$/.test(f))),
      ...(await walk(path.join(ROOT, "public"), (f) => /\.(html|css|js|json|txt|xml|webmanifest)$/.test(f))),
    ];
    let haystack = "";
    for (const f of textFiles) haystack += await readFile(f, "utf8");
    const unused = manifest
      .map((m) => m.target)
      .filter((t) => /\.(jpe?g|png|webp)$/i.test(t) && !haystack.includes(path.basename(t)));
    if (unused.length) {
      const shown = unused.map((t) => path.basename(t)).sort();
      notes.push(
        `${unused.length} tracked image${unused.length === 1 ? "" : "s"} referenced nowhere — ` +
          `free to use before generating anything new: ${shown.slice(0, 5).join(", ")}` +
          (shown.length > 5 ? `, +${shown.length - 5} more (grep images-b64/MANIFEST.json)` : ""));
    }
  }
}

/* img-ratio reads image headers from dist/. Memoised: the logo alone is
   referenced 290 times, and every asset the site references is read once. */
const imageDimsCache = new Map();
const dimsOf = (src) => {
  if (!imageDimsCache.has(src)) {
    let dims = null;
    try { dims = imageDims(readFileSync(path.join(DIST, src))); } catch { /* missing-asset reports it */ }
    imageDimsCache.set(src, dims);
  }
  return imageDimsCache.get(src);
};

/* ── 3b. og:image resolves to a file that exists ──
   Every page pointed og:image at /assets/og-default.jpg while the file did
   not exist (F12) — social shares 404'd for months. The og:image URL is
   absolute, so the relative-asset check above never sees it. */
const ogMissing = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const og = (html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ?? "").trim();
  if (!og) { fail("og-image", `${urlOf(file)} has no og:image`); continue; }
  const clean = (og.startsWith("http") ? new URL(og).pathname : og).split(/[?#]/)[0];
  if (!(await exists(path.join(DIST, clean)))) { ogMissing.add(clean); continue; }

  /* og:image:alt — CONTENT-STANDARDS § 4. It must describe the IMAGE, so the
     one thing worth failing on beyond absence is a page that inherits the
     crest plate's alt while shipping a photograph, or the reverse: an alt
     that names a place while the image is the plate. Both are checked by
     pairing alt against which file is actually referenced. */
  const alt = (html.match(/<meta property="og:image:alt" content="([^"]*)"/i)?.[1] ?? "").trim();
  const url = urlOf(file);
  if (!alt) {
    fail("og-image", `${url} has no og:image:alt — CONTENT-STANDARDS § 4 requires one describing the image`);
  } else if (/\[object Object\]|\bundefined\b|\bNaN\b/.test(alt)) {
    /* A template interpolating a prop of the wrong shape. This exact bug
       shipped "Italy, [object Object]" to 43 pages, because DestinationLayout's
       `region` is {label, href} and not a string. Nothing would have caught
       it: the tag was present and non-empty. */
    fail("og-image", `${url} og:image:alt is "${alt}" — a value was interpolated that is not a string`);
  } else if (clean.endsWith("/og-default.jpg") && alt !== "Hit Your Mark Travel") {
    fail("og-image", `${url} ships the crest plate but its og:image:alt says "${alt}" — the alt describes the image, and the plate is not a photograph of that`);
  } else if (!clean.endsWith("/og-default.jpg") && alt === "Hit Your Mark Travel") {
    fail("og-image", `${url} ships a photograph (${clean}) but kept the crest plate's alt — pass ogImageAlt describing the picture`);
  }

  /* The width/height literals in Base.astro are only safe while every
     og:image really is that size. Read the file's own header and compare. */
  const declaredW = Number(html.match(/<meta property="og:image:width" content="(\d+)"/i)?.[1]);
  const declaredH = Number(html.match(/<meta property="og:image:height" content="(\d+)"/i)?.[1]);
  if (!declaredW || !declaredH) {
    fail("og-image", `${url} declares og:image without og:image:width/height`);
  } else {
    const real = dimsOf(clean);
    if (real && (real.w !== declaredW || real.h !== declaredH)) {
      fail("og-image", `${url} declares og:image ${declaredW}×${declaredH} but ${clean} is ${real.w}×${real.h}`);
    }
  }
}
for (const p of ogMissing) {
  fail("og-image", `og:image target ${p} is not in dist/`);
  if (p.startsWith("/assets/")) hints.push(`og:image ${p} lives under /assets/ — run \`npm run restore\`.`);
}

/* ── 4. Head tags match the committed baseline ──
   Title, description and canonical are what search engines consume, and a
   generated-page change can alter them invisibly. Intentional edits are
   accepted with --update-baseline. */
const pick = (html, re) => (html.match(re)?.[1] ?? "").trim();

/* Decode the entities Astro emits, so length checks measure the string a
   human and a search engine actually see. Without this `&#38;` scores 5
   characters instead of 1 and falsely fails compliant titles (P3-1 found
   /destinations/spain/ and /destinations/uk-ireland/ flagged this way).
   Baseline comparison deliberately still uses the RAW string — it is a
   change-detector, and decoding there would hide a real encoding change. */
const decodeEntities = (s) => s
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
  .replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘")
  .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
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

/* ── 4b. Page-quality gates (P1-6) ──
   Every machine-checkable standard from docs/seo/SEO-AIO-PLAN.md lives here
   so it enforces itself on every future page instead of depending on anyone
   remembering. The canonical host is read from astro.config.mjs `site` —
   the single place the production domain is written. */
const SITE = (await readFile(path.join(ROOT, "astro.config.mjs"), "utf8"))
  .match(/site:\s*'([^']+)'/)?.[1]?.replace(/\/$/, "") ?? "";
if (!SITE) fail("canonical-host", "could not read `site` from astro.config.mjs");

/* sitemap-parity: the generated sitemap must exist, cover every indexable
   page (HTML minus the 404), and robots.txt must point at a file that is
   actually in dist/. This is the drift class that produced the old
   93-URLs-for-94-pages hand-maintained sitemap. */
{
  const s0 = path.join(DIST, "sitemap-0.xml");
  if (!(await exists(path.join(DIST, "sitemap-index.xml"))) || !(await exists(s0))) {
    fail("sitemap-parity", "sitemap-index.xml / sitemap-0.xml missing from dist/ — the @astrojs/sitemap integration did not run");
  } else {
    const urls = [...(await readFile(s0, "utf8")).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const expected = htmlFiles.length - 1;
    if (urls.length !== expected) {
      fail("sitemap-parity", `sitemap has ${urls.length} URLs but dist has ${expected} indexable pages (HTML files minus the 404)`);
    }
    const bad = urls.find((u) => !u.startsWith(SITE + "/") || !u.endsWith("/"));
    if (bad) fail("sitemap-parity", `sitemap URL ${bad} is not a trailing-slash ${SITE} URL`);
  }
  const robots = await readFile(path.join(DIST, "robots.txt"), "utf8").catch(() => "");
  const sm = robots.match(/^Sitemap:\s*(\S+)/im)?.[1];
  if (!sm) {
    fail("sitemap-parity", "dist/robots.txt has no Sitemap: line");
  } else if (!(await exists(path.join(DIST, new URL(sm).pathname)))) {
    fail("sitemap-parity", `robots.txt points at ${new URL(sm).pathname}, which is not in dist/`);
  }
}

/* sitemap-future-lastmod: a lastmod dated after the build day claims a page
   changed on a day that has not happened. Google's guidance is to stop trusting
   a sitemap's dates once they stop being accurate, so one bad entry devalues
   the signal for every URL in the file.

   This shipped. `/` and `/about/` carried 2026-08-25 in committed dist because
   tools/git-lastmod.mjs dated dirty files in UTC while committed files came from
   `%cI` in local offset, so any build whose local clock was within the zone's UTC
   offset of midnight — after 17:00 in PDT, 16:00 in PST — with an uncommitted page
   source wrote tomorrow's date. Root cause is fixed there;
   this guards the shape whatever produces it next — clock skew, a restored file
   with a future mtime, or a timezone regression all land in the same place.

   Both files are scanned: sitemap-index.xml carries its own lastmod and is one
   of the two the original bad date landed in, so checking sitemap-0.xml alone
   would leave the hole exactly where the bug already went. */
{
  const today = localDay(new Date());
  /* Enumerated rather than hardcoded: @astrojs/sitemap chunks at entryLimit
     (45,000) into sitemap-1.xml and beyond, and a fixed list would quietly stop
     covering the file that grew. */
  const files = (await readdir(DIST)).filter((n) => /^sitemap.*\.xml$/i.test(n)).sort();
  let seen = 0;
  let futures = 0;
  for (const name of files) {
    const xml = await readFile(path.join(DIST, name), "utf8").catch(() => "");
    /* The pair regex needs <lastmod> adjacent to its </loc>, which is the
       `sitemap` package's emission order rather than anything guaranteed. If
       that drifts the predicate parses nothing and this check goes quietly
       green, so a count mismatch is itself a failure. */
    const declared = (xml.match(/<lastmod>/gi) || []).length;
    const pairs = lastmodPairs(xml);
    if (declared !== pairs.length) {
      fail("sitemap-future-lastmod",
        `${name}: parsed ${pairs.length} of ${declared} <lastmod> elements — the date check cannot see them all, so it is not guarding this file`);
    }
    seen += pairs.length;
    for (const [loc, when] of futureLastmods(xml, today)) {
      futures++;
      fail("sitemap-future-lastmod",
        `${name}: ${loc} has lastmod ${when}, after today (${today}) — dist is stale and wants a rebuild, or it was generated where the clock, the timezone, or a commit's own recorded %cI offset runs ahead of this machine`);
    }
  }
  if (!futures) notes.push(`${seen} sitemap lastmod dates across ${files.length} files, all on or before ${today}`);
}

const linkResolves = async (p) => {
  const noSlash = p.replace(/\/$/, "");
  if (!noSlash) return exists(path.join(DIST, "index.html"));
  return (await exists(path.join(DIST, noSlash, "index.html"))) ||
         (await exists(path.join(DIST, noSlash)));
};

/* dead-inline-handler: an inline handler that calls a function nothing defines
   (#104). This shipped and survived because every other signal was green — the
   markup is valid, the build is clean, and a dead button looks exactly like a
   live one. 82 of them across the journal: copyLink() on 64, shareArticle() on
   18, defined nowhere.

   DEAD_HANDLER_DEBT is a ratchet, not an exemption, on the same terms as
   EAGER_IMAGE_DEBT above: a listed name may only ever appear FEWER times, an
   unlisted one fails outright, and an entry that drops to zero fails until it
   is deleted. Every entry must name the issue that removes it. */
const DEAD_HANDLER_DEBT = {
  /* Empty because it worked. filterArticles (13 calls) was the only entry;
     #105 built the feature it named, the ratchet then demanded its entry
     back out, and this is the state it should always return to. */
};
const deadHandlerSeen = new Map();

/* inline-handler (#100): the CSP blocker itself, not a style preference.
   Dropping 'unsafe-inline' from script-src is the whole of #100, and every
   inline handler attribute anywhere on the site is a reason it cannot be
   dropped. 46 shipped — 35 card divs navigating via window.location.href,
   plus the multi-step form's own controls — and not one of them could be seen
   by dead-inline-handler above, because every one of them worked.

   INLINE_HANDLER_DEBT is a ratchet on the same terms as the two above: a
   listed name may only ever appear FEWER times, an unlisted one fails
   outright, and an entry that reaches zero fails until it is deleted.

   Empty, and it should stay empty. Nothing here needs one: a control that
   navigates is a link, and a control that runs script is wired in the script
   that already defines what it calls. */
const INLINE_HANDLER_DEBT = {};
const inlineHandlerSeen = new Map();

/* hero-stat-rail: runbook § 2.5 gates on this, and until #94 it was a gate at
   0% that nothing could detect. The rail renders only the stats a page supplies
   and is hidden below 900px, so a page missing one looks fine in review and
   builds green. Every destination page must carry Best Season AND Best For.
   Flight Time is deliberately not required -- see #94 and the worksheet header. */
{
  const REQUIRED = ["Best Season", "Best For"];
  for (const file of htmlFiles) {
    const rel = path.relative(DIST, file).split(path.sep).join("/");
    if (!/^destinations\/[^/]+\/index\.html$/.test(rel)) continue;
    const labels = heroStatLabels(await readFile(file, "utf8"));
    for (const need of REQUIRED) {
      if (!labels.includes(need)) {
        fail("hero-stat-rail", `/${rel.replace(/index\.html$/, "")} has no "${need}" stat (found: ${labels.join(", ") || "none"})`);
      }
    }
  }
}

/* llms-txt: the file is a hand-authored map of the site for AI assistants
   (#36), which makes it the one shipped page nothing else re-derives. The
   SCHEMA-LIBRARY template it was built from had gone stale exactly this way
   — "42 destination guides", "29 property assessments" — against a site
   with 43 and 32. Two things are asserted: every count it states is still
   true of the built site, and every link in it resolves. Claims are matched
   by fixed phrase; the phrases and the predicate are fixture-tested. */
{
  const llms = await readFile(path.join(DIST, "llms.txt"), "utf8").catch(() => null);
  if (llms === null) {
    fail("llms-txt", "dist/llms.txt is missing — public/llms.txt did not ship");
  } else {
    const sectionCount = async (dir) => {
      const entries = await readdir(path.join(DIST, dir), { withFileTypes: true }).catch(() => []);
      let n = 0;
      for (const e of entries) {
        if (e.isDirectory() && await exists(path.join(DIST, dir, e.name, "index.html"))) n++;
      }
      return n;
    };
    const actual = {
      destinations: await sectionCount("destinations"),
      experiences: await sectionCount("experiences"),
      journal: await sectionCount("travel-journal"),
    };
    for (const m of llmsClaimMismatches(llms, actual)) fail("llms-txt", m);

    for (const url of llms.match(/https:\/\/[^\s)\]]+/g) ?? []) {
      if (!url.startsWith(SITE + "/")) {
        fail("llms-txt", `${url} is not a ${SITE} URL`);
        continue;
      }
      const p = new URL(url).pathname;
      if (p.includes(".")) {
        if (!(await exists(path.join(DIST, p)))) fail("llms-txt", `${p} is not in dist/`);
      } else if (!(await linkResolves(p))) {
        fail("llms-txt", `${p} does not resolve in dist/`);
      }
    }
  }
}

/* csp-script-src (#100): the report-only CSP names every inline script by
   hash instead of carrying 'unsafe-inline'. That only works if the list is
   complete and current, and any edit to any inline <script> changes its
   hash - one did in the session that wrote this. Under report-only a stale
   list is a console line nobody reads; under enforcing it is that script
   dead on every page carrying it. So the list is diffed against dist/ on
   every build, and the failure prints the exact script-src to paste. The
   header ships from public/.htaccess and is asserted on the copy that
   actually deploys, dist/.htaccess - which nothing else checked existed. */
{
  const htaccess = await readFile(path.join(DIST, ".htaccess"), "utf8").catch(() => null);
  if (htaccess === null) {
    fail("csp-script-src", "dist/.htaccess is missing — public/.htaccess did not ship, so no header on the site is what the repo says it is");
  } else {
    const HEADER = "Content-Security-Policy-Report-Only";
    const scriptSrc = cspDirective(htaccess, HEADER, "script-src");
    if (scriptSrc === null) {
      fail("csp-script-src", `dist/.htaccess has no ${HEADER} header with a script-src directive`);
    } else {
      const needed = new Set();
      const firstPage = new Map();
      for (const file of htmlFiles) {
        for (const h of inlineScriptHashes(await readFile(file, "utf8"))) {
          needed.add(h);
          if (!firstPage.has(h)) firstPage.set(h, urlOf(file));
        }
      }
      const { missing, stale, unsafeInline } = cspScriptSrcDrift(scriptSrc, needed);
      if (missing.length || stale.length || unsafeInline) {
        for (const h of missing) fail("csp-script-src", `script-src lacks '${h}' — an inline script on ${firstPage.get(h)} would be blocked under enforcement`);
        for (const h of stale) fail("csp-script-src", `script-src lists '${h}', which no built page carries — a script changed and the hash was not regenerated`);
        if (unsafeInline) fail("csp-script-src", "script-src still carries 'unsafe-inline'; a browser ignores it once any hash is present, so it only reads as permissive");
        const hosts = scriptSrc.split(/\s+/).filter((t) => t && !/^'sha256-/.test(t) && t !== "'unsafe-inline'");
        const want = [...hosts.filter((t) => t.startsWith("'")), ...[...needed].sort().map((h) => `'${h}'`), ...hosts.filter((t) => !t.startsWith("'"))].join(" ");
        hints.push(`csp-script-src: replace the script-src value in public/.htaccess with:\n    ${want}`);
      } else {
        notes.push(`${needed.size} inline script hashes in the CSP, all current, no 'unsafe-inline' in script-src`);
      }
    }
  }
}

/* htaccess-headers: the file that carries every header the site sends, and
   which nothing asserted. Renaming public/.htaccess, or editing one line of
   its header block, left the build fully green while the site shipped with
   no CSP, no security headers, no staging noindex and no cache rules. The
   staging-noindex check covers one leg of this but only under --remote, so
   only after the mistake has already deployed.

   Read from dist/, not public/ — dist/.htaccess is what gets uploaded, and
   asserting the two match is what proves astro copied it at all. */
{
  const distHt = await readFile(path.join(DIST, ".htaccess"), "utf8").catch(() => null);
  const publicHt = await readFile(path.join(ROOT, "public", ".htaccess"), "utf8").catch(() => null);
  if (distHt === null) {
    fail("htaccess-headers", "dist/.htaccess is missing — the site would ship with no CSP, no security headers, no staging noindex and no cache rules");
  } else {
    for (const gap of htaccessGaps(distHt)) fail("htaccess-headers", `dist/.htaccess: ${gap}`);
    if (publicHt !== null && publicHt !== distHt) {
      fail("htaccess-headers", "dist/.htaccess differs from public/.htaccess — the build did not copy the current file, so the deployed headers are not the ones in the repo");
    }
    if (!failures.some((f) => f.check === "htaccess-headers")) {
      notes.push(`.htaccess shipped with ${HTACCESS_SECURITY_HEADERS.length} security headers, the staging noindex, ${CSP_DIRECTIVES.length} CSP directives, and no immutable cache rule`);
    }
  }
}

/* web3forms (#74): the access key is THE key, there is exactly one of it
   across the site, and every page that carries it carries the honeypot.

   CLAUDE.md: never change the Web3Forms access key. The key is pinned here
   on purpose, which makes a rotation touch four files rather than three
   (Newsletter.astro, contact.html, plan-your-trip.html, and this). That is
   the intended friction: the recipient problem in #74 is a dashboard
   setting, and minting a fresh key against the right address is the
   tempting wrong fix - it silently orphans every submission on any page a
   deploy misses, and it is the one change CLAUDE.md names. A partial
   rotation is the other failure this sees: two keys live at once, and the
   form on the page still carrying the old one fails with no build error.
   If a rotation is ever deliberate and authorised, update the constant here
   in the same commit and say so. */
const WEB3FORMS_KEY = "94312057-04b8-44d8-a7a8-7cb083d999b8";
{
  const seen = new Map(); // key -> first page
  let carriers = 0, honeypotMissing = 0;
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const keys = web3formsKeys(html);
    if (!keys.length) continue;
    carriers++;
    for (const k of keys) if (!seen.has(k)) seen.set(k, urlOf(file));
    if (!hasHoneypot(html)) {
      honeypotMissing++;
      fail("web3forms", `${urlOf(file)} carries the access key but no botcheck honeypot`);
    }
  }
  if (!carriers) {
    fail("web3forms", "no built page carries the Web3Forms access key — the forms did not ship");
  }
  for (const [k, page] of seen) {
    if (k !== WEB3FORMS_KEY) {
      fail("web3forms", `${page} carries access key ${k}, not the site's key — CLAUDE.md: never change it (a partial rotation leaves two keys live; a full one is the wrong fix for #74)`);
    }
  }
  if (!failures.some((f) => f.check === "web3forms")) {
    notes.push(`Web3Forms key on ${carriers} pages, one key, honeypot on every one`);
  }
}

/* accordion-noscript, bundled half. section-shared.css carries the .pf-a
   hide and Astro bundles it under dist/_astro/; the inline-<style> half runs
   in the per-page loop above. The scoped hide must also still EXIST — a
   check that only looks for the wrong shape would stay green if the whole
   accordion CSS quietly stopped shipping. */
{
  const cssFiles = await walk(path.join(DIST, "_astro"), (f) => f.endsWith(".css")).catch(() => []);
  let scopedSeen = false;
  for (const file of cssFiles) {
    const css = await readFile(file, "utf8");
    if (/\.js-accordion\s+\.pf-a\s*\{[^}]*display\s*:\s*none/.test(css)) scopedSeen = true;
    for (const sel of unscopedAccordionHides(css)) {
      fail("accordion-noscript", `${rel(file)} hides an accordion answer outside .js-accordion: ${sel} — with JS off the answer is invisible (P0-1)`);
    }
  }
  if (!scopedSeen) {
    fail("accordion-noscript", "no bundled stylesheet carries the scoped `.js-accordion .pf-a{display:none}` rule — the accordion CSS did not ship");
  }
}

/* Runbook §2.4 gates launch at 1.5 MB initial load. Images are effectively
   all of it — see the eager-image-budget check below.

   EAGER_IMAGE_DEBT is a ratchet, not an exemption: a listed page may only
   ever get smaller, any page NOT listed is held to the full budget, a listed
   page that drops under budget fails until its entry is deleted, and an entry
   for a page the build no longer produces fails too.

   It is empty because it worked. #72 fixed the homepage; the check it shipped
   with immediately found the same defect on four more pages the #31 dry-run
   had never measured. Those were recorded here, fixed in #87, and the check
   then demanded its own entries back out. Every page is held to the full
   1.5 MB again — which is the state this should always return to. */
const EAGER_IMAGE_BUDGET = 1.5 * 1024 * 1024;
const EAGER_IMAGE_DEBT = {};
let eagerPeak = 0;
const eagerDebtSeen = new Set();

const deadLinks = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const url = urlOf(file);
  const is404 = file.endsWith("404.html");

  /* linkless-card (#106): a card that advertises an article must link to one.
     7 of 39 on the journal index did not, and no check could see it —
     internal-links validates hrefs that exist, and a card with no href has
     none to validate. Also guards the ItemList schema, which is built by
     parsing for this exact link. */
  for (const title of linklessCards(html)) {
    fail("linkless-card", `${url} has an article card with no in-site link: "${title}"`);
  }

  /* dead-inline-handler (#104) — see DEAD_HANDLER_DEBT above. */
  for (const { name, count } of undefinedInlineHandlers(html)) {
    const allowed = DEAD_HANDLER_DEBT[name];
    deadHandlerSeen.set(name, (deadHandlerSeen.get(name) ?? 0) + count);
    if (allowed === undefined) {
      fail("dead-inline-handler", `${url} calls ${name}() from an inline handler ${count}\u00d7, and nothing defines it`);
    }
  }

  /* inline-handler (#100) — see INLINE_HANDLER_DEBT above. */
  for (const { name, count } of inlineHandlers(html)) {
    inlineHandlerSeen.set(name, (inlineHandlerSeen.get(name) ?? 0) + count);
    if (INLINE_HANDLER_DEBT[name] === undefined) {
      fail("inline-handler",
        `${url} carries ${count} inline ${name}= handler${count === 1 ? "" : "s"}, ` +
          `which script-src 'unsafe-inline' has to permit (#100)`);
    }
  }

  /* field-maxlength (#74): every field a visitor can type into carries a
     length cap. All three forms POST straight to Web3Forms from the client,
     so maxlength is the only in-repo limit on a submission's size. The
     Newsletter shipped without one on 94 pages while the deployment guide
     said all three forms were capped; nothing could see it. */
  for (const tag of uncappedFields(html)) {
    fail("field-maxlength", `${url} has a user-editable field with no maxlength: ${tag.slice(0, 90)}…`);
  }

  /* analytics-host-gate: CLAUDE.md, never fire analytics on the staging
     host. One line in Analytics.astro is all that enforces it, and it ships
     on every page. Dropped, inverted or re-hosted, this goes red. */
  if (analyticsUngated(html)) {
    fail("analytics-host-gate", `${url} loads analytics without the location.hostname !== 'www.hymtravel.com' gate — it would fire on staging`);
  }

  /* photo-grid (#93): a grid carrying the --photo modifier claims every
     card is a real photograph. A half-converted page built green before
     this; the defect was visible only in a browser. */
  for (const defect of photoGridDefects(html)) {
    fail("photo-grid", `${url}: ${defect}`);
  }

  /* nested-card-anchor (#93): a card IS an <a>, so a link in its copy is
     invalid and the parser splits the card into pieces. Source-shape checks
     cannot see this — argentina shipped 12 .place-card elements for 6 cards
     while every check here stayed green. */
  for (const defect of nestedCardAnchors(html)) {
    fail("nested-card-anchor", `${url}: ${defect}`);
  }

  /* accordion-noscript (P0-1): the answer hide rule stays inside
     .js-accordion, in inline <style> as well as the bundled CSS below. */
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const sel of unscopedAccordionHides(m[1])) {
      fail("accordion-noscript", `${url} inline <style> hides an accordion answer outside .js-accordion: ${sel}`);
    }
  }

  /* img-attrs: intrinsic dimensions prevent CLS; alt is non-negotiable;
     decoding="async" is CLAUDE.md's rule for every <img> and was missing
     from the two logo tags on all 98 pages. */
  for (const img of html.match(/<img\b[^>]*>/gi) ?? []) {
    for (const attr of ["alt", "width", "height", "decoding"]) {
      if (!new RegExp(`\\b${attr}=`).test(img)) {
        fail("img-attrs", `${url} has an <img> missing ${attr}: ${img.slice(0, 80)}…`);
      }
    }
  }
  /* img-ratio: and the dimensions must be TRUE. Every logo <img> declared
     1254x1254 for a 256x256 file for as long as the file has been 256x256,
     and img-attrs, which only asks whether the attributes exist, was green
     throughout. Judged on ratio, so a declaration at the rendered size still
     passes; a declaration whose shape disagrees with the file's reserves the
     wrong box and shifts the page when the image lands. */
  for (const { src, declared, real } of imgRatioMismatches(html, dimsOf)) {
    fail("img-ratio", `${url} declares ${src} as ${declared} but the file is ${real}`);
  }

  /* canonical-host: nothing may point anywhere but the production host.
     canonical-query (P1-7/F14): canonicals must never carry a query string.
     /plan-your-trip/?type=group is the SAME page as /plan-your-trip/ —
     Base.astro deliberately derives canonicals from Astro.url.pathname,
     which has no .search. If canonical-query fires, someone "improved"
     that derivation. */
  for (const [what, val] of [
    ["canonical", pick(html, /<link rel="canonical" href="([^"]*)"/i)],
    ["og:url", pick(html, /<meta property="og:url" content="([^"]*)"/i)],
  ]) {
    if (val && !val.startsWith(SITE)) {
      fail("canonical-host", `${url} ${what} is ${val} — must start with ${SITE}`);
    }
    if (val && val.includes("?")) {
      fail("canonical-query", `${url} ${what} carries a query string: ${val}`);
    }
  }

  /* single-h1 / heading-order */
  const h1s = (html.match(/<h1\b/gi) ?? []).length;
  if (h1s !== 1) fail("single-h1", `${url} has ${h1s} <h1> elements`);
  let prev = 0;
  for (const m of html.matchAll(/<h([1-6])\b/gi)) {
    const lvl = +m[1];
    if (prev && lvl > prev + 1) {
      fail("heading-order", `${url} jumps h${prev} → h${lvl}`);
      break;
    }
    prev = lvl;
  }

  /* schema-valid, and collect @types for schema-required */
  const schemaTypes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      for (const node of [].concat(JSON.parse(m[1]))) schemaTypes.push(node["@type"]);
    } catch {
      fail("schema-valid", `${url} has an application/ld+json block that does not JSON.parse`);
    }
    /* canonical-host, JSON-LD leg: self-referential URLs must use the
       production host. External URLs (sameAs profiles etc.) are legitimate,
       so only a wrong version of our own host fails: bare/apex/http
       hymtravel.com, or a hostingersite.com staging leak. */
    for (const u of m[1].match(/https?:\/\/[^"\\\s]+/g) ?? []) {
      if ((/\bhymtravel\.com/i.test(u) && !u.startsWith(SITE)) || /hostingersite\.com/i.test(u)) {
        fail("canonical-host", `${url} JSON-LD URL ${u} — site URLs in schema must start with ${SITE}`);
      }
    }
  }
  /* schema-itemlist: an ItemList that parses can still be wrong. The journal
     hub's is built by parsing the hub HTML, and the featured post is also a
     card in the grid, so it listed one URL at two positions and claimed 33
     for 32 posts. schema-valid saw a block that parsed and moved on. */
  for (const defect of itemListDefects(html)) {
    fail("schema-itemlist", `${url}: ${defect}`);
  }
  /* schema-required — flipped hard at P2-4, extended to the full page-type
     mapping from SCHEMA-LIBRARY.md §4. Every page type must emit its set. */
  if (html.includes('class="breadcrumb') && !schemaTypes.includes("BreadcrumbList")) {
    fail("schema-required", `${url} renders breadcrumbs but emits no BreadcrumbList`);
  }
  if (!is404) {
    const required =
      url === "/" ? ["TravelAgency", "WebPage"] :
      url === "/about/" ? ["Person", "AboutPage", "BreadcrumbList"] :
      url === "/contact/" || url === "/plan-your-trip/" ? ["ContactPage", "BreadcrumbList"] :
      url === "/destinations/" || url === "/experiences/" || url === "/travel-journal/"
        ? ["CollectionPage", "BreadcrumbList"] :
      url === "/faq/" ? ["FAQPage", "BreadcrumbList"] :
      url === "/privacy-policy/" || url === "/terms-and-conditions/" ? ["WebPage", "BreadcrumbList"] :
      url.startsWith("/destinations/") ? ["WebPage", "BreadcrumbList", "TouristDestination"] :
      url.startsWith("/experiences/") ? ["WebPage", "BreadcrumbList", "Service"] :
      url.startsWith("/travel-journal/") ? ["Article", "BreadcrumbList"] :
      [];
    for (const t of required) {
      if (!schemaTypes.includes(t)) {
        fail("schema-required", `${url} must emit ${t} (page-type mapping, SCHEMA-LIBRARY §4)`);
      }
    }
    /* Types the plan forbids outright — see SCHEMA-LIBRARY §4 "Never emit". */
    for (const t of ["AggregateRating", "SearchAction", "HowTo", "Product", "Offer"]) {
      if (schemaTypes.includes(t)) {
        fail("schema-required", `${url} emits forbidden type ${t} (SCHEMA-LIBRARY §4 "Never emit")`);
      }
    }
  }

  /* faq-count (P2-5): wherever a page-faq block renders, the FAQPage node
     must exist and carry exactly one Question per pf-item. A silent zero or
     a mismatch means the build-time extractFaq() parser broke. */
  if (html.includes("page-faq")) {
    const pfItems = (html.match(/class="pf-item"/g) ?? []).length;
    let questions = 0;
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try {
        for (const node of [].concat(JSON.parse(m[1]))) {
          if (node["@type"] === "FAQPage") questions += (node.mainEntity ?? []).length;
        }
      } catch { /* already reported by schema-valid */ }
    }
    if (questions === 0 || questions !== pfItems) {
      fail("faq-count", `${url} renders ${pfItems} pf-item blocks but FAQPage carries ${questions} questions — extractFaq() and the markup disagree`);
    }
  }

  /* title-length / desc-length — quality bounds from the content standards.
     Hard since P3-1. Measured on the DECODED string: see decodeEntities. */
  const title = decodeEntities(pick(html, /<title>([\s\S]*?)<\/title>/i));
  if (!is404 && (title.length < 30 || title.length > 65)) {
    fail("title-length", `${url} title is ${title.length} chars (need 30-65): ${title}`);
  }
  const desc = decodeEntities(pick(html, /<meta name="description" content="([^"]*)"/i));
  if (!is404 && (desc.length < 110 || desc.length > 165)) {
    fail("desc-length", `${url} description is ${desc.length} chars (need 110-165)`);
  }

  /* internal-links: every same-site href must resolve to something in dist */
  for (const m of html.matchAll(/<a\b[^>]+href="(\/[^"#?]*)/gi)) {
    if (!m[1].startsWith("//") && !(await linkResolves(m[1]))) deadLinks.add(m[1]);
  }

  /* internal-link-floor (P3-6, finding F17) and testimonial-attribution
     (P3-7, folded into #67). Both predicates live in ./content-checks.mjs and
     are fixture-tested in ./verify-checks.test.mjs — see that file for why
     neither could be trusted to a passing build alone.

     link floor: journal posts were terminal nodes. 18 of the 29 carried no
     outbound link into the rest of the site at all, so the journal absorbed
     authority and returned none of it. CONTENT-STANDARDS § 7 sets the floor at
     two, BOTH ways; the return leg is checked because it is the half that rots
     silently when a content page is regenerated from a tool in tools/. The
     three hub pages are exempt — they are index pages, not spokes.

     attribution: Google's policy is explicit that where the entity controls
     the reviews about itself its pages are ineligible for star review
     features, so attempting that markup is a structured-data violation rather
     than a shortcut. AggregateRating is already banned outright in the
     forbidden @type list above; this is the other half — a quote that ships
     must name who said it. Today it guards one real quote, the Brian S. one.
     It exists for when the other 53 arrive, because an unattributed
     testimonial is not something anyone catches by eye at that count. */
  const HUBS = ["/travel-journal/", "/destinations/", "/experiences/"];
  if (!is404 && !HUBS.includes(url)) {
    const kind = url.startsWith("/travel-journal/") ? "journal"
      : (url.startsWith("/destinations/") || url.startsWith("/experiences/")) ? "section"
      : null;
    if (kind) {
      const n = linkFloor(html, kind);
      if (n === "no-main") {
        /* Reported as its own cause: without <main> every count is zero and
           would stack a second, misleading failure on top of this one. */
        fail("internal-link-floor", `${url} has no <main> element to count internal links in`);
      } else if (n < 2) {
        const what = kind === "journal"
          ? `links out to ${n} destination/experience page${n === 1 ? "" : "s"}`
          : `links to ${n} journal post${n === 1 ? "" : "s"}`;
        fail("internal-link-floor", `${url} ${what} — CONTENT-STANDARDS § 7 requires 2`);
      }
    }
  }

  /* page-length (CONTENT-STANDARDS § 3.4) — the ceiling on a destination
     country page, and only that page type.

     It exists because the M7 set was drafted at 3,636–4,087 words against a
     3,500 ceiling — 15–25% over, past anything the site had ever shipped, and
     green on every check. Length is the one quality bound with no natural
     signal: a long page looks like a thorough one, and § 3.4 is explicit that
     it buys nothing ("the GEO research found adding length produced zero
     measured citation benefit").

     WHY NO FLOOR. § 3.4's table says 1,500, and its own prose one paragraph
     later says "a tight 1,200-word destination page beats a padded 3,000-word
     one every time". Ten pages sit at 1,215–1,450 and are deliberately short —
     napa-sonoma, st-barths, new-orleans, riviera-maya-los-cabos,
     canadian-rockies, iceland, spain, antarctica, uk-ireland, portugal.
     Enforcing the table would fail all ten against the standard's own words,
     so the floor is not a rule and is not checked.

     WHY ONLY THIS PAGE TYPE. § 3.4's other bands do not describe the built
     site: all nine regional hubs run 2,544–3,109 against a stated
     1,200–2,000, and the journal runs to 4,746 against 3,000. Those numbers
     want re-deriving from the site before anything enforces them; a check
     that needs a debt list on the day it ships is a check nobody trusts.
     Regional hubs are told apart by breadcrumb depth, not a slug list — see
     crumbTrail. */
  if (!is404 && url.startsWith("/destinations/") && crumbTrail(html).length === 4) {
    const n = bodyWords(html);
    if (n === "no-main") {
      fail("page-length", `${url} has no <main> element to measure`);
    } else if (n > DEST_MAX_WORDS) {
      fail("page-length",
        `${url} body copy is ${n} words, over the ${DEST_MAX_WORDS} ceiling in ` +
          `CONTENT-STANDARDS § 3.4 by ${n - DEST_MAX_WORDS}. Cut, do not pad — ` +
          `the built set runs 1,365–3,438 across 59 country pages and the ` +
          `template pages sit at India 3,305 / Italy 3,235.`);
    }
  }

  for (const [cls, attrCls] of [
    ["testimonial-section", "testimonial-attr"],
    ["testimonial-card", "testimonial-card__name"],
    ["pull-quote", "pull-quote__attr"],
  ]) {
    if (testimonialAttribution(html, cls, attrCls) === "FAIL") {
      fail("testimonial-attribution",
        `${url} renders a .${cls} with no named attribution in .${attrCls} — ` +
          `never ship a quote without one (SEO-AIO-PLAN § P3-7)`);
    }
  }

  /* faq-first-sentence (P3-2, CONTENT-STANDARDS § 3.3 "non-negotiable"):
     every FAQ answer opens with a complete answer in ≤25 words. The site
     reached 0-of-408 over the limit on 2026-08-09 — 50 mechanical em-dash
     splits plus 36 hand rewrites — and this keeps it there, one answer at a
     time, instead of depending on anyone re-running the audit script. */
  for (const { question, words } of faqFirstSentenceOver(html)) {
    fail("faq-first-sentence",
      `${url} answer to "${question.slice(0, 60)}" opens with a ${words}-word sentence — ` +
        `the first sentence must be a complete answer in ≤25 words (CONTENT-STANDARDS § 3.3)`);
  }

  /* accordion-a11y: the P0-1 contract, kept honest forever */
  for (const m of html.matchAll(/<button\b[^>]*class="[^"]*\b(?:pf-q|faq-q)\b[^"]*"[^>]*>/gi)) {
    if (!/aria-expanded=/.test(m[0]) || !/aria-controls=/.test(m[0])) {
      fail("accordion-a11y", `${url} has an accordion button without aria-expanded/aria-controls`);
      break;
    }
  }

  /* placeholder-copy: visible text only — scripts, comments and tags are
     stripped first (see visibleText), so the sanctioned <!-- NEEDS MARK -->
     markers and the GA4 placeholder ID never trip it, but shipped copy does.
     The stripping and the token list live in content-checks.mjs behind
     fixtures since SEC-8. */
  if (!is404) {
    const text = visibleText(html);
    for (const [name, re] of PLACEHOLDER_PATTERNS) {
      if (re.test(text)) fail("placeholder-copy", `${url} ships the placeholder text "${name}"`);
    }
  }

  /* unsafe-href / inert-cost-section (SEC-8, #81): content pages render via
     set:html with no runtime sanitizer, so what an automated insert writes is
     what ships. Dangerous URL schemes fail everywhere; the .cost-range
     sections — the one surface a script writes from worksheet data — must
     additionally stay free of script tags and inline event handlers. */
  for (const bad of unsafeHrefs(html)) {
    fail("unsafe-href", `${url} carries a dangerous URL scheme: ${bad}`);
  }
  for (const kind of inertCostSections(html)) {
    fail("inert-cost-section", `${url} has a ${kind} inside a .cost-range section — the insert surface must stay inert (SEC-8)`);
  }

  /* cost-figure-shape (#108, DECISIONS.md D8): 21 rows deliberately ship a
     cost section with no headline band, because a nightly two-adult figure is
     the wrong unit for a per-cabin voyage or a four-island region. This holds
     both directions of that decision — a no-band figure must not show a price,
     and a banded figure must still show one. */
  for (const [kind, text] of costFigureShape(html)) {
    fail("cost-figure-shape", kind === "priced-unit"
      ? `${url} renders a price in a no-band cost figure: "${text}" — a --unit figure states the unit, never an amount (D8)`
      : `${url} renders a cost figure with no amount in it: "${text}" — add the band, or mark it --unit and say why (D8)`);
  }

  /* blank-link-rel (SEC-5, #80): a new-tab link without noopener leaves the
     opened page a window.opener handle back to ours. Six links shipped that
     way; this is what stops the seventh. */
  for (const a of unsafeBlankLinks(html)) {
    fail("blank-link-rel", `${url} opens a new tab without rel="noopener": ${a}`);
  }

  /* eager-image-budget (#72): runbook §2.4 gates launch at 1.5 MB of initial
     load, and the homepage failed it at 5.72 MB because 22 full-size heroes
     were inline background-images, which cannot be lazy. This counts what a
     browser fetches before any scrolling and holds the line. Images only —
     HTML, CSS and fonts are small and stable here, so the image total is what
     moves the number. */
  {
    let bytes = 0;
    const biggest = [];
    for (const ref of eagerImageRefs(html)) {
      const size = await stat(path.join(DIST, ref)).then((s) => s.size, () => 0);
      bytes += size;
      biggest.push([ref, size]);
    }
    const debt = EAGER_IMAGE_DEBT[url];
    const ceiling = debt ?? EAGER_IMAGE_BUDGET;
    const mb = (n) => (n / 1024 / 1024).toFixed(2);
    if (bytes > ceiling) {
      const top = biggest.sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([r, s]) => `${r} ${(s / 1024).toFixed(0)}KB`).join(", ");
      fail("eager-image-budget",
        `${url} fetches ${mb(bytes)} MB of images before any scroll (limit ${mb(ceiling)} MB` +
          `${debt ? ", its recorded debt — a listed page may only shrink" : ""}). Biggest: ${top}. ` +
          `Lazy the below-fold ones and crop them to the box they render into.`);
    } else if (debt && bytes <= EAGER_IMAGE_BUDGET) {
      fail("eager-image-budget",
        `${url} is now ${mb(bytes)} MB, under the ${mb(EAGER_IMAGE_BUDGET)} MB budget — ` +
          `delete its EAGER_IMAGE_DEBT entry in tools/verify-deployment.mjs so the budget holds it from here.`);
    }
    if (debt) eagerDebtSeen.add(url);
    eagerPeak = Math.max(eagerPeak, bytes);
  }
}
for (const link of deadLinks) fail("internal-links", `internal href ${link} resolves to nothing in dist/`);

/* The dead-handler ratchet (#104). A recorded name may only ever shrink; when
   it reaches zero its entry has to go, or the hole stays open for the next one. */
for (const [name, allowed] of Object.entries(DEAD_HANDLER_DEBT)) {
  const seen = deadHandlerSeen.get(name) ?? 0;
  if (seen === 0) {
    fail("dead-inline-handler",
      `DEAD_HANDLER_DEBT lists ${name}, which no page calls any more — delete the entry.`);
  } else if (seen > allowed) {
    fail("dead-inline-handler",
      `${name}() is called ${seen}× from inline handlers but DEAD_HANDLER_DEBT allows ${allowed}. ` +
        `Recorded debt may only shrink — define it or remove the new call sites.`);
  } else if (seen < allowed) {
    fail("dead-inline-handler",
      `${name}() is down to ${seen}× from ${allowed} — lower its DEAD_HANDLER_DEBT entry to ${seen} so it cannot creep back.`);
  }
}

/* The inline-handler ratchet (#100), on the same contract as the one above. */
for (const [name, allowed] of Object.entries(INLINE_HANDLER_DEBT)) {
  const seen = inlineHandlerSeen.get(name) ?? 0;
  if (seen === 0) {
    fail("inline-handler",
      `INLINE_HANDLER_DEBT lists ${name}, which no page carries any more — delete the entry.`);
  } else if (seen > allowed) {
    fail("inline-handler",
      `${name}= appears ${seen}× but INLINE_HANDLER_DEBT allows ${allowed}. ` +
        `Recorded debt may only shrink — wire it in the page's script instead.`);
  } else if (seen < allowed) {
    fail("inline-handler",
      `${name}= is down to ${seen}× from ${allowed} — lower its INLINE_HANDLER_DEBT entry to ${seen} so it cannot creep back.`);
  }
}
notes.push("page-quality gates checked (P1-6)");
/* A stale debt entry means the page was renamed or removed; drop it rather
   than leaving a permanent hole in the budget. */
for (const url of Object.keys(EAGER_IMAGE_DEBT)) {
  if (!eagerDebtSeen.has(url)) {
    fail("eager-image-budget", `EAGER_IMAGE_DEBT lists ${url}, which the build no longer produces — remove the entry.`);
  }
}
notes.push(
  `heaviest page fetches ${(eagerPeak / 1024 / 1024).toFixed(2)} MB of images before scroll ` +
  `(budget 1.5 MB, ${Object.keys(EAGER_IMAGE_DEBT).length} pages carrying recorded debt)`
);

/* ── 4c. package-lock.json keeps its platform metadata ──
   An install on this machine once stripped every "libc" block off the
   Linux-targeted optional dependencies — 102 lines, invisible here because
   those packages are never installed on Windows, and degrading for the deploy
   host that does install them. It shipped in a diff that also carried real
   work, which is how it got as far as it did.

   The comparison is against HEAD rather than against a recorded count, so a
   deliberate dependency change is judged on what it actually removed instead
   of on whether a total moved. */
{
  let head = null;
  let working = null;
  let headError = "";
  let workingError = "";
  /* Read separately so the two failure modes stay distinguishable. Folded into
     one try, a malformed lockfile on disk was indistinguishable from a missing
     baseline, and both ended up as a note — which report() prints with an `ok`
     prefix before exiting 0. */
  try {
    head = JSON.parse(execFileSync("git", ["show", "HEAD:package-lock.json"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }));
  } catch (e) { headError = String(e.message).split("\n")[0]; }
  try {
    working = JSON.parse(readFileSync(path.join(ROOT, "package-lock.json"), "utf8"));
  } catch (e) { workingError = String(e.message).split("\n")[0]; }

  /* Probed apart from the `git show` above so "there is no git here at all"
     stays distinguishable from "git works and HEAD has no lockfile". The first
     is a supported way to build this repo — tools/git-lastmod.mjs catches the
     same condition and resolves every sitemap lastmod to undefined rather than
     failing — so a `git archive` export must not be broken by this check. The
     second means the lockfile stopped being committed, which is a defect. */
  let gitAvailable = false;
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd: ROOT, stdio: "ignore" });
    gitAvailable = true;
  } catch { /* no git binary, or not a repository */ }

  const state = lockfileCheckState(head, working, gitAvailable);
  if (state === "unreadable-working") {
    fail("lockfile-metadata",
      `package-lock.json could not be read or parsed (${workingError || "no packages map"}) — a corrupt lockfile must not pass as checked`);
  } else if (state === "no-git") {
    notes.push("package-lock.json platform metadata not compared — no git here, so there is no committed baseline (git-lastmod skips sitemap dates for the same reason)");
  } else if (state === "unreadable-baseline") {
    fail("lockfile-metadata",
      `HEAD has no usable package-lock.json to compare against (${headError || "no packages map"}) — git works here, so the lockfile has stopped being committed`);
  } else {
    const losses = lockfileMetadataLoss(head, working);
    for (const { pkg, field, missing } of losses) {
      fail("lockfile-metadata",
        `${pkg} lost ${field} ${JSON.stringify(missing)} from package-lock.json`);
    }
    if (losses.length) {
      hints.push(
        "package-lock.json lost the platform metadata npm needs to install Linux-only optional\n" +
        "     dependencies on the deploy host. Every entry above is the SAME package at the SAME\n" +
        "     version with the SAME integrity hash as HEAD, so this is not an upgrade dropping\n" +
        "     support upstream — it is metadata going missing from an artifact that did not change.\n" +
        "     Restore it with `git checkout HEAD -- package-lock.json` and install with `npm ci`,\n" +
        "     which never rewrites the lockfile.");
    } else {
      notes.push(`package-lock.json keeps its platform metadata on ${Object.keys(working.packages ?? {}).length} entries`);
    }
  }
}

/* ── 4d. Built output stays LF ──
   dist/ is stored `-text`: what the build writes is what Git keeps and what
   the deploy uploads byte-for-byte. That is only safe while the build's inputs
   are stable, which `* text=auto eol=lf` in .gitattributes now makes them.

   This check is the half that notices if they stop being stable. Before it,
   123 of the 133 committed dist files carried mixed endings, every rebuild
   flipped whichever subset had changed hands since the last one, and one PR
   changing a single page carried 82 of them. It also caught a real failure:
   public/.htaccess was CRLF while its committed dist/ copy had 11 LF lines, so
   `npm run verify` failed on a clean checkout for two files that were
   identical apart from line endings. */
{
  const distText = await walk(DIST, (f) => !isBinaryDistFile(f));
  const offenders = [];
  for (const file of distText) {
    const defect = crDefect(readFileSync(file));
    if (defect) offenders.push({ file, ...defect });
  }
  for (const o of offenders) {
    fail("dist-line-endings",
      `${rel(o.file)} carries ${o.count} CR byte${o.count === 1 ? "" : "s"}, first on line ${o.firstLine}`);
  }
  if (offenders.length) {
    hints.push(
      "dist/ is committed byte-for-byte, so a CR here becomes a diff on every rebuild that\n" +
      "     writes it back the other way. The cause is upstream: check that .gitattributes still\n" +
      "     carries `* text=auto eol=lf`, and that your working tree honours it — attributes only\n" +
      "     apply on checkout, so files already on disk keep their old endings until something\n" +
      "     rewrites them. `git rm --cached -r . && git reset --hard` on a clean tree re-checks\n" +
      "     everything out, after which a rebuild produces LF.");
  } else {
    notes.push(`${distText.length} dist text files, all LF`);
  }
}

/* ── 5. Optional: confirm a deploy actually landed ──
   The FTP account does not land in the web root, so an upload can report
   success while the live site is untouched. This fetches the assets a real
   page depends on — a deploy that skipped dist/_astro/ leaves every page
   unstyled while the HTML itself still looks fine. */
if (REMOTE) {
  /* Every route the build produced must answer on the server.
     This used to be three hardcoded routes — "/", st-barths, maldives — and
     the 25 M7 destination pages deployed without the remote leg fetching one
     of them. It reported ok because it never looked. The list now comes from
     dist, so a page cannot ship outside the sample. */
  const routes = remoteRoutes(htmlFiles.map(urlOf));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* Four at a time with a pause between batches. Twelve was enough to make
     www.hymtravel.com 429 the entire sweep. Throttling is retried with
     backoff before it is believed, because one 429 says nothing about
     whether the page is deployed. */
  const probe = async (route) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(REMOTE + route, { method: "HEAD" })
        .catch((e) => ({ ok: false, status: e.message }));
      if (r.ok || !isThrottled(r.status)) return { route, ok: r.ok, status: r.status };
      await sleep(1000 * (attempt + 1));
    }
    return { route, ok: false, status: 429 };
  };

  const results = [];
  for (let i = 0; i < routes.length; i += 4) {
    results.push(...await Promise.all(routes.slice(i, i + 4).map(probe)));
    if (i + 4 < routes.length) await sleep(150);
  }

  const misses = remoteMisses(results);
  const throttled = remoteThrottled(results);
  if (misses.length) {
    fail("remote-pages",
      `${misses.length} of ${routes.length} built pages do not answer on ${REMOTE}: ` +
      misses.slice(0, 8).join(", ") + (misses.length > 8 ? `, +${misses.length - 8} more` : ""));
  }
  if (throttled.length) {
    /* Not a pass and not a failure: the host rate-limited us, so these routes
       are simply unverified. Saying so beats implying they are fine. */
    notes.push(`${throttled.length} of ${routes.length} routes still rate-limited after 3 tries — NOT verified`);
  }
  if (!misses.length && !throttled.length) {
    notes.push(`all ${routes.length} built pages answer on ${REMOTE}`);
  }

  /* Deep check on a few: a deploy that skipped dist/_astro/ leaves every page
     unstyled while the HTML itself still looks fine. Any page proves the
     stylesheets, so these stay fixed — the sweep above is what tracks new
     routes. One M7 page is included so the deep leg exercises the newest
     template too. */
  const sample = ["/", "/destinations/st-barths/", "/destinations/maldives/",
                  "/destinations/aspen/"];
  for (const page of sample) {
    const res = await fetch(REMOTE + page).catch((e) => ({ ok: false, status: e.message }));
    if (!res.ok) { fail("remote", `${REMOTE}${page} returned ${res.status}`); continue; }
    const html = await res.text();
    for (const href of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/[^"]+)"/gi)].map((m) => m[1])) {
      const asset = await fetch(REMOTE + href, { method: "HEAD" }).catch((e) => ({ ok: false, status: e.message }));
      if (!asset.ok) fail("remote", `${page} links ${href} but it returns ${asset.status} on the server`);
    }
  }
  /* Staging must serve X-Robots-Tag noindex; production must never (P0-3).
     The staging header comes from the host-scoped rule in public/.htaccess —
     robots.txt alone prevents crawling but not indexing of discovered URLs. */
  const host = new URL(REMOTE).hostname;
  const isStaging = /(^|\.)hostingersite\.com$/i.test(host);
  const front = await fetch(REMOTE + "/").catch(() => null);
  if (!front) {
    fail("remote", `${REMOTE}/ could not be fetched for the X-Robots-Tag check`);
  } else {
    const tag = front.headers.get("x-robots-tag") ?? "";
    if (isStaging && !/noindex/i.test(tag)) {
      fail("staging-noindex",
        `${host} serves no "X-Robots-Tag: noindex" — staging is exposed to crawlers. Deploy the staging block in public/.htaccess.`);
    }
    if (!isStaging && /noindex/i.test(tag)) {
      fail("prod-indexable",
        `${host} serves "X-Robots-Tag: ${tag}" — production must never carry noindex.`);
    }
  }
  notes.push(`remote spot-check against ${REMOTE}`);
}

report();

function report() {
  for (const n of notes) console.log(`  ok  ${n}`);
  if (softFailures.length) {
    const byCheck = {};
    for (const f of softFailures) (byCheck[`${f.check} — flips hard in ${f.phase}`] ??= []).push(f.detail);
    console.log(`  warnings (enforced in a later phase — do not let these grow):`);
    for (const [check, details] of Object.entries(byCheck)) {
      console.log(`  [${check}] ${details.length} page${details.length > 1 ? "s" : ""}`);
      for (const d of details.slice(0, 4)) console.log(`    - ${d}`);
      if (details.length > 4) console.log(`    ...and ${details.length - 4} more`);
    }
  }
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
