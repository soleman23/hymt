# HYMT Launch Runbook — DNS cutover to production

**Going live:** the Astro build in `soleman23/hymt`, deployed to Hostinger,
on `https://www.hymtravel.com`
**Staging:** `https://brown-goose-754147.hostingersite.com`

This is a **fresh launch**. The domain is treated as brand new: no legacy URLs
to redirect, no prior properties to migrate, no baseline to preserve.
Measurement starts from zero on launch day. Do not add redirect maps,
Change-of-Address submissions, or any "old site" assumptions to this
runbook — there is no old site in scope.

Read this whole document before starting. The cutover itself takes about an
hour of work plus DNS propagation; the preparation is what determines whether
it goes well.

---

## 0. The shape of this launch

A static site going live on its domain in one step. Because nothing is
being carried over, the entire risk profile is forward-looking: **getting every
page discovered, crawled and indexed properly, from nothing.** Weight the
post-launch indexing work accordingly — that is where launches like this
succeed or fail.

> **The page count is derived, never quoted.** It moves whenever M7 lands
> another destination page — it went 94 → 96 → 97 while this runbook still
> said 94, and #98 was filed because a verifier reading a stale literal at the
> gate has to decide, live, whether the mismatch is drift or a defect. So every
> count below reads "every URL in the sitemap" and you establish the number
> once, here, on the day:
>
> ```bash
> npm run build   # reports the page count it just built
> grep -o "<loc>" dist/sitemap-0.xml | wc -l
> ```
>
> Use `grep -o ... | wc -l`, **not** `grep -c`. The sitemap is emitted as a
> single line with no newlines, so `grep -c` counts matching lines and returns
> `1` no matter how many URLs there are. That exact mistake shipped in this
> runbook between 22779e3 and its correction.
>
> `sitemap-parity` in `tools/verify-deployment.mjs` already fails the build if
> those two disagree, so one number is enough. **At the time of writing
> (2026-08-17) it was 98 built pages / 97 sitemap URLs.** That line is dated
> because it is a snapshot, not a criterion.

Unknown paths on the domain 404 by design. The custom `/404.html` and the
`.htaccess` `ErrorDocument` rule handle that; anything a search engine may have
associated with the domain historically simply drops out on its own. That is
the intended behaviour, not a gap.

---

## 1. T-minus 2 weeks

### 1.1 Freeze scope
No new pages, no template changes after this point. Content copy edits only.

### 1.2 Verify properties **before** cutover
- [ ] GSC: verify `hymtravel.com` as a **Domain property** via DNS TXT. Do this
      now — the record survives the nameserver change if you keep the same DNS
      host, and having the property live before cutover means indexing is
      visible from hour one.
- [ ] Bing Webmaster Tools: verify the site (import from GSC).
- [ ] Do **not** verify or submit the `hostingersite.com` staging host anywhere.

### 1.3 Lower the DNS TTL
- [ ] Set the TTL on the `hymtravel.com` A/CNAME records to **300 seconds** at
      least 48 hours before cutover. This is the single most useful thing you
      can do to make the switch reversible. Raise it back to 3600 a week after.
- [ ] Record the current DNS values (A, CNAME, MX, TXT) somewhere safe. They
      are the rollback.

---

## 2. T-minus 1 week — gates

Nothing proceeds until all of these pass.

### 2.1 Build gates
- [ ] `npm install && npm run build`
- [ ] `node tools/verify-deployment.mjs` — zero failures
- [ ] `npm run verify:remote` against the staging host — zero failures
- [ ] All Phase 0–3 tasks in `SEO-AIO-PLAN.md` complete

### 2.2 Crawl the staging site
Screaming Frog's free tier covers 500 URLs, which the site fits comfortably
inside. Establish N from the sitemap first (see § 0) and hold every count below
to it.

- [ ] 0 × 4xx, 0 × 5xx
- [ ] 0 redirect chains, 0 redirect loops
- [ ] Every crawled page has a canonical, all pointing at
      `https://www.hymtravel.com/...`
- [ ] Titles and descriptions are unique across the crawl — as many distinct
      values as there are pages, with zero duplicates reported
- [ ] 0 pages with a missing or duplicate `<h1>`
- [ ] 0 images without `alt`, `width`, `height`
- [ ] 0 broken internal links, 0 broken external links
- [ ] Every page reachable within 3 clicks of the homepage

