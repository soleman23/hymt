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

STATE, re-derived on 2026-08-25 (second session that day):
  EXPERIENCES — DONE. 12 of 12 pages on .exp-cards--photo, 72 of 72 cards
    photographed, zero placeholders. Closed 2026-08-24; do not re-plan it.
  DESTINATIONS — 52 of 68 on .places-grid--photo
                 15 still on placeholder swatches (6 cards each = 90 cards)
                  1 (maldives) has no places-grid section at all
                 52 + 15 + 1 = 68.
  Higgsfield credits: 1569.

  jordan and oman came off the list first that day; then the POLAR BATCH —
  arctic-norway, greenland, svalbard, falklands-south-georgia — 24 cards for
  26 credits. Every earlier version of this file said "4 pages / 24 cards",
  true at 43 pages, before M7 added 25 more each shipping 6 placeholder cards.
  RE-DERIVE, never trust a written count:

    node -e "const g=require('glob');" # or just grep:
    grep -L 'places-grid--photo' src/content-pages/destinations__*.html \
      | xargs grep -l 'places-grid' | wc -l

WHAT IS LEFT: 90 destination place cards, ~100 credits plus re-rolls against
  1569. Credits are not the constraint and have not been since 2026-08-12 —
  concept quality and reviewer time are. jordan and oman took 13 credits for
  12 cards; polar took 26 for 24; Latin America 27 for 24; the islands 25
  for 24. Budget ~1.1 credits per card.

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

**Repo:** clean, all work pushed. HEAD was `8449977` when this was written;
the repo has moved well past it. **The photo counts below are still accurate**
(no photography work has happened since) but re-derive them with the snippet
under "The 4 pages still on placeholders" rather than trusting the commit
reference. For the launch-blocker workstream see
`docs/seo/HANDOFF-launch-blockers.md`.

| | |
|---|---|
| Destination pages | **68** |
| On the photo panel | **52** |
| Still on placeholders | **15** (90 cards) |
| No places-grid at all | **1** (maldives) |
| Experience pages | **12 of 12 photographed — closed 2026-08-24** |
| `/destinations/` index | 65 of 65 photographed, 65 distinct images |
| Higgsfield credits | **1569** |

### The 15 pages still on placeholders

```
aspen australia bhutan georgia-armenia india israel morocco new-zealand
seychelles south-africa sri-lanka uae-gulf vanuatu vietnam-southeast-asia
zambia-victoria-falls
```

Remaining batches, grouped by shared visual vocabulary so cards can be
specced against each other:

| Batch | Pages |
|---|---|
| Africa & Indian Ocean | south-africa, zambia-victoria-falls, morocco, seychelles, vanuatu |
| Asia | bhutan, india, sri-lanka, vietnam-southeast-asia, georgia-armenia |
| Middle East & Anglo | israel, uae-gulf, aspen, australia, new-zealand |

Every one needs exactly 6, so the remainder is 162 cards. `jordan` and `oman`
came off this list on 2026-08-25. The four originally named here were the whole
backlog at 43 destination pages; M7 then added 25 more, each shipping its own
six placeholders. **This is the single number in this file that has been wrong
most often — derive it.**

Suggested order: jordan and oman went first, together, on 2026-08-25 —
desert and ancient share a look and a prompt vocabulary. **new-zealand**
next, and **india** last: india is `needs-mark` blocked on Mark's
first-hand line and cost figures, so photographing it unblocks nothing.

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
  on `.exp-cards--photo`, 72 of 72 cards. The remaining work is entirely
  destination-side: 27 pages, 162 cards.
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
