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

STATE, re-derived on 2026-08-26 (third session that day):
  THE ROLLOUT IS COMPLETE. There is no backlog left to pick up.
  EXPERIENCES — DONE. 12 of 12 pages on .exp-cards--photo, 72 of 72 cards
    photographed, zero placeholders. Closed 2026-08-24; do not re-plan it.
  DESTINATIONS — DONE. 67 of 67 pages that carry a places-grid are on
    .places-grid--photo, 386 of 386 cards photographed, zero placeholders.
    Closed 2026-08-26 with the Asia five. maldives is the 68th page and has
    no places-grid section at all, so it was never in either bucket.
  SITE-WIDE — zero `.place-card__ph` and zero `.exp-card__ph` remain.
  Higgsfield credits: 1458.

  This Prompt is kept for the NEXT page that gets built, not for a backlog.
  A new destination page ships six placeholder cards; the loop below is how
  you photograph them. Everything under "Reviewing", "Gotchas" and the
  per-batch sections is the accumulated failure list and still applies.

  jordan and oman came off the list first on 2026-08-25; then the polar four,
  then Latin America, then the islands, then AFRICA & THE INDIAN OCEAN on
  2026-08-26 — south-africa, zambia-victoria-falls, seychelles, vanuatu, 24
  cards for 28 credits; then DESERT & ANCIENT the same day — morocco, israel,
  uae-gulf, 18 cards for 22 credits, specced by a 12-agent workflow; then
  ANGLO & ALPINE — aspen, australia, new-zealand, 18 cards for 21 credits,
  same workflow shape.
  Every earlier version of this file said "4 pages / 24 cards", true at 43
  pages, before M7 added 25 more each shipping 6 placeholders.
  RE-DERIVE, never trust a written count:

    node -e "const g=require('glob');" # or just grep:
    grep -L 'places-grid--photo' src/content-pages/destinations__*.html \
      | xargs grep -l 'places-grid' | wc -l

WHAT IS LEFT: nothing. Credits were never the constraint after 2026-08-12 —
  concept quality and reviewer time were. Final per-batch spend: jordan and
  oman 13 credits for 12 cards; polar 26 for 24; Latin America 27 for 24;
  the islands 25 for 24; Africa & the Indian Ocean 28 for 24; the desert
  three 22 for 18; the Anglo three 21 for 18; the Asia five 40 for 30.
  Budget ~1.2 credits per card for any future page.

  BATCH BY SHARED VISUAL VOCABULARY, not one page at a time. The polar four
  went together precisely because they collide with each other, and specced
  side by side the adversarial pass caught three CROSS-PAGE twins that a
  page-at-a-time loop cannot see by construction: Tromso and Disko were both
  a water-level humpback, Alta and Tasiilaq were both a fanned dog team,
  Ilulissat and Longyearbyen were both a 1 a.m. midnight-sun painted-timber
  town. Each was fixed on ONE side, so the stronger claim keeps the frame.

BEFORE GENERATING ANYTHING, three checks. All three have caught free images:
  1. `npm run build` prints "N tracked images referenced nowhere — free to use
     before generating anything new" at the end of every run. READ IT FIRST.
     It is 27 today.
  2. Drive — BOTH MIME sweeps (image/png AND image/jpeg). The folder CANNOT be
     enumerated by paging; a pageToken returns a near-duplicate of the previous
     page. A prefix search alone is not evidence of absence.
  3. The repo — public/assets/img/<page>-<slug>.jpg. kenya-tanzania-serengeti
     already existed there at exactly the right size and slug, unused. Free.
  Drive folder: https://drive.google.com/drive/folders/1fqBl_7TFcX0AgKdd0M2lWzfyqxHUdQAo

  CHECK THE ASPECT RATIO of anything you find free. Six of the 27 unreferenced
  images — e-07, e-13, e-15, e-19, e-21, e-23 — are 1024x1405, PORTRAIT. A
  portrait source in a 3:2 landscape panel is the Botswana mistake at scale.

BEFORE CHOOSING A SUBJECT for any card, open the page's own hero AND its
sibling regional-hub card and look at them. The obvious subject for a region is
usually already spent on the hero or the hub.

PER PAGE, the loop that works:
  a. read every card's name, region and description from
     src/content-pages/destinations__<page>.html
  b. run the three pre-generation checks above
  c. look at the hero + hub card for collisions
  d. write one concept per card FROM ITS OWN COPY, and get them approved
     before spending any credits. The user has asked for this repeatedly.
  e. generate — seedream_v5_lite, 16:9, one generate_image_batch (caps at 12).
     A second batch straight after returns 429 on one or two indices; that is
     not a hard block, just resubmit the failed ones.
  f. review EVERY frame at its true 3:2 card crop, and measure BOTH the crop
     mean and the bottom-eighth band — see "Reviewing" below. Compute luma
     from RAW PIXELS: sharp's stats() ignores .extract() AND .greyscale() and
     hands back the red channel of the whole source image without erroring.
     Then composite the bottom 30% onto a #101A30 panel and look at the seam;
     that decides it, not a threshold.
  g. intake with **tools/place-card-intake.mjs**:
       node tools/place-card-intake.mjs <srcdir> <page> <file>:<card> ...
     <card> is the card's visible name or its slugified form; ORDER DOES NOT
     MATTER and the slug is derived from the markup, so a mis-ordered list
     cannot put one card's photograph on another. It refuses on a portrait or
     otherwise badly-proportioned source, and writes nothing until all six
     have passed. Ignore tools/place-card-intake.py — it imports PIL, which is
     NOT installed on this machine.
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

## Reviewing: mean luminance is a proxy, and it lies in one direction

Shipped pages sit around 120–190, and one dark tile in a row is conspicuous
because the `--photo` panel is full-brightness by design. That rule stands.

**But a low mean does not always mean a dark photograph.** Dense dark-green
foliage or deep navy water fills a frame and drags the mean down while the
actual subject — a shaft of light, white water, a bright lagoon centre — is the
brightest thing in the image and sits dead centre. On 2026-08-24, five frames
read below 120 and only two were genuinely wrong:

| Frame | Mean | Call | Why |
|---|---|---|---|
| Rwanda bamboo | 67 | **kept** | Luminous centre, and the only forest interior in its row |
| Mexico cenote | 64 | **kept** | A cenote is a cave; the light shaft is the subject |
| New Zealand fiord | 100 | **kept** | Reads bright — mist and waterfalls carry it |
| Bali pavilion | 114 | **kept** | Warm and bright; only just under the floor |
| Costa Rica gorge | 51 | **re-rolled** | Sat directly beside Iceland 161 and Dolomites 162 |
| Maldives aerial | 34 | **re-rolled** | Mostly navy ocean — see below |

So: read the number, then **look at the crop**, then look at the row it will
sit in. The question is never "is this frame dark", it is "is this frame darker
than the two beside it".

**The navy trap, found on the Maldives re-roll.** Under `--photo` the copy
panel directly below the image is solid navy. A photograph that is itself
mostly navy dissolves into that panel and the card loses its top edge. That is
a composition constraint, not a brightness one, and no luminance threshold
catches it. Compose so the water is turquoise, or the frame is filled.

