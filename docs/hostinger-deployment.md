# Hit Your Mark Travel — Hostinger Deployment Guide

The deliverable is a static site: 122 pages plus a custom 404 (123 built HTML
files), ready to serve. Derive that rather than trusting it —
`grep -o "<loc>" dist/sitemap-0.xml | wc -l` — every count in this file has
rotted at least once.
The production source of truth is `soleman23/hymt`. Hostinger builds the static
Astro site from GitHub and serves the generated `dist/` directory.

---

## Deploy the static site

### 1. GitHub deployment (primary)

Keep the site on `brown-goose-754147.hostingersite.com` until its staging gate
passes. In hPanel, the web app settings must be:

| Setting | Required value |
|---|---|
| Repository | `soleman23/hymt` |
| Branch | `main`, after the intended release PRs are merged |
| Framework | Astro |
| Node.js | **24.x**. Not `22.x` — see below |
| Build command | `npm run build` |
| Output directory | `dist` |

The floor is **Node 22.19.0**, and it is not Astro's. `npm ci` enforces
`engines.node` for every package it installs, so the version that governs is
the strictest floor anywhere in the tree — today that is `undici`, reached
through `astro` → `unifont`. Astro's own floor is the lower `>=22.12.0`, and
reading that one is what produced the wrong setting here.

**Do not select `22.x`.** It is a floating track: on 2026-08-29 it resolved to
**v22.18.0**, one patch below the real floor, and the deployment failed in
`npm ci` with `EBADENGINE` on undici before Astro ever ran — 17 lines of build
log and no page built. hPanel's analysis of that failure recommends "22.19.0 or
higher", which is true but leaves you on the same floating track that moved
underneath the site once already. **Select `24.x`**: it is comfortably above
the floor and it matches the Node the site is actually built and verified on
locally (24.16.0), so the deploy host and the build machine stop being two
different environments.

`package.json` `engines.node` and the root entry of `package-lock.json` both
carry the floor, `tools/check-node.mjs` runs first in `npm run build` and
prints it, and `tools/verify-deployment.mjs` § 4d fails the build if a
dependency ever raises the real floor above what those declare. That check is
what turns the next occurrence of this into a red local build instead of a red
deployment.

#### The host's install rewrites `package-lock.json`

hPanel runs an install of its own before it runs the build command, and on
2026-09-01 that install was **not** `npm ci`. Two numbers in its own log say so:

| | hPanel, 2026-09-01 | this lockfile on Linux |
|---|---|---|
| install summary | `added 290 packages, and audited 291 packages` | `added 193 packages, and audited 194 packages` |
| funding line | `105 packages are looking for funding` | `70 packages are looking for funding` |

The right-hand column is not an estimate — it is what `npm ci` printed in GitHub
Actions on `ubuntu-latest` for the same commit. 290 added with **none skipped**
only happens when nothing in the lockfile says which platform a package is for:
that install had stripped every `libc`, `os` and `cpu` field out of
`package-lock.json` in the build directory. `npm ci` never rewrites that file,
which is why CI was green on the identical commit the whole time.

Nothing was wrong with the repository, and this had been true for as long as
the site has deployed from GitHub. It only became fatal on **2026-08-28**, when
two changes landed 2h27m apart:

| time | commit | effect |
|---|---|---|
| 13:45 | `46b7211` upgrade Astro | the lockfile gains `libc` for the first time in this era — 34 entries where the astro 5 lockfile had **none** |
| 16:12 | `165ff5f` fail the build on stripped metadata | adds both lockfile checks |

Before 13:45 the host could strip a field that was not there. Before 16:12
nothing looked. After both, every deploy carried a check that the host's own
install was guaranteed to fail. The 2026-08-29 deploy died earlier still, on
`EBADENGINE`, which masked it for another day; once the Node floor was fixed the
build got far enough to reach the lockfile guard and stopped there.

**No hPanel change is needed.** `tools/restore-lockfile.mjs` runs early in
`npm run build` and puts the missing platform fields back before anything reads
the lockfile.

It **patches in place rather than reverting**, which matters here: the host's
install does not merely strip fields, it re-resolves the tree, so its lockfile
also differs from `HEAD` by an added or removed package. An earlier version
reverted the whole file and refused to run when anything else had changed — the
2026-09-01 23:30 build log read `lost 34 platform field(s) AND carries real
changes ... Refusing`, and the deploy died on a repair that was declining to
act. The patch only ever adds platform values back onto entries that are the
same artifact in both files, so there is no shape it has to refuse and nothing
it can discard.

