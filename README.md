# Hit Your Mark Travel — hymtravel.com

Complete rebuild of the Hit Your Mark Travel website (bespoke luxury travel advisory, Mark Sole).
Two deployable versions of the same site live in this repo, plus the full build pipeline.

## Repo layout

| Path | What it is |
|---|---|
| `src/` | Astro 5 source — layouts, components, page wrappers, content partials |
| `tools/` | Build pipeline (source HTML → Astro pages), image manifest, `restore_images.py` |
| `public/` | Static assets served at site root (`robots.txt`, `sitemap.xml`) |
| `dist/` | **The finished static site — 98 pages, ready to upload to any static host** |
| `wordpress-theme/hym-travel/` | WordPress theme version of the same design system |
| `images-b64/` | All 49 site images as base64 text (see below) |
| `docs/` | Hostinger deployment guide + image production checklist |

> **Note:** the browsable tree here holds the site's core source (theme, layouts,
> components, styles, configs, docs, image-restore tooling). The complete tree —
> full build pipeline (`tools/`), all 98 generated page sources, `dist/` output, and
> `images-b64/` — ships as `hymt-complete-repo.zip` (see the release notes / project
> handoff). Unzip it over a clone of this repo, run `python3 tools/restore_images.py`,
> and you have the entire site locally.

## First step after cloning: restore images

Binary images can't be committed through the tooling that maintains this repo, so the
49 site images (47 generated JPGs + logo + family photo) are stored as base64 text in
`images-b64/`. Restore them with one command:

```bash
python3 tools/restore_images.py
```

This reconstructs every image into `public/assets/`, `dist/assets/`, and
`wordpress-theme/hym-travel/assets/` (verified by hash against the originals).
The restored paths are gitignored — images stay as `images-b64/` in the repo.

## The static site (`dist/`)

98 pages, fully linked, SEO meta/canonicals/JSON-LD in place, sitemap + robots included:

- Homepage with 4-slide rotating hero, category grid, featured journey
- 10 experience pages, 39 destination pages (9 regional hubs + 30 deep-dives)
- 29 journal articles + journal hub with featured card
- About, FAQ, Contact, Plan Your Trip (inquiry form with `?type=` pre-selection)
- Privacy Policy, Terms & Conditions, 404
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
```

## WordPress theme

Upload `wordpress-theme/hym-travel` as a zip (Appearance → Themes → Add New → Upload).
Includes front page, 9 page templates, journal-as-posts article design, and a
Web3Forms key setting under Settings → General. Setup details in the deployment guide.

## Forms

All forms (Plan Your Trip, Contact, newsletter) use [Web3Forms](https://web3forms.com)
with the placeholder key `YOUR_WEB3FORMS_KEY`. Replace it with the real key (free,
emails go to mark@hymtravel.com) — one string across the site.

## Brand

Navy/gold editorial design system (Raleway + DM Sans), Seller of Travel
CA 2165910-50 · WA 605920581 · FL ST46122.
