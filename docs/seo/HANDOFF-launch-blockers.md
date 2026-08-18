# Session handoff — the remaining launch blockers

Paste the block below as the first message of the next session. Everything the
task needs is in it or in the sections under it.

Written 2026-08-17, updated 2026-08-18 at `71e7aa1` with the deploy findings
(§ 4 of the hazards), and again later on 2026-08-18 after a six-dimension
adversarial audit of the whole backlog (see § "Closed after that handoff"
below). Every number here was derived on those dates and then
**adversarially re-verified by a second pass** — the corrections that pass
produced are folded in. Anything you are about to trust, re-derive anyway: this
repo's defining failure mode is a number that was true once.

---

## THE PROMPT

```
Read docs/seo/HANDOFF-launch-blockers.md and continue the launch work.

READ FIRST, in this order:
  1. docs/seo/HANDOFF-launch-blockers.md   (this file)
  2. CLAUDE.md § "SEO & AIO rules"          (non-negotiable, especially the
                                             "Never do" list)
  3. docs/seo/LAUNCH-RUNBOOK.md §§ 0-4      (§ 0 tells you how to derive the
                                             page count; never quote one)

THE ONE THING THAT WILL BITE YOU FIRST: www.hymtravel.com already answers.
It returns 200 from a host that is not this build. So "is it live yet" cannot
be answered by a 200, by HTTPS, by HSTS, or by npm run verify:prod — all four
pass today, before any cutover. Use the title discriminator in runbook § 4.3.

WHAT IS ACTUALLY LEFT, and who can do it:

  AGENT-DOABLE NOW
    - nothing LAUNCH-BLOCKING. The pre-launch polish milestone is down to
      items that need Mark, a dashboard login, or DNS. But "nothing" was
      the wrong word last time: an audit on 2026-08-18 found 41 agent-doable
      items behind that claim, and landed the important ones (§ "Closed
      2026-08-18"). What remains is listed under § "Open items", last bullet
      - image/photo work and two small verifier checks.
    - the #100 groundwork is DONE, both halves. All 46 inline handlers are
      gone (`inline-handler` holds it at zero), AND script-src now names the
      site's 10 distinct inline <script> bodies by sha256 with no
      'unsafe-inline' (`csp-script-src` regenerates the list every build and
      fails on drift). Verified under an ENFORCING local header on every
      template. The only thing left of #100 is the flip itself. See § CSP.

  HUMAN-ONLY (do not attempt; surface and stop)
    - #74  Web3Forms dashboard. FIRST: form submissions are delivered to the
           wrong address — every inquiry goes to devinp.sole@gmail.com and
           none to mark@hymtravel.com. That is a launch blocker, not
           hardening. Then: domain restriction, CAPTCHA, rate limits
    - #96  GSC Domain property + Bing, via DNS TXT, BEFORE cutover
    - #99  lower DNS TTL, snapshot every record
    - #32  the DNS cutover itself
    - #33  the 15-URL hand check, a real inquiry, GA4 realtime
    - deploying anything: deploy-to-hostinger.ps1 prompts for an FTP password

  BLOCKED BY CUTOVER, not by work
    - #79  HSTS. Read it as a REGRESSION to prevent: the domain sends HSTS
           today and stops when it moves to Hostinger unless #79 lands.
    - #100 CSP enforcing. The Google origins in the policy have never been
           exercised, because Analytics hard-gates on the production hostname.

UPLOADING IS NOT DEPLOYING. Hostinger fronts the site with a CDN. After any
upload that changes an asset, the CDN cache must be purged in hPanel or
visitors keep the old file. Two clean 582/582 deploys once changed nothing at
all. Diagnose with a GET and read x-hcdn-cache-status -- a HEAD reaches origin
and will cheerfully report the new file while everyone is served the old one.
See § The CDN cache, and #107.

BEFORE YOU COMMIT: npm run build must pass, and it is self-contained.
BEFORE YOU BUILD: stop any astro preview server — it holds dist/ open on
Windows and the build wipes dist/ before failing.
DO NOT touch the repo while the user is running a deploy. Rebuilding mid-deploy
empties dist/ under the uploader and fails a file; that has happened.
NEVER git add -A: GitNexus rewrites a symbol-count line in CLAUDE.md and
AGENTS.md that must not ride along.

Ask before deleting content. Two rounds of card removal in this repo were
correct only because they were explicitly authorised.
```

