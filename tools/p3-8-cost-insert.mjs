/**
 * P3-8: turn the hidden WHAT IT COSTS scaffolds live from research data.
 *
 *   node tools/p3-8-cost-insert.mjs
 *
 * Reads tools/cost-ranges-data.mjs (derived from
 * docs/seo/research-backfill-2026-08-09.md), then for each of the 54 pages:
 *
 *   - entries with a range: replace the whole commented scaffold with a
 *     rendered <section class="cost-range">, keeping the page's own title
 *     and basis lines.
 *   - entries with `held`: keep the section commented, but rewrite the
 *     comment header to say why it is held and where the researched band
 *     lives, instead of pointing at the retired figures worksheet.
 *
 * SEC-8 (#81) safety, non-negotiable in this path:
 *   - every text field is HTML-escaped before it touches markup;
 *   - source hrefs must be http(s) — anything else refuses to run;
 *   - no field may contain a comment terminator;
 *   - the output surface is verified inert by the `inert-cost-section` and
 *     `unsafe-href` checks in tools/verify-deployment.mjs, whose fixtures
 *     live in tools/verify-checks.test.mjs.
 *
 * Idempotent: pages whose scaffold is already replaced are skipped.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { COST_RANGES, VERIFIED } from "./cost-ranges-data.mjs";

const DIR = "src/content-pages";
const BLOCK = /<!-- ══ WHAT IT COSTS \(P3-3\) — (?:NOT YET LIVE|HELD)[^\n]*\n[\s\S]*?══ end WHAT IT COSTS ══ -->/;

const esc = (s) => s
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

function checkField(name, value) {
  if (value.includes("-->")) throw new Error(`${name} contains a comment terminator`);
  return value;
}

function renderSection(title, basis, d) {
  if (!/^https:\/\/[^\s"']+$/.test(d.source.href)) {
    throw new Error(`source href is not https: ${d.source.href}`);
  }
  /* A row re-shopped after the 2026-08-09 backfill carries its own `verified`.
     Without this the only options are to date it wrongly or to bump the global
     VERIFIED, which would claim every one of the other rows was re-checked on a
     day nobody looked at it. The label is what a reader sees and stays coarse
     ("August 2026"); the datetime is machine-readable and must be exact. */
  const v = d.verified ?? VERIFIED;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.datetime)) {
    throw new Error(`bad verified datetime: ${v.datetime}`);
  }
  const li = (items) => items.map((t) => `        <li>${esc(checkField("list item", t))}</li>`).join("\n");
  return `<section class="cost-range">
  <div class="cost-range__header">
    <div class="cost-range__label">What It Costs</div>
    <h2 class="cost-range__title">${title}</h2>
  </div>

  <div class="cost-range__figure">${esc(checkField("range", d.range))}</div>
  <div class="cost-range__basis">${basis}</div>

  <div class="cost-range__grid">
    <div class="cost-range__col">
      <div class="cost-range__col-label">What that includes</div>
      <ul class="cost-range__list">
${li(d.includes)}
      </ul>
    </div>
    <div class="cost-range__col">
      <div class="cost-range__col-label">What it does not</div>
      <ul class="cost-range__list">
${li(d.excludes)}
      </ul>
    </div>
  </div>

  <div class="cost-range__drivers">
    <div class="cost-range__col-label">The two or three things that move it most</div>
    <ul class="cost-range__list">
${li(d.drivers)}
    </ul>
  </div>

  <p class="cost-range__note">
    Editorial planning bands, not quotes — assembled from published rates and official fee sources,
    verified <time datetime="${v.datetime}">${esc(checkField("verified label", v.label))}</time>.
    Rates, permit costs and park fees change; confirm before booking.
    Source: <a href="${esc(d.source.href)}">${esc(checkField("source text", d.source.text))}</a>.
  </p>
</section>`;
}

function renderHeldHeader(reason) {
  checkField("held reason", reason);
  return `<!-- ══ WHAT IT COSTS (P3-3) — HELD ══════════════════════════════════════
     A researched band exists for this page (docs/seo/research-backfill-2026-08-09.md
     and tools/cost-ranges-data.mjs) but its confidence sits below the launch
     bar: ${reason}.
     To ship it: give the row an official fee source and a band you can
     defend, replace this page's \`held\` entry in tools/cost-ranges-data.mjs
     with that data, and re-run \`node tools/p3-8-cost-insert.mjs\`.

     A supplier quote is NOT the bar, and this line used to say it was. No
     shipped row has one. The band is EDITORIAL, assembled from published
     rates; \`source\` is an authority anchor for one concrete, checkable fee,
     not evidence for the range. destinations__europe.html bands the whole of
     Europe and cites the price of a Louvre ticket. Nine rows shipped on
     2026-08-20 by swapping an aggregator citation for an official government
     fee page, with every band left exactly where it was. See #108.

     Do NOT hand-uncomment this with placeholders still in it. The build's
     placeholder check reads visible text only, which is why this is safe
     commented and unsafe half-filled.
`;
}

let live = 0, held = 0, skipped = 0;
for (const [file, d] of Object.entries(COST_RANGES)) {
  const p = path.join(DIR, file);
  let html = await readFile(p, "utf8");
  const m = html.match(BLOCK);
  if (!m) {
    if (html.includes('class="cost-range"')) { skipped++; continue; } // already live
    throw new Error(`${file}: no WHAT IT COSTS scaffold found`);
  }
  const block = m[0];
  const title = block.match(/<h2 class="cost-range__title">([\s\S]*?)<\/h2>/)?.[1];
  const basis = block.match(/<div class="cost-range__basis">([\s\S]*?)<\/div>/)?.[1];
  if (!title || !basis) throw new Error(`${file}: scaffold missing title or basis`);

  if (d.held) {
    const header = block.match(/^<!--[\s\S]*?(?:\r?\n){2}(?=<section class="cost-range">)/);
    if (!header) throw new Error(`${file}: held scaffold header not found`);
    html = html.replace(block, block.replace(header[0], renderHeldHeader(d.held) + "\n"));
    held++;
  } else {
    const section = renderSection(title, basis, d);
    if (/NEEDS/.test(section)) throw new Error(`${file}: rendered section still carries a placeholder`);
    html = html.replace(block, () => section);
    live++;
  }
  await writeFile(p, html, "utf8");
}

/* Derived, not hardcoded. This line used to read "expect 43 / expect 11 /
   expect 54" and was wrong on two of the three the moment the M7 pages landed
   25 held rows. Counting the data file cannot go stale; a remembered number
   always does. Note `live` counts what THIS run rendered, so a second run
   reports 0 live and everything skipped — that is correct, the tool is
   idempotent. */
const total = Object.keys(COST_RANGES).length;
const wantHeld = Object.values(COST_RANGES).filter((d) => d.held).length;
console.log(`this run — rendered: ${live}, held headers rewritten: ${held}, already live and skipped: ${skipped}`);
console.log(`data file — ${total} rows: ${total - wantHeld} with a range, ${wantHeld} held`);
