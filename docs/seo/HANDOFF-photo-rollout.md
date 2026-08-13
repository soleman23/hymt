# Handoff — place-card photo rollout

Started 2026-08-12, updated at the end of every session since. Paste the
"Prompt" section below into a new Claude Code session in this repo to pick up
exactly here. **Update this file before you finish**, including the Prompt.

---

## Prompt

```
Continue the place-card photo rollout on the HYMT site.

READ FIRST, in this order — do not start work until you have:
  1. docs/seo/HANDOFF-photo-rollout.md   (this file: state, workflow, every
                                          failure mode found so far)
  2. docs/seo/drive-image-skips.md       (§ A closed; § B still open)
  3. CLAUDE.md § "SEO & AIO rules"       (non-negotiable page rules)
  (docs/seo/photography-plan.md and photography-needed.md are both STALE —
   see Open items. Read them only for the A-before-B sequencing argument.)

STATE, verified against the repo on 2026-08-13 at HEAD 8449977:
  38 destination pages on .places-grid--photo
   4 still on placeholder swatches — india, jordan, new-zealand, oman (6 each,
     24 cards)
   1 (maldives) has no places-grid section at all
  38 + 4 + 1 = 43. Higgsfield credits: 243.1.
  Re-verify with the snippet under "The 4 pages still on placeholders" rather
  than trusting this number — every handoff before 2026-08-13 quoted counts
  that silently summed to 42.

WHAT IS LEFT, suggested order:
  1. jordan + oman   — desert and ancient, one batch of 12
  2. new-zealand     — 6
  3. india           — 6, LAST. It is needs-mark blocked on Mark's first-hand
                       line and cost figures, so photographing it unblocks
                       nothing.
  ~24 credits plus re-rolls. PETRA IS THE LAST BIG LANDMARK IN THE SET —
  budget a re-roll and use the landmark wording under "What the pilot proved".

BEFORE GENERATING ANYTHING, two checks. Both have caught free images:
  1. Drive — BOTH MIME sweeps (image/png AND image/jpeg). The folder CANNOT be
     enumerated by paging; a pageToken returns a near-duplicate of the previous
     page. A prefix search alone is not evidence of absence: that mistake hid
     all four antarctica frames, which had been sitting in Drive for five days.
  2. The repo — public/assets/img/<page>-<slug>.jpg. kenya-tanzania-serengeti
     already existed there at exactly the right size and slug, unused. Free.
  Drive folder: https://drive.google.com/drive/folders/1fqBl_7TFcX0AgKdd0M2lWzfyqxHUdQAo
  The tracker spreadsheet has nothing for the remaining pages — all 60 tracked
  rows read "Not started" with an empty prompt column (verified 2026-08-13).
  Concepts have to be written from each card's own copy.

BEFORE CHOOSING A SUBJECT for any card, open the page's own hero AND its
sibling regional-hub card and look at them. Across portugal, st-barths,
riviera, kenya-tanzania, rwanda, peru and patagonia this caught 12 collisions
in 38 cards — nearly one card in three. The obvious subject for a region is
usually already spent on the hero or the hub.

PER PAGE, the loop that works:
  a. read every card's name, region and description from
     src/content-pages/destinations__<page>.html
  b. run the two pre-generation checks above
  c. look at the hero + hub card for collisions
  d. write one concept per card FROM ITS OWN COPY, and get them approved
     before spending any credits. The user has asked for this repeatedly.
  e. generate — seedream_v5_lite, 16:9, one generate_image_batch (caps at 12;
     two back-to-back returns 429)
  f. review EVERY frame at its true 3:2 card crop, and check mean luminance
     across the set — shipped pages sit around 120–190, and one dark tile in a
     row is conspicuous because the panel is full-brightness by design
  g. python tools/place-card-intake.py <srcdir> <page> <grid-style|EMPTY> \
       <file>:<slug> ...
     Does intake + conversion + every assertion in one pass. Check the real
     grid tag first:
       grep -o '<div class="places-grid[^>]*>' src/content-pages/destinations__<page>.html
  h. npm run build   (must pass; it is self-contained)
  i. verify in the browser at 1440, 768 and 375: panels exactly 3:2, card
     heights uniform WITHIN each row, CTA baselines aligned, no horizontal
     overflow, no leftovers, every image loaded. Set loading='eager' before
     measuring or lazy images report as broken.
  j. commit — stage deliberately, never git add -A: GitNexus rewrites a
     symbol-count line in CLAUDE.md and AGENTS.md and it should not ride along
  k. update THIS FILE — counts, credits, HEAD, and anything new you learned

DO NOT DEPLOY. The user runs deploy-to-hostinger.ps1 themselves (it prompts
for an FTP password). It targets the DEV site,
brown-goose-754147.hostingersite.com, not the production domain in
astro.config.mjs. Ask them to run it, then verify the live site: page 200s,
every card image 200, live HTML byte-identical to local dist/, and the
markup assertions. Deploy is not reliably automatic — never promise a time.
```