**Same-subject collisions inside one page's row.** Bora Bora and St Lucia both
came back as "peak above turquoise water seen from the sea" and would have sat
adjacent. Re-rolled Bora Bora to a palm-framed beach view with the mountain
small and distant. When two cards on one page share a shape, change the
camera, not the subject — and distance also lowers the landmark render risk.

**Same subject across two pages** is a different problem with a different fix.
Turks & Caicos and St Lucia appear on both Beach & Island and All-Inclusive.
They got a waterline shot and an infinity-pool edge, and both Pitons from the
water versus one Piton from a resort terrace at a different hour. Two real
photographs of one place, which is the patagonia/El Chaltén precedent.

## Where things stand

**Repo:** clean at `main` when this was written, everything below committed.
**Re-derive the counts** with the snippet under "The 11 pages still on
placeholders" rather than trusting any number written here. For the
launch-blocker workstream see `docs/seo/HANDOFF-launch-blockers.md`.

| | |
|---|---|
| Destination pages | **68** |
| On the photo panel | **67 of 67 that carry a grid — 386 cards, closed 2026-08-26** |
| Still on placeholders | **0** |
| No places-grid at all | **1** (maldives) |
| Experience pages | **12 of 12 photographed — closed 2026-08-24** |
| `/destinations/` index | 65 of 65 photographed, 65 distinct images |
| Higgsfield credits | **1458** |

### There are no pages left on placeholders

The last five — `bhutan`, `georgia-armenia`, `india`, `sri-lanka`,
`vietnam-southeast-asia` — were photographed on 2026-08-26. Both of these
now return nothing, and that is the check to run before believing any
number in this file:

```
grep -rl 'place-card__ph' src/content-pages/
grep -rl 'exp-card__ph'   src/content-pages/
```

`jordan` and `oman` came off this list on 2026-08-25; `south-africa`,
`zambia-victoria-falls`, `seychelles` and `vanuatu` on 2026-08-26, `morocco`,
`israel` and `uae-gulf` later the same day, then `aspen`, `australia` and
`new-zealand`, and finally the Asia five. The four originally named here were
the whole backlog at 43 destination pages; M7 then added 25 more, each shipping
its own six placeholders. **This was the single number in this file that was
wrong most often — derive it, never quote it.**

**The 27 remaining free frames contain nothing usable, and this was re-checked
by opening every candidate on 2026-08-26.** Only six clear the intake geometry
(≥1600px and ≥65% kept in a 3:2 panel), and all six were looked at, not
filename-matched:

| Frame | What it actually is |
|---|---|
| `p-02-north-island.jpg` | **not New Zealand** — a tropical reef aerial with coconut palms and a thatched villa roof |
| `i-01-maldives-season-guide.jpg` | a manta ray underwater |
| `i-02-anniversary-table.jpg` | a candlelit beach dinner table |
| `i-03-spring-amalfi.jpg` | Amalfi bougainvillea and a lemon terrace |
| `p-03-four-seasons-bora-bora.jpg` | an overwater villa row |
| `e-23-wimbledon-pimms.jpg` | **a side-by-side diptych** — two images with a seam down the middle, so it is unusable as one card frame at any size |

Three of those six filenames name a place the picture is not. That is the
`search-asset-families` lesson in its purest form: **look at the candidate,
never filename-match.** The other 21 are `rc-*` 760×435 related-card crops and
`og-*` 1200×630 social crops (both too small for a 1600px master) or `e-*`
1024×1405 portraits (the Botswana mistake).

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

## What the 2026-08-24 session did — the experience half, closed

**All 12 experience pages are photographed and on `.exp-cards--photo`.** 72 of
72 cards, zero placeholders. That half of #93 had not moved since the issue was
filed on 2026-08-11.

32 cards generated, 35 credits including 3 re-rolls, across four commits:

| Page | Cards | Slugs |
|---|---|---|
| safari-wildlife-travel | 6 | `e-33` … `e-38` |
| beach-island-escapes | 6 | `e-39` … `e-44` |
| wellness-retreat-travel | 6 | `e-45` … `e-50` |
| adventure-active-travel | 6 | `e-51` … `e-56` |
| all-inclusive-vacations | 6 | `e-57` … `e-62` |
| sports-event-travel | 2 | `e-63`, `e-64` |

New frames join the **`e-` family**, which is where experience imagery lives.
There is no `experiences-<page>-<slug>` convention and there should not be —
the six previously-photographed pages all reuse `dh-`, `jh-`, `d-`, `x-`,
`na-` and destination-slug frames.

### The pre-generation check that paid off

`npm run build` prints the unreferenced-image list at the end of every run. It
named six free `e-` frames — and all six turned out to be **1024×1405,
portrait**, unusable in a 3:2 panel. Checking the ratio took one command and
saved shipping the Botswana mistake six times. **A free image is only free if
its aspect ratio fits.**

Everything else in the repo that matched a subject by name was already in use
on a destination page, which is why this set was generated rather than
imported. That check is in "Check the repo before generating" below and it
still works — it just came back empty this time.

### tools/exp-card-intake.mjs

New. The `.exp-card` sibling of `place-card-intake.py`, which handles
`.place-card` in a `.places-grid` and was never going to do this half. It also
imports PIL, **which is not installed on this machine**, while `sharp` already
ships as a build dependency.

It does image → 1600px JPEG → b64 twin → MANIFEST entry → markup in one pass,
and refuses to run unless the image count matches the placeholder count,
because `--photo` is only safe when every card has a photograph.

It also performs the **scrim → panel transition**: `.exp-card__bg` is the
per-card slot that lets a grid upgrade one card at a time while `--photo` stays
gated. Once the last placeholder goes, every `__bg` must become `__img` and
every `__overlay` must go with it — under `--photo` the copy sits in a panel
*below* the image, so a surviving bottom-anchored scrim would darken a
photograph nothing is written over. Sports & Event was the first page to make
that transition; the tool refuses if any overlay survives.

**The destination equivalent now exists** — `tools/place-card-intake.mjs`,
written 2026-08-25. See the section below.

---

## What the 2026-08-25 session did — the tool, and jordan + oman

`jordan` and `oman` are photographed and on `.places-grid--photo`. 12 cards
generated, **13 credits** including one re-roll. 174 → 162 cards, 29 → 27 pages.

### tools/place-card-intake.mjs

The `.place-card` sibling of `exp-card-intake.mjs` and the replacement for the
PIL-dead Python script. Same four-step intake and the same `--photo` gate, with
three differences that are all lessons from this file made mechanical:

- **Cards match by NAME, not position**, and the slug is derived from the
  markup rather than passed. A mis-ordered argument list cannot put Petra's
  photograph on the Dead Sea card.
- **A 3:2 ratio guard.** A source keeps `min(r/1.5, 1.5/r)` of itself under
  `object-fit:cover`; below 65% the tool refuses. Fed
  `e-11-elephant-herd-aerial.jpg` it reports *"1024x1405 … would keep only
  48.6% of it"* — the Botswana figure, derived rather than remembered. The fix
  for a refusal is to pre-crop the source to 3:2, not to lower the floor.
