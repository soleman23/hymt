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
 * verify-deployment.mjs imports, so there is no copy here to drift. The final
 * block additionally runs them against real dist/ output, so a fixture that
 * stops resembling the site fails too.
 *
 * Runs as part of `npm run build`, before the verifier itself.
 */
import { readFile, access } from "node:fs/promises";
import { constants, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
/* Same parser the verifier uses, imported rather than copied — this file had
   its own second copy, which is the drift the value it reads exists to end. */
const CONFIGURED_SITE = configuredSite(await readFile(path.join(ROOT, "astro.config.mjs"), "utf8"));

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
  unsafeHrefs, inertCostSections, costFigureShape, futureLastmods, lastmodPairs, visibleText, PLACEHOLDER_PATTERNS,
  unsafeBlankLinks, eagerImageRefs, llmsClaimMismatches, heroStatLabels,
  undefinedInlineHandlers, linklessCards, inlineHandlers, uncappedFields, itemListDefects,
  placeCardAlt,
  imageDims, imgRatioMismatches, cspScriptHash, inlineScriptHashes, cspDirective, cspScriptSrcDrift, cspHeaders,
  analyticsUngated, unscopedAccordionHides, web3formsKeys, hasHoneypot,
  htaccessGaps as rawHtaccessGaps, configuredSite, photoGridDefects, nestedCardAnchors, bodyWords, crumbTrail,
  remoteRoutes, remoteMisses, remoteThrottled, remoteCoverage,
} from "./content-checks.mjs";
const htaccessGaps = (text, productionSite = CONFIGURED_SITE) =>
  rawHtaccessGaps(text, productionSite);
const attribution = testimonialAttribution;
import {
  satisfiesNodeRange, parseNodeVersion, lockfileMetadataLoss, lockfileCheckState, lockfileCoverage,
  crDefect, isBinaryDistFile,
} from "./repo-checks.mjs";
import { localDay } from "./git-lastmod.mjs";

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

/* ── cost-figure-shape (#108, DECISIONS.md D8) ── */

const fig = (cls, text) => `<div class="cost-range__figure${cls}">${text}</div>`;

t("cost-figure: a banded figure with a range passes",
  costFigureShape(fig("", "$800–$3,000")).length, 0);

t("cost-figure: a banded figure that lost its amount fails",
  costFigureShape(fig("", "Ranges, not quotes")).length, 1);

t("cost-figure: a --unit figure stating the unit passes",
  costFigureShape(fig(" cost-range__figure--unit", "Priced per voyage, not per night")).length, 0);

t("cost-figure: a --unit figure that shows a price fails",
  costFigureShape(fig(" cost-range__figure--unit", "From $9,400 per voyage")).length, 1);

t("cost-figure: the failure is named by which direction it broke",
  costFigureShape(fig(" cost-range__figure--unit", "$100 per night"))[0][0], "priced-unit");

t("cost-figure: a unit phrase may carry a plain number without reading as a price",
  costFigureShape(fig(" cost-range__figure--unit", "Priced per cabin over 18 to 22 days")).length, 0);

t("cost-figure: euro and sterling amounts count as priced",
  costFigureShape(fig(" cost-range__figure--unit", "€2,400 per person")).length, 1);

t("cost-figure: the modifier is matched as a token, not a substring",
  costFigureShape(`<div class="cost-range__figure cost-range__figure--unit extra">Priced per departure</div>`).length, 0);

t("cost-figure: nested markup inside the figure is read as text",
  costFigureShape(`<div class="cost-range__figure"><span>$800</span>&nbsp;–&nbsp;<span>$3,000</span></div>`).length, 0);

t("cost-figure: both figures on a page are checked, not just the first",
  costFigureShape(fig("", "$800–$3,000") + fig("", "no amount here")).length, 1);

t("cost-figure: a page with no cost section has nothing to report",
  costFigureShape(`<p>Just copy.</p>`).length, 0);

/* The check's own first finding on real dist/ was 29 failures against 1
   corruption: every held page ships its cost section commented out with the
   NEEDS FIGURE placeholder intact, and the raw-HTML scan read all 28. */
t("cost-figure: a held scaffold inside a comment is sanctioned and passes",
  costFigureShape(`<!-- HELD\n${fig("", "NEEDS FIGURE: low end to high end, in USD")}\n-->`).length, 0);

t("cost-figure: the same placeholder OUTSIDE a comment still fails",
  costFigureShape(fig("", "NEEDS FIGURE: low end to high end, in USD")).length, 1);

t("cost-figure: a live figure after a commented scaffold is still read",
  costFigureShape(`<!-- ${fig("", "NEEDS FIGURE")} -->` + fig("", "no amount")).length, 1);

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

/* The unfilled photo plate. These are the exact shapes that shipped: the
   .itin-image plate on 66 destination pages, its "Journey Photography" wording
   variant, and the .event-image plate on the nine experiences pages. All three
   were invisible to every check for as long as they existed. */
t("placeholder: an unfilled .itin-image plate fails",
  phHits(`<div class="itin-image" style="background:#1a1610">Itinerary Photography<br>Tuscany &amp; Amalfi · Italy</div>`), 1);

t("placeholder: the Journey Photography wording of the same plate fails",
  phHits(`<div class="itin-image" style="background:#141a10">Journey Photography<br>Napa Harvest Week</div>`), 1);

t("placeholder: an unfilled .event-image plate fails",
  phHits(`<div class="event-image" style="background:#141a1e">Event Photography<br>Family Resort · Riviera Maya</div>`), 1);

/* …and the filled slot passes, which is the half that proves the check is
   measuring the plate and not the word "photograph" or the card class. */
t("placeholder: the same slot carrying a photograph passes",
  phHits(`<div class="itin-image itin-image--photo"><img class="itin-image__img" src="/assets/img/ni-europe-amalfi-coast-terrace.jpg" alt="A table set with wine and lemons on an Amalfi Coast terrace above the sea" width="600" height="1000" loading="lazy" decoding="async"></div>`), 0);

t("placeholder: an unfilled .stay-card__image plate fails",
  phHits(`<div class="stay-card__image" style="background:#102830">Atoll Photography<br>Baa Atoll UNESCO</div>`), 1);

t("placeholder: an unfilled in-article .post-image__ph plate fails",
  phHits(`<span class="post-image__ph">Article Photography<br>Okavango Delta · Floodplains Rising</span>`), 1);

/* Prose about photography is not a plate, and neither is a destination tag.
   This is why the token list is a fixed alternation rather than
   /\w+ Photography/: /destinations/ ships "Iceberg Photography" as a Greenland
   activity beside "Icefjord" and "Dog Sledding", and the general pattern would
   fail that page over correct copy. If this fixture ever goes red, someone has
   widened the token list to the general form — put it back. */
t("placeholder: ordinary copy mentioning photography passes",
  phHits(`<p>Mark books a photography guide for the Serengeti crossing.</p>`), 0);

t("placeholder: the Greenland card's Iceberg Photography activity tag passes",
  phHits(`<div class="dest-card__tags"><span class="dest-tag">Icefjord</span>` +
         `<span class="dest-tag">Dog Sledding</span>` +
         `<span class="dest-tag">Iceberg Photography</span></div>`), 0);

/* Portrait joined the token list the day sp-mark-sole-portrait.jpg was wired
   into /contact/. This is the plate that shipped there, verbatim. */
t("placeholder: the /contact/ portrait plate now fails",
  phHits(`<div class="contact-photo">Portrait Photography<br>Mark Sole</div>`), 1);

/* And the photograph that replaced it must not re-trip it. The alt describes
   the person, not a plate; visibleText() strips tags, so neither the alt nor
   the filename can reach the matcher — this pins that. */
t("placeholder: the real portrait <img> that replaced it passes",
  phHits(`<div class="contact-photo"><img class="contact-photo__img" ` +
         `src="/assets/img/sp-mark-sole-portrait.jpg" ` +
         `alt="Mark Sole, founder of Hit Your Mark Travel, hands clasped at a caf&eacute; table" ` +
         `width="900" height="1086" decoding="async"></div>`), 0);

/* Both journal slots, in the three fills that shipped. Decorative alt=""
   beside the name, so nothing reaches visible text either. */
t("placeholder: the filled journal byline avatar passes",
  phHits(`<div class="post-byline__avatar"><img class="post-byline__avatar-img" ` +
         `src="/assets/img/sp-mark-sole-portrait.jpg" alt="" aria-hidden="true" ` +
         `width="900" height="1086" loading="lazy" decoding="async"></div>`), 0);

/* Portrait is a noun in the fixed alternation, not the general form. Ordinary
   copy about portraiture must still pass. */
t("placeholder: prose mentioning portrait photography passes",
  phHits(`<p>He recommends a portrait photography session in Kyoto.</p>`), 0);

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

/* ── llms-txt claims ──
   The whole point of this check is that it goes red when the site grows past
   what llms.txt says. These fixtures assert that it does — a count check that
   only ever passes is the SCHEMA-LIBRARY template all over again. */

const LLMS = [
  "- [Destinations](https://www.hymtravel.com/destinations/): 43 destination guides, grouped by region",
  "- [Experiences](https://www.hymtravel.com/experiences/): 12 trip types",
  "- [Travel Journal](https://www.hymtravel.com/travel-journal/): 32 field reports and planning guides",
].join("\n");

const TRUTH = { destinations: 43, experiences: 12, journal: 32 };

t("llms: every claim true against the built site passes",
  llmsClaimMismatches(LLMS, TRUTH).length, 0);

t("llms: one destination page added and the file is now wrong",
  llmsClaimMismatches(LLMS, { ...TRUTH, destinations: 44 }).length, 1);

t("llms: M7 landing all 26 destination pages is caught",
  llmsClaimMismatches(LLMS, { ...TRUTH, destinations: 69 })[0],
  "destinations: llms.txt claims 43, the built site has 69");

t("llms: a new journal post is caught",
  llmsClaimMismatches(LLMS, { ...TRUTH, journal: 33 }).length, 1);

t("llms: a new experience page is caught",
  llmsClaimMismatches(LLMS, { ...TRUTH, experiences: 13 }).length, 1);

t("llms: all three drifting reports all three",
  llmsClaimMismatches(LLMS, { destinations: 44, experiences: 13, journal: 33 }).length, 3);

t("llms: deleting the phrase does not silently disarm the check",
  llmsClaimMismatches("- [Destinations](https://www.hymtravel.com/destinations/): lots of guides",
    TRUTH).length, 3);

t("llms: the count must be the one in the phrase, not any number on the line",
  llmsClaimMismatches("- [Experiences](https://www.hymtravel.com/experiences/2026/): 12 trip types",
    TRUTH).length, 2);

/* ── hero stat rail (#94) ──
   The rail was a launch gate sitting at 0% that no check could see: the layout
   drops any stat without a value and hides the rail below 900px, so 42 of 43
   pages shipping one stat looked fine and built green.

   The multi-stat cases are not padding. The first version of this predicate
   used a non-greedy regex for the rail, stopped at the first nested </div> and
   reported ONE stat on a page carrying three -- which would have passed every
   page in the site while checking nothing. */

const hStat = (label, val) =>
  `<div><span class="dest-hero__stat-label">${label}</span>` +
  `<div class="dest-hero__stat-val">${val}</div></div>`;
const hRail = (...stats) =>
  `<section class="dest-hero"><div class="dest-hero__content">` +
  `<div class="dest-hero__left"><h1>x</h1></div>` +
  `<div class="dest-hero__right">${stats.join("")}</div></div></section>`;

t("rail: the shipped two-stat shape reports both",
  heroStatLabels(hRail(hStat("Best Season", "July – October"),
                       hStat("Best For", "Migration<br>&amp; Big Cats"))).join("|"),
  "Best Season|Best For");

t("rail: a third stat is not swallowed by the first nested </div>",
  heroStatLabels(hRail(hStat("Best Season", "a"), hStat("Best For", "b"),
                       hStat("Flight Time", "c"))).length, 3);

t("rail: the pre-#94 one-stat page is caught",
  heroStatLabels(hRail(hStat("Best Season", "July – October"))).includes("Best For"), false);

t("rail: a page that lost its rail entirely reports nothing",
  heroStatLabels("<section class=\"dest-hero\"><h1>x</h1></section>").length, 0);

t("rail: labels come back in document order",
  heroStatLabels(hRail(hStat("Best For", "b"), hStat("Best Season", "a")))[0], "Best For");

t("rail: markup inside a label does not leak into the name",
  heroStatLabels(hRail(hStat("Best&nbsp;For", "x")))[0], "Best For");

/* ── page-length (CONTENT-STANDARDS § 3.4) ──
   The M7 destination set was drafted at 3,636–4,087 words against a 3,500
   ceiling and every page built green, because nothing measured length. These
   fixtures pin what is counted, which is the whole difficulty: the breadcrumb
   and hero are layout output, not authored copy, and they add ~108 words to
   every destination page. Counting them makes an honest 3,402-word page fail
   a ceiling written against the standard's own number.

   The nesting cases are not padding. The breadcrumb is a div inside a div and
   the body is sections inside sections, so a non-greedy strip would end at the
   first close and leak the rest of the trail into the count — the same bug the
   hero-stat-rail predicate shipped with and that innerOf exists to prevent. */

const wds = (n, w = "word") => Array.from({ length: n }, () => w).join(" ");
const crumbs = (...names) =>
  `<div class="breadcrumb"><div class="breadcrumb__inner">` +
  names.map((n, i) => i < names.length - 1
    ? `<a class="breadcrumb__link" href="/x/">${n}</a><span class="breadcrumb__sep">&rsaquo;</span>`
    : `<span class="breadcrumb__current">${n}</span>`).join("") +
  `</div></div>`;
const dHero = `<section class="dest-hero"><div class="dest-hero__bg"></div>` +
  `<div class="dest-hero__content"><div class="dest-hero__left"><h1>India</h1>` +
  `<p class="dest-hero__sub">${wds(60, "herosub")}</p></div>` +
  `<div class="dest-hero__right"><div><span class="dest-hero__stat-label">Best Season</span></div></div>` +
  `</div></section>`;
/* Body sections nest, exactly as the real pages do. */
const dBody = (n) =>
  `<section class="intro-section"><div><p>${wds(n)}</p></div></section>` +
  `<section class="page-faq"><div class="pf-item"><div class="pf-a">${wds(10, "answer")}</div></div></section>`;
const destPage = (n, trail = ["Home", "Destinations", "Asia", "India"]) =>
  `<body><nav>${wds(25, "navlink")}</nav><main>` + crumbs(...trail) + dHero + dBody(n) +
  `</main><footer>${wds(40, "footlink")}</footer></body>`;

