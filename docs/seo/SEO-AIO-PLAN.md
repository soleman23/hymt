# Hit Your Mark Travel — SEO + AIO Build Plan

**Repo:** `github.com/soleman23/hymt` · Astro 5 · static output · Hostinger
**Production:** `https://www.hymtravel.com` (not yet cut over)
**Development:** `https://brown-goose-754147.hostingersite.com`
**Written:** 2026-08-07
**Audience:** Claude Code, executing against the repo. Every task is written to
be actioned without further interpretation.

---

## 0. How to read this document

- Tasks are numbered `P<phase>-<n>`. Reference them in commit messages.
- **Every task states the file it touches.** If a task cannot be completed
  without touching a file it does not name, stop and report rather than
  improvising.
- Phases are ordered by dependency. Do not start a phase until the previous one
  builds clean.
- `[BLOCKER]` = must be done before DNS cutover.
- `[POST]` = safe to do after launch.
- `[DECISION]` = needs a human answer. Collect these and ask in one batch.

**The single most important architectural fact in this repo:** the production
domain is written exactly once, in `astro.config.mjs` → `site`. `Base.astro`
derives every canonical, `og:url` and JSON-LD `url` from `Astro.site`. That is
already correct and it is why the dev site can be built and deployed today with
production-correct canonicals. Do not add a second source of truth. Anything in
this plan that needs an absolute URL reads it from `Astro.site`.

---

## 1. What the audit found

Audited 2026-08-07 against the repo at `main` and the deployed dev site.

### 1.1 What is already right

The site is in better technical shape than most pre-launch builds. Do not
rebuild any of this:

- 94 static pages, one `<h1>` per page, clean semantic sectioning.
- Canonical, `og:*`, `twitter:*` on every page, all derived from `Astro.site`.
- Every page has a unique `<title>` and unique meta description, and
  `tools/verify-deployment.mjs` fails the build if any of them change without
  an explicit `--update-baseline`. That guard is excellent — extend it, never
  weaken it.
- URL structure is already ideal: `/destinations/<slug>/`,
  `/experiences/<slug>/`, `/travel-journal/<slug>/`, all lowercase-hyphenated,
  trailing-slash directory format, no parameters, no dates in post URLs.
- `TravelAgency` + `Article` JSON-LD present site-wide from `Base.astro`.
- `public/.htaccess` already handles HTTPS forcing, apex→www, directory
  redirects, compression, cache headers and security headers.
- Content depth is genuinely strong: destination pages run 1,800–3,800 words of
  non-generic copy; journal posts 2,000–3,000.
- Breadcrumb trails are rendered on all 83 destination / experience / journal
  pages.

### 1.2 Findings, ranked

