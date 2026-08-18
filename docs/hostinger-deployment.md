# Hit Your Mark Travel — Hostinger Deployment Guide

The deliverable is a static site: 97 pages plus a custom 404 (98 built HTML
files), ready to serve. Derive that rather than trusting it —
`grep -o "<loc>" dist/sitemap-0.xml | wc -l` — every count in this file has
rotted at least once.
Edit the Astro source, run `npm run build`, and upload `dist/`.

---

## Deploy the static site (≈15 minutes)

### 1. Upload
1. Hostinger hPanel → **Files → File Manager** → open `public_html`.
2. Delete Hostinger's default `index.php`/placeholder files.
3. Upload `hymtravel-static-site.zip` into `public_html`.
4. Right-click the zip → **Extract**. The contents (`index.html`, folders like `destinations/`, `assets/`, `sitemap.xml`, `robots.txt`) must sit **directly inside `public_html`** — not in a subfolder. Delete the zip afterward.

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

**Uploading is not deploying.** Hostinger fronts the site with a CDN
(`server: hcdn`), and static assets are cached at the edge. After any upload
that changes an image, font or stylesheet, purge the CDN cache in hPanel or
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
- If `hymtravel.com` is registered **at Hostinger**: hPanel → Domains → assign to this hosting plan. Done.
- If registered elsewhere (e.g. GoDaddy/Namecheap): either change nameservers to Hostinger's (shown in hPanel → Domains → DNS) — simplest — or create an **A record** pointing `@` and `www` to your hosting IP (hPanel → Hosting Details).

### 3. SSL (HTTPS)
hPanel → **Security → SSL** → Install the **free Let's Encrypt** certificate on the domain. Hostinger's "Force HTTPS" toggle and the `.htaccess` redirect both do the same job — enable the hPanel toggle and the site's HTTPS is locked in from every angle. Verify `https://www.hymtravel.com` loads with the padlock.

### 4. Forms (Web3Forms key) — already done
The real Web3Forms access key is **already baked into every form** (95 of the 98
built pages: the newsletter on 94, plus Plan Your Trip, which carries its own form
and no newsletter). No placeholder remains and no post-upload find/replace is
needed. Derive these rather than trusting them:
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

Verify afterwards: a bare `curl -X POST https://api.web3forms.com/submit -d
"access_key=<key>&message=test"` from outside the site should be rejected, while
Contact, Plan Your Trip and the newsletter all still deliver.

### 5. Post-launch
- Google Search Console → add property → submit `https://www.hymtravel.com/sitemap-index.xml` (the build generates `sitemap-index.xml` + `sitemap-0.xml`; there is no `sitemap.xml` anymore).
- `robots.txt` is already in place.
- Email: set up mark@hymtravel.com in hPanel → Emails (or point MX to Google Workspace if you prefer Gmail).

---

## Notes on what was built

- **97 pages** (plus a custom 404), all interlinked, SEO meta/canonicals/JSON-LD in place, `sitemap-index.xml` + `robots.txt` included.
- **474 images** in `images-b64/MANIFEST.json` — the 92 first produced from your Image Prompt Library, plus the heroes, place-card crops and og:images added since — every destination, experience and journal post now opens on a photograph. All follow the brand rules: golden-hour editorial photography, no faces, no text overlays. See `image-production-checklist.csv` for exactly where each image is used.
- **The About page photo is your real family photo** (from the files you provided) — no fake people anywhere on the site.
- **Forms**: Plan Your Trip + Contact + newsletter all run on Web3Forms (free, no backend needed). The live key is already in place — see step 4.
- **E-commerce/booking**: not included per your call — the structure leaves room to add a booking tool later.
- Phone shown site-wide: (408) 568-1404 · mark@hymtravel.com · Seller of Travel numbers in the footer (CA 2165910-50, WA 605920581, FL ST46122).

## If you want changes
- **Static site**: open the extracted files in Cursor and ask for the change — the design system lives in one stylesheet per page's `<style>` block plus shared CSS. Re-upload changed files.
- Keep a local copy of the unzipped static site as your working master.
