# Destination hero photography — commissioned, delivered, closed

> ## ⚠ HISTORICAL RECORD. Nothing below is outstanding.
>
> **Superseded 2026-08-18; closed out 2026-08-28.** This file was titled "the
> 25 missing hero images" for months after the last of them shipped, so the
> title alone sent readers hunting for work that did not exist. It is kept for
> what was commissioned and why, not as a to-do list.
>
> Re-derived 2026-08-18: **all 25 subjects have a shippable asset** — present
> in `images-b64/MANIFEST.json`, with a base64 twin, resolving on disk. 24 were
> wired as `/destinations/` index cards; the 25th, **Aspen**
> (`dh-26-aspen-maroon-bells.jpg`), existed but was wired nowhere, because
> `888817d` deliberately pulled the Aspen and Banff cards until those pages
> existed.
>
> Re-derived 2026-08-28: **those pages exist.** `/destinations/aspen/` ships and
> M7 issues #40–#65 are all closed. The "when an image lands" procedure at the
> foot of this file has no pending subject to apply to.
>
> **Two inventories, and they are not the same number** — conflating them is how
> this file got into trouble the first time:
>
> ```bash
> ls -d dist/destinations/*/ | wc -l                                   # 68 detail pages
> grep -c 'class="dest-card"' src/content-pages/destinations.html      # 66 grid cards
> ```
>
> They differ legitimately. The nine regional hubs are pages with no grid card
> of their own, and several cards point at a shared detail page. Neither figure
> is "the number of destinations" — say which one you mean.
>
> The specs table is wrong in two ways — see the strikethroughs. Those
> corrections still matter, because they describe the house format for any
> *future* hero.
>
> **The place-card backlog this file used to point at is also closed.** Every
> figure in the block below now derives to zero; they are left with their
> historical values struck through, because a bare `# 0` teaches nothing about
> what the command was for:
>
> ```bash
> # was 4 pages / 24 cards / 42 cards on 2026-08-18 — all zero since 2026-08-26
> grep -rl  'place-card__ph' dist/destinations --include='*.html' | wc -l   # 0
> grep -rho 'place-card__ph' dist/destinations --include='*.html' | wc -l   # 0
> grep -rho 'exp-card__ph'   dist/experiences  --include='*.html' | wc -l   # 0
> ```
>
> **A zero from those three greps is not "no plates sitewide."** Each names one
> card family. So does the class-shape sweep that used to stand here, and that
> is the trap this section was rewritten to stop walking into:
>
> ```bash
> # WRONG — this is the sweep this file used to bless. It reports 2 hits.
> grep -rho '[a-z-]*__ph\b' dist --include='*.html' | sort | uniq -c
> ```
>
> It matches `__ph` at a word boundary. The two largest plate families are
> `author-card__photo-ph` and `post-byline__avatar-ph` — the token ends `-ph`,
> not `__ph` — so **64 rendered plates are invisible to it**, and its two hits
> are `dest-card__ph` CSS rules for a class nothing renders. Read literally it
> says "two, and both are dead": a clean bill of health for a file with 65
> outstanding plates in it.
>
> Accept either separator before the `ph`, and sweep the caption beside it:
>
> ```bash
> # every -ph/__ph token anywhere, CSS rules included
> grep -rho '[a-z_-]*[_-]ph\b' dist --include='*.html' | sort | uniq -c
> # only the ones a page actually RENDERS — a class attribute, not a rule
> grep -rho 'class="[a-z_ -]*[_-]ph"' dist --include='*.html' | sort | uniq -c
> grep -rho '[A-Z][a-z]* Photography' dist --include='*.html' | sort | uniq -c
> ```
>
> Today the first returns 68 tokens: `author-card__photo-ph` ×32 and
> `post-byline__avatar-ph` ×32, plus `dest-card__ph` ×2,
> `journal-featured__image-ph` and `story__photo-ph` — those last four are CSS
> rules for classes nothing renders. The second cuts straight to the 64 that
> do render, and returns exactly the first two. The third returns
> `Portrait Photography` (`/contact/`, the 65th, **not** waiting
> on Mark — `sp-mark-sole-portrait.jpg` has been in the repo since 2026-08-10
> and just needs wiring; see
> [`photography-plan.md`](photography-plan.md) § "The last fifteen") and
> `Iceberg Photography`
> (`/destinations/`, a genuine Greenland activity tag beside "Icefjord" and
> "Dog Sledding"), which is deliberate and documented in the same section.
>
> Neither grep is authority on its own. A plate is whatever renders where a
> photograph should be, and it has been given a new class name twice now.
> Check both, and read the matched rows rather than the count.

