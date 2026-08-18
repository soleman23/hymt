# Destination photography needed — the 25 missing hero images

> ## ⚠ SUPERSEDED 2026-08-18. Every subject below now ships.
>
> Re-derived against the repo on 2026-08-18: **all 25 subjects have a
> shippable asset** — present in `images-b64/MANIFEST.json`, with a base64
> twin, resolving on disk. 24 are already wired as `/destinations/` index
> cards. The 25th is **Aspen**, whose asset (`dh-26-aspen-maroon-bells.jpg`)
> exists but is wired nowhere: `888817d` deliberately pulled the Aspen and
> Banff cards from the grid until those pages exist.
>
> So the tier checklists below are a **historical record of what was
> commissioned**, not a to-do list. Nothing in them is outstanding. The
> specs table is also wrong in two ways — see the strikethroughs.
>
> The real remaining photography is **place cards, not heroes**, and it is
> tracked in [`photography-plan.md`](photography-plan.md) § Workstream B and
> in #93. Derive it, never quote it:
>
> ```bash
> grep -rl 'place-card__ph' dist/destinations --include='*.html' | wc -l   # 4 pages
> grep -rho 'place-card__ph' dist/destinations --include='*.html' | wc -l  # 24 cards
> grep -rho 'exp-card__ph'   dist/experiences  --include='*.html' | wc -l  # 42 cards
> ```

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