- **Nothing is written until every image has passed**, so a failure on the
  sixth frame no longer leaves five orphan `.b64` twins.

Two things its tests caught that are worth knowing generally:

- **The content pages are CRLF.** Every one. A regex anchored on `\n` matches
  nothing, and `cat -A` will hide it from you when the line is long enough to
  be truncated first. Match `\r?\n` and write back the ending the file uses.
- **NFKD does not decompose the stroke letters.** `Tromsø` slugifies to
  `troms` without a transliteration table, because `ø` is a stroke, not a
  base letter plus a combining mark. `å`, `ç`, `á` are all fine; `ø æ œ ð þ ł`
  are not.

### The Muscat re-roll, and why it was worth a credit

The first Sultan Qaboos Grand Mosque frame came back as a near-perfect
**Sheikh Zayed Grand Mosque in Abu Dhabi** — single onion dome, brilliant white
marble, low white arcades, that minaret placement. The card's first clause names
Sultan Qaboos. That is the Riviera-Maya-on-the-Oaxaca-card error in a new
costume, and no luminance or ratio check catches it.

**The class of defect worth watching for: a landmark that renders as the wrong
country's landmark.** Re-specced with the features that actually distinguish it
— cream Indian sandstone not white marble, crenellated fortress massing, one
very tall slender central minaret plus four short corner ones, the bare Hajar
ridge behind — and it came back Omani.

### Luminance across each row

Three columns, so cards 1–3 are row one and 4–6 row two.

| jordan | | oman | |
|---|---|---|---|
| Petra (Monastery) | 152 | Wahiba Sands | 149 |
| Wadi Rum | 148 | Musandam | 185 |
| Dead Sea | 187 | Nizwa souk | 141 |
| Jerash | 137 | Wadi Shab | 121 |
| Amman | 124 | Muscat | 106 |
| Wadi Mujib | **91** | Jebel Akhdar | 132 |

Wadi Mujib at 91 was kept deliberately. It is the same shape as the Rwanda
bamboo and Mexico cenote frames: dark red canyon walls drag the mean down while
the subject — a lit turquoise watercourse under a shaft of daylight — is the
brightest thing in the frame and sits dead centre. **The metric lies in one
direction.**

### Collisions the pre-checks caught

`jordan`'s hero is the Treasury from the Siq, and `experiences/culture-immersive`
uses the same frame, so the Petra card could not be another Treasury. The copy
supplied the alternative itself: it singles out the Monastery. `oman`'s hero is
a mud-brick fort above a palm wadi, which ruled out a fort exterior for Nizwa —
hence the souk arcade.

Wadi Rum and Wahiba Sands are both "dune at golden hour" and were specced
explicitly against each other: Rum keeps its sandstone massifs, Wahiba was told
**no rock anywhere in frame**. Same for Wadi Mujib (tight vertical slot) against
Wadi Shab (open pool basin).

### Drive, re-verified 2026-08-25

Both MIME sweeps again — 100 `image/jpeg`, 41 `image/png`. Nothing for jordan or
oman, confirming the 2026-08-13 enumeration. Two independent queries agreeing is
the bar; a prefix search is not.

### One wart, pre-existing, now not spreading

A card named for its own region produced `alt="Musandam Peninsula, Musandam
Peninsula"`. The Python tool did the same and **eleven such alts are already
live** — Provence, Normandy & Brittany, Crete, Peloponnese, Tuscany, Sicily,
Brooklyn, Hudson Valley, Cusco, Lima, Brazil. The new tool collapses them;
Musandam was fixed by hand. The eleven are backfill, not a regression.
`australia` (Tasmania) and `india` (Kerala) will hit the same case when they
convert, and the tool now handles it.

---

## What the 2026-08-25 session did — the islands, and the batch rule proved

`barbados-eastern-caribbean`, `dominican-republic`, `jamaica`, `cook-islands`
photographed and on `.places-grid--photo`. 24 cards, **25 credits**, one
re-roll — the cleanest batch so far, on the hardest set. 114 → 90 cards,
19 → 15 pages.

### The constraint that made it work

Four tropical island pages will, left alone, return 24 photographs of
turquoise water and white sand. So each page agent was given a hard quota:
**at most two of its six cards may be a wide water-and-sand landscape**, and
had to declare a `cameraHeight` and `subjectClass` per card so the batch could
be counted mechanically before a reviewer ever saw it.

Result across 24: 6 water-and-sand, 5 architecture, 6 forest-or-mountain,
3 boat-or-working, 2 food-or-market, 1 interior, 1 street. **Declaring the
class is what made the quota enforceable** — and the reviewer's job became the
judgement calls rather than the counting.

Reuse this. It generalises to any batch whose pages share a landscape.

### What the adversarial pass caught that counting could not

- **A three-way twin across three pages.** Bathsheba (Barbados), Los Haitises
  (DR) and Negril (Jamaica) were all "water-level, pitted grey limestone
  undercut at the waterline, jade water". Negril kept it; the other two changed
  shape entirely.
- **A four-way arcade cluster.** Four of the five architecture cards were
  colonnades with pale stone floors, in four different countries.
- **Casa de Campo was a Tuscan hill town with a Dominican name attached.** The
  negations blocked a pyramid and Greek whitewash — not the lookalike that
  mattered. Same class as the Cartagena pyramid, pointed at Europe.
- **Two physical impossibilities.** Bathsheba faces east, so the specified
  mid-morning sun sat behind the sea and would have silhouetted the subject.
  The Platinum Coast asked for a nadir that was also "looking seaward" with no
  ocean in frame.
- **A label that lied.** One Foot Island was declared `architecture`; the
  prompt was a beach with a hut in it. **Read the prompt, not the class.**

### The bright-bottom instruction can be followed too literally

The first Blue Mountains coffee frame put a blank pale concrete band across
the bottom **quarter** of the picture — technically a bright base, actually a
dead zone that reads as an unfinished edge at card size. Re-rolled asking for
the drying bed to fill the frame with only a narrow margin. Say *narrow*.

### Cross-page note for a later batch

`jamaica`'s hero and `sri-lanka`'s hero are near-identical skeletons — misted
green ridges, valley cloud, low sun. Verified by eye. Sri Lanka's tea terraces
are the only thing separating them, so when `sri-lanka` is photographed its
Nuwara Eliya card must not be tea terraces at sunrise.

---

## What the 2026-08-25 session did — Latin America, and a bad metric

`argentina`, `brazil`, `colombia`, `costa-rica` photographed and on
`.places-grid--photo`. 24 cards, **27 credits**, three re-rolls. 138 → 114
cards, 23 → 19 pages.

### READ THIS BEFORE YOU MEASURE ANYTHING

**`sharp().stats()` silently ignores the pipeline in front of it — BOTH
`.extract()` and `.greyscale()`.** So the natural-looking

```js
sharp(file).extract(region).greyscale().stats()   // WRONG, twice over
```

measures **the red channel of the whole source image**. Not the region, and
not luminance. It never throws and the number always looks plausible.