| # | Severity | Finding |
|---|---|---|
| F1 | **Critical** | **Every FAQ answer on the site is permanently invisible.** `.faq-a` and `.pf-a` are `display:none`, revealed only by a `.open` class that **no JavaScript anywhere in the repo ever adds.** This affects the entire `/faq/` page (~4,400 words, almost all of it answers) plus the FAQ block on all 42 destination and 12 experience pages. This is simultaneously the site's biggest UX bug and the loss of its single most AI-citable content type. |
| F2 | **Critical** | **The dev server's `robots.txt` does not match the repo's.** The server currently returns `User-agent: Googlebot / Disallow: /` — but `public/robots.txt` in the repo contains `User-agent: * / Allow: /`. The next deploy silently opens the staging site to Googlebot. Meanwhile every non-Google crawler (GPTBot, ClaudeBot, PerplexityBot, Bingbot) is already allowed to crawl the staging domain today. |
| F3 | **High** | **No analytics, no tag manager, no Search Console verification of any kind.** Zero measurement exists. Launching without a baseline means the migration cannot be evaluated. |
| F4 | **High** | **No `BreadcrumbList` schema** despite breadcrumbs being rendered on 83 pages. Free rich result, currently unclaimed. |
| F5 | **High** | **Hero images are CSS `background-image`, never preloaded.** Every destination, experience and journal page's LCP element is a full-bleed background image the browser cannot discover until CSS parses. No `<link rel="preload">` anywhere. |
| F6 | **High** | **Google Fonts is a render-blocking third-party stylesheet** in `<head>` on all 94 pages, with `display=swap` but no `preload`/`onload` pattern and no self-hosting. |
| F7 | **High** | **All 60 `<img>` tags in `src/content-pages/` carry no `loading`, `width`, `height` or `decoding`.** In the built output, only the nav and footer logos (2 of the 5 recurring `<img>` patterns) have dimensions; the other three patterns — `mark-note__photo` (×53), `page-hero__watermark` (×5), and the CTA/letter logos — have none. Worse, 53 of those 60 tags are the site logo standing in for a real photo of Mark on every destination and experience page's "Mark's note" section — a content gap wearing an image bug's clothes. See P1-4. |
| F8 | **Medium** | `public/sitemap.xml` is hand-maintained. Today it is actually in sync — 93 URLs, matching the 93 indexable pages (94 HTML files minus the 404) — but it carries `changefreq`/`priority` (ignored by Google) and hand-typed `lastmod` dates, and nothing stops it drifting the first time a page is added. The fix is generation, not vigilance. |
| F9 | **Medium** | **No `Person` schema for Mark Sole, no author byline on journal posts.** `Article` schema names an author but no page links to an author entity. For a single-advisor firm this is the central E-E-A-T asset and it is missing. |
| F10 | **Medium** | No `Service` / `TouristDestination` / `ItemList` / `WebPage` schema. Destination and experience pages are semantically anonymous to an LLM beyond the site-level `TravelAgency` block. |
| F11 | **Medium** | Journal posts carry a human-readable date ("May 2026") in the hero but `publishDate` is never passed, so `Article.datePublished` is omitted on every post and `dateModified` does not exist. Freshness is invisible. |
| F12 | **High** | `og:image` points every one of the 94 pages at `/assets/og-default.jpg` — **a file that does not exist.** It is not in `images-b64/`, not in the manifest, and not produced by `restore_images.py`. Every social share and OG fetch 404s today, and the build does not check for it. See P0-4. |
| F13 | ~~**Medium**~~ **Resolved** | Recorded here as "HTML ships uncompressed (~40 KB/page) because of the `no-transform` workaround". **Retested 2026-08-17 (#95) and the premise was wrong**: the edge negotiates compression with the header in place and a destination page ships at ~13.5 KB br against 51,355 B identity, decompressing intact. There is no TTFB/LCP cost to recover. The workaround stays — it guards a blank-page bug and is not the reason for any page weight. |
| F14 | **Medium** | Footer links `/plan-your-trip/?type=group` and `?type=honeymoon`. Canonical correctly drops the query string, so this is safe — but it is undocumented and one careless change to `canonicalPath` would create duplicates. |
| F15 | **Low** | No `sitemap.xml` reference for images, no `X-Robots-Tag` strategy, no `llms.txt`, no `/security.txt`, no `humans.txt`. |
| F16 | **Low** | `TravelAgency` schema has no `address`, no `areaServed` beyond a bare string, no `sameAs` beyond Instagram, no `priceRange`, no license identifiers. |
| F17 | **Low** | No internal-linking system between journal posts and the destination/experience hubs they support. Posts are terminal nodes. |
| F18 | **Low** | `/faq/` category filter buttons (`.faq-cat-btn`) are inert — they use `data-cat` with no handler. The sidebar links, by contrast, are real `#anchor` links to `.faq-group` ids that already exist, so they work today; only their `.active` scroll-highlight is missing. Two different severities, one page. |
| F19 | **Critical** | **The Contact page's "Send a message" form does not work at all.** The fields sit in a plain `<div id="contactForm">` — no `<form>`, no `action`, no Web3Forms access key — and the submit button calls `onclick="submitContact()"`, a function defined nowhere in the repo. Clicking it throws a `ReferenceError` and silently does nothing. Live on staging right now. |
| F20 | **Critical** | **`/about/` ships six live "Placeholder:" text blocks** ("Placeholder: Mark's origin story goes here…"), visible on the staging site today. The page is largely unwritten. This also means the E-E-A-T work in P2-3 has no copy to attach to until Mark fills it in. |

### 1.3 Launch model: fresh launch

This is a **fresh launch** on `www.hymtravel.com`. Whatever the domain may have
served before is out of scope by explicit decision (Devin, 2026-08-07): no
prior site, platform, URL set or search property is referenced, migrated,
redirected or preserved anywhere in this program. Measurement starts from zero
on launch day.

Two practical consequences:

1. **All the risk is forward-looking.** There are no rankings to lose; there
   are 94 pages to get discovered, crawled and indexed from nothing. The
   post-launch indexing work in `LAUNCH-RUNBOOK.md` is where this launch
   succeeds or fails.
2. **Unknown paths 404 by design.** The custom 404 page and the `.htaccess`
   `ErrorDocument` rule handle anything pointed at a path the new site does not
   have. Do not add legacy-path redirects; there is no legacy in scope.

**Standing instruction for all future work in this repo:** never reintroduce
references to a prior website, platform, or migration for this domain. If a
document, prompt or commit proposes a redirect map, a Change-of-Address
submission, or an "old site" assumption, it is wrong — flag it and remove it.

---

## 2. Strategy

### 2.1 What HYMT can realistically win

Head terms — "luxury travel advisor," "best safari travel agent," "how to book
a safari" — are owned by consortium directories (virtuoso.com), publisher lists
(Condé Nast Traveler "Top Travel Specialists"), and 20-year-old mega-operators
(Micato, Go2Africa, Abercrombie & Kent). A single-advisor site does not take
those pages, and building content aimed at them wastes the budget.

What a site like this *does* win, and what AI answer engines actually pull from:

1. **Cost transparency.** "How much does a private Africa safari cost per
   person," "what a $50k safari gets you that a $15k one doesn't." Almost no
   luxury operator publishes real numbers. Publishing them is the single
   highest-leverage differentiator available.
2. **Timing and seasonality.** "Best month for an Antarctica expedition,"
   "Okavango flood timing," "when Masters lodging actually gets booked."
3. **Logistics.** "How Masters badges actually work," "Derby seating tiers
   explained," "what a Rwanda gorilla permit costs and when to book it."
4. **First-hand experiential.** "What a private guided safari is actually like
   day to day," "how rough the Drake Passage really is." This is where Mark's
   actual experience is an unfair advantage and where Google's own guidance
   explicitly rewards *"expertise that comes from having actually used a product
   or service, or visiting a place."*
5. **Comparison / decision.** "Travel advisor vs booking direct,"
   "Serengeti vs Maasai Mara for a first safari," "Silversea vs Lindblad."

The existing journal already leans this way — `african-safari-calendar`,
`safari-planning-12-questions`, `how-hotel-upgrades-work`,
`what-hotel-descriptions-actually-mean`, `the-case-for-shoulder-season` are
exactly right. `KEYWORD-MAP.md` maps these clusters to URLs.

### 2.2 The AIO position, stated honestly

Two things are true at once and the plan holds both:

**There is no separate AI channel to optimize for.** Google states plainly that
AI Overviews and AI Mode draw from the ordinary Search index, that there are no
additional eligibility requirements, that structured data is not required, and
that *"you don't need to create new machine readable files, AI text files,
markup, or Markdown to appear in Google Search."* Anyone selling a distinct
"AIO stack" is selling something Google says does not exist.

**But content structure measurably changes citation rates.** The one rigorous
study on this (Aggarwal et al., *GEO: Generative Engine Optimization*, KDD 2024,
arXiv 2311.09735 — 10,000 queries, 8 domains, validated on Perplexity) found
that specific, content-level changes moved visibility 30–40%:

| Tactic | Measured effect |
|---|---|
| Cite authoritative external sources inline | +30–40% (up to +115% for lower-ranked pages) |
| Add direct quotations from named experts | +30–40% |
| Replace vague claims with specific statistics | +30–40% |
| Improve fluency without changing claims | +15–30% |
| Authoritative, low-hedging voice | +10–20% |
| Keyword stuffing | 0 to negative |
| Adding length / padding | 0 |

So: **the AIO work in this plan is content work, not markup work.** Ship
statistics instead of adjectives. Attribute claims. Answer the question in the
first 25 words under a question-shaped heading. Date everything. That is the
whole program, and it is also just good writing — which is why it is safe to
commit to regardless of how the AI search landscape shifts.

The markup work (schema) is justified separately: it is cheap, it produces real
rich results for `BreadcrumbList` and `Article`, and it gives an LLM
unambiguous entity facts. It is not a citation lever on its own.

### 2.3 What this plan deliberately does *not* do

- **No `FAQPage` schema chasing.** Google stopped serving FAQ rich results on
  2026-05-07 and is removing the reporting and testing support for it. Ship the
  markup because it is semantically correct and free, but do not treat it as a
  visibility lever, and do not restructure content around it.
- **No `HowTo` schema.** Effectively dead for rich results.
- **No `WebSite` + `SearchAction` sitelinks searchbox.** Deprecated by Google.
- **No self-serving `AggregateRating`.** Google's policy is explicit: if the
  entity being reviewed controls the reviews, `LocalBusiness`/`Organization`
  pages are ineligible for star review features. On-site testimonials get marked
  up as plain text or `Review` without an aggregate rating. Stars come from
  Google Business Profile, not from us.
- **`llms.txt` ships, but as a two-minute task with no expectations attached.**
  Ahrefs' May-2026 study of 137,210 domains found 97% of published `llms.txt`
  files received zero traffic that month, and AI answer-engine bots accounted
  for 1.1% of what little traffic there was. Google has said it does not use it.
  It costs nothing and it may matter later; it is in Phase 5, not Phase 1.
- **No keyword-density work, no meta keywords, no content padding.**

---

## 3. Phase 0 — Stop the bleeding `[BLOCKER]`

Everything here is a launch-blocking correctness issue. Do this first, in this
order, and deploy it to the dev site before touching anything else.

### P0-1 · Fix the invisible FAQ answers `[BLOCKER]`

**The problem.** `src/styles/section-shared.css:184` sets `.pf-a { display:none }`
and only `.pf-item.open .pf-a` shows it. The `/faq/` page's `pageCss` in
`src/pages/faq/index.astro` does the same for `.faq-a` / `.faq-item.open`. No
file in the repo ever adds the `open` class. Verified: the only `<script
type="module">` on every built page is the nav script, and no content page
contains an accordion handler.

Result: on `/faq/`, `/destinations/*/`, and `/experiences/*/`, every answer is
in the DOM and invisible to users forever.

**The fix — do all three parts.**

**(a) Make the questions real buttons.** In `src/content-pages/*.html`, the
destination/experience FAQ question is a `<div class="pf-q">`. Convert to:

```html
<div class="pf-item">
  <h3 class="pf-q-h">
    <button class="pf-q" type="button" aria-expanded="false" aria-controls="pf-italy-1" id="pf-italy-1-q">
      <span class="pf-q__text">What is the best time to visit Italy?</span>
      <span class="pf-q__icon" aria-hidden="true">+</span>
    </button>
  </h3>
  <div class="pf-a" id="pf-italy-1" role="region" aria-labelledby="pf-italy-1-q">
    …answer…
  </div>
</div>
```

IDs must be unique per page: `pf-<page-slug>-<n>`. The `/faq/` page already uses
`<button class="faq-q">` — it needs only the `aria-expanded` / `aria-controls` /
`id` additions and the `<h3>` wrapper, not the element change.

Add to `src/styles/section-shared.css` (and the `/faq/` `pageCss`) a reset so
the new `<h3>` and `<button>` inherit existing appearance exactly:

```css
.pf-q-h { margin:0; font:inherit; }
.pf-q { width:100%; background:none; border:none; cursor:pointer; text-align:left;
        font:inherit; color:inherit; appearance:none; -webkit-appearance:none; }
```

(`appearance:none` included deliberately — Safari/iOS can render native button
chrome even with `background`/`border` cleared. No existing selector in
`styles-master.css` or `styles-site.css` targets bare `button` or `h3`, so this
reset is the only one needed; verified 2026-08-07.)

Do not change any other declaration in the FAQ blocks. This must be a
zero-visual-diff change.

**(b) Add the toggle script.** Create `src/components/Accordion.astro`:

```astro
---
/**
 * Accordion — the one behaviour script for every FAQ block on the site.
 *
 * Both accordion flavours exist: `.pf-item`/`.pf-q`/`.pf-a` on destination and
 * experience pages, and `.faq-item`/`.faq-q`/`.faq-a` on /faq/. Their CSS is
 * identical in structure (`display:none`, revealed by `.open` on the item), so
 * one delegated listener drives both. It was missing entirely until 2026-08;
 * every answer on the site was permanently hidden. Do not remove it.
 *
 * Progressive enhancement: `js-accordion` is set on <html> by this script, and
 * the stylesheets only hide answers when that class is present. With JS off,
 * every answer renders open. That is deliberate — the answers are the most
 * valuable content on the site and must never depend on script execution.
 */
---
<script>
  document.documentElement.classList.add('js-accordion');
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.pf-q, .faq-q');
    if (!btn) return;
    const item = btn.closest('.pf-item, .faq-item');
    if (!item) return;
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
</script>
```

Render it from `Base.astro` immediately before `</body>`, unconditionally.

**(c) Make the CSS JS-conditional.** Change both hide rules so that answers are
visible when JavaScript has not run:

```css
/* section-shared.css */
.pf-a { padding:0 28px 24px; font-family:var(--font-b); font-size:14px;
        color:var(--text-secondary); line-height:1.75 }
.js-accordion .pf-a { display:none }
.js-accordion .pf-item.open .pf-a { display:block }
```

Same pattern for `.faq-a` in the `/faq/` `pageCss`.

**Why this matters beyond UX:** Google indexes content hidden in accordions, but
the risk profile is asymmetric — visible-by-default costs nothing and removes
every question about extractability, for Google and for every AI crawler that
does not execute JavaScript. Since the accordion is the site's densest
question-and-answer content, this is the highest-value 30 lines in the plan.

**Verify:** load `/faq/` and `/destinations/italy/` with JS disabled — every
answer visible. With JS on — accordions collapse and toggle, `aria-expanded`
flips, keyboard Enter/Space works.

### P0-2 · Fix the `/faq/` category filter `[BLOCKER]`

The sidebar links already work — they are real `#anchor` links and the
`.faq-group` sections already carry matching `id`s. Leave them alone (their
`.active` scroll-highlight is a nice-to-have, not a blocker).

The category buttons (`.faq-cat-btn`) are genuinely inert: `data-cat`
attributes, `.active` styling, no handler anywhere. Either wire them to filter
`.faq-group` visibility with a small delegated handler in the same
`Accordion.astro` script, or remove them. **Do not ship non-functional
buttons** — they are an accessibility failure and they read as a broken site.

### P0-3 · Lock down the staging site `[BLOCKER]`

**The problem.** The repo's `public/robots.txt` says `User-agent: * / Allow: /`.
The deployed dev site currently serves a *different* file with `Googlebot:
Disallow: /` — someone edited it on the server. The next `dist/` upload
overwrites that and exposes staging to Google. Meanwhile GPTBot, ClaudeBot,
PerplexityBot and Bingbot are allowed on staging **right now**.

**The fix.** Staging protection must live in the build, not in a hand-edited
file on the server.

1. Add to `public/.htaccess`, at the top of the `mod_headers` block:

   ```apache
   # ── Staging: block all indexing on any non-production host ──
   # Matches the Hostinger preview domain. Production (www.hymtravel.com)
   # is unaffected, so this rule can and should ship in the same .htaccess.
   <IfModule mod_setenvif.c>
     SetEnvIf Host "hostingersite\.com$" IS_STAGING=1
   </IfModule>
   <IfModule mod_headers.c>
     Header always set X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" env=IS_STAGING
   </IfModule>
   ```

   `X-Robots-Tag` is stronger than `robots.txt` here: `robots.txt` prevents
   crawling but not indexing of a URL discovered elsewhere; `noindex` prevents
   indexing outright. Because it is host-scoped it is safe to leave in place
   permanently, and it survives the DNS cutover with no edit.

2. Replace `public/robots.txt` with the production version from
   `SCHEMA-LIBRARY.md` § "robots.txt". It allows the answer-engine crawlers and
   blocks the training-only/resale crawlers with no citation surface.

3. Add HTTP Basic Auth on the staging host if Hostinger's hPanel offers it. Belt
   and braces; also stops the staging URL leaking into anyone's browser history
   and share links.

4. Add a check to `tools/verify-deployment.mjs`: when run with `--remote`
   against a `hostingersite.com` host, **fail** if the response does not carry
   `X-Robots-Tag: noindex`. When run with `--remote` against `www.hymtravel.com`,
   fail if it *does*.

### P0-3b · Fix the Contact form (F19) `[BLOCKER]`

`src/content-pages/contact.html` renders form fields inside a plain
`<div id="contactForm">` with a button wired to `onclick="submitContact()"` — a
function that does not exist anywhere in the repo. The form has never worked.

Fix: convert to a real `<form>` posting to Web3Forms exactly the way
`plan-your-trip.html` does — same access key, same in-page branded success
state, client-side validation, no redirect to a Web3Forms confirmation page.
Remove the `onclick`. Test end-to-end with a real submission to
`mark@hymtravel.com` before marking done.

While in there: the README claims the access key is present across "87
form-bearing pages"; the key is actually wired in exactly two places
(`Newsletter.astro`, `plan-your-trip.html` — the Newsletter component is what
puts a form on nearly every page). Contact makes three. Correct the README
sentence when the form is fixed.

### P0-3c · Write the About page (F20) `[BLOCKER]`

`/about/` currently ships six literal "Placeholder: …" blocks, live on staging.
This is a Mark task, not an agent task: origin story, years in the industry,
how the practice works, how he is paid, where he has actually been. An agent
drafts the scaffolding and inserts `<!-- NEEDS MARK -->` markers; Mark supplies
the substance. The E-E-A-T and `Person`-schema work in P2-3 depends on this
page having real copy, so it cannot slip past Phase 2.

Add `Placeholder` (case-insensitive) to the placeholder-copy check in P1-6 —
the standard `lorem|TBD|coming soon` grep missed all six of these.

### P0-4 · Create `/assets/og-default.jpg` `[BLOCKER]`

Every one of the 94 pages points `og:image` and `twitter:image` at
`/assets/og-default.jpg` — **and the file does not exist.** It is not in
`images-b64/`, not in the manifest, and not produced by `restore_images.py`.
Every social share and every AI crawler fetching the OG image gets a 404 today.

Create it: 1200×630, under 300 KB, legible at thumbnail size — the logo on the
navy ground with the golden-hour treatment is the obvious composition, built
from existing brand assets. Add it to `images-b64/` following the existing
base64 pipeline so `restore_images.py` reproduces it. Then add an explicit
check to `tools/verify-deployment.mjs`: the file `og:image` resolves to must
exist in `dist/` or the build fails.

### P0-5 · Stand up measurement `[BLOCKER]` `[DECISION-1]`

Nothing is measured today, and this launch starts from zero. Launching blind
means no content decision after launch can be evidence-based.

**Decision needed:** GA4 alone, or GA4 via Google Tag Manager?
Recommendation: **GA4 directly via `gtag.js`, no GTM.** This is a 94-page static
brochure site with one conversion. GTM adds ~90 KB, a second network round trip,
and a management surface nobody will use. Add GTM later if paid media starts.

Implement as `src/components/Analytics.astro`, rendered from `Base.astro`:

- Load `gtag.js` with `defer`, or better, load it on first user interaction
  (`scroll`, `pointerdown`, `keydown`) to keep it off the critical path. LCP is
  already at risk (F5, F6, F13); do not spend it on analytics.
- **Do not fire on staging.** Gate on
  `location.hostname === 'www.hymtravel.com'`.
- Track exactly four events: `form_start` (first field focus on Plan Your Trip),
  `form_submit_success`, `phone_click` (`tel:` links), `email_click`
  (`mailto:` links). Nothing else. Configure `form_submit_success` as the
  primary conversion.
- Add a `docs/analytics-events.md` recording the four events so future changes
  do not silently break them.

Also in this task:

- Verify **Google Search Console** on `www.hymtravel.com` as a **Domain
  property** (DNS TXT record) — do this now, before cutover, so history starts
  on day one.
- Verify **Bing Webmaster Tools** (import from GSC).
- Do **not** verify or submit the staging domain anywhere.

### P0-6 · `[DECISION]` batch

Collect answers to these before Phase 2. Do not guess.

- **`[DECISION-1]`** GA4 direct vs GTM. *(Recommendation above: GA4 direct.)*
- **`[DECISION-2]`** Consortium / affiliations. Is HYMT a member of Virtuoso,
  Signature, Serandipians, Ensemble, ASTA, or a host agency? These are the
  highest-leverage off-site entity signals available and they change the About
  page, the `Person` schema `sameAs` array, and the `Organization.memberOf`.
- **`[DECISION-3]`** Public address. The site currently publishes no location
  at all. Options: (a) publish Bend, OR as
  city/region only with no street address, (b) full address, (c) nothing.
  *Recommendation: (a).* It is honest, it corroborates a Google Business Profile
  as a service-area business, and it gives LLMs a geographic anchor without
  publishing a home address.
- **`[DECISION-4]`** Google Business Profile. Worth creating as a service-area
  business with the address hidden. It will not drive national traffic — Google
  caps service areas at 20 cities/postcodes and recommends staying within ~2
  hours' drive — but it is the cheapest source of third-party reviews, which is
  the *only* legitimate route to review stars given the self-serving-review
  policy.
- **`[DECISION-5]`** Author identity. Journal posts have no byline. Confirm all
  posts are authored by Mark Sole and that a photo + bio can be published.
- **`[DECISION-6]`** Real publication dates for the 29 journal posts. The heroes
  show strings like "May 2026". `Article.datePublished` needs ISO dates. If the
  true dates are unknown, decide a policy (recommendation: use the date the post
  actually goes live at cutover; never backdate).

---

## 4. Phase 1 — Technical SEO foundation `[BLOCKER]`

### P1-1 · Generate the sitemap from the build

Replace the hand-maintained `public/sitemap.xml` (93 URLs, 94 pages, hand-typed
`lastmod`) with `@astrojs/sitemap`, the first-party Astro integration. This is
not a new framework and does not violate the repo's no-framework rule.

```bash
npx astro add sitemap
```

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.hymtravel.com',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({
      // 404 has no business in a sitemap. Everything else does.
      filter: (page) => !page.includes('/404'),
      // Google ignores changefreq and priority. Omit both rather than ship
      // 94 lines of noise that imply a freshness signal we are not honouring.
      changefreq: undefined,
      priority: undefined,
      lastmod: new Date(),
    }),
  ],
});
```

Then:

- Delete `public/sitemap.xml`. The integration writes `sitemap-index.xml` +
  `sitemap-0.xml`, never `sitemap.xml` — so the old file would not be
  overwritten; it would survive as a stale, publicly-reachable duplicate with
  rotting `lastmod` dates. Remove it so exactly one sitemap exists.
- Confirm `dist/sitemap-index.xml` and `dist/sitemap-0.xml` are produced and
  contain 94 URLs, all `https://www.hymtravel.com/...` with trailing slashes.
