# Destination photography needed — the 25 missing hero images

Every destination in the `/destinations/` grid now has a card. **25 of them
ship a placeholder plate instead of a photograph**, which is the single blocker
on building their detail pages (milestone **M7**, issues #40–#65). Seychelles is
the one exception — its photo already exists, which is why it is the pilot.

Sourcing these in tier order means the highest-value pages become buildable
first. Nothing here blocks launch: every card already links to its region hub.

## Specs (match the existing `dh-*` series)

| Field | Value |
|---|---|
| Naming | `dh-NN-<slug>-<subject>.jpg`, continuing the series — **next free number is `dh-26`** |
| Location | `public/assets/img/` |
| Ratio / res | 16:9, 4K (these are full-bleed hero backgrounds) |
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
3. Update the grid card in `src/content-pages/destinations.html` to use the
   photo instead of the placeholder plate, and re-point its `href` from the
   region hub to the new page.
4. `npm run build` must stay clean.
