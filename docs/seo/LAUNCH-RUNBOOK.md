# HYMT Launch Runbook — Wix-to-Hostinger production migration

**Going live:** the Astro build in `soleman23/hymt`, deployed to Hostinger,
on `https://www.hymtravel.com`
**Staging:** `https://brown-goose-754147.hostingersite.com`

This is a **same-domain platform migration**. Wix currently serves the
production domain; the Astro site will replace it on Hostinger without carrying
forward any Wix page, code, hosting, or runtime dependency. Preserve confirmed
Wix URLs with Hostinger-side 301 redirects and keep the existing Domain property
verified. Do not submit Search Console Change of Address because the hostname is
unchanged. New-site analytics measurement starts on launch day; existing search
history does not reset.

Read this whole document before starting. The cutover itself takes about an
hour of work plus DNS propagation; the preparation is what determines whether
it goes well.

---

## 0. The shape of this launch

A static site, DNS authority and registrar move off Wix in separate gates. The
website cutover and nameserver delegation happen in a synchronized window;
registrar transfer happens only after at least seven stable days. The risk is
both forward-looking and continuity-sensitive: **get every new page discovered
while preserving the small set of URLs, mail records and verification records
already attached to the domain.**

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

Unknown, unconfirmed paths on the domain 404 by design. Confirmed Wix paths are
different: each must have an equivalent route or an explicit 301 fixture. The
custom `/404.html` and `.htaccess` `ErrorDocument` rule handle everything else.

---

## 1. T-minus 2 weeks

### 1.1 Freeze scope
No new pages, no template changes after this point. Content copy edits only.

### 1.2 Verify properties **before** cutover

Tracked as #96. This is the one search-console task that must happen *before*
the nameserver change, and it is Devin's — nothing automated touches DNS,
hPanel or Search Console.

**Why the ordering is load-bearing.** Verify after cutover and the first days
of crawl data — exactly the window in which a brand-new 122-page site either
gets discovered or does not — are invisible. § 6's weeks 1–4 indexing watch is
only as good as the property being live before there is anything to watch.

**A Domain property, not a URL-prefix property.** It covers apex and `www`,
http and https, in one, and that is what makes it survive the DNS change.

1. [ ] GSC → Add property → **Domain** → `hymtravel.com` → copy the TXT record
2. [ ] Add the TXT at the **current Wix DNS host** and verify it there
3. [ ] Add the identical TXT to the staged Hostinger zone and query each
       assigned Hostinger nameserver directly before delegation
4. [ ] Bing Webmaster Tools → **Import from GSC** (do not verify separately)
5. [ ] Confirm the staging host appears in **neither**. Do not verify or submit
       `hostingersite.com` anywhere, ever.
6. [ ] Record the TXT value in the private snapshot described in § 1.3 — it is part of the rollback
       picture, not just a setup step

### 1.3 Snapshot Wix and stage the complete Hostinger zone

Prerequisite: #114 is complete. The temporary Hostinger web app must already be
deploying `soleman23/hymt` successfully; do not attach the production domain to
the obsolete `hymtwebsite` source or a failed build.

- [ ] Set the TTL on the `hymtravel.com` A/CNAME records to **300 seconds** at
      least 48 hours before cutover. This is the single most useful thing you
      can do to make the web switch reversible. After the seven-day stability
      window, raise the **authoritative Hostinger web-record TTLs** to 3600;
      leave the Wix rollback zone unchanged until it is retired.
- [ ] Record the timestamp when the 300-second values are publicly visible. #32
      cannot begin until 48 hours after that timestamp.
- [ ] Export or screenshot the **complete Wix DNS zone** somewhere private and
      durable. Public DNS cannot enumerate a zone, so a resolver snapshot alone
      is not sufficient.
- [ ] In hPanel, attach `hymtravel.com` to the existing Hostinger site. Record
      the exact nameservers and web destination hPanel assigns. Never infer them
      from the shared `hostingersite.com` preview hostname or its CDN IPs.
- [ ] Clone every Wix record into Hostinger before delegation: A, AAAA, every
      CNAME and subdomain, all five Google Workspace MX records with priorities,
      every TXT record, SPF, DMARC, the GSC verification TXT, any DKIM selector,
      CAA and SRV records, plus the current DNSSEC state.
- [ ] Query **each** Hostinger authoritative nameserver directly and diff its
      answers against Wix. Only the intentional web-target differences may
      remain.
- [ ] Send and receive a baseline Google Workspace message and retain the
      headers showing SPF/DKIM/DMARC results.

Lowering A/CNAME TTL does **not** lower the parent delegation or cached NS TTL.
The current Wix nameserver TTL has been observed as high as 86,400 seconds, so
nameserver propagation and rollback must be treated as a 24–48-hour event.

#### The rollback table — fill this in before touching anything

Keep this filled in **outside the repo as well** (the repo is public). What
matters is that these values exist somewhere retrievable at 2am, not that they
live here.

