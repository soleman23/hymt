# Hit Your Mark Travel — hymtravel.com

Complete rebuild of the Hit Your Mark Travel website (bespoke luxury travel advisory, Mark Sole).
Two deployable versions of the same site live in this repo, plus the full build pipeline.

## Repo layout

| Path | What it is |
|---|---|
| `src/` | Astro 5 source — layouts, components, page wrappers, content partials |
| `tools/` | Build pipeline (source HTML → Astro pages), image manifest, `restore_images.py` |
| `public/` | Static assets served at site root (`robots.txt`, `sitemap.xml`) |
| `dist/` | **The finished static site — 89 pages + custom 404, ready to upload to any static host** |
| `wordpress-theme/hym-travel/` | WordPress theme version of the same design system |
| `images-b64/` | All 49 site images as base64 text (see below) |
| `docs/` | Hostinger deployment guide + image production checklist |

> **This repository is now the complete, single source of truth.** It holds the
> full build pipeline (`tools/`), every generated page source, the `dist/` output,
> and `images-b64/`. Clone it, run `python3 tools/restore_images.py`, and you have
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
python3 tools/restore_images.py
```

This reconstructs every image into `public/assets/`, `dist/assets/`, and
`wordpress-theme/hym-travel/assets/` (verified by hash against the originals).
The restored paths are gitignored — images stay as `images-b64/` in the repo.

## The static site (`dist/`)

89 pages, fully linked, SEO meta/canonicals/JSON-LD in place, sitemap + robots included:

- Homepage with 4-slide rotating hero, category grid, featured journey
- 13 experience pages, 39 destination pages (9 regional hubs + 30 deep-dives)
- 29 journal articles + journal hub with featured card
- About, FAQ, Contact, Plan Your Trip (inquiry form with `?type=` pre-selection)
- Privacy Policy, Terms & Conditions, custom 404
- 47 AI-generated brand images (golden-hour editorial, no faces, no text)

**Deploy:** upload the contents of `dist/` to Hostinger `public_html` (after running
`restore_images.py`). Full guide: `docs/hostinger-deployment.md`.

## Rebuilding from source

```bash
npm install
python3 tools/generate.py          # converts source pages
python3 tools/home_and_routes.py   # homepage + new routes
python3 tools/final_pages.py       # legal pages, sitemap, robots, plan page
npx astro build                    # → dist/
python3 tools/restore_images.py    # ← MUST be re-run AFTER every build
```

> **Run `restore_images.py` after `astro build`, not just after cloning.**
> The build regenerates `dist/` from scratch, which deletes the 11 aliased
> images it writes straight into `dist/assets/` (see `images-b64/ALIASES.json` —
> `africa-safari.jpg`, `europe-landscape.jpg`, `willamette-vineyard.jpg` and
> friends). Those aliases are referenced by the destination hub pages, so
> skipping this step ships a site with broken images and nothing in the build
> output warns you.

## WordPress theme

Upload `wordpress-theme/hym-travel` as a zip (Appearance → Themes → Add New → Upload).
Includes front page, 9 page templates, journal-as-posts article design, and a
Web3Forms key setting under Settings → General. Setup details in the deployment guide.

## Forms

All forms (Plan Your Trip, Contact, newsletter) use [Web3Forms](https://web3forms.com).
The live access key is already in place across all 87 form-bearing pages and
submissions have been tested end-to-end — they deliver to mark@hymtravel.com.

Web3Forms access keys are public by design (they ship in client-side HTML), so the
key lives in the source rather than in an environment variable. To rotate it,
replace the string in `src/components/Newsletter.astro`,
`src/content-pages/plan-your-trip.html`, `src/content-pages/contact.html` and
`wordpress-theme/hym-travel/inc/template-tags.php`, then rebuild.

**Plan Your Trip** is a 4-step inquiry flow (Experience → When & Who → Your Vision
→ Contact) with client-side validation and a branded in-page success state — it
never redirects to a generic Web3Forms confirmation page.

## Brand

Navy/gold editorial design system (Raleway + DM Sans), Seller of Travel
CA 2165910-50 · WA 605920581 · FL ST46122.