- Update `public/robots.txt` to point at `/sitemap-index.xml`.
- Add a verifier check: sitemap URL count must equal `dist/**/*.html` count
  minus one (the 404). Fail the build on mismatch. This is exactly the class of
  drift that produced the 93-vs-94 discrepancy.

`[POST]` Consider a real `lastmod` derived from `git log -1 --format=%cI` per
source file rather than build time — build time marks all 94 pages as changed on
every deploy, which is a mild credibility cost. Not launch-blocking.

### P1-2 · Preload the hero image on every templated page

Every destination, experience and journal page's LCP element is
`background-image:url('/assets/img/…')` set in an inline `style` attribute. The
browser cannot start that fetch until CSSOM is built. This is the largest single
LCP lever available.

Add an optional `preloadImage` prop to `Base.astro` and emit, in `<head>`,
before the stylesheet links:

```astro
{preloadImage && (
  <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />
)}
```

Pass it from all three section layouts — they already receive `hero.image`:

```astro
<Base … preloadImage={hero.image}>
```

The homepage rotates four hero slides (`h-01`…`h-04`); preload **only the first**
and let the rest load normally.

Also add `fetchpriority="high"` to the homepage's first slide element and
`loading="eager"` where the hero is an `<img>`.

`[POST]` Evaluate replacing the hero `background-image` with a real `<img>`
positioned behind the overlay. It makes the LCP element a proper resource with
`srcset`/`sizes`, `width`/`height` and `fetchpriority` — but it is a template
change across three layouts and should not be rushed before launch.