This corrupted every luminance figure in this project until it was caught. It
hides on neutral subjects — snow, ice, pale stone — where R ≈ G ≈ B and red
tracks luma closely, which is exactly why the polar batch's numbers looked
sane. It falls apart on saturated colour: a sunlit turquoise sea band read
**29** by that route and **108** by real arithmetic.

Measure by decoding raw pixels and computing Rec.709 luma yourself:

```js
const {data, info} = await sharp(f).extract(region).raw().toBuffer({resolveWithObject:true});
// sum 0.2126*R + 0.7152*G + 0.0722*B over every pixel
```

**What the bad metric cost, in both directions.** It said Carcass & Saunders
had a base band of 52 and it was re-rolled; the real figure was far higher and
that credit was probably wasted. It also said `tromso` and `nuuk` had bases of
101 when they are really 79 and 81 — both were kept, correctly, but on a
number that was wrong. Two frames flagged in this batch (`santa-marta` at a
"29" that is really 108) were nearly re-rolled for nothing.

### The threshold was never the point — composite against the panel

A base band near 100 sounds alarming and is usually fine; the copy panel is
about **luma 26**, so 79 is still three times it. What decides the question is
hue and texture, not a number:

- `tromso` base 79 — saturated orange survival suits. Low luma, enormous
  colour separation from navy. Fine.
- `nuuk` base 81 — sunlit gold tundra scrub. Fine.
- `medellin` base 71 — warm red-brown roofs, varied. The weakest shipped, and
  accepted after looking.

So: crop the bottom 30%, paste it on a `#101A30` panel, and **look at the
seam**. That answers it in one glance and no threshold does.

### Three re-rolls

- **Buenos Aires** came in at crop 92 beside a 166 and a 171 — the reviewer
  had predicted "nearer 90–120" and was right. An empty auditorium cannot
  reach the row. Moved to the San Telmo Sunday fair, which the card's copy
  also names: 112, and it *reads* bright because the lit subject is centred.
- **Cartagena** rendered Castillo San Felipe as a **Mesoamerican stepped
  pyramid** — and Monte Albán is already live on experiences/culture-immersive.
  The wrong-country landmark in a new costume. Fixed by naming the angular
  arrowhead bastion, the garitas, dark coral stone and the modern city behind.
- **Medellín** put a dark gondola window rail straight across the bottom edge.
  Removed the cabin entirely rather than negating the rail.

### What the adversarial pass caught this time

A **season impossibility** of the Tromsø kind: Mendoza asked for frost on the
leaves *and* ripening bunches. Frost is a spring event and fruit is late
summer — the prompt described a destroyed crop. Also a card photographing the
**wrong country for its own page**: Brazil's Iguaçu stood on the Argentine
side, which would have made it a duplicate of argentina's card *and* put no
Brazil on the Brazil page. And four cards negating text on objects that
inherently carry it — barrio walls, museum vitrines, a Chocó panga's bow
registration. **Remove the object, do not negate the lettering.**

### One subject, two pages, two photographs

Iguazú/Iguaçu is on both argentina and brazil. Each page now shows **its own
side of the border** — Argentina from beneath Salto Bossetti, Brazil across
the gorge — which is the Turks & Caicos precedent applied to a border.

---

## What the 2026-08-25 session did — the polar batch, and a live bug

`arctic-norway`, `greenland`, `svalbard`, `falklands-south-georgia` are
photographed and on `.places-grid--photo`. 24 cards, **26 credits**, two
re-rolls. 162 → 138 cards, 27 → 23 pages.

### The four weak pairings in #93 were already fixed

Verified by file identity and by looking at the pixels, not by trusting a
commit message. Napa & Sonoma, the shared Alaska/Canadian-Rockies heli-ski
frame and the portrait Botswana aerial were all fixed in `d02d80d` on
2026-08-09; culture-immersive Mexico in `0510321`. The Botswana card loads
`pc-e-11-…` at 1024×683, a true 3:2 crop — the 1024×1405 portrait is only
that page's hero and the card never loads it. **The issue body had been
stale on this point for two weeks.**

### A link in card copy splits the card in two

`.place-card` is an `<a>`. An `<a>` inside an `<a>` is invalid, and the
parser's adoption agency algorithm closes the outer anchor early and
**clones** it, so one card becomes a photograph with no body, a body with no
photograph, and a fragment. `/destinations/argentina/` was rendering **12**
`.place-card` elements for six cards, live, on the swatch layout.

28 of these were shipped across 10 pages, every one an authoritative-source
link inside `.place-card__desc`. Nothing caught it because the SOURCE is
well-formed — six anchors, six closers. Only a real parser sees it. Fixed in
`7f4d7b6` with a `nested-card-anchor` check that reads the tag stream, driven
red against real `dist/` first.

**This is why a card must be measured in a browser, not only greped.** The
build was green on all 123 pages with three cards visibly broken.

### `sharp().stats()` ignores the pipeline

`sharp(buf).extract({...}).greyscale().stats()` does **not** measure the
extracted region — `stats()` analyses the source image and silently discards
prior pipeline operations. Every "3:2 crop luminance" number in a review is
the whole 16:9 frame unless the crop was written to a buffer and re-opened
first. It was caught here only because a bottom-band measurement came back
byte-identical to the whole-frame mean for all 24 frames at once, which is
not a thing that happens.

### Measure the bottom eighth, not just the mean

The copy panel sits **below** the image, so the base is the one edge where a
dark mass costs the card its boundary. Whole-frame means hid it:

| | crop | base |
|---|---|---|
| carcass-saunders (as generated) | 96 | **52** ← re-rolled |
| carcass-saunders (re-roll) | 132 | 177 |
| tromso | 182 | 101 — kept, ~4× the panel |
| nuuk | 126 | 101 — kept |

The navy panel is about luma 26. A base near 100 is four times that and holds
its edge; 52 does not. Only one of 24 frames actually failed, and the mean
alone would have flagged the wrong ones.

### The other re-roll was a copy mismatch, not a metric

The Coastal Route came back as a heritage pleasure steamer — ornate white
looping railing — on a card whose copy says "transport with a cabin rather
than a cruise". Every number was fine. Re-specced to a plain painted steel
bulwark. **No check catches a frame that contradicts its own copy; that is
what looking is for.**

---

## What the 2026-08-26 session did — Africa & the Indian Ocean

`south-africa`, `zambia-victoria-falls`, `seychelles`, `vanuatu` photographed
and on `.places-grid--photo`. 24 cards, **28 credits**, four re-rolls across
three frames. 90 → 66 cards, 15 → 11 pages.

### Looking at the hero paid twice in one batch

The rule in the Prompt — open the page's own hero before choosing a subject —
had, until now, only ever prevented a near-miss. Here it caught two cards that
would have been straight duplicates of the photograph directly above them:

- **seychelles**' hero *is* Anse Source d'Argent: granite boulders, leaning
  palm, sunset. That is the La Digue card's obvious subject and the one its
  copy names. La Digue became the bicycle lane instead — copy-grounded
  ("bicycles are the transport, not the activity") and a different subject
  class from anything else on the page.
