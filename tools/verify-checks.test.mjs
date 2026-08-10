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
import {
  linkFloor, testimonialAttribution, faqFirstSentenceOver,
  unsafeHrefs, inertCostSections, visibleText, PLACEHOLDER_PATTERNS,
  unsafeBlankLinks, eagerImageRefs,
} from "./content-checks.mjs";
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

/* ── faq-first-sentence ── */

const faq = (answer) =>
  `<div class="pf-item"><h3 class="pf-q-h"><button class="pf-q"><span class="pf-q__text">Test question?</span></button></h3>` +
  `<div class="pf-a" id="x" role="region">${answer}</div></div>`;

t("faq lead: a short complete answer passes",
  faqFirstSentenceOver(faq("Yes. The elaboration follows here and can run as long as it likes without tripping anything.")).length, 0);

t("faq lead: 26+ words before the first period fails",
  faqFirstSentenceOver(faq("The answer to this question is one that depends on a very large number of considerations that we will now enumerate at truly excessive length before concluding. Sorry.")).length, 1);

t("faq lead: a decimal number does not end the sentence",
  faqFirstSentenceOver(faq("The flight takes 2.5 hours in most conditions. More detail follows."))[0]?.words ?? 0, 0);

t("faq lead: markup inside the answer is ignored for counting",
  faqFirstSentenceOver(faq("<strong>Yes</strong> — and here is why, briefly. Elaboration.")).length, 0);

t("faq lead: only the offending answer is reported, not its neighbours",
  faqFirstSentenceOver(
    faq("Short and fine. Rest.") +
    faq("This second answer rambles on well past the twenty-five word limit because it wants to explain every consideration before it ever commits to anything at all, sadly. Rest.")
  ).length, 1);

/* ── unsafe-href (SEC-8) ── */

t("unsafe-href: a javascript: link fails",
  unsafeHrefs(`<a href="javascript:alert(1)">x</a>`).length, 1);

t("unsafe-href: numeric-entity obfuscation still fails",
  unsafeHrefs(`<a href="&#106;avascript:alert(1)">x</a>`).length, 1);

t("unsafe-href: whitespace-split scheme still fails",
  unsafeHrefs(`<a href="java\tscript:alert(1)">x</a>`).length, 1);

t("unsafe-href: vbscript: on src fails",
  unsafeHrefs(`<img src="vbscript:msgbox(1)">`).length, 1);

t("unsafe-href: data:text/html on a link fails",
  unsafeHrefs(`<a href="data:text/html,<script>1</script>">x</a>`).length, 1);

t("unsafe-href: normal https, mailto and relative links pass",
  unsafeHrefs(`<a href="https://kws.go.ke/">x</a><a href="mailto:mark@hymtravel.com">m</a><a href="/plan-your-trip/">p</a>`).length, 0);

t("unsafe-href: a data:image src is legitimate and passes",
  unsafeHrefs(`<img src="data:image/png;base64,iVBORw0KGgo=">`).length, 0);

/* ── inert-cost-section (SEC-8) ── */

const cost = (inner) =>
  `<section class="cost-range"><div class="cost-range__grid"><div>${inner}</div></div></section>`;

t("inert: a clean cost section passes",
  inertCostSections(cost(`<ul><li>Luxury camp, all meals</li></ul>`)).length, 0);

t("inert: a script tag inside the cost section fails",
  inertCostSections(cost(`<script>fetch('/x')</script>`)).length, 1);

t("inert: an inline event handler inside the cost section fails",
  inertCostSections(cost(`<a href="/x/" onclick="track()">x</a>`)).length, 1);

t("inert: a page script OUTSIDE the cost section is not this check's business",
  inertCostSections(cost(`<li>fine</li>`) + `<script>legit()</script>`).length, 0);

t("inert: nested divs do not truncate the scan before the violation",
  inertCostSections(cost(`<div><div></div><script>late()</script></div>`)).length, 1);

/* ── placeholder-copy tokens (SEC-8 extension) ── */

const phHits = (html) => PLACEHOLDER_PATTERNS.filter(([, re]) => re.test(visibleText(html))).length;

t("placeholder: NEEDS FIGURE inside a comment is sanctioned and passes",
  phHits(`<p>real copy</p><!-- NEEDS FIGURE: low end to high end -->`), 0);