t("length: counts inside <main> only — nav and footer are not the page's copy",
  bodyWords(destPage(100)), 110);

t("length: the breadcrumb is layout output and does not count",
  bodyWords(destPage(100)) === bodyWords(
    destPage(100, ["Home", "Destinations", "Caribbean & Mexico", "Riviera Maya & Los Cabos"])), true);

/* The leak text sits AFTER the inner </div> and before the outer one — the
   only position where innerOf and a non-greedy regex disagree. With the text
   inside the nested div (the obvious way to write this) both implementations
   return 30 and the fixture pins nothing. */
t("length: a nested div inside the breadcrumb does not leak crumbs into the count",
  bodyWords(`<body><main><div class="breadcrumb"><div class="breadcrumb__inner">` +
    `<a class="breadcrumb__link">Home</a></div>${wds(50, "leak")}</div>` +
    `<p>${wds(30)}</p></main></body>`), 30);

t("length: the hero is layout output and does not count",
  bodyWords(`<body><main>${dHero}<p>${wds(30)}</p></main></body>`), 30);

t("length: a nested section inside the hero does not truncate the strip",
  bodyWords(`<body><main><section class="dest-hero"><section>${wds(10, "inner")}</section>` +
    `${wds(50, "leak")}</section><p>${wds(30)}</p></main></body>`), 30);

t("length: nested body sections are counted whole, not to the first </section>",
  bodyWords(`<body><main><section class="a"><section class="b">${wds(40)}</section>` +
    `${wds(20)}</section></main></body>`), 60);

/* The chrome strip runs against the region innerOf returned, so a <main> read
   with a non-greedy regex would hand it a truncated page. </main> is unique on
   a real page, which is exactly why this needs a fixture rather than trust:
   nothing on the site would show the difference. */
t("length: the strip reads the whole <main>, not up to a nested close",
  bodyWords(`<body><main><section class="dest-hero"><div>x</div></section>` +
    `<div class="wrap"></div>${wds(45)}</main></body>`), 45);

t("length: comments and scripts are not shipped copy",
  bodyWords(`<body><main><!-- ${wds(80, "NEEDSMARK")} --><script>${wds(80, "js")}</script>` +
    `<p>${wds(30)}</p></main></body>`), 30);

t("length: a page with no <main> reports that as its own cause",
  bodyWords("<body><p>x</p></body>"), "no-main");

/* The failure this check exists for, at the real numbers. India ships 3,225
   words of copy; the M7 drafts came in around 4,000. */
t("length: an India-sized page is under the 3,500 ceiling",
  bodyWords(destPage(3215)) <= 3500, true);

t("length: an M7-sized draft is over the ceiling — the check goes red",
  bodyWords(destPage(4030)) > 3500, true);

t("length: the ceiling is not passed by padding the hero instead",
  bodyWords(`<body><main>` + crumbs("Home", "Destinations", "Asia", "India") +
    `<section class="dest-hero">${wds(4000, "hero")}</section>` +
    dBody(100) + `</main></body>`) > 3500, false);

/* crumbTrail is how a regional hub is told from a country page, so the
   check must not fire on the nine hubs. A slug list would have drifted. */
t("length: a country page has four crumbs",
  crumbTrail(destPage(10)).join("|"), "Home|Destinations|Asia|India");

t("length: a regional hub has three, so page-length skips it",
  crumbTrail(destPage(10, ["Home", "Destinations", "Africa"])).length, 3);

t("length: entities in a crumb decode to the visible name",
  crumbTrail(destPage(10, ["Home", "Destinations", "Caribbean &amp; Mexico", "Jamaica"]))[2],
  "Caribbean &amp; Mexico");

t("length: a page with no breadcrumb yields no trail rather than throwing",
  crumbTrail("<body><main><p>x</p></main></body>").length, 0);

/* ── dead inline handlers (#104) ──
   Reproduces the shipped bug: a share button calling a function nothing
   defines. The false-positive cases matter as much as the true one — a check
   that cries wolf on `window.location.href='/x/'` gets its finding ignored,
   and there are 35 of those on the site. */

const SHARE_BTN = '<button class="share-btn" aria-label="Copy link" ' +
  'onclick="copyLink()"><svg></svg></button>';

t("handlers: the exact shipped bug is caught",
  undefinedInlineHandlers(SHARE_BTN)[0].name, "copyLink");

t("handlers: it counts every call site on the page, not just the first",
  undefinedInlineHandlers(SHARE_BTN + SHARE_BTN)[0].count, 2);

t("handlers: defining it in an inline script clears it",
  undefinedInlineHandlers(
    "<script>function copyLink(){}</script>" + SHARE_BTN).length, 0);

t("handlers: window.copyLink = ... also counts as defined",
  undefinedInlineHandlers(
    "<script>window.copyLink = function(){}</script>" + SHARE_BTN).length, 0);

t("handlers: const arrow form also counts as defined",
  undefinedInlineHandlers(
    "<script>const copyLink = () => {}</script>" + SHARE_BTN).length, 0);

/* Not this check's business either way — a member expression resolves at
   runtime. The 35 pages that shipped this exact shape are gone (#100); it is
   `inlineHandlers` below that catches the attribute itself. */
t("handlers: a member expression is not a bare call",
  undefinedInlineHandlers(
    `<div onclick="window.location.href='/plan-your-trip/'">x</div>`).length, 0);

t("handlers: a qualified method call is not ours to resolve",
  undefinedInlineHandlers(`<button onclick="history.back()">x</button>`).length, 0);

t("handlers: control-flow keywords are not function calls",
  undefinedInlineHandlers(
    `<button onclick="if(x){go()}">x</button>`).map((h) => h.name).join(","), "go");

t("handlers: callable browser globals are allowed, unknown bare calls are not",
  undefinedInlineHandlers(
    `<button onclick="alert('hi');f()">x</button>`).map((h) => h.name).join(","), "f");

/* A bare identifier PASSED to something is not a call, so it is not this
   check's business — resolving it would need real scope analysis. */
t("handlers: an identifier passed as an argument is not treated as a call",
  undefinedInlineHandlers(
    `<button onclick="setTimeout(whatever,1)">x</button>`).length, 0);

t("handlers: two different missing functions are reported separately",
  undefinedInlineHandlers(
    `<button onclick="copyLink()">a</button><button onclick="shareArticle('facebook')">b</button>`
  ).length, 2);

t("handlers: a page with no inline handlers at all is clean",
  undefinedInlineHandlers("<button class=\"share-btn\" data-share=\"copy\"></button>").length, 0);

/* ── linkless article cards (#106) ──
   The shipped shape: a card whose read element is a <span>, not an <a>. Seven
   of these were live on /travel-journal/ and nothing could see them, because
   internal-links only validates hrefs that exist and these had none. */

const jCard = (title, read) =>
  `<div class="article-card" data-category="x"><div class="article-card__image"></div>` +
  `<div class="article-card__body"><h3 class="article-card__title">${title}</h3>` +
  `<p class="article-card__excerpt">x</p>${read}</div></div>`;

const READ_LINK = `<a href="/travel-journal/kyoto-april-vs-november/" class="article-card__read">Read more</a>`;
const READ_SPAN = `<span class="article-card__read">Read more</span>`;

t("cards: a card that links is clean",
  linklessCards(jCard("Kyoto in April vs. November", READ_LINK)).length, 0);

t("cards: the exact shipped defect is caught, and named",
  linklessCards(jCard("The Case for Costa Rica with Teenagers", READ_SPAN))[0],
  "The Case for Costa Rica with Teenagers");

t("cards: one dead card among live ones is still found",
  linklessCards(jCard("A", READ_LINK) + jCard("B", READ_SPAN) + jCard("C", READ_LINK)).join(","), "B");

t("cards: all four phantoms would have been reported together",
  linklessCards(["French Riviera", "St. Barth's", "Costa Rica", "Burgundy"]
    .map((x) => jCard(x, READ_SPAN)).join("")).length, 4);

/* An external link is not an article link \u2014 the card must point into the
   site, or the ItemList schema still cannot see it. */
t("cards: an off-site link does not satisfy the check",
  linklessCards(jCard("X", `<a href="https://example.com/">Read more</a>`)).length, 1);

t("cards: a card with no title still reports rather than being skipped",
  linklessCards(`<div class="article-card"><span class="article-card__read">Read</span></div>`)[0],
  "(untitled card)");

/* The related-articles grid on every journal post uses this shape: the card IS
   the anchor. An earlier version of this predicate only looked INSIDE the card
   and reported all 86 of them as broken. */
t("cards: a card that IS the anchor counts as linked",
  linklessCards(`<a class="article-card" href="/travel-journal/x/"><h3 class="article-card__title">X</h3></a>`).length, 0);

t("cards: an anchor card with no href is still caught",
  linklessCards(`<a class="article-card"><h3 class="article-card__title">Y</h3></a>`)[0], "Y");

t("cards: a page with no article cards at all is clean",
  linklessCards("<main><p>no cards here</p></main>").length, 0);

/* ── inline handlers (#100) ──
   The 46 that shipped were all live and working, so `undefinedInlineHandlers`
   above — which only asks whether the named function exists — could not see a
   single one. This asks the other question: the attribute itself is what
   `script-src 'unsafe-inline'` has to permit, and #100 cannot drop that while
   any page carries one. */

t("inline: the shipped card pattern is caught",
  inlineHandlers(`<div class="article-card" onclick="window.location.href='/travel-journal/x/'">c</div>`)[0].name,
  "onclick");

t("inline: every occurrence on the page is counted, not just the first",
  inlineHandlers(`<button onclick="goTo(2)">a</button><button onclick="goTo(3)">b</button>`)[0].count, 2);

/* The whole point of the distinction: a handler calling a function that DOES
   exist is exactly as much of a CSP blocker as one calling a phantom. */
t("inline: a handler that resolves is still a handler",
  inlineHandlers(`<script>function goTo(){}</script><button onclick="goTo(2)">a</button>`).length, 1);

t("inline: names other than onclick are caught too",
  inlineHandlers(`<input onchange="x()"><body onload="y()">`).map((h) => h.name).sort().join(","),
  "onchange,onload");

t("inline: a single-quoted attribute counts",
  inlineHandlers(`<button onclick='goTo(2)'>a</button>`).length, 1);

t("inline: an unquoted attribute counts",
  inlineHandlers(`<button onclick=goTo(2)>a</button>`).length, 1);

/* This one caught a bug in itself on its first run against real output. The
   journal hub's pageCss is inlined into a <style> element, and its comment
   describes the handlers that were removed — so scanning the raw page reported
   the fix as the defect, on the one page the fix was largest. */
t("inline: a <style> body describing a handler is not a handler",
  inlineHandlers(`<style>/* was onclick="nav()" */ .a{color:red}</style>`).length, 0);

t("inline: a <script> body is not markup",
  inlineHandlers(`<script>var s = " onclick=x()";</script>`).length, 0);

t("inline: an HTML comment is not markup either",
  inlineHandlers(`<!-- <button onclick="x()">the old control</button> -->`).length, 0);

t("inline: the data-attribute replacement is clean",
  inlineHandlers(`<button type="button" class="btn-next" data-goto="2">Continue</button>`).length, 0);

t("inline: the stretched-link card that replaced the 35 is clean",
  inlineHandlers(
    `<div class="article-card" data-category="x">` +
    `<a href="/travel-journal/x/" class="article-card__read">Read more</a></div>`).length, 0);

t("inline: a page with no handlers at all reports nothing",
  inlineHandlers(`<main><a href="/plan-your-trip/">Ask Mark</a></main>`).length, 0);

/* ── field-maxlength (#74) ── */

/* The shipped defect, verbatim from dist/index.html before the fix. This is
   the fixture that proves the check would have caught the live bug; if it
   ever passes, the check has stopped seeing the newsletter. */
t("maxlength: the uncapped newsletter email input as it shipped on 94 pages",
  uncappedFields(`<input type="email" name="email" class="newsletter__input" placeholder="Your email address" required aria-label="Email address">`).length, 1);

t("maxlength: the same input capped is clean",
  uncappedFields(`<input type="email" name="email" class="newsletter__input" maxlength="254" placeholder="Your email address" required aria-label="Email address">`).length, 0);

t("maxlength: a capped textarea is clean",
  uncappedFields(`<textarea id="cfmsg" name="message" maxlength="3000" placeholder="Tell me" required></textarea>`).length, 0);

/* A textarea has no type attribute. A predicate keyed on type= would skip
   every textarea and pass the 3000-char message field vacuously. */
t("maxlength: an uncapped textarea is caught",
  uncappedFields(`<textarea id="cfmsg" name="message" required></textarea>`).length, 1);

t("maxlength: an input with no type is text, and is caught",
  uncappedFields(`<input id="dest-idea" placeholder="A place">`).length, 1);

/* False-positive guards: the three non-text inputs every form carries. */
t("maxlength: the hidden access_key input is not a field",
  uncappedFields(`<input type="hidden" name="access_key" value="94312057-04b8-44d8-a7a8-7cb083d999b8" />`).length, 0);

t("maxlength: the botcheck honeypot checkbox is not a field",
  uncappedFields(`<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">`).length, 0);

/* Plan Your Trip's steppers, verbatim: readonly, and no type at all. Without
   the readonly exemption the check ships red on the conversion path. */
t("maxlength: the readonly stepper display is exempt",
  uncappedFields(`<input class="stepper-val" id="adults" value="2" readonly>`).length, 0);

t("maxlength: a disabled input is exempt",
  uncappedFields(`<input type="text" id="x" disabled>`).length, 0);

t("maxlength: two uncapped fields on one page are two, not one",
  uncappedFields(`<input type="text" id="a"><input type="tel" id="b" maxlength="40"><textarea id="c"></textarea>`).length, 2);

t("maxlength: maxlength with spaces round the = still counts",
  uncappedFields(`<input type="text" id="a" maxlength = "100">`).length, 0);

t("maxlength: a page with no fields reports nothing",
  uncappedFields(`<main><p>No forms here.</p></main>`).length, 0);

/* ── img-ratio ── */

/* Header bytes, not fixture tables, for the dimension reader: a PNG IHDR and
   a JPEG with an APP0 segment before its SOF0, the shape every camera JPEG
   has. If the reader ever mis-parses, both go wrong here first. */