Every destination in the `/destinations/` grid now has a card. ~~**25 of them
ship a placeholder plate instead of a photograph**~~ — **none do; the grid has
zero placeholder plates** (`grep -c '__ph"' src/content-pages/destinations.html`
returns 0) — which ~~is~~ *was* the single blocker on building their detail
pages (milestone **M7**, issues #40–#65). Seychelles is the one exception — its
photo already exists, which is why it is the pilot.

Sourcing these in tier order means the highest-value pages become buildable
first. Nothing here blocks launch: every card already links to its region hub.

## Specs (match the existing `dh-*` series)

| Field | Value |
|---|---|
| Naming | `dh-NN-<slug>-<subject>.jpg`, continuing the series — ~~**next free number is `dh-26`**~~ the series now runs to **`dh-28`**; derive with `ls public/assets/img/ \| grep -o '^dh-[0-9]*' \| sort -u \| tail -1` |
| Location | `public/assets/img/` |
| Ratio / res | ~~16:9, 4K~~ **1600px wide, capped by `tools/cap-image-width.py`** — 1600 is the widest any visitor is ever served (measured against the Hostinger CDN), so 4K is thrown away at build time. Shipped hero widths today are 1024, 1456, 1536 and 1600. |
| Style | Golden-hour editorial travel photography, cinematic grade |
| **Hard brand rules** | **No faces. No people. No text overlays. No visible signage.** |
| Also needed | A 1200×630 crop for `og:image` if the hero doesn't crop cleanly |

The existing prompts in `tools/image-gen-manifest-heroes.json` are the reference
for tone if these are generated rather than sourced.

## Tier 1 — build first (7 images)

Highest demand; these unblock the most valuable pages.

- [ ] **South Africa** — #49 · Cape/Winelands or Sabi Sands golden hour
- [ ] **Costa Rica** — #41 · cloud forest or Pacific coastline
- [ ] **India** — #54 · Rajasthan fort or Kerala backwater at dawn
- [ ] **Morocco** — #51 · Sahara dunes at Merzouga or Fez medina rooftops
- [ ] **Australia** — #59 · Great Barrier Reef aerial or Kimberley coast
- [ ] **Jamaica** — #42 · Blue Mountains or west-coast cliffs
- [ ] **Dominican Republic** — #44 · Samaná Peninsula coastline

*(Seychelles #48 needs nothing — `d-05-seychelles-boulders.jpg` already ships.)*

## Tier 2 — build second (11 images)

- [ ] **Brazil** — #45 · Rio's setting or Pantanal wetland
- [ ] **Argentina** — #46 · Mendoza vineyards under the Andes
- [ ] **Colombia** — #47 · Cartagena walled city or Eje Cafetero
- [ ] **Vietnam & Southeast Asia** — #53 · Ha Long Bay junk or Hoi An lanterns
- [ ] **Sri Lanka** — #55 · hill-country tea estates or Sigiriya
- [ ] **Barbados & Eastern Caribbean** — #43 · Platinum Coast or the Pitons
- [ ] **Aspen** — #40 · ski-in chalet or summer mountain town
- [ ] **Israel** — #56 · Jerusalem Old City stonework or Negev desert
- [ ] **UAE & the Gulf** — #57 · Liwa desert camp or Sheikh Zayed Grand Mosque
- [ ] **Zambia & Victoria Falls** — #50 · the Falls at high water, Zambian side
- [ ] **Arctic Norway & Northern Lights** — #62 · aurora over Lofoten

## Tier 3 — build last (7 images)

- [ ] **Bhutan** — #52 · Bumthang Valley monastery road
- [ ] **Svalbard** — #63 · tidewater glacier face or pack ice
- [ ] **Greenland** — #64 · Ilulissat Icefjord icebergs
- [ ] **Cook Islands** — #60 · Aitutaki lagoon aerial
- [ ] **Vanuatu & Beyond** — #61 · Mount Yasur at night or reef wreck
- [ ] **Georgia & Armenia** — #58 · Tbilisi old town or Kakheti vineyards
- [ ] **Falklands & South Georgia** — #65 · king penguin colony at St Andrews Bay

## When an image lands

1. Drop it in `public/assets/img/` using the naming convention above.
2. The destination page (when built) passes it as `hero.image` — preload,
   `og:image` and schema `image` all follow automatically from that one prop.
3. ~~Update the grid card in `src/content-pages/destinations.html` to use the
   photo instead of the placeholder plate~~ — **dead step: that file has zero
   placeholder plates.** Every card there is already a photograph. What is
   still needed is only to re-point the card's `href` from the region hub to
   the new page.
4. `npm run build` must stay clean.
