/**
 * Fixture tests for the content checks in verify-deployment.mjs.
 *
 *   node tools/verify-checks.test.mjs
 *
 * Why this file exists: `internal-link-floor` and `testimonial-attribution`
 * were both reviewed by running the real build and seeing it pass. Both
 * passed for the wrong reason.
 *
 *   - internal-link-floor counted the whole document, and Footer.astro puts
 *     15 destination/experience links on every page, so every journal post
 *     scored 15 before linking to anything. It could not fail.
 *   - testimonial-attribution matched only the first attribution on a page,
 *     skipped any block with an extra class, and rejected an attribution
 *     containing a nested tag — including the <time> element that
 *     CONTENT-STANDARDS § 5 requires and that #67 asks contributors for.
 *
 * A green build proves nothing about a check that cannot go red. These
 * fixtures assert both directions: that valid markup passes AND that each
 * specific broken shape fails.
 *
 * The predicates are imported from ./content-checks.mjs, the same module
 * verify-deployment.mjs imports, so there is no copy here to drift. The last
 * three tests additionally run them against real dist/ output, so a fixture
 * that stops resembling the site fails too.
 *
 * Runs as part of `npm run build`, before the verifier itself.
 */
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

let pass = 0;
const failures = [];
const t = (name, actual, expected) => {
  if (actual === expected) { pass++; return; }
  failures.push(`${name}\n      expected ${expected}, got ${actual}`);
};

/* Imported, not re-implemented. An earlier draft of this file copied the
   predicates, which would have let the tests stay green while the verifier
   drifted — the exact failure mode these tests exist to prevent. */
import { linkFloor, testimonialAttribution } from "./content-checks.mjs";
const attribution = testimonialAttribution;

/* ── internal-link-floor ── */

const FOOTER = `<footer><a href="/destinations/africa/">Africa</a><a href="/destinations/asia/">Asia</a>` +
  `<a href="/experiences/cruises/">Cruises</a></footer>`;
const page = (main) => `<body><nav></nav><main>${main}</main>${FOOTER}</body>`;

t("floor: counts inside <main> only, footer links do not count",
  linkFloor(page(`<p>no links</p>`), "journal"), 0);

t("floor: two distinct links pass",
  linkFloor(page(`<a href="/destinations/italy/">Italy</a><a href="/experiences/cruises/">Cruises</a>`), "journal"), 2);

t("floor: the same link three times counts once",
  linkFloor(page(`<a href="/destinations/italy/">a</a><a href="/destinations/italy/">b</a><a href="/destinations/italy/">c</a>`), "journal"), 1);

t("floor: trailing slash is optional",
  linkFloor(page(`<a href="/destinations/italy">Italy</a><a href="/experiences/cruises">Cruises</a>`), "journal"), 2);

t("floor: both spellings of one link count once, not twice",
  linkFloor(page(`<a href="/destinations/italy">a</a><a href="/destinations/italy/">b</a>`), "journal"), 1);

t("floor: hub links do not satisfy the journal leg",
  linkFloor(page(`<a href="/travel-journal/">hub</a>`), "section"), 0);

t("floor: missing <main> is reported as its own cause",
  linkFloor(`<body><a href="/destinations/italy/">x</a></body>`, "journal"), "no-main");

/* ── testimonial-attribution ── */

const card = (name, cls = "testimonial-card") =>
  `<div class="${cls}"><p>quote</p><div class="testimonial-card__name">${name}</div></div>`;

t("attribution: a named quote passes",
  attribution(card("Brian S."), "testimonial-card", "testimonial-card__name"), "PASS");

t("attribution: a blank attribution fails",
  attribution(card(""), "testimonial-card", "testimonial-card__name"), "FAIL");

t("attribution: EVERY block is checked, not just the first",
  attribution(card("Brian S.") + card(""), "testimonial-card", "testimonial-card__name"), "FAIL");

t("attribution: a block with an extra class is not skipped",
  attribution(card("", "testimonial-card featured"), "testimonial-card", "testimonial-card__name"), "FAIL");

t("attribution: a missing attribution element fails",
  attribution(`<div class="testimonial-card"><p>quote</p></div>`, "testimonial-card", "testimonial-card__name"), "FAIL");

t("attribution: whitespace and &nbsp; do not count as a name",
  attribution(card(" &nbsp; "), "testimonial-card", "testimonial-card__name"), "FAIL");

t("attribution: a name wrapped in a tag passes",
  attribution(card("<span>Brian S.</span>"), "testimonial-card", "testimonial-card__name"), "PASS");

t("attribution: the #67 shape — name, trip and a <time> date — passes",
  attribution(
    `<section class="testimonial-section"><p>quote</p><div class="testimonial-attr">` +
    `<strong>Brian S.</strong> · Okavango Delta, <time datetime="2024-08">August 2024</time></div></section>`,
    "testimonial-section", "testimonial-attr"), "PASS");

t("attribution: an extra class on the attribution element still passes",
  attribution(`<div class="testimonial-card"><div class="testimonial-card__name is-muted">Brian S.</div></div>`,
    "testimonial-card", "testimonial-card__name"), "PASS");

t("attribution: a page with no testimonial at all is not a failure",
  attribution(`<main><p>nothing</p></main>`, "testimonial-card", "testimonial-card__name"), "no-blocks");

/* ── the real build, so these predicates cannot drift from the site ── */

const dist = path.join(ROOT, "dist");
if (await access(dist, constants.R_OK).then(() => true, () => false)) {
  const about = await readFile(path.join(dist, "about", "index.html"), "utf8");
  t("real /about/ keeps its Brian S. attribution",
    attribution(about, "pull-quote", "pull-quote__attr"), "PASS");

  const italy = await readFile(path.join(dist, "destinations", "italy", "index.html"), "utf8");
  t("real /destinations/italy/ clears the journal-link floor",
    linkFloor(italy, "section") >= 2, true);

  const masters = await readFile(path.join(dist, "travel-journal", "masters-field-report", "index.html"), "utf8");
  t("real masters post clears the destination-link floor",
    linkFloor(masters, "journal") >= 2, true);
} else {
  console.log("  (dist/ absent — skipped the 3 real-output tests; run `npm run build` first)");
}

/* ── report ── */
if (failures.length) {
  console.error(`\n${failures.length} failing:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
console.log(`  ok  ${pass} check fixtures pass`);