const pngHeader = (w, h) => {
  const b = Buffer.alloc(24);
  b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(0x0d0a1a0a, 4);
  b.writeUInt32BE(13, 8); b.write("IHDR", 12); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
};
const jpegHeader = (w, h) => Buffer.concat([
  Buffer.from([0xff, 0xd8]),
  Buffer.from([0xff, 0xe0, 0x00, 0x10]), Buffer.alloc(14),               // APP0, 16 bytes
  Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08]),                           // SOF0, precision 8
  Buffer.from([(h >> 8) & 0xff, h & 0xff, (w >> 8) & 0xff, w & 0xff]),  // height, then width
  Buffer.alloc(12),
]);

t("imageDims: reads a PNG IHDR",
  JSON.stringify(imageDims(pngHeader(256, 256))), JSON.stringify({ w: 256, h: 256 }));

t("imageDims: reads a JPEG SOF0 past an APP0 segment",
  JSON.stringify(imageDims(jpegHeader(1200, 800))), JSON.stringify({ w: 1200, h: 800 }));

t("imageDims: JPEG height comes before width in the frame header",
  imageDims(jpegHeader(1200, 800)).w, 1200);

t("imageDims: an unknown format is null, not a guess",
  imageDims(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")), null);

const dims = (table) => (src) => table[src] ?? null;
const LOGO = { "/assets/logo.png": { w: 256, h: 256 }, "/assets/img/hero.jpg": { w: 1200, h: 800 } };

/* The shipped state, verbatim: 1254x1254 for a 256x256 file is the wrong
   NUMBER but the right RATIO. This check deliberately passes it, because the
   box it reserves is the right shape; the source was corrected regardless. */
t("img-ratio: the shipped 1254x1254 logo declaration is the right ratio, and passes",
  imgRatioMismatches(`<img src="/assets/logo.png" class="dest-hero__watermark" alt="" aria-hidden="true" width="1254" height="1254" decoding="async">`, dims(LOGO)).length, 0);

t("img-ratio: the nav logo at its rendered 52x52 passes for the same reason",
  imgRatioMismatches(`<img src="/assets/logo.png" class="nav__logo" alt="Hit Your Mark Travel" width="52" height="52">`, dims(LOGO)).length, 0);

t("img-ratio: exact intrinsic dimensions pass",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="x" width="1200" height="800">`, dims(LOGO)).length, 0);

/* The regression this exists for: the file is swapped for a non-square one
   and 94 tags keep saying square. */
t("img-ratio: a square declaration for a 3:2 file is caught",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="x" width="256" height="256">`, dims(LOGO)).length, 1);

t("img-ratio: the report names the src, the declaration and the truth",
  JSON.stringify(imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="x" width="256" height="256">`, dims(LOGO))[0]),
  JSON.stringify({ src: "/assets/img/hero.jpg", declared: "256×256", real: "1200×800" }));

t("img-ratio: swapped width and height are caught",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="x" width="800" height="1200">`, dims(LOGO)).length, 1);

t("img-ratio: a 1% rounding drift is tolerated",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="x" width="600" height="401">`, dims(LOGO)).length, 0);

t("img-ratio: a query string on the src does not defeat the lookup",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg?v=2" alt="x" width="256" height="256">`, dims(LOGO)).length, 1);