- **vanuatu**'s hero *is* Mount Yasur erupting at dusk. That is the Tanna
  card's obvious subject and the first clause of its copy. Tanna became the
  grey ash plain in flat morning light with the cone smoking small and distant
  — same mountain, opposite hour, opposite palette.

Both pages would have shipped a hero and a card of the same photograph. Neither
luminance nor the ratio guard nor the build sees this.

### A new defect class: the wrong SPECIES for the card's own copy

North Luangwa's copy exists to say one thing — "Black rhino were reintroduced …
this is the only place in Zambia they live". The first frame came back a
textbook **white rhino**: square grazing lip, long head carried low, nuchal
hump. Every number was fine (crop 176, base 198).

This is the Muscat error — a landmark rendering as the wrong country's
landmark — in taxonomic costume, and it will recur on any card whose claim is a
species rather than a place. The fix is the same shape: name the features that
actually distinguish it. "Narrow pointed prehensile upper lip hooked over a
browsed twig, small head held high" came back correct on the next try.

**Where the naming convention hides it:** the slug is
`zambia-victoria-falls-north-luangwa`, the alt is "North Luangwa, Muchinga
Province". Nothing in the filename, the alt or the markup says "rhino", so
nothing downstream can ever contradict the picture. Only reading the copy and
looking at the animal catches it.

### Naming a dark material in the foreground is a predictable base failure

Both base-band failures in this batch were **written into the prompt**:

| Frame | Foreground I asked for | base |
|---|---|---|
| Victoria Falls | "bare black basalt … wet and bright in hard sun" | **46** |
| Vava'u humpbacks | "clear deep blue water" below the whale | **42** |

Both sat around the carcass-saunders figure of 52 that earned a re-roll in the
polar batch. "Wet and bright in hard sun" does not rescue black rock, and a
sunlit surface above does not rescue deep blue water below. The panel is luma
26; these were within 2× of it and would have lost the card's bottom edge.

So add a step before submitting: **read your own foreground clause and ask what
its luma is.** If the material named there is black rock, deep water, dense wet
foliage or shadow, the base band will fail — change the material, not the
lighting adjective. The fixes were "dry sun-bleached pale grey and ochre
basalt, bone dry and dusty" (base 46 → 185) and putting the whale's white
ventral pleats and both white pectorals across the bottom edge in bright
turquoise rather than navy (42 → 162).

### The tree-cat chain, and why the fix cascaded

Sabi Sand's headline is leopards; Kafue's copy says "lion that climb". Specced
independently, both would have been a cat lying along a horizontal branch, on
adjacent pages in the same batch. And Sabi Sand's *other* obvious frame — a
leopard on a sand track at night — is already live as `botswana-khwai`, a
blue-hour spotlit leopard walking a track.

So the constraint chained: Kafue keeps the tree (it is the page's actual
claim), which pushes Sabi Sand off the branch, and Khwai pushes it off the
night track. What is left is a leopard and cub in dappled jackalberry shade in
late afternoon — which is the strongest of the three anyway. **A cross-page
twin and an intra-batch twin resolved by one move.** This only works if the
already-shipped neighbours are on screen while the concepts are written.

Two more caught the same way, both dropped before generating:

- **Kafue** was first specced as red lechwe exploding through floodwater, which
  is the same "many ungulates on wet grassland" shape as **Liuwa**'s wildebeest
  — on the same page.
- **Aldabra** was first specced as champignon limestone undercut in jade water.
  That is precisely the shape Negril kept in the Caribbean batch on 2026-08-25.
  Replaced with the tortoise mass on the tidal flat, which is also the better
  reading of "the largest giant tortoise population on earth".

### Drive, swept again 2026-08-26

Both MIME sweeps: 100 `image/jpeg`, 41 `image/png`. Nothing for any of the four
pages. `africa-south-africa.png` and `africa-zambia-and-victoria-falls.png` are
in the folder and are **hub cards** — already the two pages' heroes, not a set
of six. That is the documented patagonia/peru trap, still live, still the first
thing a prefix search will hand you.

### One frame shipped that a stricter reviewer would re-roll

`south-africa-garden-route-and-overberg` — Storms River mouth, crop 156, base
181, well composed and bright. But the canopy reads eucalypt and the surf reads
temperate Pacific; without the caption it could be coastal Australia, and
`australia` is still unphotographed with a "Melbourne & the Great Ocean Road"
card in it. It is not wrong for its copy, which names Tsitsikamma's forest and
river gorges, so it shipped. **When australia is specced, its Great Ocean Road
card must not be a forested river mouth** — go to the limestone stacks.

### Verified in the browser, not just greped

All four pages at 1440, 768 and 375 with `loading` forced to eager: 24 panels
at exactly 3:2, every image loaded, card heights uniform within every row,
`.place-card__arrow` baselines aligned per row (2699/2699/2699 then
3306/3306/3306 on seychelles), zero `.place-card__ph` left, zero horizontal
overflow at any width. Alt text came out clean on all 24 — no repeat of the
`"X, X"` wart, since no card here is named for its own region.

Note for the next session: **the Browser pane could not composite**, so
`computer{action:"screenshot"}` timed out every time. `read_page`,
`javascript_tool` and the DOM measurements above all worked normally — the
measurements are the verification, and a screenshot was never the evidence.
Don't burn time retrying it.

---

## What the 2026-08-26 session did — the desert three, specced by a workflow

`morocco`, `israel`, `uae-gulf` photographed and on `.places-grid--photo`.
18 cards, **22 credits**, four re-rolls. 66 → 48 cards, 11 → 8 pages.

This batch was specced by a 12-agent workflow rather than by hand: recon on the
three pages, a catalogue of the 18 live `jordan` / `oman` / `egypt` frames, six
concepts drafted per page, then **three independent adversarial lenses over all
eighteen concepts at once**, then a synthesis. 64 findings, 11 blocking, 65
applied, 8 rejected with reasons. It is worth the setup on a batch this
collision-heavy; it would be overkill on four polar pages.

### The three lenses, and why they must see everything at once

- **copy-fidelity** — does the frame deliver what the card's own copy promises,
  and is it physically and seasonally possible?
- **twins** — the only agent given all 18 concepts *and* all 18 shipped
  neighbours *and* the three heroes. Twins are invisible to a per-page pass by
  construction.
- **render-risk** — what the model will actually produce, and what the card
  will look like in its row: base band, row brightness, landmark misrender,
  text-carrying objects, side-edge composition.

