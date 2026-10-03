# Tennis page: owner checklist (DRAFT, 2026-10-03)

Page: `/experiences/sports-event-travel/tennis/`. This is a draft only. It has
not been built or deployed, and nothing outside `docs/drafts/new-pages/` has
been changed.

- Wrapper: `docs/drafts/new-pages/src/pages/experiences/sports-event-travel/tennis/index.astro`
- Body: `docs/drafts/new-pages/src/content-pages/experiences__sports-event-travel__tennis.html`

To promote it, copy both files to the same paths under the repo root. The
import paths are already written for that location.

## Metadata

| Field | Value | Length |
|---|---|---|
| Title | `Wimbledon & Grand Slam Tennis Travel — Hit Your Mark Travel` | 59 (allowed 30–65) |
| Description | `Wimbledon debenture, official hospitality or the ballot? The three routes compared, plus Roland-Garros (late May) and the Australian Open (January).` | 148 (allowed 110–165) |
| H1 (hero) | `Three Slams,<br>Three Ways In` | — |
| Breadcrumb | Home › Experiences › Sports & Event Travel › Tennis, via the `parent` prop | 4 crumbs |

- Body word count is about **2,550**, with comments and tags stripped. Of that,
  the three tables are about 620 words.
- The brief's target was 1,800–2,400. CONTENT-STANDARDS § 3.4 says 1,200–2,000
  for experience pages. The copy has already been cut once. If more has to go,
  cut the event-card and inclusions copy and keep the tables.
- The answer capsule is 62 words, and its number is 2,520 Centre Court
  debentures.
- There are 8 FAQs. Every first sentence is 25 words or fewer (longest 24) by the
  verifier's own splitter, and every answer runs 60–77 words.

## Owner answers applied (2026-10-03)

The owner answered every NEEDS MARK question with one rule: Mark has not been
to any of these events. The page therefore claims no first-hand experience, no
booking relationships, no named operators or hotels HYMT uses, no prices beyond
the cited published figures, and no client stories or testimonials. Every
detail is informational: how the routes work, dates, rules, and which route
suits which traveller, with the existing citations. The NEEDS FIGURE gaps are
closed by leaving the figures out; never estimate them.

Removed or neutralised:

- Intro: the NEEDS MARK on which routes HYMT books through, and the
  first-hand-line placeholder. No sentence added.
- Wimbledon table: NEEDS FIGURE comments on No.1 Court debentures and Keith
  Prowse 2027 packages removed; the rows stay without figures.