### 2.3 Rendering and function
- [ ] 10 representative pages at 375 px and 768 px, Chrome + Safari
- [ ] FAQ accordions open, close, and are keyboard-operable
- [ ] **FAQ answers visible with JavaScript disabled** (this is the P0-1 fix —
      verify it specifically)
- [ ] Homepage hero rotates
- [ ] Mobile nav opens and closes
- [ ] Plan Your Trip: all four steps, validation, branded success state
- [ ] A real Web3Forms submission arrives at `mark@hymtravel.com`
- [ ] Contact form and newsletter both submit — note the contact form was
      **completely non-functional** until P0-3b (a `<div>` with a button
      calling an undefined `submitContact()`); verify the fix landed, do not
      assume it
- [ ] `tel:` and `mailto:` links work on a real phone
- [ ] `/404.html` returns HTTP 404, not 200: `curl -I <host>/nonexistent`

### 2.4 Performance
Run PageSpeed Insights against the staging host for the homepage, one
destination page, and one journal post.

- [ ] LCP ≤ 2.5 s on mobile (lab). If it is not, the hero preload (P1-2) or the
      font work (P1-3) is not done.
- [ ] CLS ≤ 0.1
- [ ] INP ≤ 200 ms
- [ ] Total page weight under 1.5 MB

The `no-transform` header in `.htaccess` is a workaround for a Hostinger CDN
bug documented in that file. It was long assumed to cost ~28 KB a page by
forcing HTML to ship uncompressed. **Retested 2026-08-17: it does not.** The
edge still negotiates compression with the header in place, and a destination
page ships at ~13.5 KB (br) against 51,355 B identity, decompressing intact.
There is no LCP debt here to accept, and nothing to re-test in month 2 beyond
confirming the numbers still hold. See #95.

### 2.5 Content
- [ ] `grep -rli "lorem\|TBD\|coming soon\|TODO\|placeholder:" dist/ --include="*.html"`
      returns nothing — "placeholder:" is in the list because `/about/` shipped
      six of them past the shorter grep.
      **Two corrections to how this was written.** Scope it to `--include="*.html"`
      and use `-l`: unscoped it matches 127 binary assets on byte sequences and
      reports 225 files, which reads as catastrophic and means nothing.
      And `XXX` is dropped from the pattern deliberately — every page carries the
      GA4 placeholder `G-XXXXXXXXXX`, so while the measurement ID is unset this
      item can never go green and tells you nothing. It starts passing the moment
      the real ID lands, which is tracked separately; do not treat the change as
      evidence of anything else.
