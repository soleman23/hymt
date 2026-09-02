# Session handoff — the www.hymtravel.com cutover (M5)

> **DONE — the site went live 2026-09-02 04:24–04:31 UTC** on release `5c9c1d7`. Wix DNS
> stays authoritative (Wix cannot change nameservers on a Wix-registered domain); only the
> web records moved (`A @ 195.179.237.168`, `CNAME www hymtravel.com`, `en` deleted). Steps
> F (nameserver delegation) and the Hostinger zone clone did not run and belong to the
> § 4.7 registrar transfer. Records: #32 (cutover), #33 (verification), #99 (zone + Hostinger
> values), #96 (Search Console). The rest of this file is the plan as it stood before.

Written 2026-09-02 ~04:35 UTC (2026-09-01 ~21:35 Pacific) by session `hymt-site-2b`,
interrupted mid-cutover. Paste THE PROMPT below as the first message of the next
session. Everything it needs is in it or in the sections under it. Every number
here was derived on that date; re-derive anything you are about to act on.

---

## THE PROMPT

```
Read docs/seo/HANDOFF-cutover-2026-09-02.md in full and continue the production
launch of https://www.hymtravel.com exactly where it stops. You are picking up a
cutover that is authorised, prepared, and about one third executed.

READ FIRST, in this order:
  1. docs/seo/HANDOFF-cutover-2026-09-02.md   (this file — state, decisions, sequence)
  2. CLAUDE.md                                 (GitNexus rules, Node/npm rules, SEO
                                                "Never do" list, before-every-commit)
  3. docs/seo/LAUNCH-RUNBOOK.md §§ 3–5         (redirect posture, cutover day, rollback)
  4. docs/hostinger-deployment.md § 2–3        (point the domain, SSL)
  5. gh issue view 99 / 96 / 32 / 33 / 31 --repo soleman23/hymt  (with comments)

THE USER HAS ALREADY DECIDED (2026-09-02, verbatim answers are in § "Decisions"):
  - Cut over as soon as everything is ready. Do not wait for a calendar date.
  - Runbook model: point the Wix-hosted web records at Hostinger first, verify,
    then move the nameservers to Hostinger the same day. "Move forward."
  - Search Console Domain property `hymtravel.com` owned by mark@hymtravel.com,
    with devinp.sole@gmail.com added as an owner.
  - en.hymtravel.com: use best judgement -> DELETE it at cutover (§ "en subdomain").
  - Wix / hPanel / Search Console: you have access to all three in the user's
    Chrome; use your best judgement. One session only — that is you.
  - Journal posts get publishDate stamped in the final pre-cutover build (D6).
  - The Wix DNS zone export and the three-form delivery test are DONE (user).

ULTRACODE IS ON for this task: use the Workflow tool for the two verification
sweeps described in § "Workflows to run" (pre-cutover and post-cutover), with
adversarial verify. Do the sequential browser work yourself, inline — never
fan browser-driving out to subagents (one Chrome, one driver).

SAFETY RULES THAT STILL APPLY: the user authorised the DNS cutover, the
nameserver delegation, the Search Console property and the hPanel domain
connection specifically. Anything outside that list that mutates an account
(a Wix consent dialog, a plan renewal, a registrar transfer, a Web3Forms
setting, deleting anything other than the `en` CNAME) — stop and ask. Never
type passwords, payment details or passkeys; admin.google.com demands a
passkey, so DKIM setup is the user's, and it is post-launch anyway.

Report progress in plain language as you go; the user follows from a phone.
Finish with the post-cutover verification, the Search Console submissions,
the issue updates and the M5 milestone close, in that order.
```

---

## Where things stand (verified 2026-09-02 ~04:30 UTC)