/* Out of scope by design: each of these is someone else's check or nobody's. */
t("img-ratio: an image with no declared size is img-attrs' problem, not this one's",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="x">`, dims(LOGO)).length, 0);

t("img-ratio: an external src is not judged",
  imgRatioMismatches(`<img src="https://cdn.example/x.jpg" alt="x" width="1" height="1000">`, dims(LOGO)).length, 0);

t("img-ratio: a src the resolver cannot read is skipped, not failed",
  imgRatioMismatches(`<img src="/assets/img/missing.jpg" alt="x" width="1" height="1000">`, dims(LOGO)).length, 0);

t("img-ratio: two wrong tags on one page are two",
  imgRatioMismatches(`<img src="/assets/img/hero.jpg" alt="a" width="1" height="1"><img src="/assets/logo.png" alt="b" width="2" height="1">`, dims(LOGO)).length, 2);

/* ── csp-script-src (#100) ── */

/* The browser hashes script text after CRLF -> LF normalisation. Three of the
   site's ten inline bodies carry CR (home, Contact, Plan Your Trip - the
   conversion path). Hashing raw bytes there produces a value the browser will
   never accept, silently. So this is the fixture that matters most. */
t("csp: CRLF and LF bodies hash identically, as the browser sees them",
  cspScriptHash("var a = 1;\r\nvar b = 2;\r\n"), cspScriptHash("var a = 1;\nvar b = 2;\n"));

t("csp: a lone CR is normalised too",
  cspScriptHash("a\rb"), cspScriptHash("a\nb"));

t("csp: but the hash is not whitespace-insensitive - a changed body is a changed hash",
  cspScriptHash("var a = 1;\n") === cspScriptHash("var a = 1; \n"), false);

/* Known-answer: sha256 of the empty string, base64. If the encoding ever
   drifts from what a CSP header wants, this is the line that goes red. */
t("csp: the hash is base64 sha256 with the CSP prefix",
  cspScriptHash(""), "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=");

t("csp: an inline script yields one hash",
  inlineScriptHashes(`<script>var x = 1;</script>`).length, 1);

t("csp: inline script extraction normalises CRLF through cspScriptHash",
  inlineScriptHashes(`<script>var a = 1;\r\nvar b = 2;\r\n</script>`).join(),
  inlineScriptHashes(`<script>var a = 1;\nvar b = 2;\n</script>`).join());

t("csp: type=module inline scripts are hashed like any other",
  inlineScriptHashes(`<script type="module">import x from "y";</script>`).length, 1);

t("csp: the same body twice on a page is one hash",
  inlineScriptHashes(`<script>a()</script><p>x</p><script>a()</script>`).length, 1);

t("csp: two different bodies are two hashes",
  inlineScriptHashes(`<script>a()</script><script>b()</script>`).length, 2);

/* script-src does not apply to a non-executable data block, and the site
   carries 305 of them. Hashing them would put 98+ dead hashes in the header
   and, worse, hide a real gap in the noise. */
t("csp: ld+json data blocks are not scripts and are not hashed",
  inlineScriptHashes(`<script type="application/ld+json">{"@type":"WebPage"}</script>`).length, 0);

t("csp: an external <script src> is host-matched, not hashed",
  inlineScriptHashes(`<script src="https://www.googletagmanager.com/gtag/js"></script>`).length, 0);

t("csp: attribute order and quoting do not change the ld+json exemption",
  inlineScriptHashes(`<script id="x" type='application/ld+json'>{}</script>`).length, 0);

const HT = `# comment
  Header set X-Frame-Options "SAMEORIGIN"
  Header always set Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'sha256-AAA=' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; frame-src 'none'"
`;

t("csp: cspDirective pulls one directive's value from the Header line",
  cspDirective(HT, "Content-Security-Policy-Report-Only", "script-src"), "'self' 'sha256-AAA=' https://www.googletagmanager.com");

t("csp: cspDirective distinguishes directives that share a prefix",
  cspDirective(HT, "Content-Security-Policy-Report-Only", "frame-src"), "'none'");

t("csp: an absent header is null, not an empty string",
  cspDirective(HT, "Content-Security-Policy", "script-src"), null);

t("csp: an absent directive is null",
  cspDirective(HT, "Content-Security-Policy-Report-Only", "worker-src"), null);

/* ── cspHeaders: surviving the #100 flip, in both directions ──
   csp-script-src and serve-csp-enforcing.mjs both pinned the -Report-Only
   spelling. #100 renames the header to enforcing and its own rollback renames
   it back, so each direction silently disabled the one check standing between
   an edited inline script and a dead page. The first two fixtures are that
   flip; before this change the enforcing one returned nothing. */
const HT_ENFORCING = HT.replace("Content-Security-Policy-Report-Only", "Content-Security-Policy");

t("cspHeaders: the report-only header is found",
  cspHeaders(HT).map((h) => h.name).join(), "Content-Security-Policy-Report-Only");

t("cspHeaders: the ENFORCING header is found — #100's flip",
  cspHeaders(HT_ENFORCING).map((h) => h.name).join(), "Content-Security-Policy");

/* The prefix trap, and why the trailing \s+" in the pattern is load-bearing:
   "Content-Security-Policy" is a strict prefix of the report-only spelling, so
   a looser match reports the enforcing header on a report-only file — the
   check would then pass while claiming the wrong mode. */
t("cspHeaders: report-only is not also reported as enforcing",
  cspHeaders(HT).length, 1);

t("cspHeaders: a file with neither header yields nothing",
  cspHeaders(`  Header set X-Frame-Options "SAMEORIGIN"`).length, 0);

/* Both at once is a half-finished flip. A browser enforces one and reports on
   the other, so two policies that can disagree ship together. */
t("cspHeaders: both headers at once are both reported",
  cspHeaders(HT + HT_ENFORCING).map((h) => h.name).join(),
  "Content-Security-Policy,Content-Security-Policy-Report-Only");

/* Enforcing first, so a caller taking [0] prefers the header that blocks. */
t("cspHeaders: enforcing sorts before report-only",
  cspHeaders(HT + HT_ENFORCING)[0].name, "Content-Security-Policy");

/* ── the SAME name twice, which one .exec per name could not see ──
   Apache documents `Header set` as replacing any previous header of that
   name, so the LAST line ships. Reporting one meant the verifier diffed
   dist's hashes against a policy the browser throws away — and a policy
   missing those hashes could deploy green. Both consumers already refuse a
   count above 1; they just never got one. */
const HT_DUP_ENFORCING = HT_ENFORCING +
  `\n  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'"\n`;

t("cspHeaders: two ENFORCING headers are both reported, not collapsed to one",
  cspHeaders(HT_DUP_ENFORCING).length, 2);

t("cspHeaders: two REPORT-ONLY headers are both reported too",
  cspHeaders(HT + `\n  Header always set Content-Security-Policy-Report-Only "default-src 'self'"\n`).length, 2);

/* The one that matters: the policy Apache keeps is the last, and it is not
   the one [0] returns — so a caller reading only [0] would validate the
   wrong policy. The count is what stops it. */
t("cspHeaders: the duplicate's differing policy is visible, not hidden",
  cspHeaders(HT_DUP_ENFORCING).at(-1).policy, "default-src 'self'; script-src 'self'");

t("cspHeaders: the policy value comes back with the name",
  cspHeaders(HT_ENFORCING)[0].policy.startsWith("default-src 'self'"), true);

/* The whole point: the directive lookup keeps working after the rename. */
t("csp: script-src is still readable once the header is enforcing",
  cspDirective(HT_ENFORCING, cspHeaders(HT_ENFORCING)[0].name, "script-src"),
  "'self' 'sha256-AAA=' https://www.googletagmanager.com");

t("csp: drift - a needed hash the header lacks is missing",
  cspScriptSrcDrift("'self' 'sha256-AAA='", ["sha256-AAA=", "sha256-BBB="]).missing.join(","), "sha256-BBB=");

t("csp: drift - a listed hash no page needs is stale",
  cspScriptSrcDrift("'self' 'sha256-AAA=' 'sha256-OLD='", ["sha256-AAA="]).stale.join(","), "sha256-OLD=");

t("csp: drift - an exact match is clean",
  JSON.stringify(cspScriptSrcDrift("'self' 'sha256-AAA=' 'sha256-BBB=' https://x", ["sha256-BBB=", "sha256-AAA="])),
  JSON.stringify({ missing: [], stale: [], unsafeInline: false }));

/* Any hash present makes a CSP2 browser ignore 'unsafe-inline'. Leaving it in
   alongside hashes reads as permissive and is not - so it is reported. */
t("csp: drift - 'unsafe-inline' alongside hashes is flagged",
  cspScriptSrcDrift("'self' 'unsafe-inline' 'sha256-AAA='", ["sha256-AAA="]).unsafeInline, true);

t("csp: drift - a host source is neither missing nor stale",
  cspScriptSrcDrift("'self' https://www.googletagmanager.com 'sha256-AAA='", ["sha256-AAA="]).stale.length, 0);

/* ── analytics-host-gate ── */

const GA = (body) => `<script>${body}</script>`;
const GATE = `if (location.hostname !== 'www.hymtravel.com') return;`;
const LOAD = `var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';document.head.appendChild(s);function gtag(){dataLayer.push(arguments)}`;

t("gate: the shipped shape - gate then gtag - is not flagged",
  analyticsUngated(GA(`(function(){ ${GATE} ${LOAD} })();`)), false);

t("gate: gtag with no gate at all is flagged",
  analyticsUngated(GA(`(function(){ ${LOAD} })();`)), true);

t("gate: an INVERTED gate (=== instead of !==) is flagged",
  analyticsUngated(GA(`(function(){ if (location.hostname === 'www.hymtravel.com') return; ${LOAD} })();`)), true);

t("gate: a gate on the wrong host is flagged",
  analyticsUngated(GA(`(function(){ if (location.hostname !== 'staging.example.com') return; ${LOAD} })();`)), true);

t("gate: a gate that does not return is flagged",
  analyticsUngated(GA(`(function(){ if (location.hostname !== 'www.hymtravel.com') console.log('x'); ${LOAD} })();`)), true);

t("gate: double quotes and a braced return are still the gate",
  analyticsUngated(GA(`if (location.hostname !== "www.hymtravel.com") { return; } ${LOAD}`)), false);

t("gate: a measurement ID alone counts as analytics",
  analyticsUngated(GA(`var id = 'G-ABC123DEF';`)), true);

t("gate: a page with no analytics is not flagged",
  analyticsUngated(`<script>document.documentElement.classList.add('js-accordion');</script>`), false);

t("gate: text outside <script> is not analytics",
  analyticsUngated(`<p>We use gtag( for analytics on G-XXXXXXXXXX.</p>`), false);

/* ── accordion-noscript (P0-1) ── */

t("accordion: the shipped scoped hide rule is clean",
  unscopedAccordionHides(`.js-accordion .pf-a{display:none}.js-accordion .pf-item.open .pf-a{display:block}`).length, 0);

/* The F1 defect verbatim: the answer hidden with no scope, so a crawler and
   a JS-off reader see nothing. */
t("accordion: an unscoped .pf-a hide is caught",
  unscopedAccordionHides(`.pf-a{display:none}`).length, 1);

t("accordion: an unscoped .faq-a hide is caught",
  unscopedAccordionHides(`.faq-a { display: none; }`).length, 1);

t("accordion: display:block on the answer is not a hide",
  unscopedAccordionHides(`.pf-a{display:block}`).length, 0);

t("accordion: hiding something else without the scope is fine",
  unscopedAccordionHides(`.journal-more__btn{display:none}`).length, 0);

t("accordion: one unscoped selector in a comma list is caught, the scoped one is not",
  unscopedAccordionHides(`.js-accordion .pf-a, .faq-a { display:none }`).join("|"), ".faq-a");

t("accordion: a rule inside @media is still checked",
  unscopedAccordionHides(`@media(max-width:900px){.pf-a{display:none}}`).length, 1);

t("accordion: a scoped rule inside @media is still clean",
  unscopedAccordionHides(`@media(max-width:900px){.js-accordion .pf-a{display:none}}`).length, 0);

t("accordion: .pf-answer is not .pf-a",
  unscopedAccordionHides(`.pf-answer{display:none}`).length, 0);

t("accordion: empty css reports nothing",
  unscopedAccordionHides(``).length, 0);

/* ── web3forms (#74) ── */

const KEY = "94312057-04b8-44d8-a7a8-7cb083d999b8";
const OTHER = "11111111-2222-4333-8444-555555555555";

/* Both shipped shapes, verbatim. */
t("web3forms: the Newsletter's hidden input yields the key",
  web3formsKeys(`<input type="hidden" name="access_key" value="${KEY}" />`).join(), KEY);

t("web3forms: Contact's formData.append yields the key",
  web3formsKeys(`formData.append('access_key', '${KEY}');`).join(), KEY);

t("web3forms: value-before-name attribute order still yields the key",
  web3formsKeys(`<input value="${KEY}" type="hidden" name="access_key">`).join(), KEY);

t("web3forms: the same key in both shapes on one page is one key",
  web3formsKeys(`<input type="hidden" name="access_key" value="${KEY}"><script>formData.append('access_key', '${KEY}')</script>`).length, 1);

/* The partial-rotation shape: two keys live at once. */
t("web3forms: two different keys on one page are two",
  web3formsKeys(`<input type="hidden" name="access_key" value="${KEY}"><script>formData.append('access_key', '${OTHER}')</script>`).length, 2);

t("web3forms: a uuid that is not an access_key is not a key",
  web3formsKeys(`<input type="hidden" name="session" value="${OTHER}">`).length, 0);

t("web3forms: a page with no form yields nothing",
  web3formsKeys(`<main><p>x</p></main>`).length, 0);

t("web3forms: the honeypot is seen",
  hasHoneypot(`<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">`), true);

t("web3forms: a missing honeypot is seen",
  hasHoneypot(`<input type="email" name="email">`), false);

t("web3forms: botcheck as a JS string is not the honeypot input",
  hasHoneypot(`<script>formData.append('botcheck', '')</script>`), false);

/* ── og:image:alt interpolation guard ──
   The og-image check's alt rules live inline in verify-deployment.mjs, but
   the one that caught a real bug is a predicate worth pinning here: an alt
   containing a stringified non-string. "Italy, [object Object]" shipped to
   43 pages because DestinationLayout's `region` is {label, href}, and
   "Africa, undefined" to the hubs that omit it. Both tags were present and
   non-empty, so nothing else could see them. */
const badInterpolation = (alt) => /\[object Object\]|\bundefined\b|\bNaN\b/.test(alt);

t("og-alt: the shipped [object Object] bug is caught",
  badInterpolation("Italy, [object Object]"), true);

t("og-alt: the shipped undefined bug is caught",
  badInterpolation("Africa, undefined"), true);

t("og-alt: NaN is caught",
  badInterpolation("Trip for NaN nights"), true);

t("og-alt: a correct two-part alt passes",
  badInterpolation("Italy, Europe"), false);

t("og-alt: a single-word alt passes",
  badInterpolation("Africa"), false);

t("og-alt: the crest plate's own alt passes",
  badInterpolation("Hit Your Mark Travel"), false);

/* Guard the guard: the \b anchors mean ordinary copy merely containing the
   letters must not fire. */
t("og-alt: a longer word containing the substring is not flagged",
  badInterpolation("Undefinedness as a theme"), false);

t("og-alt: an escaped ampersand is not an interpolation fault",
  badInterpolation("Safari &#38; Wildlife"), false);

/* -- place-card alt: region redundancy -----------------------------------
   The generator side, not a build gate. place-card-intake.mjs builds every
   destination card's alt from these, so a regression here ships silently into
   markup that no check reads back. Both directions are pinned: the shapes that
   MUST collapse, and the near misses that must keep their region.

   The old rule was string equality. It caught "Musandam Peninsula, Musandam
   Peninsula" and missed "Dubai, Emirate of Dubai" — which is why these exist.
*/
t("place-alt: an identical region collapses (the shape the old rule caught)",
  placeCardAlt("Musandam Peninsula", "Musandam Peninsula"), "Musandam Peninsula");

t("place-alt: an emirate wrapping its own city collapses",
  placeCardAlt("Dubai", "Emirate of Dubai"), "Dubai");

t("place-alt: a two-word city inside its emirate collapses",
  placeCardAlt("Abu Dhabi", "Emirate of Abu Dhabi"), "Abu Dhabi");

t("place-alt: a hyphenated region opening with the city collapses",
  placeCardAlt("Marrakech", "Marrakech-Safi"), "Marrakech");

/* Near misses. Every one of these regions carries information the card name
   does not, and a looser rule would eat all four. */
t("place-alt: a different word is kept",
  placeCardAlt("Doha", "Qatar"), "Doha, Qatar");

t("place-alt: a different emirate from the name is kept",
  placeCardAlt("Al Ain", "Emirate of Abu Dhabi"), "Al Ain, Emirate of Abu Dhabi");

t("place-alt: sharing a word is not containing the name",
  placeCardAlt("Cape Town", "Western Cape"), "Cape Town, Western Cape");

t("place-alt: a transliteration is not a containment",
  placeCardAlt("Fez", "Fès-Meknès"), "Fez, Fès-Meknès");

t("place-alt: an unrelated region is kept",
  placeCardAlt("Mahé", "Inner Granitic Islands"), "Mahé, Inner Granitic Islands");

/* Escaped source form is what the pages actually carry, and the fold must not
   change the output string — only the comparison. */
t("place-alt: an escaped ampersand survives into the alt unchanged",
  placeCardAlt("Aït Benhaddou &amp; the Valleys", "Drâa-Tafilalet"),
  "Aït Benhaddou &amp; the Valleys, Drâa-Tafilalet");

/* A word boundary, not a substring: "Ain" must not match inside "Spain". */
t("place-alt: a name embedded mid-word does not collapse",
  placeCardAlt("Ain", "Northern Spain"), "Ain, Northern Spain");

/* Reverse containment: the name contains the region. This is the commoner
   shape here, because so many cards are named "<place> & <its region>". The
   alt keeps the name either way. */
t("place-alt: a name ending in its own region collapses",
  placeCardAlt("Bay of Islands &amp; Northland", "Northland"),
  "Bay of Islands &amp; Northland");

t("place-alt: a name built on its region collapses",
  placeCardAlt("Aitutaki Lagoon", "Aitutaki"), "Aitutaki Lagoon");

t("place-alt: a two-word region inside the name collapses",
  placeCardAlt("Addo &amp; the Eastern Cape", "Eastern Cape"),
  "Addo &amp; the Eastern Cape");

t("place-alt: reverse containment survives accent folding",
  placeCardAlt("Galápagos &amp; Ecuador", "Ecuador"),
  "Galápagos &amp; Ecuador");

/* Reverse near misses. The word boundary is what stops these, and without it
   the first two would both eat a region that is genuinely informative. */
t("place-alt: a region sharing only a trailing word is kept",
  placeCardAlt("Essaouira &amp; the Coast", "Atlantic Coast"),
  "Essaouira &amp; the Coast, Atlantic Coast");

t("place-alt: a singular region does not match a plural in the name",
  placeCardAlt("Bay of Islands &amp; Northland", "Island"),
  "Bay of Islands &amp; Northland, Island");

t("place-alt: an unrelated region is still kept in the reverse direction",
  placeCardAlt("Masada &amp; the Dead Sea", "Judaean Desert"),
  "Masada &amp; the Dead Sea, Judaean Desert");

/* ── htaccess-headers ── */

const HT_GOOD = `# a comment mentioning immutable, which must be ignored
<IfModule mod_rewrite.c>
  RewriteRule ^terms-conditions/?$ https://www.hymtravel.com/terms-and-conditions/ [R=301,L,NE]
  RewriteRule ^trips/?$ https://www.hymtravel.com/travel-journal/ [R=301,L,NE]
  RewriteCond %{HTTP_HOST} ^hymtravel\.com$ [NC]
  RewriteRule ^ https://www.hymtravel.com%{REQUEST_URI} [R=301,L]
</IfModule>
<IfModule mod_headers.c>
  SetEnvIf Host "hostingersite\\.com$" IS_STAGING=1
  Header always set X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" env=IS_STAGING
  SetEnvIfNoCase Host "^(www\\.)?hymtravel\\.com(?::[0-9]+)?$" IS_PROD=1
  Header always set Strict-Transport-Security "max-age=86400" env=IS_PROD
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header always set Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'sha256-AAA=' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.web3forms.com; form-action 'self' https://api.web3forms.com; frame-ancestors 'self'; frame-src 'none'; base-uri 'self'; object-src 'none'"
  Header set Cache-Control "public, max-age=2592000, no-transform"
</IfModule>`;

t("htaccess: a complete file is clean",
  htaccessGaps(HT_GOOD).length, 0);

t("htaccess: the verifier cannot skip the configured production site",
  rawHtaccessGaps(HT_GOOD).length, 1);

t("htaccess: a missing legacy redirect is caught",
  htaccessGaps(HT_GOOD.replace(/^\s*RewriteRule \^trips.*$/m, "")).length, 1);

t("htaccess: a legacy redirect with the wrong target is caught",
  htaccessGaps(HT_GOOD.replace("https://www.hymtravel.com/travel-journal/", "https://www.hymtravel.com/")).length, 1);

t("htaccess: a temporary legacy redirect is caught",
  htaccessGaps(HT_GOOD.replace("[R=301,L,NE]", "[R=302,L,NE]")).length, 1);

t("htaccess: legacy redirects below structural rules are caught",
  htaccessGaps(HT_GOOD
    .replace(/^\s*RewriteRule \^(?:terms-conditions|trips).*\n/gm, "")
    .replace("</IfModule>", `  RewriteRule ^terms-conditions/?$ https://www.hymtravel.com/terms-and-conditions/ [R=301,L,NE]
  RewriteRule ^trips/?$ https://www.hymtravel.com/travel-journal/ [R=301,L,NE]
</IfModule>`)).length, 2);

/* THE false-positive guard. `immutable` appears 4x in the real file today and
   every one is a comment explaining why it was removed (#107). A predicate
   over raw text reports the fix as the defect — the trap inline-handler hit. */
t("htaccess: `immutable` inside a comment is not a Cache-Control value",
  htaccessGaps(HT_GOOD.replace("# a comment mentioning immutable, which must be ignored",
    "# NOT `immutable`, deliberately (#107). `immutable` promises the bytes never change.")).length, 0);

t("htaccess: a commented-out Header line does not satisfy the check",
  htaccessGaps(HT_GOOD.replace(`  Header set X-Frame-Options "SAMEORIGIN"`,
    `  # Header set X-Frame-Options "SAMEORIGIN"`)).length, 1);

/* #107, reproduced exactly. */
t("htaccess: immutable in a real Cache-Control is caught",
  htaccessGaps(HT_GOOD.replace(`"public, max-age=2592000, no-transform"`,
    `"public, max-age=31536000, immutable"`)).length, 2);   // immutable AND no no-transform

t("htaccess: a Cache-Control without no-transform is caught (#95)",
  htaccessGaps(HT_GOOD.replace(`, no-transform"`, `"`)).length, 1);

/* The two CSP entries that fail SILENTLY once #100 flips to enforcing. */
t("htaccess: dropping api.web3forms.com from connect-src is caught",
  htaccessGaps(HT_GOOD.replace("connect-src 'self' https://api.web3forms.com", "connect-src 'self'")).length, 1);

t("htaccess: dropping frame-src 'none' is caught (the Turnstile half-fix)",
  htaccessGaps(HT_GOOD.replace("frame-src 'none'; ", "")).length, 1);

t("htaccess: a missing security header is caught",
  htaccessGaps(HT_GOOD.replace(`  Header set X-Content-Type-Options "nosniff"\n`, "")).length, 1);

t("htaccess: a security header with the WRONG value is caught",
  htaccessGaps(HT_GOOD.replace(`"SAMEORIGIN"`, `"ALLOWALL"`)).length, 1);

/* The header is inert without the SetEnvIf that arms it. */
t("htaccess: deleting the SetEnvIf while keeping X-Robots-Tag is caught",
  htaccessGaps(HT_GOOD.replace(/^\s*SetEnvIf.*$/m, "")).length, 1);

t("htaccess: deleting the staging X-Robots-Tag is caught",
  htaccessGaps(HT_GOOD.replace(/^\s*Header always set X-Robots-Tag.*$/m, "")).length, 1);

/* No CSP reports its absence once, not eleven missing directives. */
t("htaccess: no CSP header at all is one offender, not eleven",
  htaccessGaps(HT_GOOD.replace(/^\s*Header always set Content-Security-Policy-Report-Only.*$/m, "")).length, 1);

t("htaccess: an ENFORCING CSP satisfies the check as well as report-only",
  htaccessGaps(HT_GOOD.replace("Content-Security-Policy-Report-Only", "Content-Security-Policy")).length, 0);

/* ── HSTS (#79) ──
   Driven red against each shape it can actually ship in. The first is the
   state of the file before this check existed, so it is the one that proves
   the check can go red at all rather than merely staying green. */
t("htaccess: the pre-#79 file, with no HSTS at all, is caught twice",
  htaccessGaps(HT_GOOD
    .replace(/^\s*Header always set Strict-Transport-Security.*$/m, "")
    .replace(/^\s*SetEnvIfNoCase Host "\^\(www.*IS_PROD=1$/m, "")).length, 2);

t("htaccess: deleting only the HSTS header is caught",
  htaccessGaps(HT_GOOD.replace(/^\s*Header always set Strict-Transport-Security.*$/m, "")).length, 1);

/* The silent one: env=IS_PROD with nothing arming IS_PROD sends the header
   to nobody, and greps for "Strict-Transport-Security" still find it. */
t("htaccess: an HSTS header whose SetEnvIf is gone is caught",
  htaccessGaps(HT_GOOD.replace(/^\s*SetEnvIfNoCase Host "\^\(www.*IS_PROD=1$/m, "")).length, 1);

/* The deployment matcher is validated against Astro's configured site, not
   against another hymtravel.com literal hidden in the verifier. A wholly
   foreign site disagrees with the .htaccess twice over — the IS_PROD matcher
   and the canonical-host rewrite — and both are real, so both are reported. */
t("htaccess: a matcher that drifts from the configured production site is caught",
  htaccessGaps(HT_GOOD, "https://www.example.com").length, 2);

t("htaccess: the drift names the IS_PROD matcher…",
  htaccessGaps(HT_GOOD, "https://www.example.com").some((g) => g.includes("IS_PROD host matcher")), true);

t("htaccess: …and the canonical-host rewrite",
  htaccessGaps(HT_GOOD, "https://www.example.com").some((g) => g.includes("canonical-host rewrite")), true);

t("htaccess: a case-sensitive production matcher is caught",
  htaccessGaps(HT_GOOD.replace("SetEnvIfNoCase Host", "SetEnvIf Host")).length, 1);

t("htaccess: a production matcher that rejects an explicit port is caught",
  htaccessGaps(HT_GOOD.replace("(?::[0-9]+)?", "")).length, 1);

/* Unscoping it is a regression, not a simplification: it would pin the
   Hostinger preview host to HTTPS on a certificate this repo does not own. */
t("htaccess: dropping env=IS_PROD so HSTS goes to every host is caught",
  htaccessGaps(HT_GOOD.replace(` "max-age=86400" env=IS_PROD`, ` "max-age=86400"`)).length, 1);

t("htaccess: preload is refused even at the correct max-age",
  htaccessGaps(HT_GOOD.replace(`"max-age=86400"`, `"max-age=86400; preload"`)).length, 1);

/* The ramp is the safety argument, so widening it in the .htaccess alone
   must fail rather than quietly commit every visitor for a year. */
t("htaccess: raising max-age in the .htaccess alone is caught",
  htaccessGaps(HT_GOOD.replace(`"max-age=86400"`, `"max-age=31536000; includeSubDomains"`)).length, 1);

/* ── The APPENDED shapes, which first-match-only reading let through ──
   Every one of these returned zero gaps before matchAll: `Header set` is
   last-wins and Apache evaluates every SetEnvIf, so a second line is the one
   that decides what ships. Deleting a line was covered; adding one was not. */
t("htaccess: a second, unscoped HSTS header is caught",
  htaccessGaps(HT_GOOD +
    `\n  Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"\n`).length, 1);

t("htaccess: a second SetEnvIf arming IS_PROD on the preview host is caught",
  htaccessGaps(HT_GOOD +
    `\n  SetEnvIfNoCase Host "hostingersite\\.com$" IS_PROD=1\n`).length, 1);

/* The env name is terminated, so a rename on the header line alone — which
   leaves nothing arming the variable — no longer reads as shipped. */
t("htaccess: an env name nothing arms is caught",
  htaccessGaps(HT_GOOD.replace("env=IS_PROD", "env=IS_PRODUCTION")).length, 1);

/* Present but not `always` rides only the onsuccess table, so it is dropped
   on the 301s. It must fail, and the message must name `always` rather than
   claim the header is missing — the reader greps, finds it, and stops
   trusting the verifier. */
t("htaccess: HSTS without `always` is caught",
  htaccessGaps(HT_GOOD.replace("Header always set Strict-Transport-Security",
                               "Header set Strict-Transport-Security")).length, 1);

t("htaccess: and that failure names `always` instead of saying it is missing",
  htaccessGaps(HT_GOOD.replace("Header always set Strict-Transport-Security",
                               "Header set Strict-Transport-Security"))[0].includes("without `always`"), true);

/* ── Directive forms that a `set`-only, quoted-only reading missed ──
   Every one of these returned ZERO gaps before. mod_headers has
   add/append/merge/setifempty besides set, Apache accepts an unquoted
   SetEnvIf pattern and several assignments per line, and `env=` takes the
   whole token — so each is a live way to ship the thing being guarded
   against while the build stays green. */
t("htaccess: an appended `Header always add` HSTS is caught",
  htaccessGaps(HT_GOOD +
    `\n  Header always add Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"\n`).length, 1);

t("htaccess: the only HSTS line using `add` instead of `set` is caught",
  htaccessGaps(HT_GOOD.replace("Header always set Strict-Transport-Security",
                               "Header always add Strict-Transport-Security")).length, 1);

t("htaccess: `setifempty` is refused the same way",
  htaccessGaps(HT_GOOD.replace("Header always set Strict-Transport-Security",
                               "Header always setifempty Strict-Transport-Security")).length, 1);

t("htaccess: an appended UNQUOTED SetEnvIf arming IS_PROD is caught",
  htaccessGaps(HT_GOOD + `\n  SetEnvIfNoCase Host . IS_PROD=1\n`).length, 1);

t("htaccess: the only arming line, unquoted, is caught",
  htaccessGaps(HT_GOOD.replace(/SetEnvIfNoCase Host "[^"]*" IS_PROD=1/,
                               "SetEnvIfNoCase Host . IS_PROD=1")).length, 1);

t("htaccess: a second assignment on the arming line is caught",
  htaccessGaps(HT_GOOD.replace("IS_PROD=1", "FOO=1 IS_PROD=1")).length, 1);

t("htaccess: a plain `SetEnv IS_PROD 1`, which arms every host, is caught",
  htaccessGaps(HT_GOOD + `\n  SetEnv IS_PROD 1\n`).length, 1);

/* `env=` takes the whole token, so IS_PROD.EXTRA is a DIFFERENT variable that
   nothing arms — production silently receives no HSTS. */
t("htaccess: a punctuation-suffixed env name is caught",
  htaccessGaps(HT_GOOD.replace("env=IS_PROD", "env=IS_PROD.EXTRA")).length, 1);

t("htaccess: trailing junk after env=IS_PROD is caught",
  htaccessGaps(HT_GOOD.replace("env=IS_PROD", "env=IS_PROD extra")).length, 1);

/* ── canonical host: `site` and the rewrite are one decision ──
   The (www\.)? matcher is unconditional, so HSTS covers both hosts whichever
   spelling `site` carries. What must NOT pass is the pair disagreeing: an
   apex `site` while this .htaccess still 301s the apex to www would point
   every canonical, og:url and sitemap URL at a host the server redirects
   away from. Nothing compared them before. */
t("htaccess: an apex `site` against a www-forcing rewrite is caught",
  htaccessGaps(HT_GOOD, "https://hymtravel.com").length, 1);

t("htaccess: and it is reported as the canonical-host mismatch, not the matcher",
  htaccessGaps(HT_GOOD, "https://hymtravel.com")[0].includes("canonical-host rewrite"), true);

t("htaccess: a rewrite pointing at a host that is not `site` is caught",
  htaccessGaps(HT_GOOD.replace("RewriteRule ^ https://www.hymtravel.com%{REQUEST_URI}",
                               "RewriteRule ^ https://cdn.hymtravel.com%{REQUEST_URI}")).length, 1);

t("htaccess: losing the canonical-host rewrite entirely is caught",
  htaccessGaps(HT_GOOD
    .replace(/^\s*RewriteCond %\{HTTP_HOST\}.*\n/m, "")
    .replace(/^\s*RewriteRule \^ https:\/\/www\.hymtravel\.com.*\n/m, "")).length, 1);

/* Same first-match-only hole as cspHeaders had: the second line is the one
   Apache keeps, so a duplicate must fail rather than have the directives
   checked against the dead policy above it. */
t("htaccess: the same CSP header set twice is caught",
  htaccessGaps(HT_GOOD +
    `\n  Header always set Content-Security-Policy-Report-Only "default-src 'self'"\n`).length, 1);

/* One of each name still passes htaccessGaps — csp-script-src is the check
   that refuses that, and it does. This pins the division of labour. */
t("htaccess: one of each CSP name is not this check's failure to report",
  htaccessGaps(HT_GOOD +
    `\n  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src https://api.web3forms.com; form-action https://api.web3forms.com; frame-ancestors 'self'; frame-src 'none'; base-uri 'self'; object-src 'none'"\n`).length, 0);


/* An empty file — the "someone renamed public/.htaccess" case. Exactly 13:
   both migration redirects, the 4 security headers, both staging lines, both
   HSTS lines (#79), the canonical-host rewrite, the CSP once, and the cache
   once. */
t("htaccess: an empty file reports all 13 gaps and does not throw",
  htaccessGaps("").length, 13);

/* ── configuredSite ──
   One parser, two readers. Both drifts below were live in the two copies it
   replaces: a `website:` key won over `site:`, and double quotes yielded "". */
t("site: the shipped single-quoted config is read",
  configuredSite(`  site: 'https://www.hymtravel.com',`), "https://www.hymtravel.com");

t("site: a double-quoted config is read, not silently dropped",
  configuredSite(`  site: "https://www.hymtravel.com",`), "https://www.hymtravel.com");

t("site: a longer key ending in `site:` does not win",
  configuredSite(`  website: 'https://evil.example',\n  site: 'https://www.hymtravel.com',`),
  "https://www.hymtravel.com");

/* Anchoring to the start of a line fixed `website:` and broke this — an
   equally valid single-line config, which would have returned "" and failed
   canonical-host on every build. The anchor is a property boundary. */
t("site: an inline single-line config is read",
  configuredSite(`export default defineConfig({ site: 'https://www.hymtravel.com' });`),
  "https://www.hymtravel.com");

t("site: `website:` inline still does not win",
  configuredSite(`export default defineConfig({ website: 'https://evil.example', site: 'https://www.hymtravel.com' });`),
  "https://www.hymtravel.com");

t("site: a trailing slash is stripped",
  configuredSite(`  site: 'https://www.hymtravel.com/',`), "https://www.hymtravel.com");

t("site: a config with no site at all is empty, not a throw",
  configuredSite(`export default {}`), "");

/* ── photo-grid (#93) ── */

const photoCard = `<a class="place-card" href="/plan-your-trip/"><img class="place-card__img" src="/assets/img/x.jpg" alt="X" width="1600" height="900" loading="lazy" decoding="async"><div class="place-card__name">X</div></a>`;
const swatchCard = `<a class="place-card" href="/plan-your-trip/"><div class="place-card__ph" style="background:#1a100a">Destination Photography · X</div><div class="place-card__overlay"></div><div class="place-card__name">X</div></a>`;
const grid = (mod, cards) => `<section><div class="places-grid places-grid--even${mod}">${cards}</div></section>`;

t("photo-grid: a --photo grid of real photos is clean",
  photoGridDefects(grid(" places-grid--photo", photoCard + photoCard)).length, 0);

/* The half-converted page: the modifier claims photos, a card is still a swatch. */
t("photo-grid: a --photo grid still holding a swatch is caught",
  photoGridDefects(grid(" places-grid--photo", photoCard + swatchCard)).length, 1);

t("photo-grid: the report counts the swatches",
  photoGridDefects(grid(" places-grid--photo", swatchCard + swatchCard))[0].includes("2 placeholder swatches"), true);

/* The honest un-converted state — 4 destination + 7 experience pages today. */
t("photo-grid: a grid WITHOUT the modifier may hold swatches",
  photoGridDefects(grid("", swatchCard + swatchCard)).length, 0);

t("photo-grid: exp-cards--photo is checked the same way",
  photoGridDefects(`<section><div class="exp-cards exp-cards--photo"><a class="exp-card"><div class="exp-card__ph" style="background:#111">X</div></a></div></section>`).length, 1);

t("photo-grid: exp-cards without the modifier may hold swatches",
  photoGridDefects(`<section><div class="exp-cards"><a class="exp-card"><div class="exp-card__ph" style="background:#111">X</div></a></div></section>`).length, 0);

/* The counting trap: a photo smuggled in as a CSS background. No alt, no
   intrinsic size, cannot lazy-load. 19 cards were in this state at filing. */
t("photo-grid: a __ph carrying a background-IMAGE is caught even without the modifier",
  photoGridDefects(`<div class="places-grid"><div class="place-card__ph" style="background-image:url(/assets/img/x.jpg)"></div></div>`).length, 1);

t("photo-grid: a flat background COLOUR is not a smuggled photo",
  photoGridDefects(`<div class="places-grid"><div class="place-card__ph" style="background:#1a100a">X</div></div>`).length, 0);

t("photo-grid: a converted grid does not leak into the next grid on the page",
  photoGridDefects(grid(" places-grid--photo", photoCard) + grid("", swatchCard)).length, 0);

t("photo-grid: two broken grids on one page are two",
  photoGridDefects(grid(" places-grid--photo", swatchCard) + grid(" places-grid--photo", swatchCard)).length, 2);

t("photo-grid: a page with no grid reports nothing",
  photoGridDefects(`<main><p>nothing</p></main>`).length, 0);

/* ── nested-card-anchor ── */

/* The exact shape that shipped: an authoritative-source link inside the copy
   of a card that is ITSELF an <a>. 28 of these were live across 10 pages.
   The source is well-formed, so every source-shape check above stays green;
   the parser is what splits the card. argentina rendered 12 .place-card
   elements for its 6 cards. */
const linkedCard = `<a class="place-card" href="/plan-your-trip/"><img class="place-card__img" src="/assets/img/x.jpg" alt="X" width="1600" height="900" loading="lazy" decoding="async"><div class="place-card__name">Alta</div><div class="place-card__desc">Carvings <a href="https://whc.unesco.org/en/list/352/" rel="noopener">UNESCO World Heritage</a> since 1985.</div></a>`;

t("nested-card-anchor: a link inside a place-card is caught",
  nestedCardAnchors(grid(" places-grid--photo", linkedCard)).length, 1);

t("nested-card-anchor: the report names the card",
  nestedCardAnchors(grid(" places-grid--photo", linkedCard))[0].includes("Alta"), true);

/* It is a defect on the un-converted pages too — 9 of the 10 were still on
   swatches. A check that only fires under --photo would have missed them. */
t("nested-card-anchor: caught on a swatch grid with no --photo modifier",
  nestedCardAnchors(grid("", linkedCard)).length, 1);

t("nested-card-anchor: a clean card reports nothing",
  nestedCardAnchors(grid(" places-grid--photo", photoCard + photoCard)).length, 0);

t("nested-card-anchor: a swatch card reports nothing",
  nestedCardAnchors(grid("", swatchCard)).length, 0);

t("nested-card-anchor: two broken cards are two",
  nestedCardAnchors(grid("", linkedCard + linkedCard)).length, 2);

t("nested-card-anchor: exp-card is checked the same way",
  nestedCardAnchors(`<a class="exp-card" href="/x/"><div class="exp-card__desc">see <a href="https://example.org/">this</a></div></a>`).length, 1);

/* A link that is a SIBLING of the card, not inside it, is ordinary markup. */
t("nested-card-anchor: a link after the card closes is not nested",
  nestedCardAnchors(`${photoCard}<a href="https://example.org/">after</a>`).length, 0);

t("nested-card-anchor: a page with no cards reports nothing",
  nestedCardAnchors(`<main><p><a href="/x/">ordinary link</a></p></main>`).length, 0);

/* ── schema-itemlist ── */

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const li = (pos, slug) => ({ "@type": "ListItem", position: pos, name: slug,
  url: `https://www.hymtravel.com/travel-journal/${slug}/` });
const collectionPage = (items, n = items.length) => ld({
  "@context": "https://schema.org", "@type": "CollectionPage", name: "Travel Journal",
  mainEntity: { "@type": "ItemList", numberOfItems: n, itemListElement: items },
});

/* The shipped defect in miniature: the featured post parsed out twice, so the
   list was one longer than the site had posts and one URL sat at two
   positions. numberOfItems agreed with the (wrong) element count, so this is
   the duplicate branch alone. */
t("itemlist: the featured post listed twice is one defect",
  itemListDefects(collectionPage([li(1, "botswana-shoulder-season"), li(2, "masters-field-report"),
    li(3, "botswana-shoulder-season")])).length, 1);

t("itemlist: the duplicate report names the URL and both positions",
  itemListDefects(collectionPage([li(1, "botswana-shoulder-season"), li(2, "masters-field-report"),
    li(3, "botswana-shoulder-season")]))[0].includes("positions 1, 3"), true);

t("itemlist: distinct URLs are clean",
  itemListDefects(collectionPage([li(1, "a"), li(2, "b"), li(3, "c")])).length, 0);

t("itemlist: numberOfItems disagreeing with the element count is caught",
  itemListDefects(collectionPage([li(1, "a"), li(2, "b")], 3)).length, 1);

t("itemlist: a duplicate AND a wrong count are two defects, not one",
  itemListDefects(collectionPage([li(1, "a"), li(2, "a")], 5)).length, 2);

/* item can be an @id object rather than a bare url. */
t("itemlist: duplicates via item.@id are seen too",
  itemListDefects(ld({ "@type": "ItemList", numberOfItems: 2, itemListElement: [
    { "@type": "ListItem", position: 1, item: { "@id": "https://www.hymtravel.com/x/" } },
    { "@type": "ListItem", position: 2, item: { "@id": "https://www.hymtravel.com/x/" } },
  ] })).length, 1);

t("itemlist: an ItemList inside an @graph is walked",
  itemListDefects(ld({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", name: "x" },
    { "@type": "ItemList", numberOfItems: 1, itemListElement: [li(1, "a"), li(2, "a")] },
  ] })).length, 2);

/* Two lists on one page are checked independently. */
t("itemlist: a clean list does not hide a broken neighbour",
  itemListDefects(collectionPage([li(1, "a"), li(2, "b")]) +
    collectionPage([li(1, "c"), li(2, "c")])).length, 1);

/* ── BreadcrumbList (was excluded, and that is what hid the bug) ──
   This fixture used to assert the opposite — that a BreadcrumbList with two
   identical items reported 0 — and it passed for exactly as long as 32 journal
   posts shipped that defect. The old expectation is the bug, pinned. */
t("breadcrumb: a duplicated item url is caught",
  itemListDefects(ld({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, item: "https://www.hymtravel.com/" },
    { "@type": "ListItem", position: 2, item: "https://www.hymtravel.com/" },
  ] })).length, 1);

/* The exact shape that shipped on all 32 posts: Home, Travel Journal, then a
   category crumb resolving to the same /travel-journal/ URL. */
t("breadcrumb: the shipped journal trail is caught",
  itemListDefects(ld({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, item: "https://www.hymtravel.com/" },
    { "@type": "ListItem", position: 2, item: "https://www.hymtravel.com/travel-journal/" },
    { "@type": "ListItem", position: 3, item: "https://www.hymtravel.com/travel-journal/" },
    { "@type": "ListItem", position: 4, name: "A post" },
  ] })).length, 1);

/* And the corrected trail this commit ships — the final crumb legitimately
   carries no `item`, which is the one position where that is valid. */
t("breadcrumb: the corrected three-crumb trail is clean",
  itemListDefects(ld({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, item: "https://www.hymtravel.com/" },
    { "@type": "ListItem", position: 2, item: "https://www.hymtravel.com/travel-journal/" },
    { "@type": "ListItem", position: 3, name: "A post" },
  ] })).length, 0);