---

## Where things stand

**Repo:** clean, all work pushed. `HEAD` on `main`, tracking `origin/main`.
Re-derive it — `git log --oneline -1` — rather than trusting a literal here;
the two that were written down both rotted within a session.

**Staging is CURRENT and verified**, including the CDN purge. Re-verified after
it: 60 of 60 sampled images byte-match local, journal index at 32 cards and 12
filters, `llms.txt` 200, CSP report-only present, staging `noindex` intact.
Re-verified again after the inline-handler deploy: 12 of 12 sampled images still
byte-match, `onclick=` is 0 site-wide, `X-Robots-Tag` is the full
`noindex, nofollow, noarchive, nosnippet`, `/sitemap-index.xml` 200 and
`/sitemap.xml` 404. The user runs the deploy:

```
powershell -ExecutionPolicy Bypass -File "C:\Users\reach\OneDrive\Pictures\Desktop\hymt-site\deploy-to-hostinger.ps1"
```

| | |
|---|---|
| Built pages | 98 (97 sitemap URLs + `404.html`) |
| Destination pages | 43, all with Best Season **and** Best For |
| Experience pages | 12 |
| Journal posts | 32 |
| Check fixtures | 242 (derive: `node tools/verify-checks.test.mjs`) |
| Open issues | 41 |
| Inline event handlers | 0, enforced by `inline-handler` |
| Inline scripts under `'unsafe-inline'` | 0 — 10 sha256 hashes, enforced by `csp-script-src` |
| Pages with a unique og:image | 83 of 98 (was 0; 15 keep the crest plate) |

### Closed 2026-08-18 (later session) — the audit and what it turned up

The claim at the top of this file's prompt used to read "AGENT-DOABLE NOW:
nothing is blocking." A six-dimension audit (doc rot, form hardening,
verifier gaps, issue rot, images, CSP), every finding re-derived by an
adversarial second agent, found 41 things that were. The ones that landed,
in commit order — `git log 229d3c6..` for the messages, which carry the
evidence:

- **Newsletter email cap** (`b8ddcd1`) — the only uncapped user input on the
  site, on 94 pages, while the deploy guide said all three forms were
  capped. `field-maxlength` check.
- **The two operator docs no longer say submissions reach Mark** (`2e620fb`)
  — README and the deploy guide asserted it; `229d3c6` had disproved it and
  corrected only this file.
- **Journal hub ItemList 33 → 32** (`99b9627`) — the featured post parsed
  twice; one URL at two positions. `schema-itemlist` check.
- **Logo `<img>` 1254×1254 → 256×256** on 94 tags (`1a9b785`) — a number true
  of an earlier file. `img-ratio` check reads image headers.
- **CSP `script-src` by hash, no `'unsafe-inline'`** (`8f41e80`) — see § CSP.
  `csp-script-src` regenerates the list every build. Verified enforcing.
- **Nine docs' rotted counts and GSC shape** (`4dba331`).
- **Three CLAUDE.md rules held in the build** (`4a0ad29`) —
  `analytics-host-gate`, `accordion-noscript`, and `decoding` joins
  `img-attrs`.
- **Web3Forms key pinned, honeypot on every form** (`e26683d`) — `web3forms`
  check; a partial rotation or a "fix #74 with a new key" goes red.

Then a second pass on the image and header work:

- **`htaccess-headers` + `photo-grid`** (`55ef0c9`) — nothing asserted
  `dist/.htaccess` existed at all; renaming it left the build green while
  the site shipped with no CSP, no security headers and no staging noindex.
- **Unreferenced-image build note** (`73d8caf`) — 17 tracked images nothing
  used, now printed every build.