### P1-3 · Take the font off the critical path

`fonts.googleapis.com` is a render-blocking third-party stylesheet on all 94
pages. Two options, in order of preference:

**Preferred — self-host.** Download the Raleway and DM Sans weights actually
used, subset to `latin` + `latin-ext`, convert to `woff2`, serve from
`/assets/fonts/`, and declare `@font-face` with `font-display:swap` in
`styles-master.css`. Preload only the two weights used above the fold:

```html
<link rel="preload" as="font" type="font/woff2"
      href="/assets/fonts/raleway-700.woff2" crossorigin>
```

This removes two DNS lookups, two TLS handshakes and one render-blocking
request. It also removes a third-party dependency from a site whose privacy
policy the client is responsible for.

**Fallback if self-hosting is rejected** — keep Google Fonts but load
non-blocking:

```html
<link rel="preload" as="style"
      href="https://fonts.googleapis.com/css2?family=…&display=swap">
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=…&display=swap"
      media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=…&display=swap"></noscript>
```

Audit the current request first — it asks for 8 Raleway variants (6 upright
weights plus 2 italics) and 4 DM Sans variants. Cut to the weights actually
used in the CSS. Each unused weight is dead download weight on every page.

### P1-4 · Fix every image

Across `src/content-pages/*.html` there are 60 `<img>` tags with no `loading`,
`width`, `height` or `decoding`. Every one of them needs:

```html
<img src="…" alt="…" width="1600" height="900" loading="lazy" decoding="async">
```

But first, name what these 60 tags actually are: 53 of them are
`/assets/logo.png` with `class="mark-note__photo"` — the site logo standing in
for a photograph of Mark on every destination and experience page. That is a
content decision (`[DECISION-5]` covers the photo), not just an attribute fix.
Get a real photo of Mark into the pipeline, or consciously keep the logo; either
way the attributes below still apply.

Rules:

- `width`/`height` = the image's **intrinsic pixel dimensions**, always, even
  when CSS resizes it. This is what prevents CLS.
- `loading="lazy"` on everything **except** anything in the first viewport. Lazy
  on an LCP image makes LCP worse.
- `decoding="async"` everywhere.
- Decorative images (the `.page-hero__watermark` logos) keep `alt=""` and
  `aria-hidden="true"` — that is already correct, do not "fix" it.
- Meaningful images get descriptive alt text: what is in the frame and why it is
  on this page, not the destination name repeated.

Write a codemod in `tools/` rather than hand-editing 60 tags — read each image
from `public/assets/` with `sharp` or `identify`, inject the real dimensions.
Then add a verifier check: **fail the build if any `<img>` in `dist/` lacks
`width`, `height` and `alt`.** That guard is what stops this regressing.

`[POST]` Generate `webp`/`avif` alongside the JPEGs and serve via `<picture>`.
The 92 hero JPEGs are the site's page weight. Significant win, but it touches
`restore_images.py`, `images-b64/`, and the asset verifier — schedule it as its
own piece of work after launch.

### P1-5 · Add `dateModified` and real `datePublished` to journal posts