- [ ] The About page contains real copy from Mark, not scaffolding (F20/P0-3c)
- [ ] `grep -rn "NEEDS MARK" src/` — every one resolved or consciously deferred
- [x] Hero stat rail — **done 2026-08-17 (#94).** All 43 destination pages
      carry Best Season **and** Best For; the TODO comments are gone from
      every page, and `hero-stat-rail-worksheet.csv` is now a record of what
      ships rather than a to-do list. Enforced by `hero-stat-rail` in
      `tools/verify-deployment.mjs`, so it cannot silently regress and a new
      destination page cannot ship without both stats.
      **Flight Time was dropped on purpose** and is not part of this gate: it
      is not derivable from the repo, and the worked example everything was to
      be copied from was wrong by roughly double. See #94.
- [ ] Privacy policy reflects the actual analytics and forms in use

---

## 3. Redirect posture

There is no redirect map. This is deliberate.

The only redirects on this site are the structural ones already in
`public/.htaccess`: HTTP→HTTPS, apex→www, and the pretty-directory rule
(`/about` → `/about/`). Verify each is a **single hop** — chained redirects
leak equity and are entirely avoidable:

```bash
# after deploying to staging, against the staging host
for u in /about /about/ /destinations/italy /nonexistent; do
  printf '%-24s ' "$u"
  curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' \
    "https://brown-goose-754147.hostingersite.com$u"
done
```

Expect `301 → /about/` for the bare paths, `200` for the canonical forms, and
`404` for the last. If anyone proposes adding legacy-path redirects later,
the answer is: this was launched as a fresh site, unknown paths 404, and that
is the design.

---

## 4. Cutover day

Pick a low-traffic window — a weekday morning is fine for a site this size.
Budget two hours including checks. Do not do this on a Friday.

### 4.1 Final deploy to staging (T-60 min)
- [ ] `node tools/set-journal-dates.mjs --date <today's date>` — stamps
      `publishDate` on every journal post per DECISIONS.md D6 (posts are
      dated the day they go live; never backdate). Commit the result.
- [ ] `git pull && npm install && npm run build`
- [ ] `node tools/verify-deployment.mjs` clean
- [ ] Upload `dist/` to Hostinger `public_html` (see `docs/hostinger-deployment.md`)
- [ ] `npm run verify:remote` clean
- [ ] Confirm `public/.htaccess` landed and is not being ignored

### 4.2 Switch DNS (T-0)
- [ ] Point `hymtravel.com` A record and `www` CNAME at Hostinger per hPanel
- [ ] Enable free SSL in hPanel; wait for the certificate to issue
- [ ] Confirm the certificate covers **both** `hymtravel.com` and
      `www.hymtravel.com`

### 4.2b Purge the CDN cache — **a deploy alone does not change what is served**

- [ ] hPanel → purge / clear the CDN cache **after** the upload, **before** any
      verification below

This is not optional and it is not belt-and-braces. On 2026-08-18 two clean
`582/582` deploys changed nothing a visitor could see, because Hostinger's edge
was replaying cached responses. Only the purge moved it. The cause (`immutable`
on non-content-addressed image URLs) is fixed in `public/.htaccess`, but **the
entries already in the cache are not evicted by fixing the header** — and the
same will be true of any future asset change.

Verify with a **GET**, never a HEAD:

```bash
curl -s -D - -o /dev/null https://www.hymtravel.com/assets/img/<some-image>.jpg \
  | grep -i "x-hcdn-cache-status\|content-length"
```

A `HEAD` reaches origin and will happily report the new file while every real
visitor is still served the old one. That mistake cost an hour; see #107.

### 4.3 Verify propagation (T+15 to T+60)

> **Before trusting ANY check in § 4.3 or § 4.4, confirm you are looking at the
> new site.** `https://www.hymtravel.com/` answers today, from a host that is not
> this build — so a propagation check, an HTTPS check, an HSTS check and a
> "200 OK" all pass *before* cutover has happened. Four of the six automated
> checks below are satisfiable by a domain that simply resolves somewhere.
>
> The cheap discriminator is the title, which is unique to this build:
>
> ```bash
> curl -s https://www.hymtravel.com/ | grep -o "<title>[^<]*</title>"
> ```
>
> It must read `Hit Your Mark Travel — Bespoke Luxury Journeys`. Anything else
> means DNS has not moved yet and every result below is measuring the wrong
> server. `npm run verify:prod` is not a substitute: its remote mode fetches
> three pages and their stylesheets, and emits `ok` lines against any host that
> returns HTML.

```bash
dig +short www.hymtravel.com
curl -sIL https://www.hymtravel.com/ | head -20
```

Then check every hop resolves in one step:

```bash
for u in http://hymtravel.com/ http://www.hymtravel.com/ \
         https://hymtravel.com/ https://www.hymtravel.com/ ; do
  printf '%-32s ' "$u"
  curl -s -o /dev/null -w '%{http_code} %{num_redirects} hops -> %{url_effective}\n' -L "$u"
done
```

- [ ] All four end at `https://www.hymtravel.com/`
- [ ] `num_redirects` ≤ 1 for `http://www.` and `https://` apex; ≤ 2 for
      `http://` apex (protocol then host). If any is higher, fix the `.htaccess`
      rule order before proceeding.

### 4.4 Verify the site (T+30)
- [ ] `npm run verify:prod` — clean
- [ ] Spot-check 15 URLs by hand across all page types
- [ ] `curl -s https://www.hymtravel.com/robots.txt` — the production version,
      pointing at `/sitemap-index.xml`
- [ ] `curl -s https://www.hymtravel.com/sitemap-index.xml` — same URL count
      as the local build (§ 0), and every URL 200s
- [ ] `curl -sI https://www.hymtravel.com/ | grep -i x-robots` — **no
      `noindex`**. If this returns `noindex`, the staging `X-Robots-Tag` rule is
      matching the wrong host. Fix immediately; this is the single most
      damaging possible mistake at this step.
- [ ] `curl -sI https://www.hymtravel.com/nonexistent` — 404
- [ ] Submit a real inquiry through Plan Your Trip; confirm it arrives
- [ ] GA4 realtime shows the visit

### 4.5 Search engines (T+60)
- [ ] Confirm the GSC Domain property is still verified after the DNS change
- [ ] Submit `https://www.hymtravel.com/sitemap-index.xml` in GSC
- [ ] URL Inspection → Request Indexing on: `/`, `/about/`, `/plan-your-trip/`,
      `/destinations/`, `/experiences/`, `/travel-journal/`, `/faq/`, and the
      three strongest destination pages
- [ ] Bing Webmaster Tools: submit the sitemap
- [ ] Create/update the Google Business Profile website URL if the profile
      exists (`[DECISION-4]`)

### 4.6 Everything else pointing at the site
- [ ] Instagram bio link
- [ ] LinkedIn
- [ ] Email signature
- [ ] Consortium / host-agency advisor profile
- [ ] Any directory listing
- [ ] Business cards and print collateral (note for the next reprint)

---

## 5. Rollback

If something is badly wrong in the first hours, revert the DNS records to the
values captured in § 1.3. With a 300-second TTL you are back within about ten
minutes. Nothing else needs undoing — the Astro build and the Hostinger
deployment are untouched and simply stop being reachable.

**Do not roll back for:** a slow start in impressions (expected — the site is
starting from zero), pages showing as `Discovered – currently not indexed`
(normal for a new site of this size), or the sitemap showing "Couldn't fetch" for
the first few hours.

**Do roll back for:** the site not loading, SSL errors, forms not delivering,
or `X-Robots-Tag: noindex` on the production host that cannot be fixed within
minutes.

---

## 6. Post-launch schedule

### Days 1–7 — daily
- [ ] GSC Coverage: new errors
- [ ] GSC Crawl Stats: Googlebot is fetching, response codes are 200
- [ ] GA4: traffic arriving, conversions firing
- [ ] `npm run verify:prod`

### Days 7–30 — weekly
- [ ] Every URL in the sitemap indexed (GSC Pages report). Chase anything
      stuck. Compare the GSC total against § 0, not against a number typed here.
- [ ] Distinguish `Discovered – currently not indexed` (normal, wait) from
      `Crawled – currently not indexed` (a quality signal — that page needs
      more substance or better internal links)
- [ ] First Search Console query data appearing
- [ ] Core Web Vitals field data begins around day 28

### Month 2
- [ ] **Re-confirm the Hostinger CDN compression finding.** Done once already
      on 2026-08-17 (#95): compression is negotiated and correct *with*
      `no-transform` in place, so the workaround costs nothing and stays.
      Re-run only to confirm that still holds:
      `curl -s -H 'Accept-Encoding: br' -D - -o /dev/null -w 'wire=%{size_download}
' https://www.hymtravel.com/destinations/caribbean-mexico/`
      Expect `Content-Encoding: br` and a wire size near 13.5 KB. Do **not**
      pipe `--compressed` into `wc -c` — curl decompresses, so that byte count
      reports the full document no matter what the edge did.
- [ ] Full CWV review against field data
- [ ] Ship `llms.txt`
- [ ] Begin the monthly AI-visibility log

### Month 3
- [ ] Review organic growth from the launch-day zero: impressions, indexed
      pages, first rankings per cluster in `KEYWORD-MAP.md`
- [ ] Full re-crawl; fix anything that drifted
- [ ] Review which pages get impressions and which get none; the second group
      tells you what to rewrite

---

## 7. Things that will look alarming and are not

- **Near-zero impressions in week 1.** The site starts from nothing; Google has
  to discover, crawl, index and then rank every page. Weeks, not days.
- **Only a fifth of the site indexed after a week.** New sites get crawled in waves.
  Internal linking and the sitemap are what accelerate it; panic does not.
- **The sitemap says "Couldn't fetch" for a day.** Common right after
  submission. Re-submit once, then wait.
- **Impressions with no clicks for the first month.** Position 40 gets
  impressions and no clicks. It is a starting point, not a verdict.
- **`Crawled – currently not indexed` on a handful of thin pages.** That is
  Google telling you which pages need more substance. Act on it in month 2, not
  week 1.