---

## Where things stand

**Repo:** clean, all work pushed. HEAD = `8449977` on `main`.

| | |
|---|---|
| Destination pages | 43 |
| On the photo panel | **38** |
| Still on placeholders | **4** (24 cards) |
| No places-grid at all | **1** (maldives) |
| `/destinations/` index | 65 of 65 photographed, 65 distinct images |
| Higgsfield credits | **243.1** |

### The 4 pages still on placeholders

```
india 6   jordan 6   new-zealand 6   oman 6
```

Every one needs exactly 6, so the remainder is a clean 24 cards.

Suggested order: **desert and ancient** (jordan, oman) together, then
**new-zealand**, and **india** last — india is `needs-mark` blocked on
Mark's first-hand line and cost figures, so photographing it unblocks
nothing. **Petra is the last big landmark in the set**; budget a re-roll
and use the wording under "Generating" that fixed Barcelona.

**Counting note, corrected 2026-08-13.** Every previous version of this
handoff quoted "N of 43" figures that silently summed to 42 — 28+14,
29+13, 30+12, 31+11 all miss by one. The missing page is **maldives**,
which has no `places-grid` section at all and so was never in either
bucket. It is not a defect and not part of this workstream, but whether
maldives *should* carry a places-grid is a real content question for
Mark, since every other destination page has one.

Reproduce the count with:

```python
# 38 photo + 4 placeholder + 1 no-grid = 43  (as of 2026-08-13)
for f in glob.glob('src/content-pages/destinations__*.html'):
    s = open(f, encoding='utf-8').read()
    'places-grid--photo' in s      # photographed
    elif 'places-grid' in s        # placeholder
    else                           # no grid (maldives)
```

No Drive coverage for any of these. Verified 2026-08-13 by a complete
enumeration: `image/png` (41 files) plus `image/jpeg` partitioned into
three `createdTime` windows (34 + 50 + 25 = 109), none of which returned a
continuation token. 150 files total, and the folder holds nothing for
these pages. Budget ~24 credits against 243.1, plus a re-roll allowance
for landmark cards (see below).

The same trap will recur: a `<hub>-<page>.jpg` in Drive is the **hub card**,
not a set for that page's own six cards. patagonia and peru both hit it and
both are now done, but check the distinction before assuming coverage.