- **restore_images.py retries** (`426d395`) — OneDrive intermittently failed
  one write of 959 with EINVAL and blocked every commit.
- **Botswana 3:2 crop** (`c351357`) — the card was severing the lead
  elephant above its tusks; 48.6% of the frame → 99.9%.
- **Photography docs corrected** (`b3c099c`).
- **family-travel photographed** (`122025c`) — six cards from assets already
  in the repo, zero credits.
- **Willamette filenames** (`4610eaf`) — two names claimed a Tuscan photo
  was Oregon.
- **70 per-page og:image crops** (`aa7a271`, `c8605ce`) — 83 of 98 pages now
  have a unique share card, was 0.

Every new check was driven red against real output before being trusted,
and three of them caught a bug in *themselves* on the first fixture run
(JPEG dims key order; `@media`-wrapped accordion rule; and the fixture
count in the dist-absent message). The pattern holds.

Issue threads updated with the derived facts: #100 (step 2 done, how),
#74 (recipient first; corrections to body and 08-10 comment), #31 (delta
against the 08-09 dry-run; criterion 2 is the wrong shape).

### What this session closed

`#36` llms.txt · `#54` India page (already shipped, so M7 is 25 not 26) ·
`#82` CSP report-only · `#83` newsletter fetch · `#94` hero stat rail · `#95`
CDN no-transform · `#98` page counts · `#104` dead share buttons · `#105`
journal index filters/Load More/count · `#106` linkless cards · `#107` image
cache.

Four verifier checks were added, each with fixtures that go red: `llms-txt`,
`hero-stat-rail`, `dead-inline-handler` (with a debt ratchet, now empty), and
`linkless-card`. Three of the four caught a bug in **themselves** on their
first run against real output — which is the argument for the fixture rule,
not a coincidence.

### Closed after that handoff — the #100 inline-handler groundwork

All **46** inline handlers are gone, and the site now builds at zero.

- **35 card divs** on `/travel-journal/` and `/destinations/` that navigated
  via `onclick="window.location.href='...'"`. The 32 journal cards already
  contained a real `<a class="article-card__read">` to the same URL, so the
  attribute came off and a stretched-link rule in the hub's own `pageCss`
  (`::before`, because `::after` already carries the arrow glyph) restores the
  whole-card click target with no JS. The 3 `compare-card__cta` "Ask Mark"
  controls on the destinations hub were `<button>`s that navigated; they are
  `<a href="/plan-your-trip/">` now.
- **11 on `/plan-your-trip/`** — `goTo` ×6, `adj` ×4, `submitForm` ×1. These
  call real functions, so they moved to `data-goto` / `data-adj` /
  `data-adj-by` attributes wired by an IIFE at the foot of the script that
  already defines them.

**This was not only a CSP change.** A `<div onclick>` is not focusable, not
announced as a link, and not followable by a crawler — so 32 journal cards and
3 CTAs to `/plan-your-trip/` were mouse-only and invisible to Google. They are
real links now.

A fifth verifier check, `inline-handler`, holds it there, with an
`INLINE_HANDLER_DEBT` ratchet on the same contract as the other two: an
unlisted name fails outright, a listed one may only ever shrink, and an entry
that reaches zero fails until it is deleted. Both ratchet branches and the
per-page failure were driven red on purpose before being trusted. It caught a
bug in itself on its first run against real output, like three of the four
before it: the journal hub's `pageCss` is inlined into a `<style>` and its
comment *describes* the handlers that were removed, so a naive scan reported
the fix as the defect on the one page the fix was largest. `<script>`,
`<style>` and comment bodies are stripped before scanning.

Verified in a browser, not just in the build: whole-card click navigates from
anywhere on the card, the #105 filters/Load More/count still read
`Showing 12 of 32` → `24 of 32` → `3 articles in Season`, the four-step form
still steps and its steppers still clamp at 1 adult / 0 children, and the
submit button still validates (tested with `fetch` stubbed, so no inquiry was
sent). Journal *post* pages were confirmed unaffected — their related cards are
`<a class="article-card">` on `journal.css`, and the hub rules did not leak.