A healthy deploy log shows the restore line, then the right-hand column above,
then `ok  package-lock.json keeps its platform metadata — 293 of 293 HEAD
entries compared`, and ends on `ok  123 pages verified`.

The host installing ~100 binaries for platforms it will never run — every musl
and arm64 variant of sharp, lightningcss and rolldown — is cosmetic waste, not a
failure. If you ever *can* change the build command, `npm ci && npm run build`
stops it and makes the deployed tree the one this repo pins.

Restoring the lockfile also stops the host installing roughly 100 binaries for
platforms it will never run — every musl and arm64 variant of sharp,
lightningcss and rolldown — and makes the deploy reproducible, because the tree
it ships is then the one this repo pins.

Use the website dashboard's **Change repository** flow if hPanel names any
other repository. Review the overwrite warning, then start a new deployment.
Record the deployed commit SHA and retain the full successful build log.

The 2026-08-27 audit found the temporary site connected to the obsolete
`soleman23/hymtwebsite` repository at `acbba39b`; its three 2026-07-30 rebuilds
all failed with a Rollup native-module/GLIBC error. Do not patch or deploy that
repository as a substitute for switching the source to `soleman23/hymt`.

After the deployment, confirm that the temporary URL serves that exact commit,
then run `npm run verify:remote`. Inspect `.htaccess`, `robots.txt`, the sitemap,
the two Wix migration redirects, and at least one version-specific page/title.
Changing the repository is tracked and gated in #114.

### 1a. Manual upload (fallback only)

Use this only if Hostinger's GitHub deployment is unavailable and record why in
the launch issue. Do not alternate between GitHub deployments and manual files;
that makes the deployed commit and stale-file behavior unknowable.

1. Build locally on Node 22.19 or newer: `npm ci && npm run build`. The build
   machine's default is 20.19.0, which `tools/check-node.mjs` rejects in
   milliseconds — put a supported Node first on PATH for the command rather
   than running `nvm use`, which moves a machine-wide symlink (CLAUDE.md § Node
   and npm).
2. Hostinger hPanel → **Files → File Manager** → open `public_html`.
3. Upload a zip containing the **contents** of `dist/`.
4. Extract it directly into `public_html`; do not leave an extra `dist` folder.
5. Confirm hidden file `public_html/.htaccess` exists and read a deployed file
   back before treating the upload as successful.

(Alternative: FTP with the credentials in hPanel → Files → FTP Accounts.)

> ### ⚠️ FTP: the web root is NOT where FTP drops you
>
> hPanel lists the upload folder as `public_html`, but the FTP account logs in
> to the **home directory**, which has no `public_html` in it. The served web
> root is nested:
>
> ```
> domains/<your-domain>/public_html
> ```
>
> Uploading to the login root instead puts a full copy of the site in the home
> directory where **nothing serves it**. Every file reports success and the live
> site simply never changes — which looks exactly like a CDN caching problem and
> will send you chasing cache purges that do nothing.
>
> **Never treat "upload succeeded" as proof of deployment.** Verify by reading a
> file back off the server, and by checking that the `Last-Modified` header on
> `sitemap.xml` actually moves.

