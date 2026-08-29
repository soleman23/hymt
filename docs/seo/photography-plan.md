# Photography plan — closing the remaining image backlog

Written 2026-08-12, after the six regional hubs shipped (PR #102).

> # ✅ ALL THREE WORKSTREAMS COMPLETE — closed out 2026-08-28.
>
> **No new photography is needed.** Workstreams A, B and C all derive to zero:
> nothing on the site is waiting on a frame that does not exist, and nothing is
> waiting on Mark.
>
> **And no unfilled plates either, as of 2026-08-29.** The 65 that were
> outstanding — `/contact/` plus 64 across the journal posts — were filled by
> `fill-portrait-slots`, all with `sp-mark-sole-portrait.jpg`, which had been
> in the repo since 2026-08-10. Re-derived on the merge commit:
>
> ```
> class="…-ph" rendered anywhere in dist   0
> <img> in the three portrait slots        1 + 32 + 32 = 65
> "<Noun> Photography" captions            1  (Iceberg, a real Greenland tag)
> ```
>
> The four `-ph` tokens the first sweep still returns — `dest-card__ph` ×2,
> `journal-featured__image-ph`, `story__photo-ph` — are CSS rules for classes
> nothing renders. A rule is not a plate.
>
> An earlier draft of this banner said "no photography backlog" full stop while
> those 65 were still live, and it was wrong in the way this whole file keeps
> being wrong — the sweep behind it found one plate family and not the other
> two. Codex bugbot caught it. The sentence is true now, and it is true because
> the greps above say so, not because the last banner said it.
>
> `Portrait` is in `PLACEHOLDER_PATTERNS` as of the same change, so a plate
> reappearing on `/contact/` fails the build rather than ageing in this file.
>
> Everything below — the sequencing argument, the waves, the budget, the open
> decisions — is a **record of how it was planned and paid for**, not work to
> pick up. Read § "How it actually finished" first; the rest is history.
>
> The one live instruction in this file is the **per-page intake mechanics**
> (§ "Per-page mechanics"), which still describes how to wire any new image
> correctly, and the **`PLACEHOLDER_PATTERNS` note** at the end of § "The last
> fifteen", which explains why that check is a fixed noun list.

## How it actually finished

Every figure here is a command, because **every figure originally written in
this document rotted** — the Workstream B row alone was wrong by a factor of
six in one direction and then, once corrected, wrong by 66 in the other.

| Workstream | Scope | Images still needed | Verified |
|---|---|---|---|
| **A — Destination heroes** (M7, #40–#65) | 25 new pages | **0** | #40–#65 all closed; 68 detail pages ship (≠ the 66 grid cards — see `photography-needed.md`) |
| **B — Place cards on existing sub-pages** | 11 pages, 66 cards | **0** | 11/11 pages at 6 cards, 6 images, grid on `--photo` |
| **C — "Trips We Plan Often" tiles** | 75 pages, 280 tiles | **0** | 0 `itin-image`, 0 `event-image` plates |

```bash
# All three now return 0. Non-zero means a regression, not a backlog.
grep -rho 'place-card__ph' dist/destinations --include='*.html' | wc -l
grep -rho 'exp-card__ph'   dist/experiences  --include='*.html' | wc -l
grep -rho 'class="itin-image"\|class="event-image"' dist --include='*.html' | wc -l
```

**Do not read a zero from those as "no plates sitewide."** Each names a card
family it already knew about, and that is precisely how 280 tiles hid behind a
finished-looking plan (§ Workstream C). The sitewide sweep is by shape:

**Do not use a `grep` for this.** Every regex tried here has been wrong, in
sequence, each one looking more general than the last:

| Attempt | Missed |
|---|---|
| `place-card__ph` / `exp-card__ph` | the 280 "Trips We Plan Often" tiles |
| `__ph\b` | `author-card__photo-ph` — `ph` is not at a boundary after `__` |
| `[a-z-]*(__\|--)?ph\b` | nothing, but matches `paragraph`, `photograph`, `Joseph` |

**Parse the class attributes and keep tokens whose final `-`/`_` segment is
`ph`.** That is the question actually being asked, and unlike a regex over raw
HTML it cannot confuse a CSS selector with rendered markup:

```bash
node -e '
const fs=require("fs"),path=require("path");
const walk=(d,o=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){
  const p=path.join(d,e.name); e.isDirectory()?walk(p,o):e.name.endsWith(".html")&&o.push(p)}return o};
const c=new Map();
for(const f of walk("dist")) for(const m of fs.readFileSync(f,"utf8").matchAll(/class="([^"]*)"/g))
  for(const t of m[1].split(/\s+/)) if(/(^|[-_])ph$/.test(t)) c.set(t,(c.get(t)||0)+1);
console.log([...c].sort((a,b)=>b[1]-a[1]));'
```

**Today that returns 64 rendered plates in TWO families, both on the journal
posts** — `author-card__photo-ph` ×32 and `post-byline__avatar-ph` ×32, two per
post. All 64 want the same `sp-mark-sole-portrait.jpg` as `/contact/`; see
§ "The last fifteen".

Four more `…-ph` tokens exist only as **CSS selectors**, styling nothing:
`.dest-card__ph` ×2 (`/destinations/`), `.journal-featured__image-ph`
(`/travel-journal/`), and `.story__photo-ph` (`/about/`, orphaned when the real
portrait landed in `17b3c4a`). Dead rules, not plates — delete them the next
time each page's `pageCss` is touched. A raw grep reports all four as hits and
gives no way to tell them from the 64 real ones.

The caption grep is still worth running beside it, and still misses both live
families — their visible text is `Mark Sole`, not `<Noun> Photography`:

```bash
grep -rho '[A-Z][a-z]* Photography' dist --include='*.html' | sort | uniq -c
```

It returns only the two intentional captions, `Portrait Photography` and
`Iceberg Photography`.

**The sequence above is the actual finding of this section.** Three sweeps in a
row were written by someone who had just been burned by the previous one, and
each was still keyed on the shape they happened to have seen. The `__ph\b`
version shipped *in the same commit that warned against exactly this mistake*,
and was caught in review by Codex bugbot rather than by its author.

Workstream B's completed pages, for the record — 4 destination (`india`,
`jordan`, `new-zealand`, `oman`) and 7 experience (`adventure-active-travel`,
`all-inclusive-vacations`, `beach-island-escapes`, `family-travel`,
`safari-wildlife-travel`, `sports-event-travel`, `wellness-retreat-travel`).

Balance at time of writing: **308.7 credits** (Plus plan) — a 2026-08-12
snapshot, long superseded. Check the dashboard.

### Workstream A is ~~nearly~~ done and nobody noticed

`photography-needed.md` was written before the hub rollout. Of its 25 missing
heroes, ~~22~~ **all 25** subjects now have an asset — 16 from the hub batch
(PR #102), plus South Africa, Morocco and Zambia from the earlier africa set.
~~Genuinely missing:~~ **The three this section called genuinely missing all
ship, and have since before this was written:**

- ~~**Costa Rica** (#41, Tier 1)~~ → `dh-27-costa-rica-cloud-forest.jpg`
- ~~**Aspen** (#40, Tier 2)~~ → `dh-26-aspen-maroon-bells.jpg` (in MANIFEST,
  wired nowhere — `888817d` pulled the Aspen card until that page exists)
- ~~**Bhutan** (#52, Tier 3)~~ → `dh-28-bhutan-paro-taktsang.jpg`

**Seven experience-card subjects genuinely have no library asset**, and this
is the list nobody should have to derive a fourth time: Dolomites & Alps,
St. Lucia (×2), Namibia, Formula 1, Football & Rugby, Arizona & Southwest.
`family-travel` is the one blocked page whose cards are *nearly* all coverable
from stock already in the repo — five of six — but its "Family Safari" card is
tagged Sabi Sand and the library holds no Southern-African safari frame at
all, only Serengeti.

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

### Workstream B — ~~162 images across 30 pages~~ 66 across 11, all delivered

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

### Workstream C — the "Trips We Plan Often" tiles

> Added 2026-08-26. This workstream did not exist in the 2026-08-12 plan, and
> that omission is the finding: A and B between them cover heroes and place
> cards, so 280 unfilled slots on 75 pages sat outside every count in this
> document while both other workstreams were declared finished.

The featured-itinerary tile beside each trip's copy. It renders through **two**
card families under the identical `<h2>Trips We Plan Often</h2>`, which is why
a grep for one finds 87% of the problem and stops:

| Family | Slot | Pages | Tiles | Crop | Prefix |
|---|---|---|---|---|---|
| `.itin-image` | destination pages | 66 | 244 | 600×1000 (9:16 master) | `ni-` |
| `.event-image` | experiences pages | 9 | 36 | 600×700 (3:4 master) | `ev-` |

```bash
# every page carrying the heading, and what is still a plate on it
grep -rlo 'Trips We Plan Often' dist --include='*.html' | wc -l   # 74
grep -rho 'class="itin-image"'  dist --include='*.html' | wc -l   # itin plates
grep -rho 'class="event-image"' dist --include='*.html' | wc -l   # event plates
```

Four destination pages carry the same `.itin-card` section under a **different
heading** — `antarctica` and `polar-regions` ("Expeditions We Plan Often"),
`svalbard` ("Voyages and Weeks We Plan Often") and `sri-lanka` ("Four Ways
Round the Island"). Count by the card class, never by the heading.

**Generated, not reused.** Of 884 tracked images ~~18~~ were referenced nowhere
and all 18 are landscape `rc-`/`e-` tiles — nothing portrait, nothing square.
(2026-08-28: the library is now **1,196 MANIFEST entries with 23 unreferenced**;
the build prints that inventory on every run, so take it from there rather than
from this sentence.) Every
destination's own slug family is already fully consumed by its place cards, so
reusing would have put each photograph on the page twice, four times over.
Cost was 1.5 credits per frame on `seedream_v5_pro` at 1.5k, ~420 for the set,
against a balance of 1,458.

Prompts and alt text for all 280 are tracked in
[`tools/itin-brief.json`](../../tools/itin-brief.json);
[`tools/make-itin-crops.mjs`](../../tools/make-itin-crops.mjs) builds both crop
boxes from the 9:16 and 3:4 masters in `tools/itin-masters/` (gitignored, same
rule as `tools/hero-masters/`).

### The last fifteen, and the two that stay

The same pass closed every other plate on the site — 8 related-article
thumbnails, 2 Maldives stay cards, 4 in-article images and the
`/travel-journal/aspen-book-early/` hero. Six of the eight thumbnails cost
nothing: a related card should show the post it links to, and `jc-jh-03/14/17`
were already built for the journal index.

~~Two things are left on purpose.~~ **One is. The other was closable the whole
time.**

- **`/contact/` — "Portrait Photography / Mark Sole".** ~~A real, named person.
  A generated likeness of someone is not a photograph of them, so this needs a
  real headshot from Mark. It is the one plate a tool cannot close.~~
  — **wrong, and wrong when written.** The reasoning is sound and the premise
  was false: **`sp-mark-sole-portrait.jpg` is a real photograph of Mark and has
  been in the repo since `17b3c4a`, 2026-08-10** — sixteen days before this
  bullet was written. It ships on `/about/` at 900×1086 as `.story__photo-img`,
  and `off-site-profiles.md` already names it as the canonical crop for
  third-party profiles. `/contact/` ~~still ships the plate at
  `src/content-pages/contact.html:19`~~ **carries the photograph as of
  2026-08-29**. **This was agent-doable and needed nothing from Mark.** The
  journal posts were the same story and the same asset: **64 further plates,
  two per post** — `author-card__photo-ph` ×32 and `post-byline__avatar-ph`
  ×32. 65 slots in total, one photograph, all closed together by
  `fill-portrait-slots`.

  Worth naming the failure mode, because "needs a human" is the most expensive
  thing a doc can say falsely: a correct-sounding *rule* ("a generated likeness
  is not a photograph of them") was never re-checked against the *inventory*,
  so a plate that could have been closed for zero credits was filed under
  human-blocked for two and a half weeks. Two subsequent passes, including one
  explicitly correcting this file, repeated it without grepping for a portrait.
- **`/destinations/` — "Iceberg Photography".** Not a plate. It is a Greenland
  activity tag beside "Icefjord" and "Dog Sledding", and it is correct copy.
  **This one is genuinely permanent.**

**The plate is now a check, not a convention.** `PLACEHOLDER_PATTERNS` in
`tools/content-checks.mjs` fails any page shipping `Destination`, `Experience`,
`Itinerary`, `Journey`, `Event`, `Article` or `Atoll Photography` as visible
copy. It is a fixed list of nouns rather than `/\w+ Photography/` **because of
the Greenland tag** — the general form reads better and would fail that page
forever. Add `Portrait` the day Mark's headshot lands; do not reach for the
general pattern.

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
   base64 twin → MANIFEST entry (indent=1, ~~CRLF~~ **LF**, trailing newline).

   **The CRLF here was wrong and this section is the live procedure, so it
   would have been followed.** `.gitattributes` stores and checks out all
   source as LF, and `images-b64/MANIFEST.json` today contains **zero** CR
   bytes (`grep -c $'\r' images-b64/MANIFEST.json` → 0). Writing it back as
   CRLF would fight the renormalisation on the next checkout and reintroduce
   the mixed-line-ending churn that policy exists to stop — a Python edit doing
   exactly that once turned a 9-line content change into a 310-line diff.
   Caught in review by Codex bugbot.
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

## Open decisions — all four resolved by events

None of these is open. Kept because three were resolved by shipping rather than
by anyone answering them, and a reader who finds an "Open decisions" heading
will otherwise try to answer them again.

1. ~~**Pro originals at 2720×1536** — accept, upscale, or regenerate?~~
   **Accepted, as recommended.** The CDN caps delivery at 1600px, so the extra
   width was never served.
2. ~~**Pilot page** for Wave 1 — Italy or Hawaii?~~ **Moot.** The rollout
   completed across all 11 pages; the pilot-then-review pacing did its job and
   is preserved in § "Per-page mechanics".
3. ~~**Refresh `photography-needed.md` now**, or fold it into Phase 1?~~
   **Done 2026-08-28**, and later than it should have been: that file kept the
   title "the 25 missing hero images" for ten days after the last one shipped.
   The recommendation said "now — it is actively misleading", and it was right.
4. ~~**Is M7 still the priority milestone?**~~ **Yes, and it landed.** All of
   #40–#65 are closed and the site went from 98 to 123 pages. The A-before-B
   ordering argument held: A created the pages, B polished them, and B's true
   scope was indeed only knowable afterwards.

## If you are here to do photography work

**No new photography is needed, and there is no wiring left either.** Nothing
on the site requires a frame that does not exist, nothing is waiting on Mark,
and no page renders a placeholder plate.

- ~~**65 slots, one photograph.** `/contact/`'s portrait plate
  (`src/content-pages/contact.html:19`), plus **64 on the journal posts** —
  `author-card__photo-ph` ×32 and `post-byline__avatar-ph` ×32, two per post.~~
  **Closed 2026-08-29** by `fill-portrait-slots`. All 65 now carry
  `sp-mark-sole-portrait.jpg`, which had shipped on `/about/` since
  2026-08-10 — see § "The last fifteen" for why this sat mislabelled as
  human-blocked, and § "How it actually finished" for why a grep found only
  half of it. The `-ph` rules went with the plates; `Portrait` went into
  `PLACEHOLDER_PATTERNS`, so the `/contact/` plate cannot come back unnoticed.

Do not take that on faith. Derive it:

```bash
grep -rho 'class="[a-z_ -]*[_-]ph"' dist --include='*.html' | sort | uniq -c   # nothing
grep -rho '[A-Z][a-z]* Photography'  dist --include='*.html' | sort | uniq -c   # 1 Iceberg
```

The only genuinely permanent exception is the Greenland "Iceberg Photography"
tag, which is correct copy and must never be "fixed".

Before concluding any new subject is missing, search the place-prefixed
filename families **and** `ALIASES.json` — and grep the library for the subject
itself. The portrait above was found by neither of the two passes that
declared it absent.

Before concluding any *new* subject is missing, read
[`photography-needed.md`](photography-needed.md) § Specs for the house format,
and search the place-prefixed filename families **and** `ALIASES.json` first —
a previous pass concluded no Southern African safari frames existed while six
`botswana-*` frames sat in the library.
