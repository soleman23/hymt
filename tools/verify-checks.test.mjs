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
  unsafeBlankLinks, eagerImageRefs, llmsClaimMismatches, heroStatLabels,
  undefinedInlineHandlers, linklessCards, inlineHandlers, uncappedFields, itemListDefects,
  imageDims, imgRatioMismatches,
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

t("itemlist: BreadcrumbList is not an ItemList",
  itemListDefects(ld({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, item: "https://www.hymtravel.com/" },
    { "@type": "ListItem", position: 2, item: "https://www.hymtravel.com/" },
  ] })).length, 0);

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
} else {
  console.log("  (dist/ absent — skipped the real-output tests; run `npm run build` first)");
}

/* ── report ── */
if (failures.length) {
  console.error(`\n${failures.length} failing:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
console.log(`  ok  ${pass} check fixtures pass`);
