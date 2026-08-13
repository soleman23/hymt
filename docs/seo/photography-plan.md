# Photography plan — closing the remaining image backlog

Written 2026-08-12, after the six regional hubs shipped (PR #102).
Supersedes the counts in [`photography-needed.md`](photography-needed.md), which
is now badly out of date: it lists 25 missing hero images, and **22 of those 25
subjects now exist**.

## Where things actually stand

| Workstream | Unblocks | Images still needed | Est. credits |
|---|---|---|---|
| **A — Destination heroes (M7, #40–#65)** | 25 **new** pages | 3 subjects + a resolution decision | ~3–30 |
| **B — Place cards on existing sub-pages** | 30 **existing** pages | 162 | ~162 |

Balance at time of writing: **308.7 credits** (Plus plan).

### Workstream A is nearly done and nobody noticed

`photography-needed.md` was written before the hub rollout. Of its 25 missing
heroes, 22 subjects now have an asset — 16 from the hub batch (PR #102), plus
South Africa, Morocco and Zambia from the earlier africa set. Genuinely missing:

- **Costa Rica** (#41, Tier 1)
- **Aspen** (#40, Tier 2)
- **Bhutan** (#52, Tier 3)

The catch is **resolution, not subject**. Heroes are full-bleed LCP images specced
at 16:9 / 4K. What is on disk is the place-card intake: 1600px wide, because
`tools/cap-image-width.py` caps everything at the width Hostinger's CDN will
actually serve. So the subjects are covered; the files are not hero-grade.

The originals are still retrievable and cost nothing:

| Source | Native size | Count | Hero-ready? |
|---|---|---|---|
| `seedream_v5_lite` @ quality=high | 4096×2304 | 12 | **Yes — true 4K** |
| `seedream_v5_pro` @ 2k | 2720×1536 | 7 | ~2.7K, below spec |
| africa set (prior session) | unknown, 1600px on disk | 3 | Originals not in hand |

Verified 2026-08-12: the CloudFront originals still return 200 at 6.8–13.5 MB.
**They may not persist indefinitely.** Pulling them is free and protects work
already paid for, which makes it the first thing to do.

> **Efficiency note worth internalising:** Lite costs 1 credit and returns
> 4096×2304. Pro costs 3 credits and returns 2720×1536. For any image that ends
> up downscaled to 1600px, **Lite is both cheaper and higher resolution.** Pro
> earns its 3 credits only on prompt adherence for complex or signature scenes.
> The hub batch ran 7 Pro / 12 Lite; on review the Lite frames held up just as
> well. Workstream B should be Lite by default.

### Workstream B — 162 images across 30 pages

| Cards needed | Pages | Images |
|---|---|---|
| 3 | napa-sonoma | 3 |
| 4 | antarctica, canadian-rockies, iceland, new-orleans, riviera-maya-los-cabos, st-barths | 24 |
| 5 | french-polynesia (1 already), portugal, spain | 15 |
| 6 | bali, botswana, egypt, fiji, france, galapagos, greece, hawaii, italy, japan, jordan, kenya-tanzania, new-york, new-zealand, oman, patagonia, peru, rwanda, thailand, turks-caicos | 120 |

These need genuinely place-specific frames — Hawaii wants six island-level shots,
Italy six regional ones. Unlike the hubs, there is no library to draw on: hub
cards pointed at sub-destinations that already owned a hero, which is why 18 of
those 37 slots came free. Here only 1 of 163 does.

## Sequencing: A before B

Three reasons, in order of weight:

1. **A creates pages; B polishes pages that already exist.** 25 new indexable
   destination pages is a different order of value from a visual upgrade to 30
   pages that already rank. A is ~3 images away; B is 162.
2. **B's true scope is unknown until A lands.** Each of those 25 new pages will
   carry its own places-grid — roughly 6 cards each, so **~150 further images**.
   Committing 162 credits to B now, then discovering another 150-image backlog,
   is the expensive ordering.
3. **A is time-sensitive and free.** The originals are sitting on a CDN we do
   not control.

## The plan

### Phase 0 — Bank the originals (0 credits, do first)

Re-fetch all 19 CloudFront originals at native resolution and store them as
hero masters. `tools/hero-masters/` already exists for this. No site change, no
build impact — purely protecting assets already paid for.

**Decision needed:** the 7 Pro frames land at 2720×1536, under the 4K hero spec.
Options: accept ~2.7K (the CDN caps delivery at 1600px anyway, so no visitor is
served more); upscale via `bytedance_image_upscale` or `topaz_image`; or
regenerate at 4K on Lite for 1 credit each. **Recommendation: accept them.**
Hostinger caps at 1600px and 800px WebP on phones — 2720px is already 70% more
than the widest delivery, so 4K buys repo size and nothing else.

### Phase 1 — Close Workstream A (~3–9 credits)

1. Generate Costa Rica, Aspen, Bhutan on Lite (1 credit each; 4K native).
2. Decide the africa trio: their originals are not in hand, but at 1600px they
   already exceed delivery width. Likely no action.
3. Refresh `photography-needed.md` to reflect reality — right now it would send
   someone hunting for 25 images that mostly exist.
4. Hero intake differs from place-card intake: full-bleed, passed as
   `preloadImage`, and it is the **LCP image, so never `loading="lazy"`**.

That unblocks the M7 page builds (#40–#65), which is the actual content win.

### Phase 2 — Workstream B in waves (~162 credits, Lite throughout)

**One page = one batch call.** `generate_image_batch` caps at 12 requests, so a
6-card page fits in a single call with room to spare — a clean unit of work with
a natural review point. Submitting two batches back-to-back returned
`429 rate_limit_reached` during the hub run, so **pace one page-batch at a
time.**

- **Wave 1 — pilot, 1 page (6 images).** Prove the house style holds at
  sub-destination granularity, where cards are *regions within one country*
  rather than countries. Suggest **Italy** or **Hawaii**: highest traffic, and
  six sibling frames from one country is the hardest consistency test in the set.
  Review before committing further credits.
- **Wave 2 — the seven small pages (27 images).** napa-sonoma, antarctica,
  canadian-rockies, iceland, new-orleans, riviera-maya-los-cabos, st-barths.
  Finishes 7 of 30 pages for 17% of the budget.
- **Wave 3 — the 5-card pages (15 images).** french-polynesia, portugal, spain.
- **Wave 4 — remaining 6-card pages (~114 images).** Batch by theme rather than
  alphabetically so sibling prompts share vocabulary: beach/island
  (fiji, turks-caicos, bali), safari (botswana, kenya-tanzania, rwanda),
  Europe (france, greece, italy, spain-adjacent), Andes/Pacific
  (patagonia, peru, galapagos), Asia (japan, thailand), desert/ancient
  (egypt, jordan, oman), cities (new-york).

### Per-page mechanics (proven on the hubs)

1. Concepts reviewed **before** generation — never auto-generate in bulk.
2. `generate_image_batch` → `jobs_wait` → one `show_generation_by_ids`.
3. Review every frame at its **3:2 card crop** before wiring anything in. A
   16:9 source loses ~12% top and bottom; portrait sources are unusable
   (`e-09-jungle-yoga-pavilion.jpg` had to be swapped out of the Bali card).
4. Intake: 1600px q85 progressive JPEG → `public/assets/img/` → single-line
   base64 twin → MANIFEST entry (indent=1, CRLF, trailing newline).
5. Markup: swap `__ph` + `__overlay` for `<img class="place-card__img">` with
   **true** intrinsic width/height, add `places-grid--photo`.
6. `npm run build`, then measure at 1440px and 768px: panels exactly 3:2, card
   heights and CTA baselines aligned per row, no horizontal overflow.
7. Deploy is **not reliably automatic** — 2 of 3 observed pushes needed
   `deploy-to-hostinger.ps1` run manually.

## Budget

| Phase | Images | Credits |
|---|---|---|
| 0 — bank originals | 0 | 0 |
| 1 — close heroes | 3 | ~3 |
| 2 — place cards, Lite throughout | 162 | ~162 |
| **Total** | **165** | **~165** |

Against 308.7 available, that leaves ~145 in reserve — enough for the ~150
place cards the 25 new M7 pages will eventually need, but not both plus a
re-run. If budget gets tight, Wave 4 is the part to stage across billing
periods; Waves 1–3 finish 11 of 30 pages for ~48 credits.

## Open decisions

1. **Pro originals at 2720×1536** — accept, upscale, or regenerate? *(rec: accept)*
2. **Pilot page** for Wave 1 — Italy or Hawaii? *(rec: Italy)*
3. **Refresh `photography-needed.md` now**, or fold it into Phase 1? *(rec: now —
   it is actively misleading)*
4. **Is M7 still the priority milestone?** The whole A-before-B argument rests on
   those 25 pages being wanted. If they are shelved, B becomes the only work and
   the ordering is moot.
