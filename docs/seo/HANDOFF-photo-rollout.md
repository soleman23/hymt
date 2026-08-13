# Handoff — place-card photo rollout

Written 2026-08-12 at the end of a long session. Paste the "Prompt" section
below into a new Claude Code session in this repo to pick up exactly here.

---

## Prompt

```
Continue the place-card photo rollout on the HYMT site.

Read these first, in this order:
  1. docs/seo/HANDOFF-photo-rollout.md   (this file — state, workflow, gotchas)
  2. docs/seo/drive-image-skips.md       (images deliberately not swapped)
  3. docs/seo/photography-plan.md        (the workstream plan; parts are now stale —
                                          it predates the discovery that most images
                                          already exist in Drive)
  4. CLAUDE.md § "SEO & AIO rules"       (non-negotiable page rules)

THE SINGLE MOST IMPORTANT RULE: check the Google Drive folder BEFORE generating
any image. Roughly 19 images were generated in this session that already existed
in Drive, some dated four days earlier. Generation is the last resort, not the
first move.

Drive folder (source of truth, approved images):
  https://drive.google.com/drive/folders/1fqBl_7TFcX0AgKdd0M2lWzfyqxHUdQAo
  "My Drive > Hit Your Mark Travel > New Images to add"

Current state: 31 of 43 destination pages are on the .places-grid--photo
layout. 11 pages remain on flat placeholder swatches (61 cards), and none
of them has Drive coverage.

Treat that last clause with suspicion — the previous handoff said the same
thing about antarctica and was wrong; all four of its frames had been in
Drive since 2026-08-08. Before generating anything for a page, run the
exhaustive check described under "Finding what exists" below, not a prefix
search.

Pick up with whichever the user asks for. If they leave it open, the next
step is the 11 uncovered pages: get concepts approved first. The tracker
spreadsheet has nothing for them -- all 60 tracked rows are "Not started"
with an empty prompt column, verified 2026-08-13 -- so concepts have to be
written from the card copy, as spain's were.

  (drive-image-skips.md § A — the borrowed-hero swaps — is CLOSED as of
   2026-08-13. It turned out to be 6, not 5: caribbean-mexico's St. Barth's
   card was also borrowing a library frame and Drive had a purpose-made one
   under the non-obvious slug `caribbean-mexico-st-barth-s.jpg`.
   § B has NOT had a full comparison and still needs one.)

Do not deploy. The user runs deploy-to-hostinger.ps1 themselves (it prompts
for an FTP password). Ask them to run it, then verify the live site.
```

---

## Where things stand

**Repo:** clean, all work pushed. HEAD = `119a091` on `main`.

| | |
|---|---|
| Destination pages | 43 |
| On the photo panel | **31** |
| Still on placeholders | **11** (61 cards) |
| `/destinations/` index | 65 of 65 photographed, 65 distinct images |
| Higgsfield credits | **280.7** |

### The 11 pages still on placeholders

```
india 6   jordan 6   kenya-tanzania 6   new-zealand 6   oman 6
patagonia 6   peru 6   portugal 5   riviera-maya-los-cabos 4
rwanda 6   st-barths 4
```

No Drive coverage for any of these. Verified 2026-08-13 by a complete
enumeration: `image/png` (41 files) plus `image/jpeg` partitioned into
three `createdTime` windows (34 + 50 + 25 = 109), none of which returned a
continuation token. 150 files total, and the folder holds nothing for
these pages. Budget ~61 credits against 280.7, plus a re-roll allowance
for landmark cards (see below).

Careful with `patagonia` and `peru`: Drive holds `south-america-patagonia`
and `south-america-peru`, but those are **hub cards** on
/destinations/south-america/ and are already in use. The standalone
/destinations/patagonia/ and /destinations/peru/ pages need six frames each
of their own.

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

4. **Intake** — 4 steps, all required (`public/assets/img/` is gitignored):
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
5. Corrected the card-crop geometry note below, which had the cropped axis
   backwards.

Total spend: **7 credits** for 21 cards across 5 pages.

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
  it be "unobstructed and cleanly separated against open sky". Budget a
  re-roll for **peru** (Machu Picchu, Cusco, Lima) and **jordan** (Petra).

---

## Gotchas that cost time this session

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
  lists 30 pages / 162 images; the real remainder is 13 pages / 70 cards, and
  its "1 of 163 slots comes free" line no longer holds — 99 of them came free
  from Drive across the two sessions. Its sequencing argument (A before B)
  still stands.
