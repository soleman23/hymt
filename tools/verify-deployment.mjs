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
/* Fixture-tested in tools/verify-checks.test.mjs. Both of these were written
   inline here first and both were wrong in ways a passing build could not
   show — see that file's header. */
import { linkFloor, testimonialAttribution } from "./content-checks.mjs";

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
  if (!(await exists(path.join(DIST, clean)))) ogMissing.add(clean);
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

const linkResolves = async (p) => {
  const noSlash = p.replace(/\/$/, "");
  if (!noSlash) return exists(path.join(DIST, "index.html"));
  return (await exists(path.join(DIST, noSlash, "index.html"))) ||
         (await exists(path.join(DIST, noSlash)));
};

const deadLinks = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const url = urlOf(file);
  const is404 = file.endsWith("404.html");

  /* img-attrs: intrinsic dimensions prevent CLS; alt is non-negotiable. */
  for (const img of html.match(/<img\b[^>]*>/gi) ?? []) {
    for (const attr of ["alt", "width", "height"]) {
      if (!new RegExp(`\\b${attr}=`).test(img)) {
        fail("img-attrs", `${url} has an <img> missing ${attr}: ${img.slice(0, 80)}…`);
      }
    }
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

  /* accordion-a11y: the P0-1 contract, kept honest forever */
  for (const m of html.matchAll(/<button\b[^>]*class="[^"]*\b(?:pf-q|faq-q)\b[^"]*"[^>]*>/gi)) {
    if (!/aria-expanded=/.test(m[0]) || !/aria-controls=/.test(m[0])) {
      fail("accordion-a11y", `${url} has an accordion button without aria-expanded/aria-controls`);
      break;
    }
  }

  /* placeholder-copy: visible text only — scripts, comments and tags are
     stripped first, so the sanctioned <!-- NEEDS MARK --> markers and the
     GA4 placeholder ID never trip it, but shipped copy does. */
  if (!is404) {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ");
    for (const [name, re] of [
      ["Lorem ipsum", /lorem ipsum/i],
      ["TBD", /\bTBD\b/],
      ["Coming soon", /coming soon/i],
      ["TODO", /\bTODO\b/],
      ["XXX", /\bXXX\b/],
      ["Placeholder", /placeholder/i],
    ]) {
      if (re.test(text)) fail("placeholder-copy", `${url} ships the placeholder text "${name}"`);
    }
  }
}
for (const link of deadLinks) fail("internal-links", `internal href ${link} resolves to nothing in dist/`);
notes.push("page-quality gates checked (P1-6)");

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