| Item | State | Evidence |
|---|---|---|
| Production `www.hymtravel.com` | **Still Wix.** Title `Hit Your Mark \| Sports & Luxury Travel`, `Server: cloudflare`, `x-wix-request-id`. Apex 301s to www at Wix. | `curl -s https://www.hymtravel.com/ \| grep -o "<title>[^<]*"` |
| Staging `brown-goose-754147.hostingersite.com` | Byte-identical to `main` (HTML and sitemap) at **2dbd14d**. `X-Robots-Tag: noindex` (correct, staging-scoped). robots.txt is CDN-masked on this host (58-byte Googlebot disallow) — only the production check counts. | hashes compared against `git show HEAD:dist/...` |
| Hostinger deploy pipeline | **Healthy.** hPanel → web app → Deployments: Auto-deployment ON, repo `hymt`, branch `main`, Node **24.x**, Astro. Last completed deploy = merge of #145, live ~1 min after merge. #138 closed with this evidence. | hPanel Deployments page |
| hPanel domain | **Not attached.** Dashboard banner "Every website needs a domain … Connect domain". | hPanel dashboard |
| Hostinger plan | Banner "Your hosting plan expires in 17 days" (seen 2026-09-01). Flag to the user; do not renew yourself. | hPanel dashboard |
| PR #145 | Merged. Fixes the host's shallow-clone sitemap defect (all 122 lastmods = HEAD's day). Staging `sitemap-0.xml` now byte-identical to committed. | `curl -s .../sitemap-0.xml \| grep -o "<lastmod>[^<]*" \| sort \| uniq -c` shows a spread |
| Web3Forms | Recipient corrected to mark@hymtravel.com (#74 closed). Three-form delivery test: **user says done.** Domain restriction NOT yet enabled — enable it in the Web3Forms dashboard **after** cutover, scoped to `www.hymtravel.com` (+apex if the UI insists). | #74 comments |
| GA4 | Real id `G-J6VZEBPCBC` on every page; staging guard keeps it off the preview host. | staging HTML |
| HSTS | Ships `Strict-Transport-Security: max-age=86400` with `env=IS_PROD` in `public/.htaccess`; inert on staging, live on the production host. #79 is code-complete; raise to a year later (two-place edit, see .htaccess comment). | `public/.htaccess` |
| CSP | Report-only on all hosts (#82). Enforcing is #100, post-launch. | response headers |
| Journal dates | NOT stamped yet. `node tools/set-journal-dates.mjs --date <local date of the final build>` then build, commit, PR, merge. | tools/set-journal-dates.mjs |
| Wix web TTLs | 1800 s (Wix minimum) since `2026-09-01T17:07:24Z`. 48-h gate = `2026-09-03T17:07:24Z`; user chose not to wait. The arithmetic requirement (old 3600 s drained) has long passed. Rollback budget is **30 min**, not 5. | #99 comments |
| Search Console | **No `hymtravel.com` property exists** under any of the four Google accounts in Chrome (u/0 devinp.sole = golo.golf only; u/1 = mysecuracore only; u/2 not signed into GSC; u/3 mark@hymtravel.com = zero properties). The apex's existing `google-site-verification=LQXT8l-…` TXT belongs to some other account (likely solefam@gmail.com or a Wix leftover). **#96 is open: create a NEW Domain property + a second TXT at Wix.** | GSC property switchers |
| DKIM | Not enabled: DoH NXDOMAIN at `google`, `default`, `selector1`, `selector2` `._domainkey`; `_domainkey` NODATA. Nothing to carry across. Post-launch: enable in Google Admin (needs the user's passkey). | dns.google |
| DMARC | `v=DMARC1; p=none;` TTL 600. Clone as-is. | dns.google |
| Peer session | `hymt-site-b7` was running the #31 gate read-only in the same checkout and Chrome. I told it the user assigned the panels to me and asked it to stop driving Chrome and send its results. Check `ListAgents`; if it is still live, re-send that message before touching a panel. Its uncommitted `AGENTS.md`/`CLAUDE.md` diff (GitNexus counts) is its own — leave it. | ListAgents |

## Decisions (user, 2026-09-02, verbatim)

1. "Cutover once everything is ready to go."
2. "Move forward. We got this and will make sure it works" (runbook model: web records first, then delegation same day).
3. GSC owner mark@hymtravel.com + devinp.sole@gmail.com as owner: "yes".
4. en.hymtravel.com: "what is this? if its not important use your best recommendation."
5. Which session drives the panels: "you have access to all three. use your best judgement for the best outcome."
6. Journal stamping at the final build: "Yes".
7. Wix zone export + three-form test: "Done and Done".

### en subdomain — the recommendation

`en.hymtravel.com` is a CNAME to `cdn3.wixdns.net`, the same Wix CDN target as
`www`. Wix creates it for its multilingual feature; it just serves the Wix site
under a second hostname. The new site has no `/en` routes and canonicals
everything to `www`. Leaving it would keep the OLD Wix site reachable on a
subdomain after launch and split signals. **Delete the `en` CNAME at cutover**
(in Wix DNS at step D, and do not create it at Hostinger). Nothing links to it.

## Live DNS zone (DoH, 2026-09-02 ~04:00 UTC) — also the rollback values

Port-53 lookups are intercepted on this network and return a cache artifact
whatever server you name; **use DNS-over-HTTPS**:

```bash
q(){ curl -s "https://dns.google/resolve?name=$1&type=$2" | python -c "import json,sys;d=json.load(sys.stdin);print('$1 $2',d.get('Status'),[(a['name'],a['type'],a['TTL'],a['data']) for a in d.get('Answer',[])])"; }
q www.hymtravel.com CNAME; q hymtravel.com A; q hymtravel.com MX; q hymtravel.com TXT; q _dmarc.hymtravel.com TXT; q en.hymtravel.com CNAME; q hymtravel.com NS
```

| Name | Type | Value | TTL |
|---|---|---|---|
| `@` | A | `185.230.63.171`, `185.230.63.186`, `185.230.63.107` (Wix) | 1800 |
| `www` | CNAME | `cdn3.wixdns.net` | 1800 |
| `en` | CNAME | `cdn3.wixdns.net` | 1800 |
| `@` | MX | `aspmx.l.google.com` 10, `alt1` 20, `alt2` 30, `alt3` 40, `alt4` 50 (`.aspmx.l.google.com`) | 3600 |
| `@` | TXT | `v=spf1 include:_spf.google.com ~all` | 1800 |
| `@` | TXT | `google-site-verification=LQXT8l-RiTxAHfGiHzFfeEBXoxbVP4Vh8GRJQNeKxLs` (unknown owner — keep it) | 1800 |
| `_dmarc` | TXT | `v=DMARC1; p=none;` | 600 |
| `@` | NS | `ns4.wixdns.net`, `ns5.wixdns.net` | 86400 |
| `@` | AAAA / CAA / DNSKEY | none | — |

Registrar: Wix (account Mark Sole, solefam@gmail.com); domain renews 2029-01-15;
Wix domain row menu has **Manage DNS records**, **Edit MX records**, **Transfer
away from Wix**. Hostinger's own values (target + nameservers) are NOT known yet
— they appear only when the domain is connected in hPanel (step C). Never
infer them from the `hostingersite.com` preview host.

## Accounts and access in the user's Chrome (Claude in Chrome)

Load the tools in ONE call:
`ToolSearch select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__find,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__browser_batch`
then `tabs_context_mcp {createIfEmpty:true}`.

| Panel | URL | Signed in as |
|---|---|---|
| Hostinger hPanel | `https://hpanel.hostinger.com/websites/brown-goose-754147.hostingersite.com` (Dashboard; `/deployments`; "Connect domain" button; left nav has Domains, Security) | user's Hostinger account |
| Wix | `https://manage.wix.com/account/domains` → row `hymtravel.com` → `⋯` → Manage DNS records | Mark Sole, solefam@gmail.com |
| Search Console | `https://search.google.com/search-console?authuser=3` (mark@hymtravel.com) — currently the "Welcome / Add a website" page | u/3 |
| Gmail, Mark's inbox | `https://mail.google.com/mail/u/3/#inbox` | mark@hymtravel.com |
| Google Admin | needs a **passkey** — human only | — |
| Bing Webmaster Tools | sign in with the same Google account, "Import from GSC" | — |

Chrome traps (all hit tonight): background tabs in the MCP tab group time out
on `screenshot` ("renderer may be frozen"); `find`, `read_page`, `get_page_text`
keep working, so prefer them and drive ONE tab, batching with `browser_batch`
(`wait` max 10 s per action). The Wix domains page exposes nothing to the
accessibility tree and only sometimes screenshots — a fresh tab immediately
after navigation works best. Another session dissolved my tab group once;
re-run `tabs_context_mcp` if a tool says the group is gone. Other MCPs
available and irrelevant here except: the Gmail connector is devinp.sole's
mailbox (not Mark's); the Wix MCP server has no DNS API for account domains.

## Repo, build and git rules that bit tonight

- Node: `export PATH="/c/Users/reach/AppData/Local/nvm/v24.16.0:$PATH"` before
  any `node`/`npm`. **Never `nvm use`.** `npm run build` takes 3–4 min here.
- The checkout is shared with other live sessions. Commit WITHOUT switching
  branches, via plumbing (worked tonight for #145):
  ```bash
  export GIT_INDEX_FILE="$(pwd)/.git/index.tmp" && git read-tree main && git add <files> \
    && TREE=$(git write-tree) && COMMIT=$(git commit-tree "$TREE" -p main -F msg.txt) \
    && unset GIT_INDEX_FILE && rm -f .git/index.tmp && git update-ref refs/heads/<branch> "$COMMIT" \
    && git push -u origin <branch> && gh pr create --base main --head <branch> --title ... --body-file ...
  ```
  After merge: `git checkout -- <the files you edited>` then `git pull --ff-only origin main`.
  Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`;
  PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- CI (`.github/workflows/build.yml`) fails any commit whose `dist/` differs from a
  fresh build, so the journal-stamp commit MUST include the rebuilt `dist/`.
- GitNexus: `impact` before editing any symbol, `detect_changes` before
  committing (CLAUDE.md). Index is 5 commits behind (c833b33); do not run
  `analyze` reflexively — CLAUDE.md § "GitNexus index" explains the cost and the
  stale-lock trap.
- `tools/restore-lockfile.mjs` runs inside the build on the host; nothing to do.
- A build wipes `dist/`; tell any peer session before building.

## The cutover sequence — do it in this order

**A. Pre-flight (inline + Workflow 1 running in the background)**
1. `ListAgents`; if `hymt-site-b7` is live, tell it you own the panels; ask for its
   gate results. Read any reply that arrives.
2. `git fetch && git status` — expect `main` at 2dbd14d or later, clean apart from
   AGENTS.md/CLAUDE.md.
3. Launch **Workflow 1** (§ "Workflows to run"). Do not wait for it; read it before step D.

**B. Search Console Domain property (#96) — under u/3 mark@hymtravel.com**
1. `https://search.google.com/search-console/welcome?authuser=3` → Domain →
   `hymtravel.com` → copy the TXT (`google-site-verification=…`). Do NOT
   verify or add the `hostingersite.com` host anywhere, ever.
2. Wix → Manage DNS records → add TXT on `@` with that value (keep the existing
   one). Confirm via DoH: `q hymtravel.com TXT` shows both.
3. Back in GSC → Verify. Then Settings → Users and permissions → add
   `devinp.sole@gmail.com` as **Owner**.
4. Bing Webmaster Tools → Import from GSC.
5. Record the TXT value in #96 as "recorded privately" (repo is public — do not
   paste it) and in the user's private snapshot (tell them the value in chat).

**C. Attach the domain in hPanel (#99 item 3)**
1. hPanel → the web app → **Connect domain** → `hymtravel.com`. Read every
   screen before clicking; if Hostinger offers "transfer" or "buy", decline —
   we only connect an existing domain. If it demands Hostinger nameservers
   before it will show records, read the Hostinger article
   `https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/`
   and record exactly what it shows.
2. Record from hPanel: the web target (A-record IP(s) and/or CNAME target) for
   apex and `www`, and the two Hostinger nameservers. Put them in #99.
3. In Hostinger's DNS zone for `hymtravel.com` (hPanel → Domains → DNS / Name
   Servers), make it a clone of the Wix table above with only the web target
   changed: A `@` → Hostinger IP; `www` → Hostinger target; MX ×5 with
   priorities; SPF TXT; BOTH google-site-verification TXTs; `_dmarc` TXT. No
   `en`. Delete any Hostinger default records that conflict (parking A/CNAME,
   Hostinger MX, `_domainkey` placeholders). Query each Hostinger nameserver
   directly via DoH-equivalent (`curl "https://dns.google/resolve?name=…"`
   cannot target a server; use `nslookup … <hostinger-ns>` and accept that
   port 53 may be intercepted — if the answers are Wix's, that is the intercept
   talking, not Hostinger; note it and rely on the hPanel zone view).

**D. Final build (§ 4.1) — journal stamp, release SHA**
1. Tell the peer (if live) you are building.
2. `node tools/set-journal-dates.mjs --date $(date +%F)` (local Pacific date at
   that moment — the day the posts go live; never a future date, the
   `sitemap-future-lastmod` guard would fail the build).
3. `npm run build` → green, `123 pages verified`, `dist/` regenerated.
4. Commit src + dist via plumbing, PR, wait for CI green, merge. Record the
   merge SHA = **release SHA**. Watch hPanel Deployments until that SHA is
   Completed/Current; `npm run verify:remote` clean; sitemap lastmods still a spread.
5. hPanel → Cache → **Clear cache** (§ 4.1b), then GET (not HEAD) one image on
   staging and confirm `x-hcdn-cache-status` is MISS/fresh.
6. Read Workflow 1's result. Any BLOCKER → fix first. Post the go/no-go on #31.

**E. The web switch (§ 4.2, at Wix)**
1. Wix DNS: change the three `@` A records to the Hostinger target (delete
   the extra two if Hostinger gives one IP); change `www` CNAME to the
   Hostinger target; **delete `en`**. Leave MX/SPF/TXT/DMARC untouched.
   Re-check the TTL dropdown after changing the value — it may now allow 300.
2. Timestamp it (UTC) in #32. Rollback = put the Wix values from the table back.
3. hPanel → Security → SSL for `hymtravel.com` + `www` (Let's Encrypt). Wait
   for issue; confirm the cert covers **both** names.
4. Discriminator before trusting anything: `curl -s https://www.hymtravel.com/ | grep -o "<title>[^<]*"`
   must read `Hit Your Mark Travel — Bespoke Luxury Journeys`. Until it does
   you are still measuring Wix.
5. Run the § 4.3/4.4 checks (Workflow 2 does the exhaustive version):
   ```bash
   for u in http://hymtravel.com/ http://www.hymtravel.com/ https://hymtravel.com/ https://www.hymtravel.com/; do printf '%-32s ' "$u"; curl -s -o /dev/null -w '%{http_code} %{num_redirects} hops -> %{url_effective}\n' -L "$u"; done
   curl -sI https://www.hymtravel.com/ | grep -iE "x-robots|strict-transport|content-security"   # NO noindex; HSTS present
   curl -s https://www.hymtravel.com/robots.txt | head -5                                          # the repo's file, sitemap-index pointer
   curl -s -o /dev/null -w '%{http_code}\n' https://www.hymtravel.com/nonexistent                  # 404
   curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' https://www.hymtravel.com/trips      # 301 one hop
   export PATH="/c/Users/reach/AppData/Local/nvm/v24.16.0:$PATH"; npm run verify:prod
   ```
   `X-Robots-Tag: noindex` on production = fix within minutes or roll back.
6. Submit Plan Your Trip once through the live domain; confirm arrival in
   Mark's inbox (Gmail u/3 tab). GA4 realtime shows the visit.

**F. Nameserver delegation (same day, only after E passes)**
1. Wix → domain row → the nameserver / "Transfer away" area shows the NS
   settings; replace `ns4/ns5.wixdns.net` with the two Hostinger nameservers
   recorded in C. Do NOT unlock/transfer the registration.
2. During propagation (24–48 h possible), both zones must answer the same
   for MX/SPF/DMARC/TXT — that is what step C.3 guaranteed. Re-check via DoH
   hourly for the first hours; `q hymtravel.com NS`.
3. Rollback for this step is slow (NS TTL 86400): put `ns4/ns5.wixdns.net`
   back. Keep Wix hosting and its zone intact for ≥ 7 days.

**G. Search engines (§ 4.5)**
GSC (still verified? check) → Sitemaps → submit
`https://www.hymtravel.com/sitemap-index.xml`; URL Inspection → Request
indexing on `/`, `/about/`, `/plan-your-trip/`, `/destinations/`,
`/experiences/`, `/travel-journal/`, `/faq/` + three strongest destinations;
Bing → submit sitemap; Rich Results Test on one page per type (home,
destination, experience, journal, FAQ) — fills the RRT column in
`docs/seo/validation-log.md`.

**H. Post-cutover Workflow 2**, then the records:
- Web3Forms dashboard: domain restriction → `www.hymtravel.com`; rate limits.
- Comment + close: #96, #99, #32, #33, #31, #79 (HSTS live). Close milestone
  M5 (`gh api -X PATCH repos/soleman23/hymt/milestones/6 -f state=closed`).
  Move nothing else; #100 (CSP enforce), #34/#35/#37/#38 stay in M6.
- Update memory: `hymt-launch-state-2026-09-01.md`, `hymt-dev-site-auto-deploy.md`
  (production now this repo), MEMORY.md lines.
- Tell the user: renew the Hostinger plan; enable DKIM in Google Admin; the
  seven-day gate before registrar transfer / Wix cancellation (#99 item 8,
  runbook § 4.7); raise HSTS to a year after both certs are confirmed.

## Workflows to run (ultracode)

Invoke the `workflow-authoring` skill, then author these. Agents must be
READ-ONLY on the repo (no builds, no git writes, no `nvm`), use DoH for DNS,
and may hit staging/production over HTTP freely (122 pages is small).

**Workflow 1 — pre-cutover verification + adversarial plan review** (run at step A.3):
finders in parallel, each with a JSON schema `{findings:[{severity: blocker|high|medium|low|info, title, evidence, fix}], checked:[...]}`:
1. Crawl every sitemap URL on staging: 200, canonical == `https://www.hymtravel.com<path>`, one `<h1>`, unique title+description across the set, body byte-identical to `git show HEAD:dist/<path>/index.html`.
2. Every `<img>` in `dist/` has alt/width/height/decoding; every internal href resolves in `dist/`; every referenced asset (img, css, font, og:image) returns 200 on staging.
3. Redirect and header audit on staging + a static read of `public/.htaccess` predicting production-host behaviour (IS_PROD matcher, HSTS, staging X-Robots env, `%{HTTPS}` behind the CDN — no loop).
4. DNS/mail skeptic: refute the zone-clone plan (MX, SPF, DMARC TTL 600, both GSC TXTs, `en` deletion, DNSSEC absent, NS TTL, rollback); read the Hostinger support article on connecting a custom domain to a Node.js web app and state exactly what records Hostinger expects and whether its nameservers are mandatory.
5. Forms/CSP/analytics skeptic: Web3Forms endpoint in `connect-src`/`form-action`, honeypot, GA4 host guard, privacy policy names the stack.
6. SEO skeptic: `dist/robots.txt`, sitemap all-www-https, no `noindex` meta anywhere, every page's JSON-LD parses, BreadcrumbList present, og:image 1200×630.
7. Runbook skeptic: diff the sequence above against LAUNCH-RUNBOOK §§ 3–5 and #99/#32 and list any gap.
Then: adversarial verify of every blocker/high (2–3 refuters each, cap ~10 verify agents, `log()` what was dropped), then one synthesis agent producing the ordered go/no-go list. Post the synthesis on #31.

**Workflow 2 — post-cutover verification** (run after step E.5 and again after F): all 122 sitemap URLs on `https://www.hymtravel.com` → 200 + canonical + no `X-Robots-Tag`; the four hop checks; robots/sitemap/404; HSTS present; both certs valid (`openssl s_client` or curl `-v`) for apex and www; the two Wix redirects single-hop; DoH answers for MX/SPF/DMARC/TXT unchanged vs the table; Rich Results Test by URL per page type; a completeness critic. Post the result on #33.

## Things that will look wrong and are not

- `npm run verify:prod` passes against the Wix site too — it only proves a host
  returns HTML. Use the title discriminator.
- Staging robots.txt is a 58-byte Googlebot disallow — Hostinger's preview-host
  guard at the edge, not the repo file. Production must show the repo file.
- `sitemap-index.xml` fetched without a cache-buster can be a stale CDN copy; add `?cb=$(date +%s)`.
- `gh api repos/soleman23/hymt/hooks` is empty and that is fine — Hostinger's
  GitHub integration does not register a repo webhook.
- Near-zero impressions, "Discovered – currently not indexed", "Couldn't fetch"
  in the first day: normal (runbook § 7).

## Definition of done

`https://www.hymtravel.com/` serves the Astro build over a valid certificate,
apex and http variants land on it in ≤ 1 hop (≤ 2 for http apex), no
`X-Robots-Tag` on production, HSTS present, robots.txt and
sitemap-index.xml are the repo's, all 122 URLs 200, forms deliver to
mark@hymtravel.com, GA4 realtime shows a visit, GSC Domain property verified
and sitemap submitted, Bing imported, nameservers at Hostinger with mail
records intact, #31/#32/#33/#96/#99/#79 closed with evidence, M5 closed.