/* A destination trail repeats no URL and must stay green. */
t("breadcrumb: a four-crumb destination trail is clean",
  itemListDefects(ld({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, item: "https://www.hymtravel.com/" },
    { "@type": "ListItem", position: 2, item: "https://www.hymtravel.com/destinations/" },
    { "@type": "ListItem", position: 3, item: "https://www.hymtravel.com/destinations/africa/" },
    { "@type": "ListItem", position: 4, name: "Kenya" },
  ] })).length, 0);

/* The label takes its noun from the node. Hardcoding "ItemList" would have
   reported every breadcrumb defect under the wrong type. */
t("breadcrumb: the defect is reported as a BreadcrumbList, not an ItemList",
  itemListDefects(ld({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, item: "https://www.hymtravel.com/x/" },
    { "@type": "ListItem", position: 2, item: "https://www.hymtravel.com/x/" },
  ] }))[0].startsWith("BreadcrumbList"), true);

t("itemlist: a block that does not parse is skipped, not reported here",
  itemListDefects(`<script type="application/ld+json">{not json</script>`).length, 0);

t("itemlist: a page with no ItemList reports nothing",
  itemListDefects(`<main><p>nothing</p></main>`).length, 0);

/* ── the real build, so these predicates cannot drift from the site ── */

const dist = path.join(ROOT, "dist");
if (await access(dist, constants.R_OK).then(() => true, () => false)) {
  const about = await readFile(path.join(dist, "about", "index.html"), "utf8");
  t("real /about/ keeps its Brian S. attribution",
    attribution(about, "pull-quote", "pull-quote__attr"), "PASS");

  const italy = await readFile(path.join(dist, "destinations", "italy", "index.html"), "utf8");
  t("real /destinations/italy/ clears the journal-link floor",
    linkFloor(italy, "section") >= 2, true);

  /* page-length against real output. The numbers are asserted, not just the
     verdict: bodyWords must return exactly what a word count of
     src/content-pages/destinations__<slug>.html returns, because that is the
     file an author opens when this check goes red. If these drift, the
     predicate has started measuring something else. */
  /* 3269 until the intro panel took a photograph, then 3260; 3235 since the
     four featured-itinerary tiles took theirs. Both times the reason is the
     same: an unfilled photo slot renders its own caption as visible text, so
     removing the plate removes words. Italy's four "Itinerary Photography /
     Rome & Tuscany" plates were 25 of them. The invariant above was re-checked
     at each new number — bodyWords(dist) still equals a word count of
     src/content-pages/destinations__italy.html — so this is the copy moving,
     not the predicate. */
  t("real /destinations/italy/ measures its authored body copy, chrome excluded",
    bodyWords(italy), 3235);
  t("real /destinations/italy/ is a country page, so page-length applies",
    crumbTrail(italy).length, 4);
  const africaHub = await readFile(path.join(dist, "destinations", "africa", "index.html"), "utf8");
  t("real /destinations/africa/ is a regional hub, so page-length skips it",
    crumbTrail(africaHub).length, 3);
  /* The shortest page on the site. It is deliberately short — § 3.4's own
     prose blesses "a tight 1,200-word destination page" — which is why this
     check has a ceiling and no floor. */
  const napa = await readFile(path.join(dist, "destinations", "napa-sonoma", "index.html"), "utf8");
  t("real /destinations/napa-sonoma/ is 1,215 words and passes: there is no floor",
    bodyWords(napa) < 1500 && bodyWords(napa) <= 3500, true);

  const masters = await readFile(path.join(dist, "travel-journal", "masters-field-report", "index.html"), "utf8");
  t("real masters post clears the destination-link floor",
    linkFloor(masters, "journal") >= 2, true);

  /* The two pages that carried 43 of the 46 removed handlers. */
  const journal = await readFile(path.join(dist, "travel-journal", "index.html"), "utf8");
  t("real /travel-journal/ carries no inline handlers",
    inlineHandlers(journal).length, 0);
  /* The hub whose ItemList shipped 33 for 32, one URL at two positions. */
  t("real /travel-journal/ ItemList has no duplicate and an honest count",
    itemListDefects(journal).length, 0);

  const plan = await readFile(path.join(dist, "plan-your-trip", "index.html"), "utf8");
  t("real /plan-your-trip/ carries no inline handlers",
    inlineHandlers(plan).length, 0);

  /* Every field on every form. The home page carries the newsletter (the one
     that shipped uncapped); Plan Your Trip carries the readonly steppers that
     the exemption exists for. */
  const home = await readFile(path.join(dist, "index.html"), "utf8");
  t("real / has no uncapped field (the newsletter is capped)",
    uncappedFields(home).length, 0);
  const contact = await readFile(path.join(dist, "contact", "index.html"), "utf8");
  t("real /contact/ has no uncapped field",
    uncappedFields(contact).length, 0);
  t("real /plan-your-trip/ has no uncapped field (steppers exempt)",
    uncappedFields(plan).length, 0);

  /* Real image bytes from dist/, through the same reader the verifier uses.
     Italy carries a hero JPEG plus the logo watermark. */
  const realDims = (src) => {
    try { return imageDims(readFileSync(path.join(dist, src))); } catch { return null; }
  };
  t("real logo.png is 256x256, so the 1254 declarations were the wrong number",
    JSON.stringify(realDims("/assets/logo.png")), JSON.stringify({ w: 256, h: 256 }));
  t("real /destinations/italy/ declares every image at its true ratio",
    imgRatioMismatches(italy, realDims).length, 0);

  /* Exercise a real executable body without assuming the checkout's line
     endings. The deterministic CRLF fixture above proves extraction travels
     through the normalising hash helper on every platform; this assertion
     keeps that fixture tied to the real Plan Your Trip output shape. */
  const planBody = /<script>([\s\S]*?)<\/script>/.exec(plan.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ""))?.[1] ?? "";
  t("real /plan-your-trip/ executable inline script is parsed and hashed",
    planBody.length > 0 && inlineScriptHashes(plan).includes(cspScriptHash(planBody)), true);

  /* Every page carries Analytics.astro; the FAQ page carries the .faq-a
     accordion in an inline <style>, and the bundled CSS carries .pf-a. */
  t("real / carries analytics behind the production-hostname gate",
    analyticsUngated(home), false);
  const faqPage = await readFile(path.join(dist, "faq", "index.html"), "utf8");
  const faqInlineCss = [...faqPage.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  t("real /faq/ inline style scopes its .faq-a hide to .js-accordion",
    unscopedAccordionHides(faqInlineCss).length, 0);
  const { readdirSync } = await import("node:fs");
  const bundled = readdirSync(path.join(dist, "_astro")).filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(path.join(dist, "_astro", f), "utf8")).join("\n");
  t("real bundled CSS scopes its .pf-a hide to .js-accordion",
    unscopedAccordionHides(bundled).length, 0);
  t("real bundled CSS does contain the scoped hide (so the check is looking at the right file)",
    /\.js-accordion \.pf-a\{display:none\}/.test(bundled), true);

  /* All three forms: the newsletter on /, Contact, Plan Your Trip. */
  t("real / carries exactly the one key, from the newsletter",
    web3formsKeys(home).join(), KEY);
  t("real /contact/ carries exactly the one key (form + newsletter agree)",
    web3formsKeys(contact).join(), KEY);
  t("real /plan-your-trip/ carries exactly the one key",
    web3formsKeys(plan).join(), KEY);
  t("real /plan-your-trip/ carries the honeypot (#76)",
    hasHoneypot(plan), true);

  /* Real sitemap output. Every fixture above builds the shape by hand, so a
     drift in what @astrojs/sitemap actually emits would leave them all green
     while the verifier silently saw nothing. These pin the predicate to the
     real file instead. */
  const smUrls = await readFile(path.join(dist, "sitemap-0.xml"), "utf8");
  const smIdx = await readFile(path.join(dist, "sitemap-index.xml"), "utf8");
  t("real dist/sitemap-0.xml parses every <lastmod> it declares",
    lastmodPairs(smUrls).length, (smUrls.match(/<lastmod>/g) || []).length);
  t("real dist/sitemap-0.xml declares lastmods at all (so the check is live)",
    lastmodPairs(smUrls).length > 0, true);
  t("real dist/sitemap-index.xml parses its own <lastmod> too",
    lastmodPairs(smIdx).length, (smIdx.match(/<lastmod>/g) || []).length);
  t("real dist/sitemap-index.xml declares one lastmod",
    lastmodPairs(smIdx).length, 1);
  /* Against its own newest date nothing can be "future", so a non-zero here
     means the comparison itself is broken rather than the data. */
  t("real dist/sitemap-0.xml has nothing after its own newest date",
    futureLastmods(smUrls, lastmodPairs(smUrls).map(([, w]) => w).sort().at(-1)).length, 0);

  const htaccess = await readFile(path.join(dist, ".htaccess"), "utf8");
  /* The real file, which contains `immutable` four times in comments. */
  t("real dist/.htaccess has no header gaps",
    htaccessGaps(htaccess).join(" | "), "");
  t("real dist/.htaccess does contain `immutable` in comments (so the guard is live)",
    /immutable/.test(htaccess), true);
  /* Whichever spelling the real file ships, exactly as the verifier resolves
     it. These three pinned "-Report-Only" and so would have gone red the day
     #100 flips the header — with messages about missing script-src hashes,
     which reads as CSP drift and sends the reader after the wrong bug. That
     is the failure this whole commit exists to remove, in the file that is
     supposed to catch it. */
  const realCsp = cspHeaders(htaccess);
  t("real dist/.htaccess carries exactly one CSP header, either spelling",
    realCsp.length, 1);
  const realCspName = realCsp[0]?.name;
  t("real dist/.htaccess exists and carries a CSP with a script-src",
    cspDirective(htaccess, realCspName, "script-src") !== null, true);
  t("real dist/.htaccess script-src covers every inline script on /",
    cspScriptSrcDrift(cspDirective(htaccess, realCspName, "script-src"), inlineScriptHashes(home)).missing.length, 0);
  t("real dist/.htaccess script-src covers every inline script on /plan-your-trip/",
    cspScriptSrcDrift(cspDirective(htaccess, realCspName, "script-src"), inlineScriptHashes(plan)).missing.length, 0);
} else {
  console.log("  (dist/ absent — skipped the real-output tests; run `npm run build` first)");
}