Note `india` — that page was created this session (issue #54) and ships with
its own six placeholder cards. Every new M7 destination page adds ~6 more.

---

## What the 2026-08-12 session did

1. Converted the six regional hubs to `--photo` (PR #102, 37 cards).
2. Photographed the `/destinations/` index — 24 placeholder plates → real
   `dc-` card crops. It is now fully photographic.
3. Fixed duplicate images on the index: 7 cards shared 6 photos; now 65 of 65
   distinct.
4. Created `/destinations/india/` — the first of 26 M7 destination pages.
5. Imported 93 approved place-card images from Drive across 17 pages
   (5 North America + 12 others). **Zero generated.**
6. Swapped the six europe hub cards onto purpose-made frames.

---

## The workflow that works

### Importing from Drive (preferred — free, approved images)

1. **Finding what exists — do this exhaustively.** Two separate misses have
   now been traced to a partial survey (St. Barth's; all four antarctica
   frames). Prefix searches alone are not sufficient:

   - Paging the folder with `parentId = '...'` and a `pageToken` returns
     **heavily overlapping result sets** — page 2 repeats most of page 1.
     You cannot enumerate the folder that way and must not assume you have.
   - The reliable sweep is **by MIME type**:
     `parentId = '...' and mimeType = 'image/png'` returns the older
     2026-08-08/09/11 batch (41 files) that the jpeg-only and prefix queries
     never showed. Run the `image/jpeg` sweep too.
   - `title contains 'foo-'` is **token** matching, not substring: it matches
     `europe-portugal.jpg` for `'portugal-'`. Useful, but it means a negative
     result is only trustworthy if the token is right.
   - Extensions lie. `south-america-galapagos-and-ecuador.jpg` and
     `antarctica-*.png` are all PNG bytes; check `mimeType`, not the name.

   Only after both MIME sweeps come back empty for a subject is it safe to
   say Drive does not have it.

2. **Compute what each page needs.** Card name → filename is:
   ```python
   n = html.unescape(name)                      # &yacute; -> ý, &amp; -> &
   n = unicodedata.normalize("NFKD", n)
   n = "".join(c for c in n if not unicodedata.combining(c))   # ñ->n, é->e
   n = n.replace("&", "and").lower()
   slug = re.sub(r"-+","-", re.sub(r"[^a-z0-9]+","-", n)).strip("-")
   asset = f"{page}-{slug}.jpg"
   ```
   **The entity/accent handling is essential.** Without it, galapagos
   (Española, Bartolomé) and iceland (Mývatn) look uncovered when their
   images are present.

3. **Download.** The folder is private, so anonymous fetch returns a sign-in
   page. Use Claude in Chrome (the user's real logged-in browser):
   - navigate to the folder URL, then run JS that schedules anchor clicks:
     ```js
     ids.forEach((id,i)=>setTimeout(()=>{
       const a=document.createElement('a');
       a.href='https://drive.google.com/uc?export=download&id='+id;
       a.download=''; a.style.display='none';
       document.body.appendChild(a); a.click(); a.remove();
     }, i*2500));
     ```
   - **2.5s spacing minimum.** Faster loses files silently.
   - `setTimeout` scheduling returns immediately; awaiting the loop times the
     CDP call out at 45s.
   - Files land in `%USERPROFILE%\Downloads`. Chrome appends " (1)" on a
     repeat download — resolve those back to the canonical name rather than
     deleting anything from the user's Downloads.
   - Verify by name, not by count, and re-trigger whatever is missing.
   - The Chrome tab dies often; re-fetch `tabs_context_mcp` and retry.
   - `fetch()` from the Drive page is CORS-blocked. Anchor clicks only.

4. **Intake** — 4 steps, all required (`public/assets/img/` is gitignored).
   **`tools/place-card-intake.py` does all four plus the page conversion in
   one pass, with assertions at every step** — use it rather than hand-rolling
   this again. What it does, and why each step matters:
   - `public/assets/img/<slug>.jpg` — if already ≤1600px wide, **keep the
     approved bytes unmodified**; only re-encode when wider (1600px, q85,
     progressive).
   - `images-b64/assets__img__<slug>.jpg.b64` — single line, no trailing newline
   - a `MANIFEST.json` entry (`b64`, `target`, `bytes`)
   - the markup

   MANIFEST format is **indent=1, CRLF, trailing newline** — verified
   byte-identical. Do not use `cap-image-width.py`'s `indent=2`; it disagrees
   with the committed file.

5. **Convert the page** — only once *every* card has an image:
   - `<div class="places-grid places-grid--even">` →
     `<div class="places-grid places-grid--even places-grid--photo">`
   - drop any `style="--card-desc-lines:N"` — dead under `--photo`
     (`destination.css:275` sets `min-height:0` on the description)
   - each `.place-card__ph` div → `<img class="place-card__img" src="..."
     alt="<Name>, <Region>" width="W" height="H" loading="lazy"
     decoding="async">` with the **true** intrinsic dimensions
   - delete the sibling `.place-card__overlay` div

6. **Build and verify:** `npm run build`, then measure in the browser at
   1440/1280 and 768/375: panels exactly 3:2, uniform card heights per row,
   CTA baselines aligned, no horizontal overflow, no broken images.

### Generating (last resort)

- Higgsfield MCP. **`seedream_v5_lite` costs 1 credit and returns 4096×2304;
  `seedream_v5_pro` costs 3 and returns 2720×1536.** For anything downscaled
  to 1600px, Lite is both cheaper and larger. Use Lite by default.
- House style lives in `tools/image-gen-manifest{,-heroes,-journal,-hubs}.json`:
  photorealistic wide cinematic · named hour · foreground/middle/distance ·
  medium-format optics · **no people, no text**.
- 16:9 for place cards. **9:16 for intro/itinerary panels** — those are
  portrait crops (`np` 900×1520, `ni` 600×1000). A landscape source there is
  the Botswana mistake at scale.
- **Which edges a place card actually eats — corrected 2026-08-13.**
  `destination.css:248` sets `aspect-ratio:3/2; object-fit:cover`. A 16:9
  source (1.778) is *wider* than a 3:2 panel (1.5), so `cover` scales it to
  fill the height and crops **7.9% off each side**. It does **not** lose
  ~12% top and bottom — an earlier version of this doc said that, and it is
  backwards. Compose to protect the **left and right** edges; the horizon is
  safe. Hover adds `scale(1.04)`, so keep ~2% more clear all round.
- Review every frame at its target crop before wiring it in.
- The "no people, no text" house rule is a *generation* convention, not a
  site rule. Several approved Drive frames contain people or boats
  (fiji-yasawa snorkelers, fiji-vanua-levu a diver, fiji-coral-coast a raft).
  Approved images win; do not "fix" them.
- `generate_image_batch` caps at 12; two batches back-to-back returns 429.
- Get concepts approved before generating. The user has asked for this twice.

---

## What the 2026-08-13 session did

1. Closed `drive-image-skips.md` § A — six hub cards (south-america ×3,
   caribbean-mexico ×3) off borrowed library frames and onto purpose-made
   ones. Pure import, zero credits. The sixth, St. Barth's, was found only
   by enumerating the folder.
2. Photographed `/destinations/fiji/` — 5 approved Drive images plus **one**
   generated frame (Mamanuca Islands, 1 credit).
3. Photographed `/destinations/antarctica/` — all 4 cards from Drive, zero
   credits. This page was documented as having no coverage; it had held all
   four frames since 2026-08-08. Found by sweeping `mimeType = 'image/png'`.
4. Photographed `/destinations/spain/` — the generation pilot, 6 credits
   (5 cards + 1 re-roll). See "What the pilot proved" below.
5. Photographed `/destinations/portugal/` (5), `/destinations/st-barths/`
   (4) and `/destinations/riviera-maya-los-cabos/` (4) — 13 credits, plus
   ~0.6 wasted on a model detour (see "The model briefly vanished").
6. Photographed `/destinations/kenya-tanzania/` (6) and
   `/destinations/rwanda/` (6) — 12 cards for **11** credits, because one
   already existed (see below).
7. Photographed `/destinations/peru/` (6) and `/destinations/patagonia/`
   (6) — 13 credits, one re-roll on the whale.
8. Corrected the card-crop geometry note below, which had the cropped axis
   backwards, and a page count that had never added up.

Total spend: **~44.6 credits** for 62 cards across 12 pages.

---

## Check the repo before generating, not just Drive

`kenya-tanzania-serengeti.jpg` already existed at exactly 1600×900, under
exactly the slug its card needed — generated on 2026-08-12 for the index
duplicate fix, and referenced ever since only through its `dc-` crop. The
full-size original was sitting unused in `public/assets/img/`. That card
cost nothing.

**So the pre-generation check is two steps, not one:**

1. the Drive folder (both MIME sweeps), and
2. `public/assets/img/<page>-<slug>.jpg` — the asset may already be on
   disk from index-crop or hub work.

Re-running intake on an existing ≤1600px JPEG is byte-identical and safe,
so the cheap move is simply to try it. Other index-crop slugs from
2026-08-12 that may be sitting unused the same way: `france-provence`,
`greece-santorini`, `italy-amalfi-coast`, `japan-kyoto`,
`french-polynesia-bora-bora` — all listed in `drive-image-skips.md` § B.
Their pages are already photographed, so this only matters if a card is
ever re-cut.

---

## The model briefly vanished — read before you panic

On 2026-08-13 a `generate_image_batch` call failed with
`unknown model "seedream_v5_lite"` on every request. The Higgsfield MCP
server had reconnected mid-session and its model registry briefly did not
list it. **Nothing was submitted and nothing was charged** (`submitted 0/5`).
It resolved by itself within minutes.

If it happens again: re-run `models_explore(action:'list', type:'image')`
and check before assuming the model is gone for good. Do not re-plan the
workstream around a different model on the strength of one failed call.

That detour did produce one genuinely useful finding, so it is recorded
rather than buried: **`soul_location`** costs **0.12 credits** a frame
against seedream's 1, and supports a **native 3:2** aspect, which would
remove the 7.9% side crop entirely. It was rejected anyway, deliberately.
Its output is softer, hazier and darker than the 31 pages already shipped
— its Porto came back dark enough to sit in the grid as a near-black tile.
Consistency across the site beat a saving that was not needed at 280
credits. If the budget ever gets tight, it is the obvious lever, and the
five Portugal frames generated on it are the evidence to judge from.

---

## What the pilot proved

Spain was run as Wave 1 on 2026-08-13: five regions of one country, which
is the consistency test the rest of the backlog turns on. The hubs were not
that test — their cards were whole countries that already owned a hero.

**The house style holds at sub-destination granularity.** The five came back
distinct in subject, palette and hour with no prompting beyond the standard
recipe. Concepts were written from each card's own description, which is
what made them specific.

Two things worth carrying into every later wave:

- **Check what the sibling hub card already shows.** Spain's Basque card
  deliberately avoids San Sebastián's La Concha bay because that is exactly
  `europe-spain.jpg`. The obvious subject for a region is often already
  spent on the hub.
- **Built landmarks render less reliably than landscape.** Barcelona needed
  two attempts; the first rendered the Sagrada Família as an indistinct mass
  with a second structure crossing its outline. Fixed by naming the landmark
  as the dominant subject, giving it a fraction of the frame, and demanding
  it be "unobstructed and cleanly separated against open sky". Porto's Dom
  Luís bridge and Cusco's cathedral both came out clean first time using that
  wording. **Petra, on jordan, is the last big landmark left** — budget a
  re-roll for it.
- **Say "bright" and name a bright hour.** Porto was specced at blue hour
  and came back the darkest frame on its page; re-specced to "warm evening,
  bright and clearly lit rather than dark", it came back the *brightest*.
  The `--photo` panel is full-brightness by design, so one dark tile in a
  row is conspicuous. Check mean luminance across a page's set before
  wiring it in — the shipped pages sit around 120–190.
- **Repetition is beaten by treatment, not subject.** st-barths is four
  beaches on one small island. Four different camera treatments — ground
  level, close macro, clifftop looking down, high road view — separate them
  completely. Reach for this before concluding a page's cards are doomed to
  look alike. Rwanda repeated the trick on three water cards: warm ground
  level wetland, wide lake from a height, and crater lakes straight down.
- **Animals work, with the landmark wording — but only one at a time.**
  The Volcanoes NP silverback came back clean first time using the phrasing
  that fixed Barcelona: name the subject as dominant, place it in the frame,
  require it "unobstructed and clearly separated", add "anatomically
  correct". Foliage across the hands is a free win.
  **Pairs and groups of large animals fuse.** Peninsula Valdés asked for a
  southern right whale mother *and calf* and got two bodies merged into one,
  with a second baleen-bearing head emerging from mid-body — at card size it
  read as a dead whale. The fix was to stop asking for two animals and pick a
  simpler silhouette: a single raised tail fluke, "one clean unbroken
  symmetrical shape", "exactly one whale in the frame and no second animal".
  Clean first try. Small animals in numbers are safe (macaws on a clay lick,
  penguins on an islet) because no single body carries the frame; it is the
  two-big-animals case that breaks.
- **When a subject appears on two pages, split it by aspect.** Akagera is a
  card on both kenya-tanzania and rwanda. One took the dry savanna and the
  rhino, the other Lake Ihema and the hippos. Neither reads as a repeat.
- **When the hero owns a subject the card cannot avoid, change the hour.**
  patagonia's hero is Fitz Roy in warm light with a trekker; the El Chaltén
  card is the same mountain at blue hour, dark, mirrored and empty. Same
  place, unmistakably a different photograph. Where even that is not enough
  — Machu Picchu, whose classic vista is spent on both the hero *and* the
  hub card — move the camera somewhere else entirely: the Sun Gate, with the
  citadel small and distant. Distance also lowers the landmark render risk.
- **Some subjects should not be generated at all.** Kigali's card copy calls
  the Genocide Memorial essential. The image is the city on its hills. A
  generated travel photograph of a memorial to the dead of 1994 would be
  the wrong call, and should stay the wrong call.

---

## Gotchas that cost time (2026-08-12 and 08-13)

- **Counting coverage:** a `.place-card__ph` can carry a real photo as
  `style="background-image:url(...)"`. Only the *unfilled* form is
  `style="background:#hex"`. Counting `.place-card__img` alone under-reports
  badly. The correct count reproduces `destination.css`'s own tally.
- **Deploy is not reliably automatic.** 2 of 3 observed pushes needed
  `deploy-to-hostinger.ps1` run manually. It prompts for an FTP password, so
  only the user can run it. Never quote "~5 minutes" as a guarantee.
- **`git add -A` sweeps in `CLAUDE.md` / `AGENTS.md`** — GitNexus rewrites a
  symbol-count line in both when the index refreshes. Harmless but unintended;
  stage deliberately.
- **The GitNexus index** goes stale constantly and `analyze` deadlocked once
  against its own MCP servers. `status` eventually self-resolved. Don't fight
  it; it does not affect the site.
- **New pages need `--update-baseline`** in its own commit
  (`node tools/verify-deployment.mjs --update-baseline`).

---

## Open items

- ~~**5 borrowed-hero swaps** left in `drive-image-skips.md` § A.~~ **Closed
  2026-08-13**, and it was 6 — St. Barth's was missing from the list because
  its slug is `caribbean-mexico-st-barth-s` (the apostrophe in `St. Barth's`
  becomes a separator, it is not dropped). Found by enumerating the whole
  folder instead of guessing slugs. Do that for § B too.
- **§ B of that doc** — ~14 slugs where a generated image is live and Drive
  holds a different version of the same subject. Needs a side-by-side call
  after launch. Not a defect.
- **M7 is 1 of 26 pages.** Every one is labelled `needs-mark`. The blocker is
  not images — it is page authoring plus two things only Mark can supply:
  a first-hand line (`CONTENT-STANDARDS` § 6) and cost figures. **One sitting
  with Mark on first-hand detail would unblock all 26 at once.**
- **India's cost band is `held`** in `tools/cost-ranges-data.mjs`, shipping
  commented like bali/hawaii. Same for its two `NEEDS MARK` comments.
- **No destination page sets a per-page `og:image`** — all 43 use the site
  default. Permitted, but every social/AI share of any destination shows the
  same picture. The `dc`/`rc` crop tooling already does this shape of work.
- **`docs/seo/photography-needed.md` is stale** — it lists 25 missing heroes;
  22 of those subjects now exist. It would send someone hunting for images
  that ship.
- **`docs/seo/photography-plan.md` is now stale too.** Its Workstream B table
  lists 30 pages / 162 images; the real remainder is **4 pages / 24 cards**,
  and its "1 of 163 slots comes free" line no longer holds — 99 came free from
  Drive and 1 more from the repo. Its sequencing argument (A before B) still
  stands. Worth rewriting or deleting once the last four pages ship.
