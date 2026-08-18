# Session handoff — the remaining launch blockers

Paste the block below as the first message of the next session. Everything the
task needs is in it or in the sections under it.

Written 2026-08-17, updated 2026-08-18 at `71e7aa1` with the deploy findings
(§ 4 of the hazards). Every number here was derived on those dates and then
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
    - nothing is blocking. The pre-launch polish milestone is down to items
      that need Mark, a dashboard login, or DNS.
    - the #100 inline-handler groundwork is DONE — all 46 are gone and an
      `inline-handler` verifier check now holds the site at zero. What is
      left of #100 is the inline <script> blocks, which is not a mechanical
      job. See § CSP.

  HUMAN-ONLY (do not attempt; surface and stop)
    - #74  Web3Forms dashboard: domain restriction, CAPTCHA, rate limits
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
The user runs the deploy:

```
powershell -ExecutionPolicy Bypass -File "C:\Users\reach\OneDrive\Pictures\Desktop\hymt-site\deploy-to-hostinger.ps1"
```

| | |
|---|---|
| Built pages | 98 (97 sitemap URLs + `404.html`) |
| Destination pages | 43, all with Best Season **and** Best For |
| Experience pages | 12 |
| Journal posts | 32 |
| Check fixtures | 110 |
| Open issues | 41 |
| Inline event handlers | 0, enforced by `inline-handler` |

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

## #74 — Web3Forms hardening

**Dashboard-only, and the issue is wrong about which parts.**

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
- **Inline `<script>`: 425 blocks across all 98 pages, 3 to 5 per page, and
  zero external `<script src>` anywhere on the site.** This is now the whole of
  the `'unsafe-inline'` blocker, and it is not a mechanical job — it needs
  nonces or externalising, and externalising costs the site its
  no-external-JS posture. Derive it again before acting on it:

  ```bash
  grep -rho '<script[^>]*>' dist --include='*.html' | grep -vc 'ld+json'
  ```

- Also present: 305 `application/ld+json` data blocks. Browsers do not apply
  `script-src` to a non-executable data block, so these should not need a
  nonce — but that is reasoned, not observed. Confirm it under the report-only
  header before enforcing, because getting it wrong strips the schema off
  every page on the site.

**The gap that only production can close:** `src/components/Analytics.astro:31`
hard-gates on `location.hostname !== 'www.hymtravel.com'`, so `gtag.js` has
**never loaded** under this policy — not locally, not on staging. The
`googletagmanager` and `google-analytics` entries are reasoned from code, never
observed. A `script-src` mistake there fails *silently*: blocked analytics
breaks measurement, not the page.

Order: cutover → browse production with report-only still on → check
specifically for Google-origin violations → only then enforce.

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
- [ ] #74's dashboard settings are on, and runbook § 2.3's E2E gate ran
      **before** the domain restriction
- [ ] #96 complete: Domain property on `hymtravel.com`, Bing imported, staging
      submitted nowhere
- [ ] #99's record snapshot exists, MX included, TTL lowered
- [ ] #32, then #33 using the § 4.3 title discriminator, not a bare 200
- [ ] #79 lands so HSTS does not regress
- [ ] #100 only after a production browse with report-only still on

---

## Open items this handoff did not resolve

- **`docs/seo/HANDOFF-photo-rollout.md` is stale at the top** — it states
  `HEAD = 8449977`, which is 12 commits behind. Its photo counts are still
  accurate; only the commit reference rotted.
- **`docs/hostinger-deployment.md` and `README.md` carry stale counts** — "93
  pages", "87 pages", "three places" for the key. Same family as #98.
- **`docs/seo/photography-needed.md` and `photography-plan.md` are stale
  enough to mislead** — see #92's comment thread for the verified numbers.
- **`docs/seo/validation-log.md` has an unlisted #33 deliverable** — the Rich
  Results Test column, scheduled to §§ 4.3–4.4 but in no issue checklist.
- **The GA4 measurement ID is still `G-XXXXXXXXXX`**, so runbook § 2.5's
  placeholder grep can only go green once a real property exists. The grep is
  now scoped so it does not also report 127 binary assets.