t("placeholder: NEEDS FIGURE in visible copy fails",
  phHits(`<div class="cost-range__figure">NEEDS FIGURE: low end to high end</div>`), 1);

t("placeholder: NEEDS MARK in visible copy fails",
  phHits(`<p>NEEDS MARK: a real client testimonial</p>`), 1);

t("placeholder: the pre-existing tokens still fail",
  phHits(`<p>TBD</p>`), 1);

/* ── blank-link-rel (SEC-5) ── */

t("blank-rel: target=_blank with no rel at all fails",
  unsafeBlankLinks(`<a href="https://instagram.com/x" target="_blank">IG</a>`).length, 1);

t("blank-rel: the house pattern passes",
  unsafeBlankLinks(`<a href="https://x.com/" target="_blank" rel="noopener noreferrer">x</a>`).length, 0);

t("blank-rel: noopener alone passes",
  unsafeBlankLinks(`<a href="https://x.com/" target="_blank" rel="noopener">x</a>`).length, 0);

t("blank-rel: noreferrer alone passes — it severs the handle too",
  unsafeBlankLinks(`<a href="https://x.com/" target="_blank" rel="noreferrer">x</a>`).length, 0);

t("blank-rel: an unrelated rel value does not satisfy it",
  unsafeBlankLinks(`<a href="https://x.com/" target="_blank" rel="nofollow">x</a>`).length, 1);

t("blank-rel: rel before target is still seen",
  unsafeBlankLinks(`<a rel="noopener" href="https://x.com/" target="_blank">x</a>`).length, 0);

t("blank-rel: unquoted target is still caught",
  unsafeBlankLinks(`<a href="https://x.com/" target=_blank>x</a>`).length, 1);

t("blank-rel: a same-tab link is not this check's business",
  unsafeBlankLinks(`<a href="/plan-your-trip/">plan</a>`).length, 0);

t("blank-rel: EVERY offending link is reported, not just the first",
  unsafeBlankLinks(
    `<a href="https://a.com/" target="_blank">a</a><a href="https://b.com/" target="_blank">b</a>`
  ).length, 2);

/* ── eager-image-budget (#72) ── */

t("eager: a lazy <img> is not counted",
  eagerImageRefs(`<img src="/assets/img/a.jpg" loading="lazy">`).length, 0);

t("eager: an <img> with no loading attribute IS counted",
  eagerImageRefs(`<img src="/assets/img/a.jpg">`).length, 1);

t("eager: loading=eager is counted",
  eagerImageRefs(`<img src="/assets/img/a.jpg" loading="eager">`).length, 1);

t("eager: an inline background-image is counted — it cannot be lazy",
  eagerImageRefs(`<div style="background-image:url('/assets/img/a.jpg');background-size:cover"></div>`).length, 1);

t("eager: the exact shape the homepage shipped is caught",
  eagerImageRefs(
    `<div class="ig-post" style="background-image:url('/assets/img/e-05-positano-alley.jpg');background-size:cover;background-position:center"></div>`
  )[0], "/assets/img/e-05-positano-alley.jpg");

t("eager: the same asset twice counts once, like the browser cache",
  eagerImageRefs(`<img src="/a.jpg"><img src="/a.jpg">`).length, 1);

t("eager: query strings collapse to one asset",
  eagerImageRefs(`<img src="/a.jpg?v=1"><img src="/a.jpg?v=2">`).length, 1);

t("eager: data: URIs are not a second fetch",
  eagerImageRefs(`<img src="data:image/png;base64,iVBORw0KGgo=">`).length, 0);

t("eager: a remote image is not our budget to spend",
  eagerImageRefs(`<img src="https://cdn.example.com/a.jpg">`).length, 0);

t("eager: a background-image in a <style> block is NOT counted (may never paint)",
  eagerImageRefs(`<style>.x{background-image:url('/assets/img/a.jpg')}</style>`).length, 0);

t("eager: the post-fix homepage hero pattern counts slide 1 only",
  eagerImageRefs(
    `<div class="hero__slide is-active" style="background-image:url('/assets/img/h-01.jpg');background-size:cover"></div>` +
    `<div class="hero__slide" style="background-size:cover" data-bg="/assets/img/h-02.jpg"></div>` +
    `<div class="hero__slide" style="background-size:cover" data-bg="/assets/img/h-03.jpg"></div>`
  ).length, 1);

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