/* ── remote-pages (§5 remote spot-check) ──
   The bug these encode: the remote leg sampled three hardcoded routes, so the
   25 M7 destination pages deployed to the dev site without one of them being
   fetched. `verify:remote` printed ok while nothing had verified the pages
   that had just shipped. A check that only looks at three routes cannot go red
   for the fourth, so these assert the route list tracks the build and that a
   page which does not answer is actually reported. */
const BUILT = [
  "/", "/destinations/", "/destinations/st-barths/", "/destinations/aspen/",
  "/destinations/falklands-south-georgia/", "/404.html",
];

t("remoteRoutes keeps every built page",
  remoteRoutes(BUILT).length, 5);
t("remoteRoutes drops 404.html — it is the error document, not a route",
  remoteRoutes(BUILT).includes("/404.html"), false);
t("remoteRoutes includes a page the old hardcoded sample never named",
  remoteRoutes(BUILT).includes("/destinations/aspen/"), true);
t("remoteRoutes dedupes and sorts, so the order cannot drift with walk order",
  remoteRoutes(["/b/", "/a/", "/b/"]).join(","), "/a/,/b/");

/* the broken shape: a page that does not answer must be reported */
t("remoteMisses reports a page that 404s on the server",
  remoteMisses([
    { route: "/", ok: true, status: 200 },
    { route: "/destinations/aspen/", ok: false, status: 404 },
  ]).join(""), "/destinations/aspen/ -> 404");