Splitting it this way is what made the collisions legible. Two lenses hit Fez
from opposite directions and **both were right**: copy-fidelity said the frame
had quietly deleted the vats the copy names ("the Chouara tannery from a
terrace above the vats"), render-risk said negating the honeycomb is negating a
landmark's *dominant* feature and never works. The fix had to satisfy both —
the pits return as a cropped left-edge fragment, and the words *Chouara* and
*tannery* are banned from the prompt so the honeycomb is foreclosed by parapet
geometry instead of by words. **Banning the attractor word works where negating
the feature does not.** That is the one prompt trick in this file that has
never failed.

### One card was reassigned outright, on three findings at once

Aït Benhaddou & the Valleys was drafted as Todra Gorge. It was simultaneously a
twin of israel/Masada, a twin of the LIVE `egypt-aswan` frame, and physically
impossible: a face-on wall in a north–south gorge takes no direct sun at solar
noon, and the narrow geometry manufactures the shaded floor the concept claimed
to refuse. Reassigned to the Dades hairpins seen obliquely from the viewpoint
above — which also let the village be cut, so no earthen kasbah architecture
echoes the morocco hero.

### The cross-page twin no page-at-a-time pass can see

morocco's **seguia** and uae-gulf's **falaj** are the same object, and both sat
in the base band. The seguia was deleted from The High Atlas — which also
pulled that frame off the morocco hero's own braided-water-over-pale-cobbles
foreground. One deletion, three problems.

### Astronomy caught the Negev twice

The draft put a 20 per cent crescent low behind the camera to rake the chalk. A
crescent delivers 0.01–0.02 lux against an exposure set for the Milky Way core,
so it does nothing. Render-risk's proposed replacement window — 04:40 in
mid-July — was also wrong: the core is roughly six hours past transit by then
and setting in the west-south-west. The synthesis took the *hour* concept (end
of nautical twilight) at copy-fidelity's *early-May* date, when the core is
still about 25 degrees up, and dropped the moon entirely. **Both lenses were
half right and the synthesis had to know the astronomy to combine them.**

### The Negev also proves a rule about dark frames

It measured **crop 56, base 123** — by far the darkest whole-frame in the
rollout, and it shipped. Its copy ends "and so is the country's darkest sky",
and one of its three tags is *Desert Skies*. A daylight makhtesh would have
been brighter and would have thrown away the card's third claim. The base band
is what protects the card's bottom edge, and 123 is nearly five times the
panel; the whole-frame mean is not the test. **Read the copy before re-rolling
a dark frame — sometimes dark is the claim.**

### Four re-rolls, and what each was

| Card | v1 | Why | v2 |
|---|---|---|---|
| Caesarea & Akko | crop 82, **base 76** | the sun sheet landed mid-frame, near floor in shade | 113 / **194** |
| Masada | crop 195, base 239 | landmark misrender — a soft eroded mesa, not a sheer flat-topped table; blown out | 156 / 202 |
| Ras Al Khaimah | crop 192, base 212 | pale grey limestone read as **snow**, in the UAE | 171 / 187 |
| Abu Dhabi | crop 204, base 231 | CGI-clean and dead axially symmetric — a hero echo, since the uae hero is a floodlit symmetrical dome | 166 / 216 |

Two of those four are new failure modes worth naming:

- **A palette can misrender into a different climate.** "Pale grey sun-bleached
  limestone" plus haze returned a snowfield. The fix was to state the warm
  arid palette positively — ochre, tan, brown-grey, "sun-baked" — not to add
  another "no snow". Negation had already been in the prompt and lost.
- **A frame can echo the hero through composition alone.** The Louvre dome
  shares no subject with Sheikh Zayed Grand Mosque, but shot dead-on it shared
  the hero's axial symmetry and dome silhouette. Fixed by moving the camera off
  axis, not by changing the subject.

### The concepts came back over-specified, and that is fine

The synthesised concepts ran 800–1,400 characters each and carried `x∈[0.12,
0.88]` coordinate notation and long negation lists. Coordinates are not
honoured by the model and negation lists are the thing this file keeps warning
about. They were compressed to the working house shape (~150–200 words) before
generation, keeping what is load-bearing — named hour, foreground material,
landmark markers, object *removals* — and dropping the notation. **Let the
adversarial pass over-specify; compress at prompt-writing time.** The reasoning
is worth more than the wording.

### Where the workflow is worth it

Twelve agents, ~39 minutes, 1.19M subagent tokens, zero errors. It earned its
keep here because 18 cards collided against 18 live neighbours across three
pages plus three heroes — 39 frames to hold in one head. On a batch with less
collision surface, the hand loop in the Prompt is still faster.

---

## What the 2026-08-26 session did — the Anglo three, and four ski mountains

`aspen`, `australia`, `new-zealand` photographed and on `.places-grid--photo`.
18 cards, **21 credits**, three re-rolls. 48 → 30 cards, 8 → 5 pages. Same
12-agent workflow shape as the desert batch: 59 findings, 10 blocking, 25
applied, 6 rejected.

### Four ski mountains in one valley — the hardest page yet

`aspen` has six cards and **four of them are ski mountains a few miles apart**.
Specced independently they are four photographs of pistes between conifers
under blue sky, twice per row. The thing that solved it was making recon
return, for every card, not its obvious subject but **what that place is FOR
according to its own copy** — the job it does that its siblings do not. From
that, four axes were forced apart at once and written down:

| | Terrain | Vantage | Hour | Weather |
|---|---|---|---|---|
| Aspen Mountain | one steep ungroomed mogul fall line, no apron | 300mm from a bench two miles off | 11:00 | cloudless cobalt, hard cross-light |
| Highlands | wind-scoured knife ridge, **no piste in frame at all** | standing on the boot track, boot height | 09:30 | hazy, near-monochrome, valley inversion |
| Snowmass | wide multi-tier groomed fan | close wide-angle at the base | 12:30 | high overcast, shadowless |
| Buttermilk | one broad shallow convex teaching roll | low and open, 60% empty sky | 15:30 | cumulus, low raking sun |

**The hour table is now load-bearing.** Highlands and Buttermilk were still
twins after the first pass — both treeless, structureless, near-monochrome, at
09:30 and 09:20 — and Buttermilk moved, because Highlands' hour is fixed by
inversion physics while Buttermilk's had been chosen only for snow firmness. If
a re-roll ever changes one of those four hours or sky states, **re-run the
four-way comparison before accepting it**. Record the hours next to the prompts.

### Look at the hero: three for three

Third consecutive batch, and this time two of three heroes collided head-on:

- **aspen's hero IS the Maroon Bells** and the page has a card called "Maroon
  Bells & the Passes". The card went to Independence Pass. Note how the
  exclusion was finally secured: not by negating the Bells in the prompt but by
  **fixing the look direction** — facing east-north-east puts them 110 degrees
  off axis behind the photographer, so they cannot appear.
- **new-zealand's hero IS a fiord at dawn** and the page has "Queenstown &
  Fiordland". The card went to the Shotover canyon.

And two cards were echoing a hero by **composition with no shared subject**:
Tasmania was reassembling australia's hero shape — a free-standing mass on a
clean horizon — and was rebuilt into three bands with the crest exiting the
right edge; Rotorua was reassembling the NZ hero's signature of white vertical
ribbon + horizontal cloud band + dark bush, and became a widening ragged boil
with diagonal steam.

### Southern-hemisphere months are a live trap

Two blocking findings were solar-geometry errors that only bite below the
equator or at a named clock time:

- **Sydney at 07:00 AEDT** was specced for side-light and an eastern sea band.
  At 07:00 the sun is **5.6 degrees** up, not the 20–25 the frame needed. Moved
  to 08:15 — and removing the horizon to fix the light also dropped australia
  from four flat-sea-horizon frames to three.
- **Doha, Al Ain, Ras Al Khaimah and Dubai** in the previous batch and
  **Buttermilk, Kata Tjuta and Melbourne** in this one all had their month or
  hour moved because the stated sun elevation and the stated light did not
  agree. Always state the month, and check the elevation against it.

### Melbourne's limestone is in the cliff FACE, not on top

The draft put karst pavement on the clifftop at Port Campbell. It is not there:
the limestone is exposed in the cliff and the stacks, and the clifftop is bare
calcareous sand and heath. Correcting it cascaded — the proposed replacement
foreground was tussock, which would have been a **third straw foreground on one
page**, beside Tasmania in the same row and under Kata Tjuta at the two-column
breakpoint. Weighted to near-white sand instead, leaving Tasmania the only
hummock-and-cobble moor.

### Accuracy can lose to the text rule

Shotover's jet boats really are red. But a red boat there is one specific
liveried commercial vessel, and every training image of it carries the
operator's name in metre-high letters along the hull. **The colour was dropped
and the hull became plain brushed aluminium**, with the red preserved on the
passengers' splash jackets. When a true detail is also the strongest attractor
for lettering, the text rule wins. The helmets went in the same fix — commercial
jet boats do not use them, and helmet plus spray plus canyon returns a raft crew.

### Three re-rolls

| Card | v1 | Why | v2 |
|---|---|---|---|
| Stewart Island | 45 / **84** | torch falloff reached both bottom corners | 63 / **142** |
| Kimberley | 159 / **95** | shot into the sun, and the vessel's own roof edge cut a dark diagonal across the top | 175 / 119 |
| Great Barrier Reef | 198 / 214 | **numbers fine, frame wrong** | 197 / 224 |

The Reef is the one worth remembering. Every measurement passed and the picture
was attractive, but its copy is about *"the liveaboards working the northern
Ribbon Reefs"* and *"which operator, and how far out they go"* — and what came
back was a **sailing charter catamaran** with a mast, in inshore-pale water.
That is the Coastal Route steamer again: no check in this repo can catch a
frame that contradicts its own copy. Re-specced as a mastless motor dive vessel
with a flat open aft working deck at the crest.

### The dark-frame rule, now with a second data point

Stewart Island ships at **crop 63, base 142** — the page's only night frame,
and the second-darkest in the rollout after the Negev's 56. Its copy is about
kiwi at night on the beach, so night is the claim. **Judge a night card on its
base band alone; the frame mean is not the test.** Both dark cards that shipped
did so on a base above 120 while their means were under 65.

### Where the workflow is worth it, refined

Twelve agents, ~46 minutes, 1.47M subagent tokens, zero errors — against ~39
minutes for the desert batch. Worth it again here because 18 cards collided
against 30 catalogued live frames plus three heroes. Asking for concepts under
900 characters also worked: the desert batch returned 800–1400 characters
stuffed with coordinate notation that had to be compressed by hand, and these
came back usable with only light trimming.

---

## What the 2026-08-26 session did — the Asia five, and the rollout closed

`bhutan`, `georgia-armenia`, `india`, `sri-lanka`, `vietnam-southeast-asia`
photographed and on `.places-grid--photo`. 30 cards, **40 credits**, six
re-rolls. 30 → 0 cards, 5 → 0 pages. **#93's destination half is closed and
the site now has zero place-card and zero exp-card placeholders.**

### Count credits from the balance, not from the number of frames you kept

This batch generated 36 frames (30 + 6 re-rolls) and the balance moved
**1498 → 1458, which is 40**. Six submissions came back
`429 rate_limit_reached` and were resubmitted; the four-credit gap is
unexplained by the frames actually delivered, and the most likely reading is
that a rejected submission can still cost. **Read the balance before and after
a batch and quote the difference** — every per-batch figure in this file above
was derived from frames kept, so any of them may understate by a few credits
the same way.

### Every one of the five heroes collided with a card on its own page

Three consecutive batches had found one or two hero collisions. This one was
**five for five**, and each counts twice because every one of these heroes is
also that page's regional-hub card:

| Page | Hero is | Card it collided with |
|---|---|---|
| bhutan | Taktsang | Paro Valley — its copy opens *"Taktsang is here"* |
| georgia-armenia | Tbilisi from Narikala at sunset | Tbilisi |
| india | the Taj Mahal at dawn | Agra — its copy opens *"The Taj Mahal at opening"* |
| sri-lanka | tea terraces at sunrise | Nuwara Eliya & Ella |
| vietnam | Ha Long karst in mist | Ha Long & Lan Ha Bay |

The sri-lanka one was **predicted in this file in August** and confirmed by
looking. If the "open the hero first" step is ever dropped, this is the batch
to point at.

### The three lenses, run over all 30 concepts at once

Same shape as the desert and Anglo batches: copy-fidelity, twins, render-risk.
**28 blocking findings between them**, and they barely overlapped — only
Kakheti's Caucasus snow wall was caught by two lenses independently.

**copy-fidelity was the highest-value lens this time**, because it computed
sun positions against each subject's actual orientation rather than checking
that an hour sounded plausible:

- **Gal Vihara's images face south. At 7.94°N in July the sun rises at azimuth
  68° and sets at 292°, so it never enters the 90–270° window a south face
  needs — the relief is unlit at every hour of the day.** At the drafted 11:00:
  93% on the sand at its base, 0% on the subject.
- **Ngo Mon is the Citadel's south gate**, so mid-June gave it 0% too. The
  grey-brown brick the whole frame was built on would have sat in flat shade.
- **Pidurangala is north of Sigiriya**, so the camera sees the rock's NNW face
  — 0% in February. Moved to a May evening when the sun sets north of west.
- **November is Delhi's annual air-quality minimum**; "white marble against
  deep blue sky" is not available that month.

**The rule this adds: for any card whose subject is a wall, a façade or a
relief, work out which way it faces before choosing the hour.** A landscape
forgives a wrong hour; a flat vertical surface does not.

### The finding no arithmetic could have produced

Nuwara Eliya was drafted as the World's End escarpment dropping into "a bright
void of low cloud". The card's own copy says the walk is *"worth the six
o'clock start — the escarpment at World's End clouds over most mornings by
nine"*. **The frame was a photograph of the exact condition the copy tells you
to get up early to beat**, and it simultaneously contradicted its own "the
southern plains far below". Fixed to the plains visible to a hazy horizon with
a few cloud shreds below the rim only. No metric sees this; only reading does.

### Six re-rolls, and the two classes worth naming

| Card | v1 | Why | v2 |
|---|---|---|---|
| Phobjikha | 146 / **81** | **wrong species** | 178 / 148 |
| Sigiriya | 127 / **43** | base band — dark canopy at the bottom edge | 165 / 139 |
| Haa Valley | 143 / 173 | **numbers fine, frame wrong** — came back Austria | 129 / 165 |
| Agra | 135 / 151 | landmark misrender — a pagoda | 122 / 119 |
| Hue | 168 / 165 | landmark misrender — the Forbidden City | 184 / 190 |
| Kandy | 187 / 230 | 40% empty sky, quarter-frame blank paving | 145 / 218 |

- **The species error survived being explicitly guarded against.** Render-risk
  caught that the draft's *"black head and neck, white body, red crown"* is a
  **red-crowned crane**, a Japanese bird. I rewrote it — and the model returned
  a red-crowned crane anyway, in a frost-and-conifer landscape that read
  Hokkaido, on a Bhutan page with `japan` live on the site. What finally worked
  was foreclosing it: *"its entire head and its entire long neck are solid
  black from bill to shoulders, with no white on the neck at all"*. **State the
  feature that the wrong species cannot have, not the features the right one
  has.**
- **Two landmarks misrendered into the wrong country in one batch**, both
  predicted by render-risk and both from a word rather than a shape. *"Five
  tiers, each smaller than the one below"* fetched a **pagoda** for the Panch
  Mahal; the fix was to ban *tier* and say *"every roof is a plain flat
  horizontal stone slab with a straight square edge, no curve, no upswept
  corner"*, plus *"broader than it is tall"*. Hue's Ngo Mon came back as the
  **Meridian Gate of the Forbidden City**, which it is modelled on and which
  outweighs it hundreds to one in training data; negating features was never
  going to win, so the subject moved to Thien Mu's seven-storey tower — which
  the copy supports as part of the same World Heritage complex.

### Two frames shipped that a stricter reviewer would question

Recorded rather than buried, as with `south-africa-garden-route`:

- **`georgia-armenia-yerevan-and-the-ararat-plain`** — rose tuff with Armenian
  geometric carving, correct for the copy's *"Yerevan is built in pink tuff"*,
  but it says "Armenia" less loudly than the page's other five. It got there
  legitimately: the drafted roofscape-with-Ararat was a **composition-only
  echo of the hero** (same high vantage, same warm lower two-thirds, same hazy
  band across the top, no shared subject), and going into the Cascade was the
  fix. The identity cost was the price of not repeating the hero.
- **`vietnam-southeast-asia-hue`** — a pale octagonal seven-storey tower over
  the Perfume River. Genuinely Thien Mu's shape, but generic enough that it
  could pass for a Chinese stone pagoda at card size.

### Verified in the browser, not just greped

All five pages at 1440, 768 and 375: 30 panels at exactly 3:2 at every
breakpoint, card heights uniform at 584px within every row, `.place-card__arrow`
baselines aligned per row, zero horizontal overflow, every image 200 and
decoding at 1600×899, every `alt` and intrinsic dimension present, all lazy,
zero `.place-card__ph` and zero `.place-card__overlay`. `a.place-card` parses
as exactly 6 per page — the guard against the nested-anchor bug from `7f4d7b6`.

**Measure loaded-ness with `img.decode()`, not `img.complete`.** Flipping
`loading` to eager after parse does not force a synchronous fetch, so a
naive check reported all 30 images "broken" while a HEAD request on every one
returned 200. The handoff already said to set eager before measuring; that is
necessary and **not sufficient** — you have to await the decode.

The Browser pane still could not composite, so `computer{action:"screenshot"}`
timed out exactly as on 2026-08-26. Unchanged: the measurements are the
verification, a screenshot never was.

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
- ~~**The experience half of #93.**~~ **Closed 2026-08-24** — 12 of 12 pages
  on `.exp-cards--photo`, 72 of 72 cards.
- ~~**The destination half of #93.**~~ **Closed 2026-08-26** with the Asia
  five — 67 of 67 grids on `.places-grid--photo`, 386 of 386 cards, zero
  placeholders site-wide. **#93 is fully closeable.** The whole workstream ran
  2026-08-12 → 2026-08-26 for roughly 240 credits.
- **M7 is 1 of 26 pages.** Every one is labelled `needs-mark`. The blocker is
  not images — it is page authoring plus two things only Mark can supply:
  a first-hand line (`CONTENT-STANDARDS` § 6) and cost figures. **One sitting
  with Mark on first-hand detail would unblock all 26 at once.**
- **India's cost band is `held`** in `tools/cost-ranges-data.mjs`, shipping
  commented like bali/hawaii. Same for its two `NEEDS MARK` comments.
- ~~**No destination page sets a per-page `og:image`.**~~ **Closed 2026-08-18**
  by `aa7a271`, eight days before the last two entries in this section were
  written. `tools/make-og-crops.mjs` cuts a 1200×630 `og-` crop from each
  page's hero, writes the base64 twin and the MANIFEST entry, and generates
  `src/lib/og-crops.ts`; `DestinationLayout`, `ExperienceLayout` and
  `JournalLayout` look `hero.image` up in that table, so no page file passes an
  `ogImage` prop and none needs to.
- **`docs/seo/photography-needed.md` is stale** — it lists 25 missing heroes;
  22 of those subjects now exist. It would send someone hunting for images
  that ship.
- **`docs/seo/photography-plan.md` is now stale too.** Its Workstream B table
  lists 30 pages / 162 images; the real remainder is **zero** — Workstream B
  is finished. Its "1 of 163 slots comes free" line never held either: 99 came
  free from Drive and 1 more from the repo. Only its sequencing argument
  (A before B) still stands. **Now safe to rewrite or delete**, which the last
  page shipping was the stated condition for.
- ~~**No per-page `og:image` on any of the pages shipped 2026-08-26.**~~ **Was
  already false when written** — it restated the bullet above from memory
  instead of reading `dist/`, and the crops had shipped in `aa7a271` eight days
  earlier. The last three holdouts — pages whose hero is a 1024×1405 portrait
  that `MIN_SOURCE_RATIO` refuses to crop — **closed 2026-08-26** with
  `HERO_FALLBACK` in `make-og-crops.mjs`: a hero too tall to crop now names a
  landscape stand-in and the crop comes off that instead. `destinations/bali`
  takes `e-45-ubud-yoga-pavilion` (its own hero's subject, in 16:9),
  `destinations/botswana` takes its own `botswana-okavango-delta` place card,
  and `travel-journal/willamette-valley-winery-route` takes
  `napa-sonoma-the-valley-floor`. No layout changed — the table is keyed by
  hero, which the three section layouts already look up.

  Measured in a clean build: **111 of the 122 pages carrying an `og:image` ship
  their own crop, and destinations is 68 of 68.** The 11 left on the crest
  plate have no hero to crop — the 7 utility pages (`/`, `/about`, `/contact`,
  `/faq`, `/plan-your-trip`, `/privacy-policy`, `/terms-and-conditions`), the
  3 section indexes (`/destinations`, `/experiences`, `/travel-journal`), and
  `travel-journal/aspen-book-early`, which still carries its `NEEDS IMAGE`
  comment. **That is the floor.** No page gains a share card until it gains a
  picture, so there is nothing further to pick up here.

  Two rules if you ever add a fourth stand-in. **It must assert less about
  place than the hero it replaces, never more** — Willamette's first draft used
  `e-06-tuscan-landscape`, whose cypresses and villa shout Tuscany on an
  article titled "Oregon's Answer to Burgundy", while the hero it stood in for
  was only a generic tasting interior. And **the table is keyed by picture, not
  by page**, so a stand-in named for a hero that two pages share would reach
  both; the tool now exits 1 rather than let that ship. **Read `dist/` before
  quoting any count in this section — both of these bullets were wrong on the
  day they were written.**