- AO table: NEEDS FIGURE on AO Reserve 2027 prices removed.
- Trips section: H2 "Trips We Plan Around the Slams" became "How a Trip Around
  Each Slam Fits Together". The three card descriptions were rewritten as
  dates plus transport from the official getting-there pages already cited
  (AELTC help page, FFT access guide, Tennis Australia getting-here page). The
  AO card's "two nights on the Great Ocean Road" was removed. Two alt texts
  lost their itinerary clauses ("where a Roland-Garros trip spends its
  evenings", "a drive from Melbourne after the Open").
- Inclusions: H2 "What We Handle Around the Seat" became "What to Plan Around
  the Seat"; "We tell you which is faster on your day and book the car if it
  is" became a neutral line; "Rest Days Between Sessions" became "Days Off
  Between Sessions", phrased as a general planning consideration.
- Seasons: the US Open comment removed. The page does not mention it.
- Testimonial section placeholder removed entirely.
- Cost section: NEEDS FIGURE on per-day debenture and hospitality prices
  removed.
- FAQ 4 and FAQ 7: the NEEDS MARK comments removed. FAQ 4 already ends on a
  neutral "who each route suits" line; FAQ 7 names no hotels.

Body word count after these edits: about **2,550** (comments and tags
stripped), up from 2,460, because the trip cards now carry dates and transport
facts. Still above the brief's 2,400; if it must come down, trim the trip-card
and inclusions copy first.

## Image gaps

- **Hero: I swapped the image the brief named.** I did not use
  `e-23-wimbledon-pimms.jpg` (2000×1116), for three reasons:
  - it is a two-panel diptych with a hard seam down the centre, which the
    `object-fit: cover` hero would put in the middle of the frame;
  - the player wears clearly visible Nike swooshes, on her top and wristband;
  - an AI-generator sparkle watermark sits in the bottom-right corner.

  The brief bans logos and trademarks. The draft uses
  `e-31-wimbledon-court-strawberries.jpg` (1600×893) instead, even though the
  parent page already uses it as its Tennis exp-card. To fix this, either
  regenerate e-23 as a single clean frame, or accept the reuse.
- **No `og-` crop exists** for e-31 or e-23. Generate one with
  `tools/make-og-crops.mjs` and add it to `src/lib/og-crops.ts`. Without it the
  page falls back to the default plate.
- **Intro portrait (`np-`, 900×1520): none exists.** The draft uses the flat
  `.intro-image` placeholder, which must not ship. The brief suggests a
  grass-court baseline or a clay line being swept, with no players, logos or
  tournament marks.
- **Roland-Garros and Australian Open event cards:** these use
  `france-paris.jpg` (Palais-Royal) and
  `australia-melbourne-and-the-great-ocean-road.jpg` (Twelve Apostles). Both
  are 16:9, cropped by the 3:4 event slot, and their alt text honestly
  describes the city, not the venue. A clay-court or Melbourne Park `ev-` 3:4
  crop would be better. Any new image needs a MANIFEST entry written through
  `tools/image-manifest.mjs`.
- **The Wimbledon event card reuses `ev-e-27-wimbledon-pimms-terrace.jpg`**
  from the parent page. The brief allows this.
- **The events grid has 2 columns and holds 3 cards,** so one card sits alone
  on the last row. Add a fourth card or accept it.

## Layout gap: the tables have no CSS

`src/styles/` has no table rule anywhere, and the brief forbids new CSS here.
The three plain `<table>`s will render with browser defaults. The 6-column
Wimbledon table will overflow at 375 px, which breaks the "no horizontal page
scroll" rule.

Before launch, add a small modifier to `experience.css` in its own change (for
example `.exp-compare`, with a scroll wrapper or a stacked layout on mobile),
then add the class to the three tables.

## Proposed `tools/cost-ranges-data.mjs` row (do not edit that file here)

```js
"experiences__sports-event-travel__tennis.html": {
  unit: "Priced by the seat per day, not by the night",
  noBand: "The seat is the largest line on a Slam trip, and it is priced by route, court and day. A Ground Pass and a two-week loge are both tickets to the same tournament, and no nightly figure covers both.",
  includes: [
    "The seat at the route booked: debenture ticket, official hospitality or loge, reserved seat",
    "A hotel on a direct line to the venue",
    "Match-day transfers where a car beats the train",
  ],
  excludes: [
    "International flights and the nights either side of the tournament",
    "Food and drink outside the package's own catering",
    "Cancel-for-any-reason cover",
  ],
  drivers: [
    "Route: a Wimbledon Centre Court debenture cost £116,000 for the five Championships of 2026–2030; that is the series single-day debenture tickets come from",
    "Day: the FFT prices a per-day Chatrier loge by date, from €935 per person before tax",
    "Timing: Australian Open Ground Passes carry early-bird prices until 30 November",
  ],
  source: { text: "AELTC Centre Court debenture issue", href: "https://www.wimbledon.com/amp/en_GB/news/articles/2024-03-13/2024-03-13_centre_court_debenture_issue.html" },
},
```

The draft's `.cost-range` section mirrors the parent page's rendered noBand
shape, with drivers only. Re-run `node tools/p3-8-cost-insert.mjs` after adding
the row and compare the two.

## Launch-time edits elsewhere (listed, not made)

1. **`src/data/tiles.mjs`, under `sports-event-travel`:**
   - Change the Tennis exp-card to
     `href: "/experiences/sports-event-travel/tennis/", status: "live"`, and
     drop `final`.
   - Give the Wimbledon event-card
     `more: "/experiences/sports-event-travel/tennis/#wimbledon", moreLabel: "Debenture vs hospitality vs ballot, compared"`.
2. **`src/content-pages/experiences__sports-event-travel.html` (the parent):**
   - Point Tennis exp-card 1's `href` at `/experiences/sports-event-travel/tennis/`.
     Change the href only; the card is an `<a>`, so no nested link.
   - On the Wimbledon event-card, keep "Request Wimbledon Package". Add
     `<a class="event-more" href="/experiences/sports-event-travel/tennis/#wimbledon">Debenture vs hospitality vs ballot, compared</a>`.
     Trim the description so the parent stops competing for "Wimbledon
     hospitality".
   - In FAQ 3, link "Tennis at Wimbledon and Roland Garros" to the new page.
3. **`destinations__uk-ireland.html`:** in the why-desc, link the existing word
   "Wimbledon" to `/experiences/sports-event-travel/tennis/#wimbledon`.
4. **`destinations__france.html`:** link "Roland-Garros fortnight" to
   `#roland-garros`, from the late May/June season item or an FAQ. Keep it
   under 30 words; do not link inside a place-card.
5. **`destinations__australia.html`:** link an existing word in the January or
   summer season item that names the Australian Open, adding at most 10 words.
   The page is at 3,389 of its 3,500-word ceiling, so recount after the edit.
6. **Journal reverse links:** add a link to `/experiences/sports-event-travel/tennis/`
   from `travel-journal__masters-field-report.html` (sold-out-event access) and
   `travel-journal__europe-destination-guide.html` (staying on after the
   fortnight). Do not touch the Derby report.
7. **Head baseline:** run `node tools/verify-deployment.mjs --update-baseline`
   in its own commit for the new page, and again if the parent's description
   changes.
8. **No change needed:** the `/experiences/` hub stays at 12 cards, the footer
   is unchanged, and the llms.txt count is unchanged. The sitemap picks the
   page up automatically.
9. **Verifier gap:** no check yet fails a nested `/experiences/<parent>/<child>/`
   page that emits only 3 crumbs. The brief asks for that check plus a fixture
   in `tools/verify-checks.test.mjs`, before or alongside this page. The
   `parent` prop itself has already landed in `ExperienceLayout.astro`.

## How the sources were verified

The egress proxy blocks direct fetches of wimbledon.com, content.wimbledon.com,
help.wimbledon.com, rolandgarros.com and ausopen.com (CONNECT 403). Every fact
was confirmed from search results restricted to the governing body's own
domain on 3 October 2026. **Open each cited URL in a browser before launch.**
These need particular attention:

- **The 2,520 / £116,000 debenture figures** came from the AMP copy of the
  AELTC news release at
  `wimbledon.com/amp/en_GB/news/articles/2024-03-13/...`. Swap in the non-AMP
  URL if it resolves.
- **The Roland-Garros Club des Loges prices** (€62,500 / €95,000 two-week,
  from €935 per day) are what the FFT corporate pages listed when checked. The
  search results did not make clear which edition they apply to. Confirm they
  are the 2027 prices, or remove them.
- **The Roland-Garros 2027 dates** (17 May–6 June, main draw from 23 May) come
  from the FFT's own travel site, travel.rolandgarros.com, and LTA coverage
  agrees. rolandgarros.com had not yet published a 2027 schedule page.
- **The Roland-Garros draw mechanics** are those of the 2026 edition. The FFT
  said 2027 sale dates would be published by mid-October 2026. Update the page
  once they are.
- **The Queue Guide and Debenture Handbook** are the 2026 PDFs. Swap in the
  2027 editions when they are published.
- **Not used, because they could not be verified:** the Debenture Holders'
  official ticket exchange, a general spectator dress code, and No.1 Court
  debenture numbers.

Sources cited on the page:

- AELTC:
  - wimbledon.com/en_GB/tickets
  - tickets/ballot
  - tickets/debentures
  - tickets/hospitality
  - ticket_resale_kiosk
  - the 2024 Centre Court debenture issue release
  - Queue Guide 2026 PDF
  - Debenture Handbook 2026 PDF
  - help.wimbledon.com nearest-station article
- FFT:
  - tickets.rolandgarros.com Club des Loges (two weeks, and per day)
  - travel.rolandgarros.com offers
  - rolandgarros.com 2026 draw article
  - rolandgarros.com fraud and resale article
  - rolandgarros.com 2027 scam warning
  - rolandgarros.com access/transport page
- Tennis Australia:
  - ausopen.com 2027 dates article
  - 2027 tickets on-sale article
  - hospitality (AO Reserve)
  - AO 2027 Conditions of Sale PDF
  - getting-here page