t("remoteMisses reports a transport failure, not just an HTTP status",
  remoteMisses([{ route: "/x/", ok: false, status: "ENOTFOUND" }]).join(""),
  "/x/ -> ENOTFOUND");
t("remoteMisses is empty when every page answers",
  remoteMisses([{ route: "/", ok: true, status: 200 }]).length, 0);

/* The false red this cost us: sweeping 122 routes made production 429 every
   one, and the first version reported "122 of 122 built pages do not answer"
   — a deploy catastrophe that had not happened. Throttling is inconclusive,
   never absence. */
const THROTTLED = [
  { route: "/", ok: false, status: 429 },
  { route: "/destinations/aspen/", ok: false, status: 503 },
  { route: "/gone/", ok: false, status: 404 },
];
t("a 429 is not counted as a missing page",
  remoteMisses(THROTTLED).join(""), "/gone/ -> 404");
t("a 503 is not counted as a missing page either",
  remoteMisses(THROTTLED).some((m) => m.includes("aspen")), false);
t("throttled routes are reported separately, so they are not silently a pass",
  remoteThrottled(THROTTLED).join(","), "/,/destinations/aspen/");
t("a genuine 404 is not mistaken for throttling",
  remoteThrottled(THROTTLED).includes("/gone/"), false);

/* ── remote-coverage ──
   "Reported separately" above was true, and separately meant notes.push(),
   which report() prints as `ok` and exits 0 on. A half-throttled sweep
   announced "NOT verified" under an ok prefix and returned success. These pin
   the arithmetic the failure message is built from. */
t("coverage: a throttled route does not count as answered",
  remoteCoverage(THROTTLED).answered, 1);

t("coverage: the definite 404 DOES count as answered — it is a real result",
  remoteCoverage(THROTTLED).unverified.includes("/gone/"), false);

t("coverage: unverified routes are listed, not just counted",
  remoteCoverage(THROTTLED).unverified.join(","), "/,/destinations/aspen/");

/* The shape that shipped green: most routes fine, a slice throttled. */
const PARTIAL = [
  { route: "/a/", ok: true, status: 200 },
  { route: "/b/", ok: true, status: 200 },
  { route: "/c/", ok: false, status: 429 },
];
t("coverage: a partial sweep is the real hole — 2 of 3 answered",
  `${remoteCoverage(PARTIAL).answered}/${remoteCoverage(PARTIAL).total}`, "2/3");

t("coverage: a partial sweep leaves something unverified, so it cannot pass",
  remoteCoverage(PARTIAL).unverified.length > 0, true);

/* A fully clean sweep must stay clean, or the check is just noise. */
const ALL_OK = [
  { route: "/a/", ok: true, status: 200 },
  { route: "/b/", ok: true, status: 200 },
];
t("coverage: a clean sweep reports nothing unverified",
  remoteCoverage(ALL_OK).unverified.length, 0);

t("coverage: a clean sweep answers everything",
  `${remoteCoverage(ALL_OK).answered}/${remoteCoverage(ALL_OK).total}`, "2/2");

/* A sweep of only definite misses is a deploy failure, not a coverage one —
   remote-pages reports it and coverage must not double-report. */
t("coverage: definite misses are answers, not coverage gaps",
  remoteCoverage([{ route: "/x/", ok: false, status: 404 }]).unverified.length, 0);

t("coverage: an empty sweep answers nothing and has nothing unverified",
  `${remoteCoverage([]).answered}/${remoteCoverage([]).total}`, "0/0");

/* ── the WIRING, which is the only thing that was ever broken ──
   Everything above pins arithmetic on a pure counter that was never wrong.
   The bug was that the throttled branch called notes.push(), which report()
   prints with an `ok` prefix and exits 0 on — so "NOT verified" shipped as a
   pass. Reverting that one call leaves every fixture above green, which is
   exactly how the predecessor got through: main's "throttled routes are
   reported separately, so they are not silently a pass" was green for the
   whole life of the bug it names.

   So assert the call itself. This reads the verifier's source rather than
   running it, because the alternative — spawning verify-deployment.mjs
   against a stub host — would drag in all 103 other checks and fail for
   reasons that have nothing to do with coverage. Narrow and literal on
   purpose: it goes red on the precise edit that regressed, and on nothing
   else. */
const verifierSrc = await readFile(path.join(ROOT, "tools", "verify-deployment.mjs"), "utf8");
/* Comments stripped: the branch's own comment says the words "notes.push()"
   while explaining why it must not call it, and an unstripped match on that
   is a fixture that fails on the correct code. */