> **`.htaccess` is already included** at the zip root. It forces HTTPS, redirects the apex domain → `www.hymtravel.com` (matching every canonical, `og:url` and sitemap entry), enables gzip compression, sets long cache lifetimes on your images, adds security headers, and routes the custom 404 page. Hostinger runs LiteSpeed, which reads `.htaccess` — no extra config needed. Just make sure it extracts into `public_html` with everything else (it's a hidden dotfile, so enable "show hidden files" in File Manager to see it).
>
> The apex → www rule is deliberately scoped to `hymtravel.com`. A blanket
> "force www" rule would redirect the `*.hostingersite.com` preview domain to a
> hostname that does not exist, breaking the preview site.

### 1b. Purge the CDN cache

**A completed build or upload is not proof of fresh edge content.** Hostinger fronts the site with a CDN
(`server: hcdn`), and static assets are cached at the edge. After any upload
or deployment that changes an existing image, font or stylesheet URL, purge the CDN cache in hPanel or
visitors keep getting the old file.

Two clean `582/582` uploads on 2026-08-18 changed nothing that anyone could
see. Only the purge did. Full write-up in #107.

Check a **GET**, not a HEAD — HEAD reaches origin and hides the problem:

```bash
curl -s -D - -o /dev/null <url>/assets/img/<file>.jpg | grep -i "x-hcdn-cache-status"
```

`HIT` after a purge-and-reupload means the purge did not take.

**A purge is only needed when the bytes behind an EXISTING url changed.**
Adding new files, or renaming, cannot go stale — a url the edge never
cached is fetched from origin. Confirm before assuming: diff
`images-b64/MANIFEST.json` against the last deployed commit and look for a
`target` whose `bytes` changed. On 2026-08-18's deploy that was 73 added, 2
removed and **0 changed in place**, so no purge was required, and the new
crops came back `x-hcdn-cache-status: MISS` at byte-exact size.

### 1c. Prune files the build no longer ships

**An upload never removes anything.** A renamed or deleted asset stays on
the server, answering 200, referenced by nothing — and it will be carried to
production at cutover unless it is pruned.

`deploy-to-hostinger.ps1` has a `$StaleFiles` list for this. Entries are
web-root-relative with forward slashes, and are safe to leave in place
permanently: a file already gone reports "not on server (fine)", and the
loop refuses to delete anything that exists in `dist/`, so a wrong entry
cannot remove a file the build actually ships.

Currently listed:

```
sitemap.xml                             (replaced by sitemap-index.xml)
assets/willamette-vineyard.jpg          (renamed in 4610eaf)
assets/img/jc-willamette-vineyard.jpg   (renamed in 4610eaf)
```

**That list lives only in the working copy.** The four `*.ps1` deploy scripts
are gitignored on purpose — they embed the FTP host and username and this
repository is public (see `.gitignore`). So the script cannot carry this
knowledge between machines; this section is the tracked copy. **If the deploy
script is ever recreated, restore the entries above**, and add any future
rename here at the same time as the rename.

Find orphans by listing the server and diffing against `dist/`, or from a
rename's own commit: anything in `images-b64/MANIFEST.json` at the previous
deployed commit whose `target` is absent now is a candidate.

### 2. Point the domain

`hymtravel.com` currently uses Wix for registration, DNS and the production
website. The final state is complete Wix separation, but website cutover, DNS
delegation and registrar transfer are separate gates:

1. Attach `hymtravel.com` to this existing Hostinger site. Record the exact
   nameservers and web target shown in this site's hPanel; never infer them from
   the shared `hostingersite.com` preview hostname.
2. Export or screenshot the complete Wix zone privately. Clone every record
   into Hostinger: all five Google Workspace MX records with priorities, SPF,
   DMARC, GSC verification, any DKIM/CAA/SRV records, and every discovered
   subdomain. Query each Hostinger authoritative nameserver directly and diff
   its answers against Wix before delegation.
3. Lower the current Wix web-record TTLs to 300 at least 48 hours ahead. This
   improves web-record rollback but does not shorten parent nameserver caches;
   a delegation change can still take 24–48 hours.
4. At cutover, point the Wix-hosted web records to the exact Hostinger target
   first. Verify the Hostinger site, SSL, redirects, forms and production robots
   behavior, then change the registrar nameservers to Hostinger. Keeping both
   zones equivalent prevents resolvers on old and new delegation paths from
   seeing different mail or verification records.
5. Keep Wix hosting and its DNS zone intact through the rollback window. After
   Hostinger DNS, SSL, Google Workspace and GSC have been stable for at least
   seven days, transfer the registrar to Hostinger. Only then cancel Wix and
   remove the Wix site.

### 3. SSL (HTTPS)
hPanel → **Security → SSL** → Install the **free Let's Encrypt** certificate on the domain. Hostinger's "Force HTTPS" toggle and the `.htaccess` redirect both do the same job — enable the hPanel toggle and the site's HTTPS is locked in from every angle. Verify `https://www.hymtravel.com` loads with the padlock.

### 4. Forms (Web3Forms key) — already done
The real Web3Forms access key is **already baked into every form** — 120 of the
123 built files carry it. The three that do not are `404.html`,
`/privacy-policy/` and `/terms-and-conditions/`, which ship no newsletter by
design. No placeholder remains and no post-upload find/replace is needed.

**Derive this rather than trusting it** — the number has been wrong in this file
twice, both times because new pages landed after someone wrote it down:
`grep -rl '94312057' dist --include='*.html' | wc -l`.

Web3Forms keys are not secrets — they are public by design, since the key sits in
client-side HTML on every page.

> **Submissions are delivered to the wrong address. Fix this before launch (#74).**
> Verified 2026-08-18 by a real staging submission: the mail arrived intact one
> second later, and its **only** recipient was `devinp.sole@gmail.com`. Nothing
> reached **mark@hymtravel.com**, which has never received a submission from this
> site. This is account-level — a Newsletter signup the same day landed at the same
> address — so **all three forms are affected**, silently, with the branded success
> state showing every time.
>
> The fix is the **recipient setting in the Web3Forms dashboard** (§ 4a below). It
> cannot be fixed in code: no recipient field is sent, so delivery follows whatever
> address the key is registered to. **Do not rotate the key to "fix" it** — the
> access key must not change (`CLAUDE.md` § Never do). Once corrected, re-run the
> § 2.3 end-to-end gate *before* enabling the domain restriction, and check Mark's
> spam folder on the first delivery.

If you ever rotate the key, change it in `src/components/Newsletter.astro`,
`src/content-pages/plan-your-trip.html` and `src/content-pages/contact.html`,
then rebuild. Note that `src/content-pages/plan-your-trip.singlestep.bak` also
carries the key — it is gitignored and never reaches `dist/`, but it will not be
updated by a rotation, so do not treat a grep of the working tree as the source
of truth.

#### 4a. Web3Forms dashboard hardening (SEC-1, #74) — human step, ~10 minutes

Because the key is public, anyone can script POSTs straight at the API and
flood the inbox or burn the quota. The code side is done — all three forms now
carry the honeypot and length caps — but the controls that actually stop a
scripted flood live in the Web3Forms dashboard and need a login:

1. **Restrict allowed domains** to `www.hymtravel.com` (add the apex too if the
   UI requires it). This is the single highest-value setting: it rejects
   submissions that did not originate on the site.
2. **Enable a CAPTCHA** — Cloudflare Turnstile is the least intrusive. If you
   turn this on, the forms need a matching widget added to the markup, so tell
   the next session before enabling it.
3. **Enable rate limiting / spam filtering** if the plan offers it.

Verify afterwards with the script rather than hand-rolling a curl — it reads
the key out of `dist/` so it cannot drift from what ships, and it refuses to
send anything without an explicit flag:

```bash
node tools/check-web3forms-hardening.mjs --send
```

**REJECTED is the pass.** An accepted submission means anyone who reads the key
out of the page can post to the inbox — and it also means a real email just
arrived, which is why the flag exists.

Then confirm the other direction by hand, which the script cannot do: submit
Contact, Plan Your Trip and the newsletter through the real UI and confirm all
three still deliver. **Do this before enabling the domain restriction** — a
restriction scoped to `www.hymtravel.com` will reject submissions from the
staging host and make three working forms look broken.

### 5. Post-launch
- Google Search Console → add property → submit `https://www.hymtravel.com/sitemap-index.xml` (the build generates `sitemap-index.xml` + `sitemap-0.xml`; there is no `sitemap.xml` anymore).
- `robots.txt` is already in place.
- Email remains on Google Workspace. Preserve all five MX records, SPF, DMARC,
  GSC verification, and the Google Admin DKIM selector if one exists. Test both
  inbound and outbound mail, including SPF/DKIM/DMARC results in message
  headers, before and after nameserver delegation.

---

## Notes on what was built

- **122 pages** (plus a custom 404), all interlinked, SEO meta/canonicals/JSON-LD in place, `sitemap-index.xml` + `robots.txt` included.
- **596 images** in `images-b64/MANIFEST.json` (602 entries, of which 6 are fonts) — the 92 first produced from your Image Prompt Library, plus the heroes, place-card crops and og:images added since — every destination, experience and journal post now opens on a photograph. All follow the brand rules: golden-hour editorial photography, no faces, no text overlays. See `image-production-checklist.csv` for exactly where each image is used.
- **The About page photo is your real family photo** (from the files you provided) — no fake people anywhere on the site.
- **Forms**: Plan Your Trip + Contact + newsletter all run on Web3Forms (free, no backend needed). The live key is already in place — see step 4.
- **E-commerce/booking**: not included per your call — the structure leaves room to add a booking tool later.
- Phone shown site-wide: (408) 568-1404 · mark@hymtravel.com · Seller of Travel numbers in the footer (CA 2165910-50, WA 605920581, FL ST46122).

## If you want changes
- **Static site**: open the extracted files in Cursor and ask for the change — the design system lives in one stylesheet per page's `<style>` block plus shared CSS. Re-upload changed files.
- Keep a local copy of the unzipped static site as your working master.