| Record set | Required fields in the private snapshot |
|---|---|
| `@` A / AAAA | Every value, TTL |
| `www` and every subdomain | Name, type, value, TTL |
| `@` MX | One row per target: priority, value, TTL |
| All TXT | Name, exact private value, TTL; include SPF and GSC |
| DKIM / DMARC | Selector or name, value, TTL; confirm against Google Admin |
| CAA / SRV | Name, flags/priority/weight/port, value, TTL |
| Nameservers / SOA | Every value, TTL, serial and timing fields |
| DNSSEC | DS/DNSKEY state and migration decision |
| Registrar / DNS host | Provider, lock status, account owner and noted-on timestamp |
| Hostinger target | Exact hPanel web destination and both assigned nameservers |

**The GSC TXT row is the one people forget.** If the nameservers move and that
record is not carried across, the Domain property silently unverifies and the
§ 4.5 post-cutover check fails at exactly the moment it is least welcome.

---

## 2. T-minus 1 week — gates

Nothing proceeds until all of these pass.

### 2.1 Build gates
- [ ] With Node 22, `npm ci && npm run build`
- [ ] `node tools/verify-deployment.mjs` — zero failures
- [ ] `npm run verify:remote` against the staging host — zero failures
- [ ] hPanel names `soleman23/hymt` / `main`; its deployed SHA matches the
      intended release commit and its build log is successful (#114)
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
- [ ] 0 broken internal links, 0 broken external links. Internal links are
      already enforced on every build by `internal-links`, which fails on any
      internal href resolving to nothing in `dist/`. **External links are not
      enforced anywhere, by design** — run them:

      ```bash
      npm run check:links
      ```

      It sweeps wide, then re-tests only the flagged URLs one at a time, and
      that second pass is the verdict. Do not act on a single concurrent sweep:
      on 2026-08-31 a 12-way pass reported 46 failures of which 32 were its own
      rate limiting, and that noise hid three of the eight links that really
      were dead. `BROKEN` (404, no such domain, refused) is actionable;
      `SUSPECT` (403, TLS, timeouts) needs a browser before you edit anything —
      three such flags that audit were false, and one was real.
- [ ] Every page reachable within 3 clicks of the homepage. Verified 2026-08-31
      by a breadth-first walk of `dist/`: all 122 pages sit within **2** clicks
      of `/`, with no orphans.

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
- [ ] `grep -rli "lorem\|\bTBD\b\|coming soon\|\bTODO\b\|placeholder:" dist/ --include="*.html"`
      returns nothing — "placeholder:" is in the list because `/about/` shipped
      six of them past the shorter grep.
      **Three corrections to how this was written.** Scope it to `--include="*.html"`
      and use `-l`: unscoped it matches 127 binary assets on byte sequences and
      reports 225 files, which reads as catastrophic and means nothing.
      And `XXX` is dropped from the pattern deliberately — every page carries the
      GA4 placeholder `G-XXXXXXXXXX`, so while the measurement ID is unset this
      item can never go green and tells you nothing. It starts passing the moment
      the real ID lands, which is tracked separately; do not treat the change as
      evidence of anything else.
      **The third: `TBD` and `TODO` need `\b` word boundaries**, added
      2026-08-31. Without them `-i` matches `TODO` inside **Todo**s Santos and
      the gate reads red on `/destinations/riviera-maya-los-cabos/` forever, on
      correct copy. That is not a hypothetical — it was the only hit this grep
      produced on the day it was checked, and a verifier arriving at the gate has
      to decide live whether it is a defect. The bounded form still goes red on a
      real `TODO`; both halves were driven on fixtures before this line changed.
      **The build already gets this right** — `placeholder-copy` in
      `tools/verify-deployment.mjs` tests `/\bTODO\b/` against visible text only,
      which is why it stayed green while this grep did not. That check is the
      gate; this command is the quick echo of it, and the two should agree.
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

The live Wix sitemap exposes four production URLs. Two already have equivalent
new routes (`/` and `/privacy-policy`); two require explicit migration rules in
`public/.htaccess`:

| Wix path | Hostinger destination |
|---|---|
| `/terms-conditions` | `/terms-and-conditions/` |
| `/trips` | `/travel-journal/` |

These rules run before HTTP→HTTPS and apex→www so every old URL reaches its
canonical destination in a **single hop**. The structural pretty-directory rule
still handles `/privacy-policy` → `/privacy-policy/`. Chained redirects leak
equity and are entirely avoidable:

```bash
# after deploying to staging, against the staging host
for u in /about /about/ /destinations/italy /privacy-policy \
         /terms-conditions /trips /nonexistent; do
  printf '%-24s ' "$u"
  curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' \
    "https://brown-goose-754147.hostingersite.com$u"
done
```

Expect `301` to the canonical destinations for the bare and Wix paths, `200`
for canonical forms, and `404` for the last. The build verifier asserts both
Wix mappings so they cannot silently disappear. Add future legacy rules only
for URLs confirmed by crawl data, backlinks or search-console evidence;
unknown, unconfirmed paths still 404 by design.

---

## 4. Cutover day

Pick a low-traffic window — a weekday morning is fine for a site this size.
Budget two hours including checks. Do not do this on a Friday.

### 4.1 Final deploy to staging (T-60 min)
- [ ] `node tools/set-journal-dates.mjs --date <today's date>` — stamps
      `publishDate` on every journal post per DECISIONS.md D6 (posts are
      dated the day they go live; never backdate). Commit the result.
- [ ] Merge every approved release change into `main`; record the release SHA
- [ ] With Node 22, `git pull && npm ci && npm run build`
- [ ] `node tools/verify-deployment.mjs` clean
- [ ] In hPanel, deploy that exact `soleman23/hymt` `main` SHA using Astro,
      build command `npm run build`, and output directory `dist`
- [ ] Retain the successful Hostinger build log and confirm the deployed SHA
- [ ] `npm run verify:remote` clean
- [ ] Confirm `public/.htaccess` landed and is not being ignored

### 4.1b Purge the CDN cache — **a deploy alone does not change what is served**

- [ ] hPanel → purge / clear the CDN cache **after** the upload and **before**
      changing DNS or performing any production verification

This is not optional and it is not belt-and-braces. On 2026-08-18 two clean
`582/582` deploys changed nothing a visitor could see, because Hostinger's edge
was replaying cached responses. Only the purge moved it. The cause (`immutable`
on non-content-addressed image URLs) is fixed in `public/.htaccess`, but **the
entries already in the cache are not evicted by fixing the header** — and the
same will be true of any future asset change.

Verify with a **GET**, never a HEAD. Before DNS changes, use the staging host:

```bash
curl -s -D - -o /dev/null \
  https://brown-goose-754147.hostingersite.com/assets/img/<some-image>.jpg \
  | grep -i "x-hcdn-cache-status\|content-length"
```

A `HEAD` reaches origin and will happily report the new file while every real
visitor is still served the old one. That mistake cost an hour; see #107.

### 4.2 Switch the website, then delegate DNS (T-0)

Do not combine these into one blind change. During nameserver propagation,
resolvers will use both the old Wix zone and the new Hostinger zone. They must
serve the same website, mail and verification state.

- [ ] Confirm the private zone export, direct Hostinger-NS diff, Google Workspace
      baseline and 48-hour TTL gate in § 1.3 are complete
- [ ] In the **current Wix zone**, point the apex and `www` web records at the
      exact Hostinger destination shown for this site in hPanel
- [ ] Enable/request free SSL in hPanel; wait for the certificate to issue
- [ ] Confirm the certificate covers **both** `hymtravel.com` and
       `www.hymtravel.com`
- [ ] Verify the unique Hostinger-build title, critical routes, redirects,
      forms and production crawler behavior through the public domain
- [ ] At the Wix registrar, replace `ns4/ns5.wixdns.net` with the exact
      Hostinger nameservers recorded in § 1.3
- [ ] Query the parent delegation plus every old and new authoritative
      nameserver. Web, MX, SPF, DKIM, DMARC and GSC answers must remain
      equivalent throughout propagation.

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
- [ ] Submit a real inquiry through Plan Your Trip; confirm it arrives **at
      `mark@hymtravel.com`** — not only that it arrives. Every submission before
      launch went to `devinp.sole@gmail.com` (#74); check Mark's spam folder on
      this first delivery.
- [ ] GA4 realtime shows the visit
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) by URL
      on one page per type — home, a destination, an experience, a journal post,
      the FAQ — now that Googlebot is allowed on the production host (it cannot
      test staging, by design). Pass = each page-type schema and
      `BreadcrumbList` detected, 0 errors. A missing-date *recommendation* on
      `Article` before § 4.1's stamp is expected; an error is not. This fills
      the RRT column in `docs/seo/validation-log.md`, which has no other route
      to completion.

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

### 4.7 Complete registrar separation after the rollback window

Do not couple registrar transfer to launch-day DNS delegation. After the site,
Hostinger DNS, SSL, Google Workspace mail and GSC have been stable for at least
seven days:

- [ ] Unlock the domain at Wix and obtain the transfer authorization/EPP code
- [ ] Transfer the domain registration to Hostinger while retaining the already
      working Hostinger nameservers
- [ ] Verify registrar, renewal, contacts, nameservers, DNS, mail and GSC again
- [ ] Only then cancel Wix hosting/subscriptions and remove the Wix site

---

## 5. Rollback

Keep Wix hosting and the old Wix DNS zone intact through the rollback window.
There are two different rollback paths:

1. **Fast website rollback:** change the Hostinger zone's web records back to
   the captured Wix values. Also change the still-authoritative Wix web records
   if delegation is incomplete. A 300-second web TTL makes this path fast for
   resolvers using the edited zone.
2. **Delegation rollback:** change the registrar nameservers back to the captured
   Wix values. This is a slow fallback: cached NS and parent-delegation data can
   take 24–48 hours to converge. Never promise a ten-minute nameserver rollback.

Do not cancel Wix, delete its site, transfer the registrar, or remove its DNS
zone until the seven-day stability gate in § 4.7 is complete.

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
