# Session handoff — the remaining launch blockers

Paste the block below as the first message of the next session. Everything the
task needs is in it or in the sections under it.

Written 2026-08-17 at `50f5ac5`. Every number here was derived on that date and
then **adversarially re-verified by a second pass** — the corrections that pass
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
    - optional: #100 groundwork (see § CSP below) — you can remove inline
      handlers to shrink the 'unsafe-inline' blocker without touching the
      header. 46 remain, 35 of them one mechanical pattern.

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

BEFORE YOU COMMIT: npm run build must pass, and it is self-contained.
BEFORE YOU BUILD: stop any astro preview server — it holds dist/ open on
Windows and the build wipes dist/ before failing.
NEVER git add -A: GitNexus rewrites a symbol-count line in CLAUDE.md and
AGENTS.md that must not ride along.

Ask before deleting content. Two rounds of card removal in this repo were
correct only because they were explicitly authorised.
```

---

## Where things stand

**Repo:** clean, all work pushed. `HEAD = 50f5ac5` on `main`, tracking
`origin/main`.

**Staging is BEHIND.** The last deploy was at `d93bf5f`. Three commits have
landed since and are **not deployed**: `25d1d0b`, `5e97e4b`, `50f5ac5` — the
whole journal-index rebuild. The user runs the deploy:

```
powershell -ExecutionPolicy Bypass -File "C:\Users\reach\OneDrive\Pictures\Desktop\hymt-site\deploy-to-hostinger.ps1"
```

| | |
|---|---|
| Built pages | 98 (97 sitemap URLs + `404.html`) |
| Destination pages | 43, all with Best Season **and** Best For |
| Experience pages | 12 |
| Journal posts | 32 |
| Check fixtures | 96 |
| Open issues | 42 |

### What this session closed

`#36` llms.txt · `#83` newsletter fetch · `#94` hero stat rail · `#95` CDN
no-transform · `#98` page counts · `#104` dead share buttons · `#105` journal
index filters/Load More/count · `#106` linkless cards.

Four verifier checks were added, each with fixtures that go red: `llms-txt`,
`hero-stat-rail`, `dead-inline-handler` (with a debt ratchet, now empty), and
`linkless-card`.

---

## The cutover hazards nobody had written down

These came out of a verification sweep on 2026-08-17 and are the highest-value
content in this file. None of them is in any issue.

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

**#100's blocker is measured, not guessed:**

- 46 inline handlers remain site-wide (was 141; #104 and #105 removed 95).
  **35 are one mechanical pattern** — `onclick="window.location.href='...'"` on
  cards — which is the cheapest remaining win and is agent-doable today.
- The rest: `goTo` ×6, `adj` ×4, `submitForm` ×1, all defined.
- Every page also carries inline `<script>`, so `'unsafe-inline'` needs nonces
  or externalising regardless.

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

---

## Definition of done for this handoff

- [ ] The three undeployed commits are live on staging and verified
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