`JournalLayout` accepts `publishDate` and passes it to `Base`, but **no journal
page actually sets it**, so `Article.datePublished` is omitted on all 29 posts.

- Add `publishDate` (ISO 8601, e.g. `2026-05-14`) to every
  `src/pages/travel-journal/*/index.astro`. See `[DECISION-6]`.
- Add `modifiedDate`, defaulting to `publishDate`.
- Emit both in the `Article` schema as `datePublished` / `dateModified`.
- Render a visible `<time datetime="2026-05-14">` in the post hero alongside the
  existing display string, and a visible "Updated <date>" line when
  `modifiedDate !== publishDate`.

Freshness is one of the few signals that is both a documented ranking input and
a demonstrated AI-citation factor, and it is invisible on this site today. For
cost, seasonality and event-logistics posts — Masters, Derby, safari pricing —
a visible, honest update date is worth more than any markup on the page.

### P1-6 · Extend `tools/verify-deployment.mjs`

The verifier is the best thing in this repo. Every rule in this plan that can be
machine-checked goes into it, so the standard enforces itself on every future
page instead of depending on anyone remembering.

Add these checks:

| Check | Fails when |
|---|---|
| `og-image` | `og:image` resolves to a file missing from `dist/` |
| `img-attrs` | any `<img>` in `dist/` lacks `alt`, `width` or `height` |
| `sitemap-parity` | sitemap URL count ≠ HTML page count − 1 |
| `canonical-host` | any canonical, `og:url` or JSON-LD URL does not start with `Astro.site` |
| `single-h1` | a page has zero or more than one `<h1>` |
| `heading-order` | heading levels skip (h2 → h4) |
| `title-length` | `<title>` outside 30–65 characters |
| `desc-length` | meta description outside 110–165 characters |
| `schema-valid` | any `application/ld+json` block fails `JSON.parse` |
| `schema-required` | a page lacks `BreadcrumbList` where breadcrumbs are rendered |
| `internal-links` | an internal `href` resolves to no file in `dist/` |
| `accordion-a11y` | a `.pf-q`/`.faq-q` lacks `aria-expanded` or `aria-controls` |
| `staging-noindex` | `--remote` on a `hostingersite.com` host returns no `X-Robots-Tag: noindex` |
| `prod-indexable` | `--remote` on `www.hymtravel.com` returns any `noindex` |
| `placeholder-copy` | `dist/` contains "Lorem ipsum", "TBD", "Coming soon", "TODO", "XXX", or "Placeholder" (case-insensitive — the About page shipped six of these past the shorter list) |

Keep the existing behaviour: fail loud, print the file and the fix, and support
`--update-baseline` for intentional changes.

### P1-7 · Confirm 404 and canonical edge cases

- `/404.html` returns HTTP 404 (not 200) on Hostinger. `ErrorDocument 404
  /404.html` is already in `.htaccess`; verify it against the deployed dev site
  with `curl -I`.
- `/plan-your-trip/?type=group` must canonical to `/plan-your-trip/`. It does
  today because `Base` uses `Astro.url.pathname`. Add a verifier note and a
  comment in `Base.astro` so nobody "improves" it into including the query.
- Confirm no page is reachable at both `/x` and `/x/`. The `.htaccess`
  directory-redirect rule handles this; verify with `curl -I` on three URLs.
- Confirm `http://`, `http://www.`, and apex all 301 to
  `https://www.hymtravel.com/...` in **one** hop after cutover. Chained
  redirects leak equity and are the most common migration mistake.

---

## 5. Phase 2 — Structured data

Full copy-paste implementations are in `SCHEMA-LIBRARY.md`. This section is the
plan; that file is the code.

### P2-1 · Create `src/components/Schema.astro`

One component that takes a typed `schema` prop and emits
`<script type="application/ld+json">`. All JSON-LD goes through it. No page
hand-writes a `<script>` tag.

### P2-2 · Upgrade the `Organization` / `TravelAgency` block

Currently thin. Add: `@id` (a stable
`https://www.hymtravel.com/#organization`), `address` (see `[DECISION-3]`),
`areaServed` as a proper `Country`, `founder` with an `@id` pointing at the
`Person` node, `sameAs` (Instagram, LinkedIn, Facebook, consortium profile,
Google Business Profile), `knowsAbout` (the destination and experience
taxonomy), `identifier` entries for the three Seller of Travel licenses, and
`contactPoint`. Emit it **once, on the homepage only**, with every other page
referencing `@id` rather than duplicating the whole node.

### P2-3 · Add `Person` schema for Mark Sole

New: a `Person` node with `@id` `https://www.hymtravel.com/about/#mark-sole`,
`jobTitle`, `worksFor` → the org `@id`, `sameAs` (LinkedIn, Instagram,
consortium advisor profile), `knowsAbout`, and `description`. Emit on `/about/`.
Every `Article` references it by `@id` instead of restating a name.

Pair with visible on-page changes on `/about/`: headshot, years in the
business, the three license numbers in body copy (not only the footer),
affiliations, and a plain statement of where Mark has actually been. Google's
guidance rewards *"expertise that comes from having actually used a product or
service, or visiting a place"* — for a solo advisory firm this page is the
entity, and right now it is a scaffold: roughly 900 words of real copy, six
"Placeholder:" blocks where the substance should be (F20), and no author
identity attached. P0-3c gets the copy; this task attaches the entity to it.

### P2-4 · Add `BreadcrumbList` to all 83 templated pages

The breadcrumb data already exists as props on all three section layouts. Build
the `BreadcrumbList` from the same props so the markup and the visible trail can
never disagree. This is a real Google rich result and it is free.

### P2-5 · Add per-page-type schema

| Page type | Emit |
|---|---|
| Homepage | `TravelAgency` (full), `WebPage` |
| `/about/` | `Person`, `AboutPage` |
| `/contact/`, `/plan-your-trip/` | `ContactPage` |
| Destination page | `WebPage` + `BreadcrumbList` + `TouristDestination` (name, description, `touristType`, `includesAttraction`, `geo` where known) |
| Experience page | `WebPage` + `BreadcrumbList` + `Service` (`serviceType`, `provider` → org `@id`, `areaServed`) |
| Journal post | `Article` + `BreadcrumbList`, with `author` → Person `@id`, `datePublished`, `dateModified`, `image`, `wordCount`, `articleSection` |
| Destination / experience hubs | `CollectionPage` + `ItemList` of the children |
| `/faq/` and page FAQ blocks | `FAQPage` — semantically correct, no rich result expected |
| `/privacy-policy/`, `/terms-and-conditions/` | `WebPage` |