---

## The cutover hazards nobody had written down

These came out of a verification sweep on 2026-08-17, plus the deploy
investigation on 08-18, and are the highest-value content in this file. Only
the last one has an issue (#107); the rest are in none.

### 1. The domain already answers, and it breaks the gate

```bash
$ curl -sI https://www.hymtravel.com/ | head -1
HTTP/1.1 200 OK
$ curl -s https://www.hymtravel.com/ | grep -o "<title>[^<]*</title>"
<title>Hit Your Mark | Sports &amp; Luxury Travel</title>     # NOT this build
```

Served by Cloudflare/Fastly, already sending `strict-transport-security:
max-age=31556952`.

**Consequence:** four of the six automated checks in runbook §§ 4.3–4.4 pass
*before* cutover. `npm run verify:prod` is not a safety net either — its remote
mode fetches three pages plus stylesheets and emits `ok` lines against any host
returning HTML. Runbook § 4.3 now opens with a title-based discriminator; use it
before believing anything else in that section.

**And the same blind spot applies to staging, which is easier to trip over.**
`npm run verify:remote` ran clean against staging while staging was serving a
build from *before* the push — because 8 of its 10 `ok` lines are local checks
against `dist/`, and the remote work (`tools/verify-deployment.mjs:751`) is
three pages, a HEAD on their stylesheets, and the `X-Robots-Tag` read. It
answers "is a site there and locked down", never "is it *this* build".
Discriminate on something the deploy actually changed. For the current HEAD:

```bash
curl -s https://brown-goose-754147.hostingersite.com/plan-your-trip/ \
  | grep -o 'data-goto=' | wc -l   # 6 on this build, 0 before it
```

Distinguishing "not deployed" from "deployed but cached" is a separate step, and
cheap: read `x-hcdn-cache-status` on a GET. HTML is served `max-age=0,
must-revalidate` and comes back `DYNAMIC`, i.e. never edge-cached — so stale
HTML means the upload did not happen, not that the CDN is holding it. The purge
only ever matters for `/assets/` and `/_astro/`.

Per CLAUDE.md this changes **nothing** about the launch plan: no redirect maps,
no Change-of-Address, no legacy-path assumptions. It is recorded here only
because it silently invalidates verification steps.

### 2. Nameservers are not Hostinger's

`hymtravel.com` uses `ns4/ns5.wixdns.net`. Runbook § 4.2 says to point the A
record and www CNAME "at Hostinger per hPanel" — **that cannot be done in hPanel
while the nameservers are elsewhere.** Whoever executes § 4.2 needs to resolve
this first, and § 1.2's DNS TXT for GSC has to go at the *current* host.

### 3. MX is live Google Workspace

Five records, `aspmx.l` plus `alt1`–`alt4`, with an SPF TXT. #99's warning about
MX is not theoretical: a nameserver move that drops them kills Mark's email
silently. Snapshot before touching anything.

### 4. The CDN cache — uploading is not deploying

**Two clean `582/582` deploys changed nothing a visitor could see.** Only a CDN
purge in hPanel did. This is now the single most likely way for a future change
to appear to ship and not ship.

The cause, fixed in `237e654` / `940c7c7`: `/assets/img/` carried
`Cache-Control: public, max-age=31536000, immutable`. `immutable` promises a
URL's content never changes, which is only true of content-addressed filenames.
Astro hashes what it emits under `/_astro/`; those image names are hand-managed
and stable, so the same URL genuinely does change content whenever an image is
re-cut. It is now `max-age=2592000, no-transform` — a month, with revalidation.

**The consequence was larger than the symptom that surfaced it.** Since that
header shipped, no image change had ever reached a visitor. Every photo landed
by the rollout work sat behind a cached copy and would have stayed there for up
to a year, production included.

**Fixing the header does not evict what is already cached.** The purge is a
permanent part of any asset change, not a one-off cleanup. Runbook § 4.2b and
`docs/hostinger-deployment.md` § 1b now carry it.

**Diagnose with a GET, never a HEAD.** This is the part that cost the most
time — it produced a confident wrong root cause and a wrong fix before the
right one:

```
HEAD -> x-hcdn-cache-status: MISS, Content-Length: 288,154   (origin, correct)
GET  -> x-hcdn-cache-status: HIT,  Content-Length: 295,047   (edge, year-old)
```

A HEAD reaches origin. Every real visitor gets the GET. Two further traps in
the same family: a `?cachebust=1` fetch proves nothing, because this CDN keys
static assets **without** the query string; and the cached GET replays the
**previous `Cache-Control` value**, so the header you read may not be the header
that is configured.

Also note `eager-image-budget` measures **local** bytes while runbook § 2.4
gates on PageSpeed against the **live** host. Those disagreed by 6% until this
was fixed. They now agree exactly (delta 0 bytes), so the check's 1.38 MB
against a 1.5 MB budget is the real figure rather than an optimistic one.

---

## #74 — Web3Forms

### The submissions go to the wrong person. Fix this before anything else here.

Verified 2026-08-18 by submitting a real inquiry through the staging UI. Web3Forms
accepted it and the mail arrived one second later, intact — and its **only**
recipient was `devinp.sole@gmail.com`. No CC. Nothing reached
`mark@hymtravel.com`.

This is account-level, not a one-off: a Newsletter signup earlier the same day
landed at the same address, so **all three forms** are affected. If the site
went live as it stands, every client inquiry would go to the site owner's
personal Gmail and Mark would never see one — silently, with the form showing
its branded success state every time.

**It cannot be fixed in code, and the key must not be touched.** `submitForm`
sends no recipient field; its 13 `append` calls are `access_key`, `subject`,
`from_name`, `name`, `email`, `replyto`, `phone`, `message`, `experiences`,
`destination`, `botcheck`, `budget`, `newsletter`. Web3Forms delivers to the
address the access key is registered to, so the fix is the recipient setting in
the dashboard. Per CLAUDE.md the access key does not change — do **not** "fix"
this by minting a new key.

**What runbook § 2.3 actually has, and has not, proved:**

- Proved: the form works end to end. Every field round-tripped — experiences,
  timing, `1 adults, 0 children` from the steppers, budget, both free-text
  fields, occasion, advisor experience, `NEWSLETTER: No`. Honeypot clean,
  delivered to Inbox rather than spam, and it ran *before* any domain
  restriction, which is the required order.
- Not proved: **that mail reaches `mark@hymtravel.com` at all.** That address
  has never received a submission. The live Google Workspace MX (§ 3 below)
  makes it likely, but likely is not tested. Re-run the gate after fixing the
  recipient, and check Mark's spam on the first one — it will be the first
  delivery from this sender.

---

**The rest of #74 is hardening. Dashboard-only, and the issue is wrong about
which parts.**

Correct in the issue: all three forms POST the public key to
`api.web3forms.com` from client JS with no CAPTCHA, no rate limit, no proxy. The
key is public by design — do not "fix" it by hiding it.

**Stale in the issue:**

| Issue says | Actually |
|---|---|
| honeypot on Contact + Newsletter only | all **three** forms have `botcheck` (#76 closed) |
| key is in 3 files | **4** — the 4th is `src/content-pages/plan-your-trip.singlestep.bak:15`, dead code that never reaches `dist`, but a rotation trap. `README.md:141` and `docs/hostinger-deployment.md` § 4 both repeat the 3 |
| "dashboard, no code required" | true for domain restriction and rate limits; **false for CAPTCHA** — that needs widget markup in all three forms |
| #76 / #77 / #84 referenced as open | all three are **closed** |

**The finding nobody had made — CAPTCHA vs the CSP.** Turnstile works fine today
because the CSP ships as `Content-Security-Policy-Report-Only`. The moment #100
flips it to enforcing, Turnstile breaks **three ways at once**: `frame-src
'none'` (set explicitly, so it does *not* inherit `default-src 'self'`), plus
`script-src` and `connect-src`. Fixing only `script-src` yields a silently
half-broken widget. If a CAPTCHA is added, #100's policy needs
`challenges.cloudflare.com` in `script-src`, `frame-src` and `connect-src` —
and `frame-src 'none'` must be *replaced*, not extended.

**Two more traps:**

- **Plan Your Trip has no `<form>` element at all.** It builds `FormData` by
  element ID (13 `append` calls). Any CAPTCHA guide saying "put the div inside
  your form" does not apply, and with JS off that page cannot submit.
- **Enabling the domain restriction before runbook § 2.3's E2E gate silently
  invalidates that gate** — staging submissions would be rejected and it would
  look like a broken form.

Also genuinely missing: **the Newsletter has zero length caps.** No `maxlength`,
no JS-side cap. Contact and Plan Your Trip both cap and mirror the cap in JS.
`docs/hostinger-deployment.md` claims "all three forms now carry the honeypot
and length caps" — half right.

No verifier check asserts anything about the key, the honeypot, `maxlength` or
the CSP. None of this can go red in a build.

---

## #96 and the cutover chain (#99 → #32 → #33, gated by #31, watched by #34)

Entirely human. The one thing worth restating: **#96 has the hardest ordering
constraint in the programme and lives in a different milestone from the rest of
the chain** (M5a vs M5), so a milestone-driven reading of "what is left" misses
it. It must happen *before* the nameserver change.

It also asks for a **Domain property on `hymtravel.com`** via DNS TXT — not a
URL-prefix property on `www`. #31's criterion 2 and `SEO-AIO-PLAN.md:887` both
say "GSC + Bing verified on `www.hymtravel.com`", which is the wrong shape.
Follow the runbook § 1.2 wording.

**#31's pinned gate-run comment is substantially out of date** — its go/no-go
list still shows the stat-rail worksheet at "1 of 42 rows" (done, #94), the
About page NEEDS MARK items (closed), and #72 homepage weight (closed). The
NEEDS MARK census is **55 files / 57 occurrences**, not 59.

**M7 is 25 pages, not 26.** #54 (India) is stale — `/destinations/india/`
already ships and passes `hero-stat-rail`. Worth closing.

---

## #82 → #100 — the CSP

**#82 is done and can be closed.** The report-only header shipped in `b1a9c08`,
is live on staging, and was browsed across five templates with zero violations
under a deliberately *enforcing* local copy. Its only remaining checkbox is
#100's job.

**#100's blocker is measured, not guessed. It has also moved:**

- **Inline handlers: 0.** Was 141, then 46; all 46 are now gone and the
  `inline-handler` check fails the build if one returns. See the section above.
  Nothing is left to do here.
- **Inline `<script>`: DONE (2026-08-18).** The 425 blocks across all 98
  pages are only **10 distinct bodies**, so `script-src` now names each by
  sha256 and carries **no `'unsafe-inline'`**. It was not the nonce-or-
  externalise job this section previously said it was. The list is not
  maintained by hand: the build's `csp-script-src` check diffs
  `dist/.htaccess` against every inline script in `dist/` and fails with the
  exact `script-src` value to paste. Two traps it exists for, both observed
  in Chrome rather than reasoned:
  - a browser hashes script text after CRLF→LF normalisation, and three
    bodies (home, Contact, Plan Your Trip — the conversion path) carry CR in
    `dist/`. Under a header built from raw-byte hashes, Plan Your Trip's
    script was **blocked**, and the console demanded the normalised hash;
  - any hash present makes the browser ignore `'unsafe-inline'`, so coverage
    is all-or-nothing, and an edit to any inline script changes its hash. One
    did during the session that wrote this (the Newsletter cap), which is why
    the check, not the list, is the deliverable.

  Verified under an **enforcing** local copy — `node
  tools/serve-csp-enforcing.mjs`, also in `.claude/launch.json` — across
  every template: home, Contact (form + newsletter submitted with `fetch`
  stubbed, both reached their success state), Plan Your Trip (`goTo`,
  `submitForm`, all six step buttons and four steppers live), both hubs
  (Load More, filters), a destination page, a journal post. Zero violations
  from any page's own scripts; a deliberately unhashed probe *was* blocked,
  which is what proves the header was live. Re-derive before trusting:

  ```bash
  grep -rho '<script[^>]*>' dist --include='*.html' | grep -vc 'ld+json'   # 425
  node tools/verify-deployment.mjs | grep 'inline script hashes'          # 10, all current
  ```

- The 305 `application/ld+json` data blocks are **not hashed and did not
  need to be** — now observed, not reasoned: every template above rendered
  its schema under the enforcing header with no `script-src` violation.
  `script-src` does not apply to a non-executable type.

- `frame-src 'none'` is **enforced** — an attempt to load site pages into
  iframes under the local enforcing header was refused. If a CAPTCHA is ever
  added (#74), that directive must be *replaced*, not extended.

**Which third-party origins are observed, and which are still only reasoned.**
The distinction matters because a `script-src` or `connect-src` mistake under an
enforcing policy fails *silently*.

- `api.web3forms.com` in `connect-src`, and `form-action` — **observed.** A real
  Plan Your Trip inquiry was submitted through the staging UI on 2026-08-18 under
  the report-only header. It reached the branded success state, which is gated on
  `response.ok && data.success`, and raised zero CSP violations in the console.
  These two entries can be trusted.
- `googletagmanager` and `google-analytics` — **still reasoned from code, never
  observed.** `src/components/Analytics.astro:31` hard-gates on
  `location.hostname !== 'www.hymtravel.com'`, so `gtag.js` has never loaded
  under this policy: not locally, not on staging, and it cannot until cutover.

Order: cutover → browse production with report-only still on → check
specifically for Google-origin violations → only then enforce. That check is now
the *only* origin work left before #100 can flip.

---

## #79 — HSTS

Filed as INFO-level defence in depth. **Read it as a regression to prevent.**
`www.hymtravel.com` sends `strict-transport-security: max-age=31556952` today.
After cutover to Hostinger that header disappears unless #79 lands. Do not add
`preload`. Ramp `max-age` as the issue says, and only after SSL is confirmed on
apex and www.

---

## Constraints — these will break things if ignored

1. **Stop the preview server before `npm run build`.** On Windows it holds
   `dist/` open, and the build clears `dist/` *before* failing. It has already
   emptied all 98 pages once. Recovery is just rebuilding with the server
   stopped — but never stage `dist/` in that window; check
   `find dist -name '*.html' | wc -l` returns 98 first.
2. **Never `git add -A`.** GitNexus rewrites a symbol-count line in `CLAUDE.md`
   and `AGENTS.md`; it must not ride along.
3. **Write patch scripts with the Write tool, not a bash heredoc.** Heredocs
   here silently mangle `\b` into a literal backspace, `\\n` into a real
   newline, and em dashes into U+FFFD. One of those shipped a regex into a
   verifier check that could never match.
4. **`tools/content-checks.mjs` legitimately contains NUL bytes** — a sentinel
   plus a `[\s\x00-\x1f]` range. Git calls it binary. Do not "fix" that.
5. **A new verifier check needs fixtures proving it goes red.** Two shipped
   without and both were wrong. Every check added this session caught a bug in
   *itself* during its first real run.
6. **Never quote a page count.** Derive it. `grep -o "<loc>" dist/sitemap-0.xml
   | wc -l` — `grep -c` returns 1, because the sitemap has no newlines.
7. **Purge the CDN after any asset change, and verify with a GET.** A deploy
   alone does not change what is served. See § The CDN cache.
8. **Never run a build while the user is deploying.** The build clears `dist/`
   and the uploader reads from it.

---

## Definition of done for this handoff

- [x] Staging current and verified, CDN purged, 60/60 images byte-matching
- [ ] **#74's recipient address is fixed so submissions reach
      `mark@hymtravel.com`.** They currently do not — see § #74. This outranks
      every other item in this list: it is the one that loses real business
      after launch, and it does so silently
- [ ] Runbook § 2.3's E2E gate re-run *after* that fix and *before* the domain
      restriction. The 2026-08-18 run proved the form works but was delivered
      to the wrong address, so the gate is half-satisfied, not done
- [ ] #74's remaining dashboard settings are on (domain restriction, CAPTCHA,
      rate limits)
- [ ] #96 complete: Domain property on `hymtravel.com`, Bing imported, staging
      submitted nowhere
- [ ] #99's record snapshot exists, MX included, TTL lowered
- [ ] #32, then #33 using the § 4.3 title discriminator, not a bare 200
- [ ] #79 lands so HSTS does not regress
- [ ] #100 only after a production browse with report-only still on

---

## Open items this handoff did not resolve

- **`docs/seo/HANDOFF-photo-rollout.md` is stale at the top** — it states
  `HEAD = 8449977`, which is many commits behind (derive:
  `git rev-list --count 8449977..HEAD`; the number written here rotted from
  12 to 28 in one session). Its photo counts are still
  accurate; only the commit reference rotted.
- ~~`docs/hostinger-deployment.md` and `README.md` carry stale counts~~ —
  fixed in `4dba331`. "Three places" for the key was correct and stays.
- **`docs/seo/photography-needed.md` and `photography-plan.md` are stale
  enough to mislead** — see #92's and #93's comment threads for the verified
  numbers (all 43 destination heroes ship; 24 swatch cards remain, on 4
  pages: india, jordan, new-zealand, oman). **#92's and #93's titles still
  carry the old counts** ("25 missing heroes", "181 of 230 cards") — retitle
  or close is the owner's call; the threads have the truth.
- ~~`docs/seo/validation-log.md` has an unlisted #33 deliverable~~ — the Rich
  Results Test is now a checklist item in runbook § 4.4, and the log says
  so truthfully.
- **The GA4 measurement ID is still `G-XXXXXXXXXX`**, so runbook § 2.5's
  placeholder grep can only go green once a real property exists. The grep is
  now scoped so it does not also report 127 binary assets.
- ~~Audit findings not yet acted on~~ — **all seven landed 2026-08-18**, see
  the section above. What is left of the image work is only the 60 remaining
  swatch cards (24 destination on india/jordan/new-zealand/oman, 36
  experience on 6 pages), and those need photography that does not exist in
  the repo — the seven subjects are listed in `photography-plan.md`.

- **`og:image:alt`, `og:image:width` and `og:image:height` are on 0 of 98
  pages.** `CONTENT-STANDARDS.md` § OG image asks for alt and
  `SCHEMA-LIBRARY.md:594` shows all three. Now that 83 pages carry a real
  per-page image, the missing alt is more visible, not less. One change to
  `Base.astro`'s head block; deliberately not bundled with the 70-blob crop
  commit.

- **`/destinations/alaska/` ships a frame containing about six recognisable
  people** on a viewing platform, which the no-faces brand rule would
  normally exclude. Keeping it was an explicit call on 2026-08-18, recorded
  here so it is not silently re-litigated. Six other Alaska frames are in
  the library if that is ever revisited.

- **One frame ships three times over.** `e-17-tuscan-wine-tasting.jpg` also
  exists as a byte-identical `/assets/vineyard-tasting-golden-hour.jpg` with
  its own 435 KB base64 twin, plus an `ALIASES.json` entry pointing at a
  third path. Consolidating means deleting a tracked asset, which needs
  authorisation. Same family: check `ALIASES.json` before assuming two paths
  are two pictures.

- **Search the place-prefixed filename families before concluding an asset
  is missing.** A pass looking for a Southern-African safari frame checked
  `africa-*`, `safari`, `kruger`, `sabi` and `serengeti`, concluded none
  existed, and proposed an East African substitute. Six `botswana-*` frames
  were sitting there. The build now prints the unreferenced-image inventory
  on every run for the same reason.
