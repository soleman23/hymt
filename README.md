# Hit Your Mark Travel — hymtravel.com

Complete rebuild of the Hit Your Mark Travel website (bespoke luxury travel advisory, Mark Sole).
Two deployable versions of the same site live in this repo, plus the full build pipeline.

## Repo layout

| Path | What it is |
|---|---|
| `src/` | Astro 5 source — layouts, components, page wrappers, content partials |
| `tools/` | Build pipeline (source HTML → Astro pages), image manifest, `restore_images.py` |
| `public/` | Static assets served at site root (`robots.txt`, `sitemap.xml`) |
| `dist/` | **The finished static site — 93 pages + custom 404, ready to upload to any static host** |
| `images-b64/` | All 92 site images as base64 text (see below) |
| `docs/` | Hostinger deployment guide + image production checklist |

> **This repository is now the complete, single source of truth.** It holds the
> full build pipeline (`tools/`), every generated page source, the `dist/` output,
> and `images-b64/`. Clone it, run `npm run restore`, and you have
> the entire site locally — no separate archive required.
>
> Earlier revisions of this README pointed at a `hymt-complete-repo.zip` handoff
> archive because binary-heavy content was kept out of the repo. That is no longer
> the case; the zip is superseded and should not be treated as authoritative.

## First step after cloning: restore images

The 49 site images (47 generated JPGs + logo + family photo) are stored as base64
text in `images-b64/` — a constraint of the tooling that maintains this repo.
Restore them to real binaries with one command:

```bash
npm run restore
```

That runs `tools/restore-images.mjs`, which finds the local Python interpreter
itself (`python3` on mac/linux, `python` on Windows) and runs
`tools/restore_images.py` with it.

This reconstructs every image into `public/assets/` and `dist/assets/`.
The restored paths are gitignored — images stay as `images-b64/` in the repo.

## Building and verifying

`npm run build` is self-contained: `astro build`, then the image restore
(`tools/restore-images.mjs`), then `tools/verify-deployment.mjs`, which
fails the build on the mistakes this repo has actually shipped before:

- a page under `src/pages/destinations/` that leaves `DestinationLayout` or
  reintroduces its own `pageCss` (all 42 share `src/styles/destination.css`;
  experiences and journal posts likewise share one sheet each, and the
  components destinations and experiences hold in common — breadcrumb, buttons,
  intro, seasons, testimonial, Mark's note, page FAQ — live in
  `src/styles/section-shared.css`, imported before the section sheet)
- double-escaped HTML entities — page copy contains literal `&#39;`/`&amp;`, so a
  title passed as a JS string instead of a template attribute ships as `&amp;#39;`
- an asset referenced by a built page that is missing from `dist/`, including the
  aliased images `astro build` wipes on every run
- a change to any page's `<title>`, meta description or canonical

That last check compares against `tools/head-baseline.json`. When a change is
intentional, accept it explicitly:

```bash
node tools/verify-deployment.mjs --update-baseline
```

`astro build` deletes the aliased images; `npm run build` re-restores them
itself. If you run `npx astro build` directly, follow it with `npm run restore`
— the verifier will stop you if you forget. After deploying, confirm the
upload actually landed (the FTP account does not start in the web root):

```bash
npm run verify:remote
```

That checks `brown-goose-754147.hostingersite.com`, which is where deploys
actually go. **`www.hymtravel.com` is not pointed at this host yet** — the DNS
cutover has not happened, so nothing in this repo is live on the production
domain. `npm run verify:prod` targets that domain and will report failures on
every clean URL until the cutover; it is there for after it happens.

## The static site (`dist/`)

94 pages, fully linked, SEO meta/canonicals/JSON-LD in place, sitemap + robots included:

- Homepage with 4-slide rotating hero, category grid, featured journey
- 12 experience pages, 42 destination pages (9 regional hubs + 33 deep-dives)
- 29 journal articles + journal hub with featured card
- About, FAQ, Contact, Plan Your Trip (inquiry form with `?type=` pre-selection)
- Privacy Policy, Terms & Conditions, custom 404
- 92 AI-generated brand images (golden-hour editorial, no faces, no text)

**Deploy:** upload the contents of `dist/` to Hostinger `public_html` (after a
clean `npm run build`). Full guide: `docs/hostinger-deployment.md`.

## Rebuilding from source

Run these two, in order, from the repo root:

```bash
npm install
npm run build     # → dist/ (astro build + image restore + verifier)
```

That is all you need. `src/pages/` and `src/content-pages/` are committed, so
Astro builds the whole site from them, and the build restores the images and
verifies itself.

**On Windows PowerShell 5.1**, `&&` is not a statement separator — run the two
lines one at a time, or chain with:

```powershell
npm install; if ($?) { npm run build }
```

<details>
<summary>The one-time <code>tools/*.py</code> generation scripts (legacy)</summary>

`tools/generate.py`, `home_and_routes.py` and `final_pages.py` were used once to
convert the original hand-built HTML into Astro pages. **They cannot be re-run
here:** `tools/convert.py` hardcodes `UP = "/mnt/agents/upload"`, the upload
directory of the environment the site was originally built in. That path does
not exist on a normal machine, so the scripts would find no source files.

They are kept for reference only. Edit `src/pages/` and `src/content-pages/`
directly instead — those are the real source now.
</details>

> **The image restore must follow every `astro build` — `npm run build` does it
> automatically; a direct `npx astro build` needs `npm run restore` after.**
> The build regenerates `dist/` from scratch, which deletes the 11 aliased
> images it writes straight into `dist/assets/` (see `images-b64/ALIASES.json` —
> `africa-safari.jpg`, `europe-landscape.jpg`, `willamette-vineyard.jpg` and
> friends). Those aliases are referenced by the destination hub pages, so
> skipping this step ships a site with broken images and nothing in the build
> output warns you.

## Forms

All forms (Plan Your Trip, Contact, newsletter) use [Web3Forms](https://web3forms.com).
The live access key is wired in exactly three places — `Newsletter.astro` (which
puts the newsletter form on nearly every page), `plan-your-trip.html`, and
`contact.html` — and submissions have been tested end-to-end; they deliver to
mark@hymtravel.com.

Web3Forms access keys are public by design (they ship in client-side HTML), so the
key lives in the source rather than in an environment variable. To rotate it,
replace the string in `src/components/Newsletter.astro`,
`src/content-pages/plan-your-trip.html` and `src/content-pages/contact.html`,
then rebuild.

**Plan Your Trip** is a 4-step inquiry flow (Experience → When & Who → Your Vision
→ Contact) with client-side validation and a branded in-page success state — it
never redirects to a generic Web3Forms confirmation page.

## Brand

Navy/gold editorial design system (Raleway + DM Sans), Seller of Travel
CA 2165910-50 · WA 605920581 · FL ST46122.