`TouristDestination`, `Service` and `ItemList` do not produce Google rich
results. They are worth 20 lines each anyway because they state unambiguously
what the page is about, which is exactly the input an LLM needs to place the
entity. Do not oversell them internally as a ranking lever.

### P2-6 · Validate

Run every page type through the [Rich Results Test](https://search.google.com/test/rich-results)
and the [Schema Markup Validator](https://validator.schema.org/). Zero errors,
zero warnings on `Article` and `BreadcrumbList`. Record the passing URLs in
`docs/seo/validation-log.md`.

---

## 6. Phase 3 — On-page and content

### P3-1 · Title and description audit

All 94 titles and descriptions are unique and baseline-locked. Now check
quality:

- Titles 30–65 characters **including** the `— Hit Your Mark Travel` suffix.
  Several destination titles will be over; shorten the leading phrase, never
  drop the brand.
- Descriptions 110–165 characters, written as a reason to click, not a summary.
  Lead with the specific thing on the page (a number, a season, a name), not
  with "Discover…" or "Explore…".
- Front-load the distinguishing term. `Italy — Hit Your Mark Travel` is fine;
  `Hit Your Mark Travel — Italy` is not.
- Run `--update-baseline` once at the end, in a single commit, so the diff is
  reviewable.

### P3-2 · Answer capsules

This is the highest-value content task in the plan and it maps directly to the
GEO findings in § 2.2.

On every destination and experience page, immediately under the first `<h2>`,
add a 40–70 word paragraph that answers the page's core question directly and
factually, with at least one number in it. Not a hook. Not a tagline. The
answer.

> **Bad:** "Italy rewards the traveler who knows where to look."
>
> **Good:** "The best months for Italy are May–June and September–October. July
> and August are simultaneously peak tourist season and peak heat; the Amalfi
> Coast in particular becomes difficult. Shoulder season delivers the same
> country with 30–40% fewer visitors, lower rates, and either wildflowers or
> truffle harvest depending on which end you pick."

The second version is quotable verbatim by an answer engine, contains two
specifics, and takes a position. That is the whole technique.

Do the same under each `.pf-q` — the first sentence of every FAQ answer must
stand alone as a complete answer in ≤25 words, with elaboration after it. Many
existing answers already do this well (the Italy timing answer is close);
rewrite the ones that bury the answer in paragraph three.

### P3-3 · Publish real numbers

Currently the site is priced entirely in adjectives. Nothing on it says what
anything costs. That is the norm in luxury travel and it is exactly why
publishing ranges is an opening.

Add to every destination and experience page a short, honest range block:

- Typical per-person, per-day range for the way HYMT actually plans that trip.
- What is inside the number and what is not.
- The two or three things that move it most.
- A dated "as of" line.

Ranges, not quotes. Caveated. Updated on a schedule. This single change is the
strongest AI-citation asset available to this site, because cost questions are
high-volume, poorly served, and almost never answered by operators.

### P3-4 · First-person, first-hand framing

The copy is well written but written from nowhere. There is no "I stayed at,"
no "on my last trip," no month, no year, no named property Mark personally
visited. Add, wherever it is true:

- "I was last in the Serengeti in June 2025."
- "I have put nine clients through this camp since 2023; two things surprise
  people."
- Named properties, named guides where permissible, named months.

This is the E-E-A-T signal Google names explicitly and the one no competitor can
copy. It is also the difference between a page that reads like a template and a
page that reads like an advisor.

### P3-5 · Cite and attribute

Per the GEO research, inline citation of authoritative external sources was the
single strongest measured lever (+30–40%, up to +115% for lower-ranked pages).
Where the site makes a factual claim — permit costs, park regulations, visa
rules, event dates, wildlife migration timing — link the source. Rwanda
Development Board for gorilla permits, IAATO for Antarctic operators, the
relevant national park authority, the tournament's own site.

External links to authoritative sources do not leak anything meaningful and they
make the page more citable. Use them.

### P3-6 · Internal linking

Journal posts are terminal nodes today. Build the hub-and-spoke:

- Every journal post links to at least two destination or experience pages using
  descriptive anchor text.
- Every destination and experience page links to at least two related journal
  posts, in a "Read more" block after the FAQ.
- Every regional hub links to all its children; every child links back up.
- Related-destinations block on each destination page (3–4 genuinely related,
  not random).

Add a verifier check: fail if any page in `/travel-journal/` has fewer than two
outbound internal links to `/destinations/` or `/experiences/`.

### P3-7 · Testimonials, done legally

If testimonials go on the site: mark up as `Review` with a named author, no
`AggregateRating`, no star markup. Google's policy is explicit — when the entity
controls the reviews about itself, its `LocalBusiness`/`Organization` pages are
ineligible for star review features. Attempting it is a structured-data
violation, not a shortcut. Real stars come from Google Business Profile
(`[DECISION-4]`).

---

## 7. Phase 4 — Launch

Full procedure in `LAUNCH-RUNBOOK.md`. Summary of gates:

1. Phases 0–3 complete, `npm run build` clean, `npm run verify:remote` clean.
2. GSC and Bing verified on `www.hymtravel.com` **before** cutover.
3. Full crawl of the dev site (Screaming Frog free tier covers 94 pages) with
   zero 4xx/5xx, zero redirect chains, zero missing canonicals.
4. Manual pass at 375 px on ten representative pages.
5. Web3Forms end-to-end test from the dev site with a real submission.
6. DNS cutover.
7. Sitemap submitted in GSC and Bing.
8. `verify:prod` clean; spot-check 15 URLs by hand.

This is a fresh launch (§ 1.3): no redirect map, no Change-of-Address
submission, no prior-property handling. If any of those appear in a launch
checklist, remove them.

---

## 8. Phase 5 — Post-launch `[POST]`

- **Week 1:** daily GSC Coverage and Crawl Stats. Watch for `Discovered –
  currently not indexed` (normal early) vs `Crawled – currently not indexed`
  (a quality signal worth acting on).
- **Week 2–4:** confirm all 94 URLs indexed. Request indexing manually for the
  top 10 pages.
- **Month 2:** first Core Web Vitals field data appears in GSC. Re-test the
  Hostinger CDN `no-transform` workaround (`curl --compressed -s <url> | wc -c`)
  and remove it if the bug is fixed — that alone cuts ~28 KB per page.
- **Month 2:** ship `llms.txt` (see `SCHEMA-LIBRARY.md`). Two minutes, no
  expectations.
- **Ongoing monthly:** query AI assistants directly for the target queries in
  `KEYWORD-MAP.md` and log whether hymtravel.com is cited. This is the only
  honest AIO measurement that exists — there is no reliable reporting surface
  for it. Keep the log in `docs/seo/ai-visibility-log.md`.
- **Off-site entity building**, in this order: consortium advisor profile →
  ASTA / host-agency directory → LinkedIn kept current with licenses and
  specialties → Bend Chamber of Commerce directory → travel-industry podcasts →
  press pitches. Wikidata and Crunchbase are not worth attempting until press
  coverage exists to cite as notability.

---

## 9. Repo rules addendum

**Append this verbatim to both `CLAUDE.md` and `AGENTS.md`.** Keep the two files
identical. These are the rules that apply to every page, post and change made
after this plan is executed.

```markdown
## SEO & AIO rules — apply to every page, always

Full standards: `docs/seo/CONTENT-STANDARDS.md`. Schema: `docs/seo/SCHEMA-LIBRARY.md`.

### Domain
- The production domain is written once, in `astro.config.mjs` → `site`.
  Never hardcode `hymtravel.com` or the Hostinger preview host anywhere else.
  Canonicals, `og:url` and JSON-LD all derive from `Astro.site`.

### Every new page must have
- Unique `<title>`, 30–65 chars including the `— Hit Your Mark Travel` suffix.
- Unique meta description, 110–165 chars, with a specific in it.
- Exactly one `<h1>`; heading levels never skip.
- Canonical, `og:*`, `twitter:*` — inherited from `Base.astro`, do not override.
- A per-page `og:image`, 1200×630, or the default if none exists.
- `BreadcrumbList` schema matching the visible breadcrumb exactly.
- The page-type schema listed in `SCHEMA-LIBRARY.md` § "Page type → schema".
- At least two outbound internal links with descriptive anchor text.
- A 40–70 word answer capsule under the first `<h2>` that answers the page's
  core question directly and contains at least one specific number.

### Images
- Every `<img>`: `alt`, intrinsic `width`, intrinsic `height`, `decoding="async"`.
- `loading="lazy"` on everything below the fold; never on the LCP image.
- Decorative images: `alt=""` plus `aria-hidden="true"`.
- Hero images are passed to `Base` as `preloadImage`.

### Accordions and FAQ blocks
- Questions are `<button>` inside a heading, with `aria-expanded` and
  `aria-controls`. Answers have a matching `id` and `role="region"`.
- Answers must be visible when JavaScript has not run. The hide rule is scoped
  to `.js-accordion`, which `Accordion.astro` sets on `<html>`. Never move the
  hide rule outside that scope.
- The first sentence of every answer is a complete answer in ≤25 words.

### Writing
- Specifics over adjectives. A number beats a superlative every time.
- Attribute factual claims to a linked authoritative source.
- Write in Mark's first person where the experience is genuinely his.
- Date anything time-sensitive and show the date on the page.
- Never ship "Lorem ipsum", "TBD", "Coming soon", or a placeholder image.

### Never do
- Never reference a prior website, platform, or migration for this domain.
  This was launched as a fresh site: no redirect maps for legacy paths, no
  Change-of-Address submissions, no "old site" assumptions — in code, docs,
  prompts, or commit messages. Unknown paths 404 by design.
- Never add `AggregateRating` to HYMT-controlled reviews.
- Never add `WebSite`+`SearchAction` sitelinks-searchbox markup (deprecated).
- Never chase `FAQPage` or `HowTo` rich results — they no longer render.
- Never introduce a CSS or JS framework. Astro-official integrations only.
- Never add per-page `pageCss` under `destinations/`, `experiences/` or
  `travel-journal/`.
- Never fire analytics on the staging host.
- Never change the Web3Forms access key.

### Before every commit
- `npm run build` must pass. It is self-contained: astro build, then the image
  restore (`node tools/restore-images.mjs`), then `tools/verify-deployment.mjs`.
- Intentional `<title>`/description/canonical changes:
  `node tools/verify-deployment.mjs --update-baseline`, in their own commit.
```

---

## 10. Sources

Claims in this plan that rest on external evidence, with sources.

- Google, *AI features and your website* and *AI optimization guide* — no
  separate eligibility, no required markup, standard index powers AI Overviews
  and AI Mode: developers.google.com/search/docs/appearance/ai-features and
  /docs/fundamentals/ai-optimization-guide
- Google, *Google-Extended* is a training/grounding token only, not a Search
  ranking signal: developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- Google, *Creating helpful, reliable, people-first content* — the who/how/why
  framework and the "visiting a place" language:
  developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google, *Review snippet* — entity-controlled reviews are ineligible for star
  features: developers.google.com/search/docs/appearance/structured-data/review-snippet
- FAQ rich results ceased serving 2026-05-07; reporting and testing support
  being removed: searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- Sitelinks searchbox deprecated: searchengineland.com/google-search-to-drop-sitelinks-search-box-447682
- Core Web Vitals thresholds LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, at the 75th
  percentile: web.dev/articles/lcp (no new metric announced as of 2026-08)
- Aggarwal et al., *GEO: Generative Engine Optimization*, KDD 2024,
  arXiv:2311.09735 — the +30–40% citation figures
- Ahrefs, *llms.txt study*, May 2026 — 137,210 domains, 97% of published
  `llms.txt` files received zero traffic: ahrefs.com/blog/llmstxt-study/
- Google, *Service-area businesses* — hide the address, max 20 service areas:
  support.google.com/business/answer/3038177 and /answer/9157481
- ai-robots-txt/ai.robots.txt — the maintained AI crawler user-agent list:
  github.com/ai-robots-txt/ai.robots.txt

**Two places where sources conflict**, flagged so nobody re-litigates them:

1. Several SEO vendors still recommend `FAQPage` and `HowTo` schema as an
   AI-visibility lever. Google's own announcement that FAQ rich results stopped
   serving in May 2026 is the stronger source. This plan ships the markup
   because it is semantically accurate and costs nothing, and treats the *visible
   question-and-answer structure* — not the markup — as the actual lever.
2. Perplexity's documentation states it honours `robots.txt`; Cloudflare has
   publicly alleged undisclosed crawling that bypasses it. Since this plan
   allows PerplexityBot anyway, the dispute does not change any action here.