const throttledBranch = (/if \(throttled\.length\) \{([\s\S]*?)\n  \}/.exec(verifierSrc)?.[1] ?? "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

t("coverage: the throttled branch exists and was found",
  throttledBranch.includes("throttled.slice"), true);

t("coverage: an unverified sweep FAILS — it does not merely note",
  /\bfail\(\s*"remote-coverage"/.test(throttledBranch), true);

t("coverage: and it never routes back through notes.push, which exits 0",
  /\bnotes\.push\(/.test(throttledBranch), false);

/* report() must actually exit non-zero on a failure, or the fail() above is
   decoration. The early return on the clean path is what makes this real. */
t("coverage: report() exits non-zero when anything failed",
  /if \(!failures\.length\) \{[\s\S]*?\n  process\.exit\(1\);/.test(verifierSrc), true);

/* ── sitemap-future-lastmod ──
   The shape that shipped: `/` and `/about/` dated 2026-08-25 in a sitemap
   built on 2026-08-24. An instant-compare against Date.now() passes on this
   input, because astro writes the date as midnight UTC and that instant had
   already passed by the time the 17:47 Pacific build ran — which is why these
   fixtures compare local days. */
const sm = (loc, lastmod) =>
  `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}T00:00:00.000Z</lastmod>` : ""}</url>`;

t("a lastmod after today is the shipped defect",
  futureLastmods(sm("https://x/about/", "2026-08-25"), "2026-08-24").length, 1);

t("the offending loc and date are both reported",
  JSON.stringify(futureLastmods(sm("https://x/about/", "2026-08-25"), "2026-08-24")),
  JSON.stringify([["https://x/about/", "2026-08-25"]]));

t("today itself is not in the future",
  futureLastmods(sm("https://x/", "2026-08-24"), "2026-08-24").length, 0);

t("a past lastmod passes",
  futureLastmods(sm("https://x/", "2026-08-18"), "2026-08-24").length, 0);

t("a page with no lastmod cannot borrow the next entry's date",
  JSON.stringify(futureLastmods(sm("https://x/no-date/", null) + sm("https://x/later/", "2026-08-25"), "2026-08-24")),
  JSON.stringify([["https://x/later/", "2026-08-25"]]));

t("the sitemap-index shape is scanned too, not just <url>",
  futureLastmods('<sitemap><loc>https://x/sitemap-0.xml</loc><lastmod>2026-08-25T00:00:00.000Z</lastmod></sitemap>', "2026-08-24").length, 1);

t("a clean sitemap yields nothing",
  futureLastmods(sm("https://x/", "2026-08-20") + sm("https://x/about/", "2026-08-24"), "2026-08-24").length, 0);

/* localDay is the fix itself, not just its guard, so these pin it directly.

   An earlier draft passed only a Date and leaned on the host's ambient
   timezone. That is inert wherever the two derivation paths happen to agree —
   not only at UTC, where the shift is by zero and they are definitionally
   identical, but at Europe/London too, where an August evening is +01:00 and a
   January morning is +00:00, so neither boundary crosses midnight UTC. CI
   runners default to UTC, so a guard written that way would have been
   permanently green precisely where it ran most.

   Injecting the offset removes the ambient dependency: every case below is
   deterministic on any host. Offsets are in getTimezoneOffset() convention,
   positive = west of UTC. Each of the first five fails against the pre-fix
   `mtime.toISOString().slice(0, 10)`, the fractional ones included — those are
   the cases whole-hour reasoning would have missed. */
const LD = (iso, off) => localDay(new Date(iso), off);

t("localDay: an evening west of UTC keeps its own day (PDT -07:00)",
  LD("2026-08-25T06:59:00Z", 420), "2026-08-24");

t("localDay: a morning east of UTC keeps its own day (JST +09:00)",
  LD("2025-12-31T15:30:00Z", -540), "2026-01-01");

t("localDay: a 45-minute offset is not rounded (Kathmandu +05:45)",
  LD("2026-08-24T18:20:00Z", -345), "2026-08-25");

t("localDay: a 12:45 offset is not rounded (Chatham +12:45)",
  LD("2026-08-24T11:20:00Z", -765), "2026-08-25");

t("localDay: a 30-minute western offset (St John's -02:30)",
  LD("2026-08-25T01:30:00Z", 150), "2026-08-24");

/* Cannot go red, and is here to say so: at offset 0 localDay IS the code it
   replaced. Documents the one host where these fixtures prove nothing. */
t("localDay: at UTC the shift is a no-op",
  LD("2026-08-24T12:00:00Z", 0), "2026-08-24");

/* The default is the host's own offset — the only path production takes,
   since pageLastmod and the verifier both call localDay(d). */
t("localDay defaults to the host offset rather than to zero",
  localDay(new Date(2026, 7, 24, 23, 59)),
  LD(new Date(2026, 7, 24, 23, 59).toISOString(), new Date(2026, 7, 24, 23, 59).getTimezoneOffset()));

/* ── node-floor ── */

/* The build machine's default Node is 20.19.0 and Astro 7 needs >=22.12.0, so
   `npm run build` died a few seconds in with a message that named the problem
   but not the fix. tools/check-node.mjs now fails first, in milliseconds.
   These fixtures are the reason to believe it: each names a version that must
   be REJECTED, not only ones that pass.

   The floor is written out here rather than read from package.json on purpose.
   Reading it would make the fixtures agree with whatever engines happens to
   say — including the "22.x" that was there before, which was wrong in both
   directions at once. */

t("node-floor: the build machine's default Node is rejected",
  satisfiesNodeRange(">=22.12.0", "v20.19.0"), false);

/* The half of the old "22.x" range that was too loose: Astro rejects these. */
t("node-floor: the last 22 release below the floor is rejected",
  satisfiesNodeRange(">=22.12.0", "v22.11.0"), false);

t("node-floor: a whole major below the floor is rejected",
  satisfiesNodeRange(">=22.12.0", "v21.7.3"), false);

t("node-floor: the floor itself passes",
  satisfiesNodeRange(">=22.12.0", "v22.12.0"), true);

/* The half of the old "22.x" range that was too tight: this is the version the
   site is actually built on, and "22.x" excluded it. */
t("node-floor: the Node the site is built on passes",
  satisfiesNodeRange(">=22.12.0", "v24.16.0"), true);

t("node-floor: a prerelease compares on its numbers, not its tag",
  satisfiesNodeRange(">=22.12.0", "v23.0.0-nightly20260101abc"), true);

/* Not understood is its own answer, distinct from pass and from fail. The
   caller prints it rather than guessing — a comparator that returns true for a
   range it cannot read is how the wrong Node gets through. */
t("node-floor: the old \"22.x\" range is reported unreadable, not passed",
  satisfiesNodeRange("22.x", "v24.16.0"), null);

t("node-floor: a caret range is reported unreadable, not passed",
  satisfiesNodeRange("^22.12.0", "v24.16.0"), null);

t("node-floor: a missing engines value is unreadable",
  satisfiesNodeRange(undefined, "v24.16.0"), null);

t("node-floor: an unparseable version is unreadable",
  satisfiesNodeRange(">=22.12.0", "not-a-version"), null);

t("node-floor: process.version's leading v is optional",
  satisfiesNodeRange(">=22.12.0", "24.16.0"), true);

t("node-floor: a version parses to its three numbers",
  parseNodeVersion("v24.16.0")?.join("."), "24.16.0");

t("node-floor: a prerelease suffix is dropped by the parser",
  parseNodeVersion("v23.0.0-nightly20260101abc")?.join("."), "23.0.0");

/* ── lockfile-metadata ── */

/* An `npm install` here once deleted 102 lines from package-lock.json, every
   one a "libc" block on a Linux-targeted optional dependency. Nothing on this
   machine installs those packages, so nothing on this machine noticed; the
   deploy host is where it would have shown up.

   These fixtures carry more weight than most, because the failure was NOT
   reproducible on demand — two npm versions and two install shapes all
   preserved the field when this was written. The check has to be trustworthy
   on its own terms rather than validated against a live repro. */

const LOCK = (packages) => ({ lockfileVersion: 3, packages });
const GNU = { libc: ["glibc"], os: ["linux"], cpu: ["x64"] };

t("lockfile: an unchanged lockfile loses nothing",
  lockfileMetadataLoss(LOCK({ "node_modules/a": GNU }), LOCK({ "node_modules/a": GNU })).length, 0);

t("lockfile: a deleted libc block is caught",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { libc: ["glibc"] } }),
    LOCK({ "node_modules/a": {} })).length, 1);

t("lockfile: the caught entry names the package, field and value",
  JSON.stringify(lockfileMetadataLoss(
    LOCK({ "node_modules/a": { libc: ["glibc"] } }),
    LOCK({ "node_modules/a": {} }))[0]),
  JSON.stringify({ pkg: "node_modules/a", field: "libc", missing: ["glibc"] }));

/* The subtle shape: musl dropped, glibc kept. A check that counted how many
   entries carry libc would score this clean. */
t("lockfile: a shrunk libc array is caught, not only a deleted one",
  JSON.stringify(lockfileMetadataLoss(
    LOCK({ "node_modules/a": { libc: ["glibc", "musl"] } }),
    LOCK({ "node_modules/a": { libc: ["glibc"] } }))[0]?.missing),
  JSON.stringify(["musl"]));

t("lockfile: os is watched too",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { os: ["linux"] } }),
    LOCK({ "node_modules/a": {} })).length, 1);

t("lockfile: cpu is watched too",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { cpu: ["arm64"] } }),
    LOCK({ "node_modules/a": {} })).length, 1);

t("lockfile: one entry losing two fields reports both",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": GNU }),
    LOCK({ "node_modules/a": { cpu: ["x64"] } })).length, 2);

/* Removing a dependency is a dependency change and the diff shows it. Only an
   entry that survived and came back thinner is metadata loss. */
t("lockfile: a package removed outright is not metadata loss",
  lockfileMetadataLoss(LOCK({ "node_modules/a": GNU }), LOCK({})).length, 0);

t("lockfile: a package added with metadata is not a loss",
  lockfileMetadataLoss(LOCK({}), LOCK({ "node_modules/a": GNU })).length, 0);

t("lockfile: gaining a field is not a loss",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": {} }),
    LOCK({ "node_modules/a": GNU })).length, 0);

t("lockfile: an entry with no platform fields either side is clean",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0" } }),
    LOCK({ "node_modules/a": { version: "1.0.1" } })).length, 0);

t("lockfile: a lockfile with no packages key does not throw",
  lockfileMetadataLoss({}, {}).length, 0);

/* Against the real file rather than a fixture, the way the dist/ block at the
   end of this file works — so a predicate that stops matching the shape npm
   actually writes fails here too. The expected value is derived from the
   lockfile, not typed in, so a dependency change moves both sides together. */
const REAL_LOCK = JSON.parse(readFileSync(path.join(ROOT, "package-lock.json"), "utf8"));
const REAL_LIBC = Object.values(REAL_LOCK.packages).filter((p) => Array.isArray(p.libc)).length;

t("lockfile: the committed lockfile carries platform metadata to lose",
  REAL_LIBC > 0, true);

t("lockfile: the real lockfile against itself loses nothing",
  lockfileMetadataLoss(REAL_LOCK, REAL_LOCK).length, 0);

/* The reported incident, replayed on the real file: strip every libc block the
   way that install did, and every one of them must come back named. */
t("lockfile: stripping libc from the real lockfile is caught on every entry",
  lockfileMetadataLoss(REAL_LOCK, (() => {
    const stripped = JSON.parse(JSON.stringify(REAL_LOCK));
    for (const p of Object.values(stripped.packages)) delete p.libc;
    return stripped;
  })()).length, REAL_LIBC);

/* Codex review on #118, P2. Comparing by package key alone made a legitimate
   upgrade unfixable: a package that genuinely drops musl in its next major
   would fail this check, `npm run build` must pass before every commit, and
   there was no override. The gate is now the artifact — same key, same
   version, same resolved tarball — which keeps the real signal, because the
   install this exists to catch deleted 102 libc blocks without touching a
   single version. */

t("lockfile: the same version losing a field is still caught",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0" } })).length, 1);

t("lockfile: an upgrade that narrows platform support is not metadata loss",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", libc: ["glibc", "musl"] } }),
    LOCK({ "node_modules/a": { version: "2.0.0", libc: ["glibc"] } })).length, 0);

t("lockfile: an upgrade that drops a field entirely is not metadata loss",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "2.0.0" } })).length, 0);

t("lockfile: a downgrade is a different artifact too",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "2.0.0", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0" } })).length, 0);

/* Codex review on #119, P2. Artifact identity was `resolved` — the download
   URL. An install pointed at a mirror or an alternate registry rewrites that
   while fetching identical bytes, so the tripwire skipped every entry such an
   install touched: the hole reopened for precisely the unusual install most
   likely to mangle a lockfile. Identity is the content hash. */

t("lockfile: the same bytes fetched from a mirror are still compared",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", resolved: "https://r/a-1.0.0.tgz", integrity: "sha512-AAA", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0", resolved: "https://mirror/a-1.0.0.tgz", integrity: "sha512-AAA" } })).length, 1);

t("lockfile: a different integrity at the same version is a different artifact",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", integrity: "sha512-AAA", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0", integrity: "sha512-BBB" } })).length, 0);

t("lockfile: the same version and integrity losing a field is caught",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", integrity: "sha512-AAA", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0", integrity: "sha512-AAA" } })).length, 1);

/* Entries carrying no integrity — the root entry is one of them — are compared
   rather than skipped, on both sides and on either side alone. The safe
   direction when identity cannot be established is to look. */
t("lockfile: an entry with no integrity on either side is still compared",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0" } })).length, 1);

t("lockfile: integrity appearing on only one side does not skip the entry",
  lockfileMetadataLoss(
    LOCK({ "node_modules/a": { version: "1.0.0", libc: ["glibc"] } }),
    LOCK({ "node_modules/a": { version: "1.0.0", integrity: "sha512-AAA" } })).length, 1);

/* Codex review on #118, P2. When either lockfile could not be read the check
   pushed a note — and notes print with an `ok` prefix and exit 0, so the
   tripwire was bypassed exactly when something was already wrong, while the
   comment above it claimed "not a pass". Both states now fail, and the branch
   that decides is a function so a fixture can hold it there. */

t("lockfile-state: two readable lockfiles are comparable",
  lockfileCheckState({ packages: {} }, { packages: {} }), "comparable");

t("lockfile-state: an unreadable working lockfile is reported, not skipped",
  lockfileCheckState({ packages: {} }, null), "unreadable-working");

t("lockfile-state: an unreadable baseline is reported, not skipped",
  lockfileCheckState(null, { packages: {} }), "unreadable-baseline");

t("lockfile-state: a corrupt working copy outranks a missing baseline",
  lockfileCheckState(null, null), "unreadable-working");

t("lockfile-state: a non-object working lockfile is unreadable",
  lockfileCheckState({ packages: {} }, "not json"), "unreadable-working");

/* Codex review on #119, P2. `typeof [] === "object"`, so an array and an
   object with no packages map both passed as comparable. The comparison then
   found no losses in a map with no entries and announced that metadata was
   retained "on 0 entries" — a corrupt working copy passing as verified, which
   is the case the state check exists to fail. */

t("lockfile-state: an array is not a lockfile",
  lockfileCheckState({ packages: {} }, []), "unreadable-working");

t("lockfile-state: an object with no packages map is not a lockfile",
  lockfileCheckState({ packages: {} }, {}), "unreadable-working");

t("lockfile-state: a packages array is not a packages map",
  lockfileCheckState({ packages: {} }, { packages: [] }), "unreadable-working");

t("lockfile-state: a null packages map is not a packages map",
  lockfileCheckState({ packages: {} }, { packages: null }), "unreadable-working");

t("lockfile-state: the same shape rules apply to the baseline",
  lockfileCheckState({ packages: [] }, { packages: {} }), "unreadable-baseline");

/* Codex review on #119, P2. Failing when git is absent broke builds from a
   `git archive` export, which this repo supports: tools/git-lastmod.mjs
   catches unavailable git and resolves every sitemap date to undefined rather
   than failing. A missing baseline for that reason is a skip, not a defect —
   but a corrupt working copy is still a defect, git or no git. */

t("lockfile-state: no git means no baseline to compare against, not a failure",
  lockfileCheckState(null, { packages: {} }, false), "no-git");

t("lockfile-state: git present but no committed lockfile is still a failure",
  lockfileCheckState(null, { packages: {} }, true), "unreadable-baseline");

t("lockfile-state: a corrupt working copy outranks having no git",
  lockfileCheckState(null, {}, false), "unreadable-working");

t("lockfile-state: git availability defaults to present",
  lockfileCheckState(null, { packages: {} }), "unreadable-baseline");

/* ── lockfile-coverage ── */

/* A loss scan reports what it FOUND, which says nothing about what it COVERED.
   A working lockfile emptied to {"packages":{}} produces no losses at all --
   every baseline entry is absent and skipped -- so the check announced success
   and printed "keeps its platform metadata on 0 entries", counting the working
   file instead of the comparison. Measured before this was added: an emptied
   lockfile and one truncated to a single unrelated entry both exited 0.

   The gate is `shared`, not `compared`. A real dependency upgrade drives
   `compared` towards zero while `shared` stays high, and must not be mistaken
   for a truncated file. */

const COV = (pkgs) => ({ packages: pkgs });
const A1 = { version: "1.0.0", integrity: "sha512-AAA", libc: ["glibc"] };

t("coverage: an identical lockfile is fully covered",
  JSON.stringify(lockfileCoverage(COV({ "node_modules/a": A1, "node_modules/b": A1 }),
                                  COV({ "node_modules/a": A1, "node_modules/b": A1 }))),
  JSON.stringify({ baselineEntries: 2, shared: 2, compared: 2 }));

t("coverage: an emptied working lockfile shares nothing",
  JSON.stringify(lockfileCoverage(COV({ "node_modules/a": A1 }), COV({}))),
  JSON.stringify({ baselineEntries: 1, shared: 0, compared: 0 }));

t("coverage: a lockfile truncated to unrelated entries shares nothing",
  lockfileCoverage(COV({ "node_modules/a": A1 }), COV({ "node_modules/zzz": A1 })).shared, 0);

/* The case the gate must NOT catch: everything upgraded. Keys still line up,
   so `shared` stays at full, while `compared` drops to zero. */
t("coverage: a wholesale upgrade still shares every key",
  JSON.stringify(lockfileCoverage(
    COV({ "node_modules/a": { version: "1.0.0" }, "node_modules/b": { version: "1.0.0" } }),
    COV({ "node_modules/a": { version: "2.0.0" }, "node_modules/b": { version: "2.0.0" } }))),
  JSON.stringify({ baselineEntries: 2, shared: 2, compared: 0 }));

t("coverage: a changed integrity counts as shared but not compared",
  JSON.stringify(lockfileCoverage(
    COV({ "node_modules/a": { version: "1.0.0", integrity: "sha512-AAA" } }),
    COV({ "node_modules/a": { version: "1.0.0", integrity: "sha512-BBB" } }))),
  JSON.stringify({ baselineEntries: 1, shared: 1, compared: 0 }));

t("coverage: an empty baseline is vacuously covered",
  JSON.stringify(lockfileCoverage(COV({}), COV({ "node_modules/a": A1 }))),
  JSON.stringify({ baselineEntries: 0, shared: 0, compared: 0 }));

/* Against the real file: the committed lockfile compared with itself covers
   every entry, so the note the build prints is the whole file, not a subset. */
t("coverage: the real lockfile against itself is fully covered",
  JSON.stringify(lockfileCoverage(REAL_LOCK, REAL_LOCK)),
  JSON.stringify({
    baselineEntries: Object.keys(REAL_LOCK.packages).length,
    shared: Object.keys(REAL_LOCK.packages).length,
    compared: Object.keys(REAL_LOCK.packages).length,
  }));

/* ── dist-line-endings ── */

/* dist/ is stored `-text`, so a CR in built output is a byte Git keeps and the
   deploy uploads. 123 of the 133 committed dist files used to carry mixed
   endings and every rebuild flipped an arbitrary subset of them; one PR
   changing a single page carried 82. */

t("dist-eol: clean text has no defect",
  crDefect("<html>\n<body>\n</body>\n</html>\n"), null);

t("dist-eol: empty content has no defect",
  crDefect(""), null);

t("dist-eol: a single CRLF is caught",
  JSON.stringify(crDefect("a\r\nb")), JSON.stringify({ count: 1, firstLine: 1 }));

t("dist-eol: the reported line is where the first CR is, not the first line",
  JSON.stringify(crDefect("a\nb\nc\r\nd")), JSON.stringify({ count: 1, firstLine: 3 }));

/* The shape that made git treat ExperienceLayout.astro as binary, and the one
   a count of CRLF pairs would miss. */
t("dist-eol: a lone CR is caught, not only CRLF",
  JSON.stringify(crDefect("a\rb")), JSON.stringify({ count: 1, firstLine: 1 }));

t("dist-eol: every CR is counted, not just the first",
  crDefect("a\r\nb\r\nc\r\n")?.count, 3);

t("dist-eol: reads Buffers byte-exactly, the way the verifier passes them",
  JSON.stringify(crDefect(Buffer.from("a\r\nb", "utf8"))),
  JSON.stringify({ count: 1, firstLine: 1 }));

t("dist-eol: a CR inside a line counts, not only at a line end",
  crDefect("<p>one\rtwo</p>")?.count, 1);

/* Which files get read as text. Unknown extension means check it: a text type
   nobody listed is how the churn would come back unnoticed, and a binary type
   nobody listed fails loudly and is a one-line fix. */
t("dist-eol: html is text",       isBinaryDistFile("dist/index.html"), false);
t("dist-eol: css is text",        isBinaryDistFile("dist/_astro/a.css"), false);
t("dist-eol: xml is text",        isBinaryDistFile("dist/sitemap-0.xml"), false);
t("dist-eol: .htaccess is text",  isBinaryDistFile("dist/.htaccess"), false);
t("dist-eol: jpg is binary",      isBinaryDistFile("dist/assets/img/a.jpg"), true);
t("dist-eol: woff2 is binary",    isBinaryDistFile("dist/fonts/a.woff2"), true);
t("dist-eol: extensions match case-insensitively",
  isBinaryDistFile("dist/assets/img/A.JPG"), true);
t("dist-eol: a file with no extension is treated as text",
  isBinaryDistFile("dist/CNAME"), false);
t("dist-eol: an unlisted extension is treated as text",
  isBinaryDistFile("dist/app.js"), false);

/* Against the build's real output, which by the time these run has just been
   written by astro. A predicate that stops matching what the build emits fails
   here rather than in review. */
t("dist-eol: the built home page is LF",
  crDefect(readFileSync(path.join(ROOT, "dist", "index.html"))), null);

t("dist-eol: the built .htaccess is LF — the file that failed the build",
  crDefect(readFileSync(path.join(ROOT, "dist", ".htaccess"))), null);

/* ── report ── */
if (failures.length) {
  console.error(`\n${failures.length} failing:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
console.log(`  ok  ${pass} check fixtures pass`);
